import { useState } from "react";
import { Check, Eye, MapPin, RotateCcw, X } from "lucide-react";
import type { Block } from "@/data/lesson";
import { cn } from "@/lib/utils";

/** الوثيقة 1: ثلاث صور متجاورة */
export function ImageTrioBlock({ block }: { block: Extract<Block, { kind: "imageTrio" }> }) {
  return (
    <figure className="space-y-4">
      <figcaption className="text-[1.35em] font-bold text-primary">{block.title}</figcaption>
      <div
        className={cn(
          "grid gap-4",
          block.images.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3",
        )}
      >
        {block.images.map((im, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border-2 border-border bg-secondary/30">
            <img
              src={im.src}
              alt={im.caption}
              loading="lazy"
              width={1024}
              height={768}
              className="h-[clamp(140px,22vh,260px)] w-full object-cover"
            />
            <p className="p-3 text-center text-[1em] font-semibold text-foreground/85">
              {im.caption}
            </p>
          </div>
        ))}
      </div>
      {block.prompt && (
        <p className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-[1.3em] font-semibold leading-relaxed">
          {block.prompt}
        </p>
      )}
    </figure>
  );
}

/** الوثيقة 2: مستكشف الأوساط الحية مع نقاط التوقف */
export function BiomeExplorerBlock({
  block,
}: {
  block: Extract<Block, { kind: "biomeExplorer" }>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number[]>([]);
  const active = open === null ? null : block.biomes[open]!;
  const allDone = answered.length === block.biomes.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[1.4em] font-bold">{block.title}</h3>
        <p className="mt-1 text-[1.05em] text-muted-foreground">{block.instruction}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {block.biomes.map((b, i) => (
          <button
            key={b.name}
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className={cn(
              "group overflow-hidden rounded-2xl border-2 text-right transition",
              open === i ? "border-primary ring-2 ring-primary/40" : "border-border",
              answered.includes(i) && "bg-success/10",
            )}
          >
            <img
              src={b.src}
              alt={b.name}
              loading="lazy"
              width={1024}
              height={768}
              className="h-[clamp(110px,16vh,180px)] w-full object-cover"
            />
            <span className="flex items-center justify-between gap-2 p-3 text-[1.1em] font-bold">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> {b.name}
              </span>
              {answered.includes(i) && <Check className="size-5 text-success" />}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="animate-fade-in space-y-4 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { k: "الحرارة", v: active.temp },
              { k: "التساقط", v: active.rain },
              { k: "التربة", v: active.soil },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-border bg-background/50 p-4">
                <p className="text-[0.85em] text-muted-foreground">{d.k}</p>
                <p className="mt-1 text-[1.2em] font-bold">{d.v}</p>
              </div>
            ))}
          </div>
          <p className="text-[1.1em]">
            <span className="font-bold text-primary">كائنات مستوطنة: </span>
            {active.species.join(" — ")}
          </p>
          <div className="rounded-xl border border-accent/50 bg-accent/10 p-4">
            <p className="text-[0.8em] font-semibold text-accent">نقطة توقف</p>
            <p className="mt-1 text-[1.35em] font-semibold leading-relaxed">{active.question}</p>
            {answered.includes(open!) ? (
              <p className="mt-3 animate-fade-in rounded-lg border border-success/50 bg-success/10 p-3 text-[1.15em] leading-relaxed">
                {active.note}
              </p>
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

/** الوثيقة 3: تصنيف الكائنات إلى أوساطها (سحب أو نقر) */
export function DragSortBlock({ block }: { block: Extract<Block, { kind: "dragSort" }> }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const pool = block.items.filter((it) => !placed[it.name]);

  const place = (itemName: string, cat: string) => {
    setPlaced((p) => ({ ...p, [itemName]: cat }));
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[1.4em] font-bold">{block.title}</h3>
          <p className="mt-1 text-[1.05em] text-muted-foreground">{block.instruction}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaced({});
            setSelected(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[0.9em] hover:bg-secondary"
        >
          <RotateCcw className="size-5" /> إعادة
        </button>
      </div>

      <div className="flex min-h-[4.5rem] flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 p-4">
        {pool.length === 0 && (
          <span className="text-[1em] text-muted-foreground">تم تصنيف كل الكائنات.</span>
        )}
        {pool.map((it) => (
          <button
            key={it.name}
            type="button"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", it.name)}
            onClick={() => setSelected(selected === it.name ? null : it.name)}
            className={cn(
              "inline-flex cursor-grab items-center gap-2 rounded-xl border px-4 py-2.5 text-[1.15em] transition",
              selected === it.name
                ? "border-primary bg-primary/15"
                : "border-border bg-background/50 hover:border-primary/60",
            )}
          >
            <span className="text-[1.4em]">{it.emoji}</span> {it.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {block.categories.map((cat) => (
          <div
            key={cat.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const name = e.dataTransfer.getData("text/plain");
              if (name) place(name, cat.id);
            }}
            onClick={() => selected && place(selected, cat.id)}
            className={cn(
              "min-h-[9rem] rounded-2xl border-2 border-dashed p-4 transition",
              selected ? "border-primary/70 bg-primary/5" : "border-border bg-secondary/20",
            )}
          >
            <p className="mb-3 text-[1.15em] font-bold text-primary">{cat.label}</p>
            <ul className="space-y-2">
              {block.items
                .filter((it) => placed[it.name] === cat.id)
                .map((it) => {
                  const ok = it.category === cat.id;
                  return (
                    <li
                      key={it.name}
                      className={cn(
                        "rounded-xl border p-3 text-[1.05em]",
                        ok
                          ? "border-success/50 bg-success/10 text-success"
                          : "border-destructive/50 bg-destructive/10 text-destructive",
                      )}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="text-[1.3em]">{it.emoji}</span>
                        {it.name}
                        {ok ? (
                          <Check className="size-5 shrink-0" />
                        ) : (
                          <X className="size-5 shrink-0" />
                        )}
                      </span>
                      {ok && (
                        <span className="mt-1 block text-[0.95em] leading-relaxed text-foreground/80">
                          {it.why}
                        </span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
