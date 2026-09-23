import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SafeCanvas } from "@/components/three/SafeCanvas";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import glassware from "@/assets/lab_glassware.glb.asset.json";
import { SOILS, type FunnelState } from "./usePermeabilitySim";

useGLTF.preload(glassware.url);

/** كأس زجاجي مأخوذ من النموذج المرفوع ومعاير إلى ارتفاع ثابت */
function Beaker({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(glassware.url) as unknown as { scene: THREE.Group };

  const beaker = useMemo(() => {
    let source: THREE.Object3D | null = null;
    scene.traverse((o) => {
      if (!source && /beaker/i.test(o.name) && (o as THREE.Mesh).isMesh) source = o;
    });
    if (!source) {
      scene.traverse((o) => {
        if (!source && (o as THREE.Mesh).isMesh && !/plane|floor/i.test(o.name)) source = o;
      });
    }
    if (!source) return null;
    const clone = (source as THREE.Object3D).clone(true);
    clone.rotation.set(0, 0, 0);
    clone.position.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const k = 1.6 / Math.max(0.0001, size.y);
    clone.scale.setScalar(k);
    const box2 = new THREE.Box3().setFromObject(clone);
    clone.position.y -= box2.min.y;
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = new THREE.MeshPhysicalMaterial({
          color: "#cfeefb",
          transparent: true,
          opacity: 0.28,
          roughness: 0.05,
          metalness: 0,
          transmission: 0.6,
          thickness: 0.4,
        });
      }
    });
    return clone;
  }, [scene]);

  if (!beaker) return null;
  return <primitive object={beaker} position={position} />;
}

function Station({
  x,
  funnel,
  volume,
  running,
}: {
  x: number;
  funnel: FunnelState;
  volume: number;
  running: boolean;
}) {
  const soil = SOILS[funnel.soil];
  const stream = useRef<THREE.Mesh>(null);
  const maxWater = Math.max(1, volume);
  const level = Math.min(1, funnel.percolated / maxWater);
  const flowing = running && funnel.rate > 0.6;

  useFrame((state) => {
    if (stream.current) {
      const m = stream.current.material as THREE.MeshStandardMaterial;
      m.opacity = flowing ? 0.45 + Math.sin(state.clock.elapsedTime * 12) * 0.15 : 0;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* الكأس */}
      <Beaker position={[0, 0, 0]} />

      {/* الماء داخل الكأس */}
      <mesh position={[0, 0.06 + (level * 1.3) / 2, 0]}>
        <cylinderGeometry args={[0.62, 0.62, Math.max(0.001, level * 1.3), 28]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.62} roughness={0.15} />
      </mesh>

      {/* القمع */}
      <mesh position={[0, 2.65, 0]}>
        <coneGeometry args={[0.95, 1.1, 28, 1, true]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.3}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16, 1, true]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* التربة داخل القمع */}
      <mesh position={[0, 2.62, 0]}>
        <coneGeometry args={[0.78, 0.85, 26]} />
        <meshStandardMaterial color={soil.hex} roughness={0.95} />
      </mesh>

      {/* خيط الماء المتدفق */}
      <mesh ref={stream} position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 1.5, 8]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function PermeabilityScene({
  funnels,
  volume,
  running,
  onContextLost,
}: {
  funnels: FunnelState[];
  volume: number;
  running: boolean;
  onContextLost: () => void;
}) {
  return (
    <SafeCanvas onContextLost={onContextLost} camera={{ position: [0, 2.4, 8.5], fov: 42 }}>
      <color attach="background" args={["#07141c"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 6]} intensity={1.5} color="#e0f2fe" />
      <pointLight position={[-5, 2, 3]} intensity={25} color="#5eead4" />
      <group position={[0, -1.4, 0]}>
        {funnels.map((f, i) => (
          <Station key={i} x={(i - 1) * 3.1} funnel={f} volume={volume} running={running} />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[16, 8]} />
          <meshStandardMaterial color="#0b1f2a" roughness={0.9} />
        </mesh>
      </group>
    </SafeCanvas>
  );
}
