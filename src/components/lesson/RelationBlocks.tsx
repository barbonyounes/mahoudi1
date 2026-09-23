import { useState } from "react";
import { Check, Eye, Link2 } from "lucide-react";
import type { Block } from "@/data/lesson";
import { cn } from "@/lib/utils";

/** الوثيقة 2: بطاقات الكائنات — انقر على البطاقة لإظهار خط الارتباط ونوع العلاقة */
export function RelationExplorerBlock({
  block,
}: {
  block: Extract<Block, { kind: "relationExplorer" }>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number[]>([]);
  const active = open === null ? null : block.cases[open]!;
  const allDone = answered.length === block.cases.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
        <p className="mt-1 text-[1.05em] text-muted-foreground">{block.instruction}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {block.cases.map((c, i) => (
          <button
            key={c.relation + c.a.name}
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className={cn(
              "rounded-2xl border-2 p-4 text-right transition",
              open === i ? "border-primary ring-2 ring-primary/40" : "border-border",
              answered.includes(i) ? "bg-success/10" : "bg-secondary/25",
            )}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="rounded-xl border border-border bg-background/60 px-3 py-2 text-[1.6em]">
                {c.a.emoji}
              </span>
              <Link2
                className={cn(
                  "size-6 transition",
                  open === i || answered.includes(i) ? "text-primary" : "text-muted-foreground/50",
                )}
              />
              <span className="rounded-xl border border-border bg-background/60 px-3 py-2 text-[1.6em]">
                {c.b.emoji}
              </span>
            </span>
            <span className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[1.05em] font-semibold">
                {c.a.name} — {c.b.name}
              </span>
              {answered.includes(i) && <Check className="size-5 text-success" />}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="animate-fade-in space-y-4 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-5">
          <p className="text-[1.15em]">
            <span className="font-bold text-primary">طبيعة الصلة: </span>
            {active.link}
          </p>
          <div className="rounded-xl border border-accent/50 bg-accent/10 p-4">
            <p className="text-[0.8em] font-semibold text-accent">نقطة توقف</p>
            <p className="mt-1 text-[1.35em] font-semibold leading-relaxed">{active.question}</p>
            {answered.includes(open!) ? (
              <div className="mt-3 animate-fade-in space-y-2 rounded-lg border border-success/50 bg-success/10 p-3">
                <p className="text-[1.05em] font-bold text-success">
                  نوع العلاقة: {active.relation}
                </p>
                <p className="text-[1.15em] leading-relaxed">{active.note}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAnswered((a) => [...a, open!])}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[1em] font-semibold text-primary-foreground"
              >
                <Eye className="size-5" /> تثبيت إجابة التلميذ
              </button>
            )}
          </div>
        </div>
      )}

      {allDone && (
        <p className="animate-fade-in rounded-2xl border border-success/50 bg-success/10 p-5 text-[1.25em] leading-relaxed">
          {block.conclusion}
        </p>
      )}
    </div>
  );
}
