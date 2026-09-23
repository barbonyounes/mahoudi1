import { lazy, Suspense, useEffect, useState } from "react";
import { Droplets, Play, RotateCcw, FastForward, ClipboardList, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOILS, usePermeabilitySim, type SoilKey } from "./usePermeabilitySim";
import { useFpsGuard, useLowPowerDevice, useWebglSlot } from "@/hooks/useWebglGuard";

const PermeabilityScene = lazy(() => import("./PermeabilityScene"));

const SOIL_KEYS = Object.keys(SOILS) as SoilKey[];

export function PermeabilityLab({ title, conclusion }: { title: string; conclusion: string }) {
  const sim = usePermeabilitySim();
  const [mounted, setMounted] = useState(false);
  const [pref3d, setPref3d] = useState<boolean | null>(null);
  const [gpuFailed, setGpuFailed] = useState(false);
  const lowPower = useLowPowerDevice();
  const use3d = pref3d ?? !lowPower;
  const wants3d = mounted && use3d && !gpuFailed;
  const canRender3d = useWebglSlot(wants3d, 2);
  const [showConclusion, setShowConclusion] = useState(false);

  useFpsGuard(canRender3d, () => setGpuFailed(true));

  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.4em] font-bold">{title}</h3>
        <button
          type="button"
          onClick={() => setPref3d(!use3d)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[0.85em] text-muted-foreground hover:text-foreground"
        >
          <Boxes className="size-4" /> {canRender3d ? "عرض مبسّط" : "عرض ثلاثي الأبعاد"}
        </button>
      </div>

      {gpuFailed && (
        <p className="rounded-xl bg-warning/20 px-4 py-2 text-[0.8em] text-foreground/80">
          تم التحويل تلقائياً إلى العرض المبسّط للحفاظ على ثبات الأداء على هذا الجهاز.
        </p>
      )}

      {/* المشهد */}
      <div className="overflow-hidden rounded-2xl border border-border bg-[#07141c]">
        <div className="relative h-[clamp(260px,38vh,440px)]">
          {canRender3d ? (
            <Suspense fallback={<FlatLab sim={sim} />}>
              <PermeabilityScene
                funnels={sim.funnels}
                volume={sim.volume}
                running={sim.running}
                onContextLost={() => setGpuFailed(true)}
              />
            </Suspense>
          ) : (
            <FlatLab sim={sim} />
          )}
        </div>
        {/* قراءات حية */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border border-t border-border">
          {sim.funnels.map((f, i) => (
            <div key={i} className="p-4 text-center">
              <p className="text-[0.85em] text-muted-foreground">{SOILS[f.soil].label}</p>
              <p className="text-[1.6em] font-bold tabular-nums text-primary">
                {Math.round(f.percolated)} <span className="text-[0.5em]">مل</span>
              </p>
              <p className="text-[0.75em] text-muted-foreground">
                محتفَظ به: {Math.round(sim.volume - f.percolated)} مل
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* لوحة التحكم */}
      <div className="grid gap-4 rounded-2xl border border-border bg-secondary/30 p-5 md:grid-cols-3">
        {sim.soils.map((key, i) => (
          <div key={i}>
            <p className="mb-2 text-[0.85em] text-muted-foreground">القمع {i + 1}</p>
            <div className="flex gap-1.5">
              {SOIL_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => sim.setSoil(i, k)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-[0.8em] transition",
                    key === k
                      ? "border-primary bg-primary/20 font-bold text-primary"
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SOILS[k].short}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="md:col-span-2">
          <label className="mb-2 block text-[0.85em] text-muted-foreground">
            حجم الماء المسكوب: <span className="font-bold text-foreground">{sim.volume} مل</span>
          </label>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={sim.volume}
            onChange={(e) => {
              sim.reset();
              sim.setVolume(Number(e.target.value));
            }}
            className="w-full accent-[var(--primary)]"
          />
        </div>

        <div>
          <p className="mb-2 text-[0.85em] text-muted-foreground">سرعة الزمن</p>
          <div className="flex gap-1.5">
            {[1, 4].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => sim.setSpeed(sp)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-2 text-[0.8em]",
                  sim.speed === sp
                    ? "border-primary bg-primary/20 font-bold text-primary"
                    : "border-border bg-background/40 text-muted-foreground",
                )}
              >
                ×{sp}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button
            type="button"
            onClick={sim.start}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[1em] font-bold text-primary-foreground"
          >
            <Play className="size-5" /> اسكب الماء
          </button>
          <button
            type="button"
            onClick={sim.finish}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-[0.95em] font-semibold hover:bg-secondary"
          >
            <FastForward className="size-5" /> النتيجة النهائية
          </button>
          <button
            type="button"
            onClick={sim.reset}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-[0.95em] font-semibold hover:bg-secondary"
          >
            <RotateCcw className="size-5" /> أعد التجربة
          </button>
          <button
            type="button"
            onClick={sim.record}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/50 bg-accent/15 px-5 py-3 text-[0.95em] font-semibold text-accent"
          >
            <ClipboardList className="size-5" /> سجّل النتيجة
          </button>
          <span className="ms-auto self-center text-[0.9em] tabular-nums text-muted-foreground">
            <Droplets className="me-1 inline size-4" /> الزمن: {sim.elapsed.toFixed(1)} ثا
          </span>
        </div>
      </div>

      {/* جدول النتائج المسجلة */}
      {sim.records.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-right text-[0.95em]">
            <thead className="bg-secondary/60">
              <tr>
                <th className="p-3 font-semibold">نوع التربة</th>
                <th className="p-3 font-semibold">الماء المسكوب</th>
                <th className="p-3 font-semibold">الماء النافذ</th>
                <th className="p-3 font-semibold">الماء المحتفظ به</th>
                <th className="p-3 font-semibold">الزمن</th>
              </tr>
            </thead>
            <tbody>
              {sim.records.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3 font-semibold">{SOILS[r.soil].label}</td>
                  <td className="p-3 tabular-nums">{r.volume} مل</td>
                  <td className="p-3 tabular-nums text-primary">{r.percolated} مل</td>
                  <td className="p-3 tabular-nums">{r.volume - r.percolated} مل</td>
                  <td className="p-3 tabular-nums">{r.seconds} ثا</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={sim.clearRecords}
            className="w-full border-t border-border p-2 text-[0.85em] text-muted-foreground hover:bg-secondary/40"
          >
            مسح الجدول
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowConclusion(true)}
        className={cn(
          "w-full rounded-2xl border p-5 text-right transition",
          showConclusion
            ? "border-success/50 bg-success/10 text-[1.2em] leading-relaxed"
            : "border-dashed border-border text-[1em] text-muted-foreground hover:bg-secondary/40",
        )}
      >
        {showConclusion ? conclusion : "اضغط لكشف الاستنتاج"}
      </button>
    </div>
  );
}

/** بديل ثنائي الأبعاد يضمن سير التجربة على الأجهزة الضعيفة */
function FlatLab({ sim }: { sim: ReturnType<typeof usePermeabilitySim> }) {
  return (
    <div className="flex h-full items-end justify-center gap-10 p-6">
      {sim.funnels.map((f, i) => {
        const level = Math.min(1, f.percolated / Math.max(1, sim.volume));
        return (
          <div key={i} className="flex w-24 flex-col items-center">
            <div
              className="h-10 w-20"
              style={{
                background: SOILS[f.soil].hex,
                clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)",
              }}
            />
            <div
              className={cn(
                "w-1 bg-sky-400/70 transition-all",
                sim.running && f.rate > 0.6 ? "h-8 opacity-100" : "h-8 opacity-10",
              )}
            />
            <div className="flex h-24 w-20 items-end rounded-b-lg border-2 border-t-0 border-sky-200/40">
              <div
                className="w-full rounded-b-md bg-sky-400/70 transition-[height] duration-200"
                style={{ height: `${level * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
