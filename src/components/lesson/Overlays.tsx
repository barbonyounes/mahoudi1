import { useEffect, useState } from "react";
import { Coffee, Home, PartyPopper, Play, RotateCcw, Shuffle } from "lucide-react";
import { formatClock } from "@/hooks/useLessonSession";
import { useClassroom } from "@/hooks/useClassroom";
import { FEEDBACK_LABELS } from "@/data/classroom";
import type { LessonDef } from "@/data/lesson";

/** شاشة الاستعداد قبل بدء الحصة */
export function StandbyScreen({ lesson, onStart }: { lesson: LessonDef; onStart: () => void }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="lesson-scroll absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-background/85 px-4 py-8 text-center backdrop-blur-xl sm:gap-8">
      <p className="text-lg text-muted-foreground sm:text-2xl">{lesson.subject}</p>
      <p className="text-[clamp(4rem,14vw,11rem)] font-bold leading-none tabular-nums text-primary">
        {now}
      </p>
      <h1 className="max-w-4xl px-6 text-center text-[clamp(1.6rem,4vw,3rem)] font-bold">
        {lesson.title}
      </h1>
      <p className="text-base text-muted-foreground sm:text-xl">
        {lesson.level} — مدة الحصة {lesson.totalMinutes} دقيقة
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-xl font-bold text-primary-foreground transition hover:opacity-90 sm:px-10 sm:py-5 sm:text-2xl"
      >
        <Play className="size-7" /> بدء الحصة
      </button>
    </div>
  );
}

/** شاشة الاستراحة (زر 5 دقائق) */
export function BreakOverlay({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-2xl">
      <Coffee className="size-16 text-primary" />
      <p className="text-3xl text-muted-foreground">استراحة قصيرة — الحصة متوقفة مؤقتاً</p>
      <p className="text-[clamp(5rem,18vw,14rem)] font-bold leading-none tabular-nums text-primary">
        {formatClock(seconds)}
      </p>
      <button
        type="button"
        onClick={onEnd}
        className="rounded-2xl border border-border px-8 py-4 text-xl font-semibold hover:bg-secondary"
      >
        استئناف الحصة الآن
      </button>
    </div>
  );
}

/** التعتيم الفوري لإعادة الانتباه */
export function BlackoutOverlay({ onExit }: { onExit: () => void }) {
  return (
    <button
      type="button"
      onClick={onExit}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black"
    >
      <span className="text-lg text-white/25">انقر أو اضغط B لإظهار المحتوى</span>
    </button>
  );
}

/** الاختيار العشوائي لاسم تلميذ مع تعليق فوري */
export function StudentPicker({ onClose }: { onClose: () => void }) {
  const { roster, activeClass, addFeedback } = useClassroom();
  const [name, setName] = useState<string>("…");
  const [spinning, setSpinning] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);

  const spin = () => {
    setSaved(null);
    setSpinning(true);
    let count = 0;
    const id = window.setInterval(() => {
      setName(roster[Math.floor(Math.random() * roster.length)] ?? "…");
      count += 1;
      if (count > 18) {
        window.clearInterval(id);
        setSpinning(false);
      }
    }, 80);
    return () => window.clearInterval(id);
  };

  useEffect(spin, [roster]);

  return (
    <div className="lesson-scroll absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 overflow-y-auto bg-background/90 p-4 backdrop-blur-xl">
      <Shuffle className="size-10 text-accent" />
      <p className="text-xl text-muted-foreground">
        التلميذ المعني بالإجابة{activeClass ? ` — ${activeClass.name}` : ""}
      </p>
      <p className="text-[clamp(2.4rem,10vw,7rem)] font-bold leading-none text-accent">{name}</p>

      {!spinning && (
        <div className="flex max-w-2xl flex-wrap justify-center gap-2">
          {FEEDBACK_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                addFeedback(name, label);
                setSaved(label);
              }}
              className="rounded-2xl border border-border bg-card px-4 py-2.5 text-base font-semibold hover:bg-secondary"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {saved && <p className="text-sm text-success">سُجّل التعليق: {saved}</p>}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground disabled:opacity-40"
        >
          اختيار آخر
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          className="rounded-2xl border border-border px-6 py-3 text-lg font-semibold hover:bg-secondary disabled:opacity-40"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

/** مولّد الأفواج الثنائية لتحليل الجداول */
export function PairsOverlay({ onClose }: { onClose: () => void }) {
  const { roster } = useClassroom();
  const [pairs, setPairs] = useState<string[][]>([]);
  const shuffle = () => {
    const arr = [...roster].sort(() => Math.random() - 0.5);
    const out: string[][] = [];
    for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
    setPairs(out);
  };
  useEffect(shuffle, [roster]);

  return (
    <div className="lesson-scroll absolute inset-0 z-50 overflow-auto bg-background/95 p-4 backdrop-blur-xl sm:p-10">
      <h2 className="mb-6 text-center text-4xl font-bold">الأفواج الثنائية</h2>
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border bg-secondary/40 p-5 text-center">
            <p className="mb-1 text-sm text-muted-foreground">الفوج {i + 1}</p>
            <p className="text-2xl font-bold text-primary">{p.join(" و ")}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          onClick={shuffle}
          className="rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground"
        >
          إعادة التوزيع
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-border px-8 py-4 text-lg font-semibold hover:bg-secondary"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

/** الملخص النهائي للحصة */
export function SummaryOverlay({
  lesson,
  onClose,
  stationSeconds,
  totalSeconds,
}: {
  lesson: LessonDef;
  onClose: () => void;
  stationSeconds: number[];
  totalSeconds: number;
}) {
  return (
    <div className="absolute inset-0 z-50 overflow-auto bg-background/95 p-4 backdrop-blur-xl sm:p-8 lesson-scroll">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-4xl font-bold">ملخص الحصة</h2>
        <p className="mb-8 text-xl text-muted-foreground">
          {lesson.title} — الزمن الإجمالي {formatClock(totalSeconds)}
        </p>
        <div className="space-y-5">
          {lesson.stations.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <span className="tabular-nums text-muted-foreground">
                  {formatClock(stationSeconds[i] ?? 0)} / {s.minutes}:00
                </span>
              </div>
              <ul className="space-y-2">
                {s.keyPoints.map((k, j) => (
                  <li key={j} className="text-lg text-foreground/85">
                    • {k}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-4 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground"
          >
            طباعة / تصدير ورقة الدرس
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border px-8 py-4 text-lg font-semibold hover:bg-secondary"
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}

/** شاشة نهاية الحصة: تظهر بعد آخر عنصر من آخر محطة */
export function EndScreen({
  lesson,
  stationSeconds,
  totalSeconds,
  quizStats,
  onReview,
  onRestart,
  onHome,
}: {
  lesson: LessonDef;
  stationSeconds: number[];
  totalSeconds: number;
  quizStats: Record<string, { correct: number; total: number }>;
  onReview: () => void;
  onRestart: () => void;
  onHome: () => void;
}) {
  const answers = Object.values(quizStats).reduce(
    (acc, v) => ({ correct: acc.correct + v.correct, total: acc.total + v.total }),
    { correct: 0, total: 0 },
  );
  const score = answers.total ? Math.round((answers.correct / answers.total) * 100) : null;

  return (
    <div className="lesson-scroll absolute inset-0 z-[70] flex flex-col items-center justify-center gap-6 overflow-y-auto bg-background/95 px-4 py-10 text-center backdrop-blur-xl">
      <PartyPopper className="size-14 text-success" />
      <h2 className="text-[clamp(1.8rem,5vw,3.2rem)] font-bold">انتهت الحصة</h2>
      <p className="max-w-3xl text-lg text-muted-foreground sm:text-xl">{lesson.title}</p>

      <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">الزمن الإجمالي</p>
          <p className="text-3xl font-bold tabular-nums text-primary">{formatClock(totalSeconds)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">المحطات المنجزة</p>
          <p className="text-3xl font-bold tabular-nums text-primary">
            {stationSeconds.filter((v) => v > 0).length} / {lesson.stations.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">نتيجة التقويم</p>
          <p className="text-3xl font-bold tabular-nums text-success">
            {score === null ? "—" : `${score}%`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-lg font-bold text-primary-foreground hover:opacity-90"
        >
          <Home className="size-5" /> العودة إلى الصفحة الرئيسية
        </button>
        <button
          type="button"
          onClick={onReview}
          className="rounded-2xl border border-border px-6 py-4 text-lg font-semibold hover:bg-secondary"
        >
          عرض ملخص الحصة
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-4 text-lg font-semibold hover:bg-secondary"
        >
          <RotateCcw className="size-5" /> إعادة الحصة
        </button>
      </div>
    </div>
  );
}
