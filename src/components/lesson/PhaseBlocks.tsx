import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, Eye, Lightbulb, Lock, Puzzle, Timer, X } from "lucide-react";
import type { Block } from "@/data/lesson";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* 1. محطة التعليمة (المهمة)                                            */
/* ------------------------------------------------------------------ */
export function TaskBlock({ block }: { block: Extract<Block, { kind: "task" }> }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-[0.75em] font-bold text-primary-foreground">
          <ClipboardList className="size-4" /> التعليمة
        </span>
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
        {block.minutes && (
          <span className="text-[0.85em] text-muted-foreground">({block.minutes} دقائق)</span>
        )}
      </div>

      <p className="text-[1.5em] font-semibold leading-[1.9] text-foreground/90">
        {block.instruction}
      </p>

      <ol className="mt-5 space-y-3">
        {block.steps.map((step, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-right text-[1.15em] transition",
                checked[i]
                  ? "border-success/60 bg-success/15 text-foreground"
                  : "border-border bg-background/40 hover:bg-secondary/50",
              )}
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[0.8em] font-bold text-primary">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">{step}</span>
            </button>
          </li>
        ))}
      </ol>

      {block.support && (
        <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-[1em] text-muted-foreground">
          {block.support}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. التحليل ثم التفسير                                                */
/* ------------------------------------------------------------------ */
export function AnalysisBlock({ block }: { block: Extract<Block, { kind: "analysis" }> }) {
  /** 0: المعطيات فقط، 1: التحليل، 2: حقل التفسير، 3: التفسير المرجعي */
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      <h3 className="text-[1.4em] font-bold">{block.title}</h3>

      <p className="rounded-2xl border border-border bg-secondary/40 p-5 text-[1.15em] leading-relaxed">
        {block.data}
      </p>

      {step >= 1 && (
        <div className="animate-fade-in rounded-2xl border border-primary/40 bg-primary/10 p-5">
          <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-[0.75em] font-bold text-primary">
            ماذا نلاحظ؟ — التحليل
          </span>
          <p className="text-[1.35em] leading-relaxed">{block.observation}</p>
        </div>
      )}

      {step >= 2 && (
        <div className="animate-fade-in rounded-2xl border-2 border-accent/50 bg-accent/10 p-5">
          <span className="mb-2 inline-block rounded-full bg-accent/25 px-3 py-1 text-[0.75em] font-bold text-accent">
            لماذا؟ — التفسير
          </span>
          <p className="mb-3 text-[1.3em] font-semibold leading-relaxed">{block.question}</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="اكتب هنا تفسير التلاميذ قبل كشف التفسير المرجعي…"
            className="w-full resize-y rounded-xl border border-border bg-background/70 p-4 text-[1.05em] leading-relaxed outline-none focus:border-accent"
          />
        </div>
      )}

      {step >= 3 && (
        <p className="animate-fade-in rounded-2xl border border-success/50 bg-success/10 p-5 text-[1.25em] leading-relaxed">
          {block.explanation}
        </p>
      )}

      {step < 3 && (
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[1em] font-bold text-primary-foreground"
        >
          {step === 0 && <>كشف التحليل</>}
          {step === 1 && <>التالي: التفسير</>}
          {step === 2 && (
            <>
              <Eye className="size-5" /> كشف التفسير المرجعي
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. الأثر الكتابي — وضع التدوين المقفل                                 */
/* ------------------------------------------------------------------ */
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CopyModeBlock({ block }: { block: Extract<Block, { kind: "copyMode" }> }) {
  const [active, setActive] = useState(false);
  const [left, setLeft] = useState(block.minutes * 60);
  const { theme, setTheme } = useTheme();
  const previous = useRef(theme);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  const start = () => {
    previous.current = theme;
    setTheme("night");
    setLeft(block.minutes * 60);
    setActive(true);
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  const stop = () => {
    setActive(false);
    setTheme(previous.current);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-[1.4em] font-bold">
          <Lock className="size-6 text-primary" /> {block.title}
        </h3>
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[0.95em] font-bold text-primary-foreground"
        >
          <Timer className="size-5" /> بدء التدوين ({block.minutes} د)
        </button>
      </div>
      <p className="text-[1.05em] text-muted-foreground">
        يقفل هذا الوضع كل التفاعلات، ويحوّل الشاشة إلى العرض الليلي المريح للعين، ويعرض النص بخط
        كبير مع مؤقت عكسي.
      </p>

      {active &&
        createPortal(
          <div
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="وضع التدوين"
            className="fixed inset-0 z-[9999] flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-3 sm:px-8">
              <span
                className={cn(
                  "col-start-2 rounded-full bg-secondary px-5 py-1.5 font-mono text-xl font-bold tabular-nums sm:text-3xl",
                  left === 0 && "bg-destructive/20 text-destructive",
                )}
              >
                {fmt(left)}
              </span>
              <button
                type="button"
                onClick={stop}
                className="storybook-pill col-start-3 row-start-1 inline-flex min-h-11 justify-self-end items-center gap-2 bg-secondary px-4 py-2 text-sm font-bold hover:bg-secondary/80 sm:text-base"
              >
                <X className="size-5" /> إنهاء
              </button>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-12 sm:py-10 lg:px-20">
              <div className="mx-auto flex min-h-full w-full max-w-[1500px] items-center">
                <ol className="w-full space-y-5 sm:space-y-7">
                  {block.sentences.map((sentence, i) => (
                    <li
                      key={i}
                      className="text-[clamp(1.35rem,3.5vw,3rem)] font-medium leading-[1.85]"
                    >
                      {sentence}
                    </li>
                  ))}
                </ol>
              </div>
            </main>

            {left === 0 && (
              <p className="shrink-0 bg-destructive/20 py-3 text-center text-base font-bold text-destructive">
                انتهى وقت التدوين
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. الإدماج الجزئي                                                    */
/* ------------------------------------------------------------------ */
export function IntegrationBlock({
  block,
}: {
  block: Extract<Block, { kind: "integration" }>;
}) {
  const [showResources, setShowResources] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-accent/50 bg-accent/10 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-[0.75em] font-bold text-accent-foreground">
          <Puzzle className="size-4" /> إدماج جزئي
        </span>
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
      </div>

      <p className="rounded-2xl border border-border bg-background/50 p-5 text-[1.3em] leading-[1.9]">
        {block.scenario}
      </p>

      <p className="mt-4 text-[1.4em] font-bold leading-relaxed text-primary">{block.question}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowResources((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[0.95em] hover:bg-secondary"
        >
          <Lightbulb className="size-5" /> الموارد المجنَّدة
        </button>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[0.95em] font-bold text-primary-foreground"
        >
          <Eye className="size-5" /> كشف الحل المنتظر
        </button>
      </div>

      {showResources && (
        <ul className="mt-4 animate-fade-in space-y-2 rounded-xl border border-dashed border-border p-4">
          {block.resources.map((r, i) => (
            <li key={i} className="text-[1.1em] text-foreground/85">
              • {r}
            </li>
          ))}
        </ul>
      )}

      {revealed && (
        <p className="mt-4 animate-fade-in rounded-2xl border border-success/50 bg-success/10 p-5 text-[1.25em] leading-relaxed">
          {block.expected}
        </p>
      )}
    </div>
  );
}
