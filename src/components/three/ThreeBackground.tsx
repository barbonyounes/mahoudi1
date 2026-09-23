import { lazy, Suspense, useEffect, useState } from "react";
import type { ModelKind } from "@/data/lesson";
import storybookBg from "@/assets/storybook-bg.jpg";
import { useLowPowerDevice, useWebglSlot } from "@/hooks/useWebglGuard";

const LessonScene = lazy(() => import("./LessonScene"));

/**
 * يحمّل المشهد ثلاثي الأبعاد بعد الترطيب فقط، ويُلغى تلقائياً
 * على الهاتف أو عند انخفاض الإطارات أو عند فقدان سياق WebGL.
 */
export function ThreeBackground({
  index,
  model,
  enabled,
  onDegraded,
}: {
  index: number;
  model: ModelKind;
  enabled: boolean;
  onDegraded: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const lowPower = useLowPowerDevice();
  // الخلفية الزخرفية أدنى أولوية: تتنازل عن السياق لصالح المحاكاة التعليمية
  const active = useWebglSlot(mounted && enabled && !lowPower, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    let frames = 0;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      frames += 1;
      if (performance.now() - start < 3000) {
        raf = requestAnimationFrame(tick);
      } else if (frames / 3 < 20) {
        onDegraded();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, onDegraded]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <img
        src={storybookBg}
        alt=""
        width={1920}
        height={1088}
        className="storybook-bg absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-background/45" />
      {active && (
        <div className="absolute inset-0 opacity-35">
          <Suspense fallback={null}>
            <LessonScene index={index} model={model} onContextLost={onDegraded} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
