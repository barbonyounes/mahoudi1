import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Check, X, Eye, Timer, PenLine, ExternalLink, Headphones, PlayCircle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Block, Term } from "@/data/lesson";
import { cn } from "@/lib/utils";
import { PermeabilityLab } from "@/components/lab/PermeabilityLab";
import { DesertSim } from "@/components/lab/DesertSim";
import {
  TaskBlock,
  AnalysisBlock,
  CopyModeBlock,
  IntegrationBlock,
} from "@/components/lesson/PhaseBlocks";
import {
  ImagePairBlock,
  HypothesesBlock,
  EcosystemBlock,
  RevealGridBlock,
} from "@/components/lesson/MilieuBlocks";
import {
  ImageTrioBlock,
  BiomeExplorerBlock,
  DragSortBlock,
} from "@/components/lesson/DiversityBlocks";
import { RelationExplorerBlock } from "@/components/lesson/RelationBlocks";
import { BurnLabBlock } from "@/components/lesson/NutritionBlocks";
import { useGlossary } from "@/components/lesson/Glossary";
import { supabase } from "@/integrations/supabase/client";

function UploadedFile({ block }: { block: Extract<Block, { kind: "uploadedFile" }> }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (block.storagePath.startsWith("data:")) {
      setUrl(block.storagePath);
      return;
    }
    let active = true;
    void supabase.storage.from("teacher-documents").createSignedUrl(block.storagePath, 3600).then(({ data }) => {
      if (active) setUrl(data?.signedUrl ?? "");
    });
    return () => { active = false; };
  }, [block.storagePath]);
  if (!url) return <p className="rounded-2xl bg-secondary p-5 text-muted-foreground">جارٍ تحميل الوثيقة الخاصة…</p>;
  return <figure className="space-y-3"><figcaption className="text-xl font-bold text-primary">{block.title}</figcaption>{block.media === "image" ? <img src={url} alt={block.title} className="max-h-[65vh] w-full rounded-2xl object-contain" /> : block.media === "video" ? <video src={url} controls className="w-full rounded-2xl" /> : block.media === "audio" ? <audio src={url} controls className="w-full" /> : <iframe src={url} title={block.title} className="h-[65vh] w-full rounded-2xl border border-border" />}{block.caption && <p className="text-muted-foreground">{block.caption}</p>}</figure>;
}

/** نص مع مصطلحات علمية قابلة للنقر — تفتح نافذة القاموس على التعريف المطابق */
function TermText({ text, terms }: { text: string; terms: Term[] }) {
  const glossary = useGlossary();
  const parts = useMemo(() => {
    const found = terms.filter((t) => text.includes(t.term));
    if (found.length === 0) return [{ text }] as { text: string; term?: Term }[];
    const pattern = new RegExp(`(${found.map((t) => t.term).join("|")})`, "g");
    return text.split(pattern).map((chunk) => {
      const term = found.find((t) => t.term === chunk);
      return term ? { text: chunk, term } : { text: chunk };
    });
  }, [text, terms]);

  return (
    <p className="leading-[1.9] text-[1.6em] text-foreground/90">
      {parts.map((p, i) =>
        p.term ? (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              glossary?.open(p.term!.term);
            }}
            className="relative mx-1 rounded-md bg-primary/15 px-1.5 text-primary underline decoration-primary/50 decoration-dotted underline-offset-8"
          >
            {p.text}
          </button>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </p>
  );
}

function QuizBlock({
  block,
  onAnswer,
  stats,
}: {
  block: Extract<Block, { kind: "quiz" }>;
  onAnswer: (correct: boolean) => void;
  stats?: { correct: number; total: number } | undefined;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-full bg-accent/20 px-4 py-1.5 text-[0.75em] font-semibold text-accent">
          سؤال تقويمي
        </span>
        <h3 className="text-[1.5em] font-bold">{block.question}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {block.options.map((opt, i) => {
          const isAnswer = i === block.answer;
          const state = revealed ? (isAnswer ? "correct" : picked === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (revealed) return;
                setPicked(i);
                onAnswer(isAnswer);
              }}
              className={cn(
                "flex items-center justify-between rounded-xl border px-5 py-4 text-right text-[1.15em] transition",
                "border-border bg-background/40 hover:border-primary/60 hover:bg-primary/10",
                picked === i && !revealed && "border-primary bg-primary/15",
                state === "correct" && "border-success bg-success/20 text-success",
                state === "wrong" && "border-destructive bg-destructive/20 text-destructive",
              )}
            >
              <span>{opt}</span>
              {state === "correct" && <Check className="size-6 shrink-0" />}
              {state === "wrong" && <X className="size-6 shrink-0" />}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[1em] font-semibold text-primary-foreground"
        >
          <Eye className="size-5" /> كشف الإجابة
        </button>
        {block.hint && !revealed && (
          <span className="text-[0.95em] text-muted-foreground">تلميح: {block.hint}</span>
        )}
        {stats && stats.total > 0 && (
          <span className="text-[0.95em] text-muted-foreground">
            مؤشر التفاعل: {Math.round((stats.correct / stats.total) * 100)}% إجابات صحيحة (
            {stats.total} محاولة)
          </span>
        )}
      </div>
    </div>
  );
}

/** جدول قياسات تُكشف أعمدته تدريجياً مع مخطط متزامن */
function RevealTable({ block }: { block: Extract<Block, { kind: "revealTable" }> }) {
  const [shown, setShown] = useState(0);
  const [conclusion, setConclusion] = useState(false);
  const chartReady = shown > block.chartColumn;
  const chartData = block.rows.map((r) => ({
    name: r.name.split("—")[0]!.trim(),
    value: Number(r.values[block.chartColumn]) || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShown((s) => Math.min(block.columns.length, s + 1))}
            className="rounded-xl bg-primary px-5 py-2.5 text-[0.9em] font-bold text-primary-foreground disabled:opacity-40"
            disabled={shown >= block.columns.length}
          >
            كشف العمود التالي
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
              <th className="p-4 font-bold">{block.rowHeader}</th>
              {block.columns.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    "p-4 font-bold transition",
                    i < shown ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {c.label}
                  {c.unit && (
                    <span className="block text-[0.7em] font-normal text-muted-foreground">
                      ({c.unit})
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="p-4 font-semibold">{r.name}</td>
                {r.values.map((v, i) => (
                  <td key={i} className="p-4 tabular-nums">
                    {i < shown ? (
                      <span className="animate-fade-in font-bold">{v}</span>
                    ) : (
                      <span className="inline-block h-3 w-12 rounded-full bg-muted-foreground/25" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartReady && (
        <div className="animate-fade-in rounded-2xl border border-border bg-secondary/30 p-5">
          <h4 className="mb-3 text-[1.1em] font-bold">
            {block.columns[block.chartColumn]!.label}
          </h4>
          <div className="h-[clamp(180px,26vh,300px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
        {conclusion ? block.conclusion : "اضغط لكشف الاستنتاج"}
      </button>
    </div>
  );
}

/** الأثر الكتابي: كشف الخلاصة جملة بجملة مع مؤقت نسخ */
function WritingBlock({
  block,
  onStartActivityTimer,
}: {
  block: Extract<Block, { kind: "writing" }>;
  onStartActivityTimer: (seconds: number) => void;
}) {
  const [shown, setShown] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-[1.4em] font-bold">
          <PenLine className="size-6 text-primary" /> {block.title}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShown((s) => Math.min(block.sentences.length, s + 1))}
            className="rounded-xl bg-primary px-5 py-2.5 text-[0.9em] font-bold text-primary-foreground disabled:opacity-40"
            disabled={shown >= block.sentences.length}
          >
            كشف الجملة التالية
          </button>
          <button
            type="button"
            onClick={() => onStartActivityTimer(block.minutes * 60)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[0.9em] hover:bg-secondary"
          >
            <Timer className="size-5" /> مؤقت النسخ {block.minutes} د
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-primary/30 bg-background/50 p-7">
        <ol className="space-y-4">
          {block.sentences.map((s, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-4 text-[1.7em] leading-[1.8] transition-all duration-500",
                i < shown ? "animate-fade-in opacity-100" : "select-none opacity-0",
              )}
            >
              <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** سؤال مفتوح مع إجابة مرجعية تُكشف بعد إجابات التلاميذ */
function OpenQuestion({ block }: { block: Extract<Block, { kind: "openQuestion" }> }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-6">
      <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-[0.75em] font-semibold text-accent">
        تمرين التقويم
      </span>
      <p className="text-[1.55em] font-semibold leading-relaxed">{block.question}</p>
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[1em] font-semibold text-primary-foreground"
      >
        <Eye className="size-5" /> كشف الإجابة المنتظرة
      </button>
      {revealed && (
        <p className="mt-5 animate-fade-in rounded-xl border border-success/50 bg-success/10 p-5 text-[1.25em] leading-relaxed">
          {block.expected}
        </p>
      )}
    </div>
  );
}

function LiveResource({ block }: { block: Extract<Block, { kind: "liveResource" }> }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const Icon = block.media === "audio" ? Headphones : block.media === "simulation" ? FlaskConical : PlayCircle;
  const label = block.media === "audio" ? "وثيقة سمعية" : block.media === "simulation" ? "تجربة تفاعلية" : "فيديو علمي";

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-secondary/30">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-7">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-bold text-primary">{label}</span>
            {block.duration && <span className="text-sm text-muted-foreground">{block.duration}</span>}
          </div>
          <h3 className="mt-3 text-[1.35em] font-bold leading-snug">{block.title}</h3>
          <p className="mt-2 text-[1em] leading-relaxed text-foreground/80">{block.description}</p>
          <div className="mt-4 rounded-xl border border-warning/50 bg-warning/15 p-4">
            <p className="text-sm font-bold text-warning-foreground">تعليمة المشاهدة</p>
            <p className="mt-1 leading-relaxed">{block.instruction}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {block.embedUrl && (
              <Button type="button" size="lg" onClick={() => setShowEmbed((value) => !value)}>
                <PlayCircle /> {showEmbed ? "إغلاق العرض" : "عرض داخل الحصة"}
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <a href={block.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> فتح من المصدر
              </a>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">المصدر: {block.source}</p>
        </div>
      </div>
      {showEmbed && block.embedUrl && (
        <div className="border-t-2 border-border bg-background p-2 sm:p-4">
          <iframe
            src={block.embedUrl}
            title={block.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="aspect-video w-full rounded-xl border border-border bg-secondary"
          />
          <p className="px-2 pt-3 text-sm text-muted-foreground">
            إذا منع المصدر العرض هنا، استخدم زر «فتح من المصدر».
          </p>
        </div>
      )}
    </section>
  );
}

export function BlockView({
  block,
  terms,
  onAnswer,
  stats,
  onStartActivityTimer,
}: {
  block: Block;
  terms: Term[];
  quizId: string;
  onAnswer: (correct: boolean) => void;
  stats?: { correct: number; total: number } | undefined;
  onStartActivityTimer: (seconds: number) => void;
}) {
  switch (block.kind) {
    case "text":
      return <TermText text={block.text} terms={terms} />;

    case "bullets":
      return (
        <ul className="space-y-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-4 text-[1.5em] leading-relaxed">
              <span className="mt-3 size-3 shrink-0 rounded-full bg-primary" />
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "compare":
      return (
        <div className="grid gap-5 md:grid-cols-2">
          {[block.left, block.right].map((col, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border p-6",
                i === 0 ? "border-primary/40 bg-primary/10" : "border-accent/40 bg-accent/10",
              )}
            >
              <h3 className="mb-4 text-[1.4em] font-bold">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((it, j) => (
                  <li key={j} className="text-[1.2em] text-foreground/90">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "chart":
      return (
        <div className="rounded-2xl border border-border bg-secondary/30 p-6">
          <h3 className="mb-4 text-[1.3em] font-bold">{block.title}</h3>
          <div className="h-[clamp(220px,32vh,380px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={block.data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  unit={block.unit}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {block.data.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

    case "revealTable":
      return <RevealTable block={block} />;

    case "permeabilityLab":
      return <PermeabilityLab title={block.title} conclusion={block.conclusion} />;

    case "desertSim":
      return <DesertSim title={block.title} />;

    case "writing":
      return <WritingBlock block={block} onStartActivityTimer={onStartActivityTimer} />;

    case "video":
      return (
        <figure className="space-y-3">
          <figcaption className="text-xl font-bold text-primary">{block.title}</figcaption>
          <video
            src={block.src}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-3xl border-2 border-border bg-secondary shadow-lg"
          />
          {block.caption && (
            <p className="text-base text-muted-foreground">{block.caption}</p>
          )}
        </figure>
      );

    case "liveResource":
      return <LiveResource block={block} />;

    case "uploadedFile":
      return <UploadedFile block={block} />;

    case "task":
      return <TaskBlock block={block} />;

    case "analysis":
      return <AnalysisBlock block={block} />;

    case "copyMode":
      return <CopyModeBlock block={block} />;

    case "integration":
      return <IntegrationBlock block={block} />;

    case "openQuestion":
      return <OpenQuestion block={block} />;

    case "quiz":
      return <QuizBlock block={block} onAnswer={onAnswer} stats={stats} />;

    case "imagePair":
      return <ImagePairBlock block={block} />;

    case "hypotheses":
      return <HypothesesBlock block={block} />;

    case "ecosystem":
      return <EcosystemBlock block={block} />;

    case "revealGrid":
      return <RevealGridBlock block={block} />;

    case "imageTrio":
      return <ImageTrioBlock block={block} />;

    case "biomeExplorer":
      return <BiomeExplorerBlock block={block} />;

    case "dragSort":
      return <DragSortBlock block={block} />;

    case "relationExplorer":
      return <RelationExplorerBlock block={block} />;

    case "prompt":
      return (
        <div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-5 sm:p-6">
          <span className="mb-3 inline-block rounded-full bg-primary px-4 py-1.5 text-[0.75em] font-bold text-primary-foreground">
            {block.label ?? "السؤال"}
          </span>
          <p className="text-[1.5em] font-semibold leading-[1.9]">{block.question}</p>
        </div>
      );

    case "burnLab":
      return <BurnLabBlock block={block} />;



    default:
      return null;
  }
}
