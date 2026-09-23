import { useEffect } from "react";
import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { useLowPowerDevice } from "@/hooks/useWebglGuard";

/** يلتقط فقدان سياق WebGL ويبلّغ الواجهة لعرض بديل ثنائي الأبعاد */
function ContextWatcher({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      // تحرير ذاكرة الرسوميات فوراً عند التفكيك
      gl.dispose();
      gl.forceContextLoss?.();
    };
  }, [gl, onLost]);
  return null;
}

type Props = Omit<CanvasProps, "gl" | "dpr"> & {
  onContextLost: () => void;
  /** تعطيل الرسم عند عدم الحاجة (يوقف حلقة الإطارات) */
  paused?: boolean;
};

/**
 * غلاف Canvas آمن على الهاتف: دقة منخفضة، بدون تنعيم،
 * تفضيل طاقة منخفضة، وتحرير السياق عند التفكيك.
 */
export function SafeCanvas({ children, onContextLost, paused, ...rest }: Props) {
  const low = useLowPowerDevice();
  return (
    <Canvas
      {...rest}
      frameloop={paused ? "demand" : "always"}
      dpr={low ? 1 : [1, 1.5]}
      gl={{
        antialias: !low,
        powerPreference: low ? "low-power" : "high-performance",
        alpha: true,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
    >
      <ContextWatcher onLost={onContextLost} />
      {children}
    </Canvas>
  );
}
