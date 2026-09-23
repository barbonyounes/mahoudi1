import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Eye, Pause, Play, RotateCcw, Sun, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFpsGuard, useWebglSlot } from "@/hooks/useWebglGuard";

const DesertScene = lazy(() => import("./DesertScene"));

const STOPS: { at: number; label: string; question: string }[] = [
  {
    at: 0.5,
    label: "الظهيرة",
    question: "ما موقع اليربوع الآن؟ وما قيمة حرارة السطح مقارنة بحرارة الجحر؟",
  },
  {
    at: 0.78,
    label: "الغروب",
    question: "ماذا تلاحظ على حرارة السطح؟ وما التغير الذي طرأ على سلوك اليربوع؟",
  },
  {
    at: 0.97,
    label: "منتصف الليل",
    question: "صف نشاط اليربوع في هذه اللحظة، وحدد الوقت الذي يبحث فيه عن غذائه.",
  },
];

const CLOCK = (phase: number) => {
  const h = (phase * 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** بديل ثنائي الأبعاد خفيف عند تعذّر تشغيل WebGL أو على الأجهزة الضعيفة */
function FlatDesert({ phase, dayness }: { phase: number; dayness: number }) {
  const out = Math.max(0, (1 - dayness - 0.45) / 0.55);
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg,
          color-mix(in oklab, #0b1220 ${Math.round((1 - dayness) * 100)}%, #7dd3fc) 0%,
          color-mix(in oklab, #1b1408 ${Math.round((1 - dayness) * 100)}%, #fcd9a0) 62%,
          color-mix(in oklab, #2b2416 ${Math.round((1 - dayness) * 100)}%, #e0b972) 100%)`,
      }}
    >
      <div
        className="absolute size-16 rounded-full blur-[2px]"
        style={{
          background: dayness > 0.35 ? "#fde68a" : "#e2e8f0",
          left: `${8 + phase * 82}%`,
          top: `${72 - Math.sin(phase * Math.PI * 2 - Math.PI / 2) * 45}%`,
        }}
      />
      <div className="absolute bottom-6 right-[22%] size-8 rounded-full bg-[#1a1005]" />
      <div
        className="absolute bottom-8 rounded-full bg-[#e7cfa3] transition-all duration-500"
        style={{
          right: `${22 + out * 30}%`,
          width: `${10 + out * 22}px`,
          height: `${10 + out * 22}px`,
          opacity: out,
        }}
      />
    </div>
  );
}

export function DesertSim({ title }: { title: string }) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [stopIndex, setStopIndex] = useState<number | null>(null);
  const [passed, setPassed] = useState<number[]>([]);
  const [showExplain, setShowExplain] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gpuFailed, setGpuFailed] = useState(false);
  const canRender3d = useWebglSlot(mounted && started && !gpuFailed, 2);

  useFpsGuard(canRender3d, () => setGpuFailed(true));

  const raf = useRef(0);
  const last = useRef(0);
  const passedRef = useRef(passed);
  passedRef.current = passed;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      setPhase((p) => {
        const next = p + dt * 0.06;
        const hit = STOPS.findIndex(
          (s, i) => !passedRef.current.includes(i) && p < s.at && next >= s.at,
        );
        if (hit !== -1) {
          setPlaying(false);
          setStopIndex(hit);
          setPassed((arr) => [...arr, hit]);
          return STOPS[hit]!.at;
        }
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const dayness = Math.max(0, Math.sin(phase * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
  const surface = Math.round(14 + dayness * 40);
  const burrow = Math.round(24 + dayness * 4);

  return (
    <div className="space-y-4">
      <h3 className="text-[1.4em] font-bold">{title}</h3>
      {gpuFailed && (
        <p className="rounded-xl bg-warning/20 px-4 py-2 text-[0.8em] text-foreground/80">
          تم التحويل تلقائياً إلى العرض المبسّط للحفاظ على ثبات الأداء على هذا الجهاز.
        </p>
      )}

      {!started ? (
        <div className="rounded-2xl border border-primary/40 bg-primary/10 p-7">
          <p className="mb-2 text-[0.9em] font-semibold text-primary">التقديم — التعليمة</p>
          <p className="text-[1.4em] leading-relaxed">
            شاهد المحاكاة وركّز حصرياً على نشاط اليربوع وعلى تغير حرارة سطح الرمل خلال اليوم.
          </p>
          <button
            type="button"
            onClick={() => {
              setStarted(true);
              setPlaying(true);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[1em] font-bold text-primary-foreground"
          >
            <Play className="size-5" /> تشغيل المحاكاة
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="relative h-[clamp(260px,38vh,440px)] bg-[#08111f]">
              {canRender3d ? (
                <Suspense fallback={null}>
                  <DesertScene phase={phase} onContextLost={() => setGpuFailed(true)} />
                </Suspense>
              ) : (
                <FlatDesert phase={phase} dayness={dayness} />
              )}
              <div className="pointer-events-none absolute right-4 top-4 space-y-2 text-right">
                <span className="block rounded-lg bg-background/70 px-3 py-1.5 text-[0.9em] font-bold tabular-nums backdrop-blur">
                  <Sun className="me-1 inline size-4" /> {CLOCK(phase)}
                </span>
                <span className="block rounded-lg bg-background/70 px-3 py-1.5 text-[0.85em] tabular-nums backdrop-blur">
                  <Thermometer className="me-1 inline size-4 text-destructive" /> حرارة السطح:{" "}
                  {surface}°م
                </span>
                <span className="block rounded-lg bg-background/70 px-3 py-1.5 text-[0.85em] tabular-nums backdrop-blur">
                  <Thermometer className="me-1 inline size-4 text-primary" /> داخل الجحر: {burrow}°م
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border bg-secondary/30 p-4">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[0.95em] font-bold text-primary-foreground"
              >
                {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
                {playing ? "إيقاف" : "متابعة"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setPhase(0);
                  setPassed([]);
                  setStopIndex(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-[0.95em] hover:bg-secondary"
              >
                <RotateCcw className="size-5" /> من البداية
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={phase}
                onChange={(e) => {
                  setPlaying(false);
                  setPhase(Number(e.target.value));
                }}
                className="min-w-[12rem] flex-1 accent-[var(--primary)]"
              />
            </div>
          </div>

          {stopIndex !== null && (
            <div className="animate-fade-in rounded-2xl border border-accent/50 bg-accent/10 p-6">
              <p className="mb-2 text-[0.9em] font-semibold text-accent">
                نقطة توقف — {STOPS[stopIndex]!.label}
              </p>
              <p className="text-[1.35em] leading-relaxed">{STOPS[stopIndex]!.question}</p>
              <button
                type="button"
                onClick={() => {
                  setStopIndex(null);
                  setPlaying(true);
                }}
                className="mt-4 rounded-xl border border-border px-5 py-2.5 text-[0.95em] font-semibold hover:bg-secondary"
              >
                متابعة العرض
              </button>
            </div>
          )}

          {phase >= 0.99 && (
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <p className="mb-2 text-[0.9em] font-semibold text-primary">التفسير — الربط السببي</p>
              <p className="text-[1.35em] leading-relaxed">
                فسّر سبب نشاط اليربوع ليلاً اعتماداً على العامل الفيزيائي الذي تغيّر في المحاكاة.
              </p>
              <button
                type="button"
                onClick={() => setShowExplain(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[0.95em] font-bold text-primary-foreground"
              >
                <Eye className="size-5" /> كشف الإجابة المرجعية
              </button>
              <p
                className={cn(
                  "mt-4 rounded-xl border p-5 text-[1.2em] leading-relaxed transition",
                  showExplain
                    ? "border-success/50 bg-success/10 opacity-100"
                    : "pointer-events-none border-transparent opacity-0",
                )}
              >
                يتجنب اليربوع الحرارة المرتفعة جداً على سطح الرمل نهاراً باللجوء إلى الجحر حيث
                الحرارة معتدلة والرطوبة أعلى، ويخرج ليلاً بعد انخفاض الحرارة للبحث عن غذائه. وهذا
                تكيف سلوكي مع العوامل المناخية للوسط الصحراوي.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
