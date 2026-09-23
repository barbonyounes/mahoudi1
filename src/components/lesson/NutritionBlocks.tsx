import { useEffect, useState } from "react";
import { Check, Flame, RotateCcw } from "lucide-react";
import type { Block } from "@/data/lesson";
import { cn } from "@/lib/utils";

type BurnBlock = Extract<Block, { kind: "burnLab" }>;

/** محاكاة تجربة حرق الأغذية: الأغذية العضوية تتفحّم، المعدنية لا تتفحّم */
export function BurnLabBlock({ block }: { block: BurnBlock }) {
  const [active, setActive] = useState<number | null>(null);
  const [burning, setBurning] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const [showNote, setShowNote] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const sample = active === null ? null : block.samples[active]!;

  useEffect(() => {
    if (!burning) return;
    const t = setTimeout(() => {
      setBurning(false);
      setDone((d) => (active !== null && !d.includes(active) ? [...d, active] : d));
    }, 1800);
    return () => clearTimeout(t);
  }, [burning, active]);

  const allDone = done.length === block.samples.length;
  const revealed = sample !== null && !burning && active !== null && done.includes(active);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.4em] font-bold">{block.title}</h3>
          <p className="mt-1 text-[1.05em] text-muted-foreground">{block.instruction}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActive(null);
            setDone([]);
            setBurning(false);
            setShowNote(false);
            setShowVerdict(false);
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-border px-3 py-2 text-[0.95em] font-semibold"
        >
          <RotateCcw className="size-4" /> إعادة
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {block.samples.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => {
              setActive(i);
              setShowNote(false);
              setShowVerdict(false);
              setBurning(!done.includes(i));
            }}
            className={cn(
              "rounded-2xl border-2 p-3 text-center transition",
              active === i ? "border-primary ring-2 ring-primary/40" : "border-border",
              done.includes(i) && "bg-success/10",
            )}
          >
            <span className="block text-[2em] leading-none">{s.emoji}</span>
            <span className="mt-2 block text-[1em] font-bold">{s.name}</span>
            {done.includes(i) && <Check className="mx-auto mt-1 size-4 text-success" />}
          </button>
        ))}
      </div>

      {sample && (
        <div className="animate-fade-in grid gap-4 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-5 md:grid-cols-[minmax(0,1fr)_1.4fr]">
          {/* أنبوب الاختبار فوق اللهب */}
          <div className="flex flex-col items-center justify-end gap-2 rounded-2xl bg-background/60 p-4">
            <div className="relative h-40 w-16 overflow-hidden rounded-b-2xl rounded-t-md border-4 border-border/70 bg-background">
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 transition-all duration-[1600ms]",
                  burning ? "h-16" : "h-10",
                  revealed && sample.organic ? "bg-foreground" : "bg-primary/40",
                )}
              />
              {burning && (
                <div className="absolute inset-x-0 bottom-0 h-full animate-pulse bg-gradient-to-t from-orange-500/60 to-transparent" />
              )}
            </div>
            <Flame
              className={cn("size-9", burning ? "animate-bounce text-orange-500" : "text-muted-foreground")}
            />
            <span className="text-[0.95em] font-semibold text-muted-foreground">
              {burning ? "…جارٍ التسخين" : "الموقد"}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[1.3em] font-bold text-primary">
              {sample.emoji} {sample.name}
            </p>
            {burning ? (
              <p className="text-[1.15em] text-muted-foreground">لاحظ ما يحدث داخل الأنبوب…</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowNote(true)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-right text-[1.15em] transition",
                    showNote
                      ? "border-border bg-background/60"
                      : "border-dashed border-primary/50 text-muted-foreground hover:bg-primary/5",
                  )}
                >
                  {showNote ? (
                    <>
                      <strong>الملاحظة: </strong>
                      {sample.residue}
                    </>
                  ) : (
                    "اضغط لكشف الملاحظة"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerdict(true)}
                  className={cn(
                    "w-full rounded-xl p-3 text-right text-[1.15em] font-bold transition",
                    !showVerdict
                      ? "border border-dashed border-primary/50 text-muted-foreground hover:bg-primary/5"
                      : sample.organic
                        ? "bg-success/15 text-success"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  {showVerdict
                    ? sample.organic
                      ? "غذاء عضوي (يتفحّم)"
                      : "غذاء معدني (لا يتفحّم)"
                    : "اضغط لكشف الاستنتاج"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {allDone && (
        <p className="animate-fade-in rounded-2xl border-2 border-success/50 bg-success/10 p-4 text-[1.25em] font-bold leading-relaxed">
          {block.conclusion}
        </p>
      )}
    </div>
  );
}
