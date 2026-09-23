import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SafeCanvas } from "@/components/three/SafeCanvas";
import * as THREE from "three";

/**
 * مشهد صحراوي: دورة نهار/ليل مع حركة اليربوع بين الجحر والسطح.
 * phase: 0 = منتصف الليل، 0.5 = الظهيرة، 1 = منتصف الليل التالي.
 */
export default function DesertScene({
  phase,
  onContextLost,
}: {
  phase: number;
  onContextLost: () => void;
}) {
  const dayness = Math.max(0, Math.sin(phase * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
  const sky = new THREE.Color("#08111f").lerp(new THREE.Color("#7dd3fc"), dayness);

  return (
    <SafeCanvas onContextLost={onContextLost} camera={{ position: [0, 2.2, 8], fov: 45 }}>
      <color attach="background" args={[sky.getHex()]} />
      <ambientLight intensity={0.25 + dayness * 0.65} />
      <directionalLight
        position={[Math.cos(phase * Math.PI * 2 - Math.PI / 2) * 8, dayness * 8 - 1, 3]}
        intensity={0.4 + dayness * 1.8}
        color={dayness > 0.4 ? "#fde68a" : "#93c5fd"}
      />
      <Stars visible={dayness < 0.3} />
      <Dunes dayness={dayness} />
      <Burrow />
      <Jerboa phase={phase} />
    </SafeCanvas>
  );
}

function Stars({ visible }: { visible: boolean }) {
  const pts = useMemo(() => {
    const arr: [number, number, number][] = [];
    let seed = 7;
    for (let i = 0; i < 80; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const r = seed / 233280;
      arr.push([(r - 0.5) * 22, 2 + ((i * 37) % 60) / 12, -6 - ((i * 13) % 40) / 10]);
    }
    return arr;
  }, []);
  if (!visible) return null;
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      ))}
    </group>
  );
}

function Dunes({ dayness }: { dayness: number }) {
  const sand = new THREE.Color("#3b2f21").lerp(new THREE.Color("#e0b972"), dayness);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[40, 24]} />
        <meshStandardMaterial color={sand.getHex()} roughness={1} />
      </mesh>
      {[
        [-5, -1.1, -3, 3],
        [4.5, -1.1, -4, 4],
        [0.5, -1.15, -6, 5.5],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x!, y!, z!]} scale={[s!, s! * 0.35, s!]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color={sand.getHex()} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Burrow() {
  return (
    <group position={[1.8, -1.18, 0.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#1a1005" />
      </mesh>
    </group>
  );
}

/** اليربوع: يخرج من الجحر ليلاً ويختفي فيه نهاراً */
function Jerboa({ phase }: { phase: number }) {
  const group = useRef<THREE.Group>(null);
  const night = 1 - Math.max(0, Math.sin(phase * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
  const out = Math.max(0, (night - 0.45) / 0.55); // 0 داخل الجحر، 1 على السطح

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const wander = out > 0.1 ? Math.sin(t * 0.7) * 2.4 * out : 0;
    group.current.position.set(1.8 - wander, -1.15 + out * 0.35, 0.6 + Math.sin(t * 0.5) * 0.5 * out);
    group.current.scale.setScalar(0.25 + out * 0.55);
    group.current.rotation.y = Math.cos(t * 0.7) > 0 ? 0.4 : -0.4;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.28, 0]} scale={[1, 0.85, 1.25]}>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color="#e7cfa3" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0.2]}>
        <sphereGeometry args={[0.19, 16, 16]} />
        <meshStandardMaterial color="#eddcb8" roughness={0.9} />
      </mesh>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.82, 0.16]} scale={[0.5, 1.5, 0.4]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#f2e4c8" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, -0.55]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#d8c39a" roughness={0.9} />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.05, -0.05]} scale={[0.4, 1, 0.6]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#e7cfa3" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
