import { useState } from "react";
import { Check, Eye, HelpCircle, Lightbulb, Plus, X } from "lucide-react";
import type { Block } from "@/data/lesson";
import { cn } from "@/lib/utils";

/* ---------------- 1. وثيقة الصورتين ---------------- */
export function ImagePairBlock({ block }: { block: Extract<Block, { kind: "imagePair" }> }) {
  const [zoom, setZoom] = useState<null | "left" | "right">(null);
  const side = zoom === "left" ? block.left : zoom === "right" ? block.right : null;

  return (
    <div className="space-y-4">
      <h3 className="text-[1.4em] font-bold">{block.title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["left", "right"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setZoom(k)}
            className="group overflow-hidden rounded-2xl border-2 border-border text-right transition hover:border-primary"
          >
            <img
              src={block[k].src}
              alt={block[k].caption}
              loading="lazy"
              className="h-auto w-full object-cover"
            />
            <p className="bg-secondary/60 p-3 text-[1em] text-foreground/85">{block[k].caption}</p>
          </button>
        ))}
      </div>
      {block.prompt && (
        <p className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-5 text-[1.35em] font-semibold leading-relaxed">
          {block.prompt}
        </p>
      )}

      {side && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-4 bg-black/90 p-4"
          onClick={() => setZoom(null)}
        >
          <img src={side.src} alt={side.caption} className="max-h-[80vh] w-auto rounded-2xl" />
          <p className="text-center text-lg text-white/85">{side.caption}</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white"
          >
            <X className="size-4" /> إغلاق العرض
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- 2. الفرضيات ---------------- */
type Hyp = { text: string; verdict: null | "valid" | "invalid" };

export function HypothesesBlock({ block }: { block: Extract<Block, { kind: "hypotheses" }> }) {
  const [items, setItems] = useState<Hyp[]>([]);
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setItems((a) => [...a, { text: t, verdict: null }]);
    setDraft("");
  };

  const setVerdict = (i: number, v: Hyp["verdict"]) =>
    setItems((a) => a.map((h, j) => (j === i ? { ...h, verdict: h.verdict === v ? null : v } : h)));

  return (
    <div className="space-y-4">
      <h3 className="inline-flex items-center gap-2 text-[1.4em] font-bold">
        <Lightbulb className="size-6 text-primary" /> {block.title}
      </h3>
      <p className="text-[1.2em] leading-relaxed text-foreground/85">{block.prompt}</p>

      <div className="flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="أضف فرضية كما نطقها التلميذ…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 p-3 text-[1.05em] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[0.95em] font-bold text-primary-foreground"
        >
          <Plus className="size-5" /> إضافة
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((h, i) => (
          <li
            key={i}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-xl border p-4 text-[1.15em]",
              h.verdict === "valid" && "border-success/60 bg-success/15",
              h.verdict === "invalid" && "border-destructive/60 bg-destructive/10 line-through opacity-70",
              !h.verdict && "border-border bg-background/40",
            )}
          >
            <span className="min-w-0 flex-1">{h.text}</span>
            <button
              type="button"
              onClick={() => setVerdict(i, "valid")}
              className="rounded-lg border border-success/50 px-3 py-1.5 text-[0.8em] text-success"
            >
              صحّت
            </button>
            <button
              type="button"
              onClick={() => setVerdict(i, "invalid")}
              className="rounded-lg border border-destructive/50 px-3 py-1.5 text-[0.8em] text-destructive"
            >
              بطلت
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- 3. واجهة الوسط الحي التفاعلية ---------------- */
export function EcosystemBlock({ block }: { block: Extract<Block, { kind: "ecosystem" }> }) {
  const [open, setOpen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, "bio" | "abio">>({});
  const [conclusion, setConclusion] = useState(false);

  const item = open === null ? null : block.items[open]!;
  const picked = open === null ? undefined : answers[open];
  const stopIndex =
    open !== null && block.items.findIndex((it) => it.type === block.items[open]!.type) === open
      ? block.items[open]!.type === "bio"
        ? 1
        : 2
      : null;

  const done = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      <h3 className="text-[1.4em] font-bold">{block.title}</h3>
      <p className="text-[1.1em] text-muted-foreground">{block.instruction}</p>

      <div className="relative overflow-hidden rounded-2xl border-2 border-border">
        <img src={block.image} alt="الوسط الحي" loading="lazy" className="w-full" />
        {block.items.map((it, i) => (
          <button
            key={it.name}
            type="button"
            onClick={() => setOpen(i)}
            style={{ right: `${it.x}%`, top: `${it.y}%` }}
            title={it.name}
            className={cn(
              "absolute -translate-y-1/2 translate-x-1/2 rounded-full border-2 bg-background/85 p-2 text-xl shadow-lg backdrop-blur transition hover:scale-110 sm:text-2xl",
              answers[i] === "bio" && "border-success bg-success/30",
              answers[i] === "abio" && "border-accent bg-accent/30",
              !answers[i] && "animate-pulse border-primary",
            )}
          >
            <span aria-hidden>{it.emoji}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(["bio", "abio"] as const).map((t) => (
          <div
            key={t}
            className={cn(
              "rounded-2xl border p-4",
              t === "bio" ? "border-success/50 bg-success/10" : "border-accent/50 bg-accent/10",
            )}
          >
            <h4 className="mb-2 text-[1.15em] font-bold">
              {t === "bio" ? "عناصر حية (الوحدة الحياتية)" : "عناصر لاحية (المدى الحيوي)"}
            </h4>
            <ul className="space-y-1 text-[1.05em]">
              {block.items.map((it, i) =>
                answers[i] === t ? (
                  <li key={it.name}>
                    {it.emoji} {it.name}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.95em] text-muted-foreground">
          صُنِّف {done} من {block.items.length}
        </span>
        <button
          type="button"
          onClick={() => setConclusion(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[0.95em] font-bold text-primary-foreground"
        >
          <Eye className="size-5" /> كشف الاستنتاج
        </button>
      </div>

      {conclusion && (
        <p className="animate-fade-in rounded-2xl border border-success/50 bg-success/10 p-5 text-[1.25em] leading-relaxed">
          {block.conclusion}
        </p>
      )}

      {item && open !== null && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[65] flex items-end justify-center bg-black/70 p-4 sm:items-center"
        >
          <div className="w-full max-w-xl rounded-3xl border-2 border-border bg-background p-6">
            {stopIndex && (
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-warning px-3 py-1 text-xs font-bold text-warning-foreground">
                نقطة توقف {stopIndex}
              </span>
            )}
            <h4 className="mb-2 text-2xl font-bold">
              {item.emoji} {item.name}
            </h4>
            <p className="mb-5 inline-flex items-start gap-2 text-lg leading-relaxed text-foreground/85">
              <HelpCircle className="mt-1 size-5 shrink-0 text-primary" /> {item.question}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["bio", "abio"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [open]: t }))}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-base font-bold transition",
                    picked === t
                      ? t === item.type
                        ? "border-success bg-success/25 text-success"
                        : "border-destructive bg-destructive/20 text-destructive"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {t === "bio" ? "عنصر حي" : "عنصر لاحي"}
                </button>
              ))}
            </div>

            {picked && (
              <p
                className={cn(
                  "mt-4 animate-fade-in rounded-xl border p-4 text-base leading-relaxed",
                  picked === item.type
                    ? "border-success/50 bg-success/10"
                    : "border-destructive/50 bg-destructive/10",
                )}
              >
                {picked === item.type ? (
                  <span className="inline-flex items-center gap-2 font-bold">
                    <Check className="size-5" /> إجابة صحيحة —{" "}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 font-bold">
                    <X className="size-5" /> أعد الملاحظة —{" "}
                  </span>
                )}
                {item.note}
              </p>
            )}

            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mt-5 w-full rounded-xl border border-border py-3 text-base font-semibold hover:bg-secondary"
            >
              متابعة الاستقصاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 4. جدول يُكشف سطراً بسطر ---------------- */
export function RevealGridBlock({ block }: { block: Extract<Block, { kind: "revealGrid" }> }) {
  const [shown, setShown] = useState(0);
  const [conclusion, setConclusion] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShown((s) => Math.min(block.rows.length, s + 1))}
            disabled={shown >= block.rows.length}
            className="rounded-xl bg-primary px-5 py-2.5 text-[0.9em] font-bold text-primary-foreground disabled:opacity-40"
          >
            كشف السطر التالي
          </button>
          <button
            type="button"
            onClick={() => setShown(0)}
            className="rounded-xl border border-border px-4 py-2.5 text-[0.9em] hover:bg-secondary"
          >
            إخفاء
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-right text-[1.1em]">
          <thead className="bg-secondary/60">
            <tr>
              {block.columns.map((c) => (
                <th key={c} className="p-4 font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                {r.map((v, j) => (
                  <td key={j} className="p-4">
                    {i < shown ? (
                      <span className="animate-fade-in">{v}</span>
                    ) : (
                      <span className="inline-block h-3 w-16 rounded-full bg-muted-foreground/25" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setConclusion(true)}
        className={cn(
          "w-full rounded-2xl border p-5 text-right transition",
          conclusion
            ? "border-success/50 bg-success/10 text-[1.25em] leading-relaxed"
            : "border-dashed border-border text-[1em] text-muted-foreground hover:bg-secondary/40",
        )}
      >
        {conclusion ? block.conclusion : "اضغط لكشف المعيار العلمي"}
      </button>
    </div>
  );
}
