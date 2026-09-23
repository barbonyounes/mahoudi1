import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SafeCanvas } from "./SafeCanvas";
import * as THREE from "three";
import type { ModelKind } from "@/data/lesson";

/** طبقة ثلاثية الأبعاد للخلفية، تتغير وضعيتها مع تقدم المحطات. */

function useEased(target: number, speed = 2) {
  const ref = useRef(target);
  useFrame((_, delta) => {
    ref.current += (target - ref.current) * Math.min(1, delta * speed);
  });
  return ref;
}

/** كوكب/منظومة بيئية */
function Biome() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (mesh.current) mesh.current.rotation.y += d * 0.15;
  });
  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2.7, 3]} />
        <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.55, 32, 32]} />
        <meshStandardMaterial color="#134e4a" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/** شمس وأشعة: العوامل المناخية */
function Climate() {
  const group = useRef<THREE.Group>(null);
  const rays = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  useFrame((state, d) => {
    if (!group.current) return;
    group.current.rotation.z += d * 0.12;
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
    group.current.scale.set(s, s, s);
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.25, 28, 28]} />
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.8} />
      </mesh>
      {rays.map((i) => {
        const a = (i / rays.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.3, Math.sin(a) * 2.3, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[1.1, 0.06, 0.06]} />
            <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/** مقطع تربة بطبقات وقطرات ماء تتسرب */
function Soil() {
  const group = useRef<THREE.Group>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: ((i * 37) % 40) / 10 - 2,
        z: ((i * 53) % 30) / 10 - 1.5,
        o: (i % 7) / 7,
      })),
    [],
  );
  useFrame((state, d) => {
    if (group.current) group.current.rotation.y += d * 0.1;
    group.current?.children.forEach((c) => {
      if (c.userData['drop']) {
        c.position.y -= d * 0.9;
        if (c.position.y < -1.6) c.position.y = 2.2;
      }
    });
    if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
  });
  return (
    <group ref={group}>
      {[
        { y: 0.6, c: "#d9b979", h: 0.7 },
        { y: -0.2, c: "#8a6b4a", h: 0.8 },
        { y: -1.1, c: "#4b3a28", h: 0.9 },
      ].map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]}>
          <cylinderGeometry args={[2.4, 2.4, l.h, 32]} />
          <meshStandardMaterial color={l.c} roughness={0.95} transparent opacity={0.75} />
        </mesh>
      ))}
      {drops.map((dp, i) => (
        <mesh key={i} position={[dp.x, dp.o * 3, dp.z]} userData={{ drop: true }}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** كثبان صحراوية */
function Desert() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.y += d * 0.06;
  });
  return (
    <group ref={group} position={[0, -1, 0]}>
      {[
        [-2.4, 0, -1, 2.6],
        [2.2, 0, -1.6, 3.1],
        [0, 0, 1.4, 2.2],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x!, y!, z!]} scale={[s!, s! * 0.4, s!]}>
          <sphereGeometry args={[1, 22, 14]} />
          <meshStandardMaterial color="#c99a55" roughness={1} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 3, -2]}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Rig({ index, model }: { index: number; model: ModelKind }) {
  const targetX = Math.sin(index * 1.1) * 2.2;
  const targetY = 0.6 + Math.cos(index * 0.9) * 1.1;
  const targetZ = 9 - (index % 3) * 1.1;
  const ex = useEased(targetX);
  const ey = useEased(targetY);
  const ez = useEased(targetZ);

  useFrame((state) => {
    state.camera.position.set(ex.current, ey.current, ez.current);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {model === "biome" && <Biome />}
      {model === "climate" && <Climate />}
      {model === "soil" && <Soil />}
      {model === "desert" && <Desert />}
    </group>
  );
}

export default function LessonScene({
  index,
  model,
  onContextLost,
}: {
  index: number;
  model: ModelKind;
  onContextLost: () => void;
}) {
  return (
    <SafeCanvas onContextLost={onContextLost} camera={{ position: [0, 0, 9], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#a5f3fc" />
      <pointLight position={[-6, -3, -4]} intensity={30} color="#a78bfa" />
      <Rig index={index} model={model} />
    </SafeCanvas>
  );
}
