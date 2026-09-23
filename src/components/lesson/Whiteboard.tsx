import { useEffect, useRef, useState } from "react";
import { Eraser, Pencil, X } from "lucide-react";

const COLORS = ["#5eead4", "#f0abfc", "#fde047", "#fca5a5"];

/** سبورة رسم حرة فوق المحتوى المعروض */
export function Whiteboard({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]!);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const snapshot = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const img = new Image();
      img.onload = () => canvas.getContext("2d")?.drawImage(img, 0, 0);
      img.src = snapshot;
    };
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className="absolute inset-0 z-40">
      <canvas
        ref={canvasRef}
        className="size-full cursor-crosshair"
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.strokeStyle = color;
          ctx.lineWidth = 5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-popover/95 px-4 py-3 shadow-2xl">
        <Pencil className="size-5 text-muted-foreground" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`size-8 rounded-full ring-offset-2 ring-offset-popover ${
              color === c ? "ring-2 ring-foreground" : ""
            }`}
            aria-label={`اللون ${c}`}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            const c = canvasRef.current;
            c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
        >
          <Eraser className="size-4" /> مسح
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl bg-destructive px-3 py-2 text-sm text-destructive-foreground"
        >
          <X className="size-4" /> إغلاق السبورة
        </button>
      </div>
    </div>
  );
}
