import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleHelp, Maximize2, MousePointerClick, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ANATOMY_PIECES, AnatomyBody, AnatomyOrgan, AnatomyThumbnail } from "./DigestiveAnatomyArt";

/**
 * بازل الجهاز الهضمي: تركيب تفاعلي ثنائي الأبعاد على جسم إنسان أمامي.
 * يعمل بالسحب (Pointer Events) وببديل «انقر القطعة ثم انقر الموضع» لللمس ولوحة المفاتيح.
 * خمس مراحل: الأنبوب الهضمي ← الغدد الملحقة ← الامتصاص ← طريقا الدم واللمف ← الخلية.
 */

type Slot = { id: string; label: string; x: number; y: number; hint: string };
type StageDef = { id: string; label: string; goal: string; slots: Slot[] };

const STAGES: StageDef[] = [
  {
    id: "tube",
    label: "الأنبوب الهضمي",
    goal: "ركّب القناة التي يمر فيها الغذاء من الفم إلى الشرج بالترتيب.",
    slots: [
      { id: "mouth", label: "الفم", x: 50, y: 7, hint: "مدخل الغذاء، في أعلى الرأس." },
      { id: "esophagus", label: "المريء", x: 50, y: 20, hint: "أنبوب عمودي يعبر الصدر نحو المعدة." },
      { id: "stomach", label: "المعدة", x: 42, y: 33, hint: "جيب عضلي في أعلى البطن نحو اليسار." },
      { id: "small-intestine", label: "المعي الدقيق", x: 50, y: 52, hint: "أنبوب ملتوٍ يملأ وسط البطن." },
      { id: "large-intestine", label: "المعي الغليظ", x: 50, y: 66, hint: "إطار يحيط بالمعي الدقيق من الخارج." },
    ],
  },
  {
    id: "glands",
    label: "الغدد الملحقة",
    goal: "أضف الغدد التي تصبّ عصاراتها في الأنبوب ولا يمر الغذاء داخلها.",
    slots: [
      { id: "salivary", label: "الغدد اللعابية", x: 30, y: 9, hint: "حول الفم، تفرز اللعاب." },
      { id: "liver", label: "الكبد", x: 62, y: 28, hint: "أكبر غدة، فوق المعدة نحو اليمين." },
      { id: "pancreas", label: "البنكرياس", x: 56, y: 41, hint: "خلف المعدة، يصب عصارته في المعي الدقيق." },
    ],
  },
  {
    id: "absorption",
    label: "الامتصاص",
    goal: "حدد مقر الامتصاص والبنية التي توسّع سطح التبادل.",
    slots: [
      { id: "villi", label: "الزغابات المعوية", x: 50, y: 56, hint: "بروزات دقيقة تكسو جدار المعي الدقيق." },
      { id: "absorption-site", label: "مقر الامتصاص", x: 38, y: 58, hint: "العضو الذي تعبر منه المغذيات إلى الدم." },
    ],
  },
  {
    id: "transport",
    label: "طريقا النقل",
    goal: "فرّق بين الطريق الدموي نحو الكبد والطريق اللمفاوي للدسم.",
    slots: [
      { id: "blood-path", label: "الطريق الدموي (الوريد البابي)", x: 60, y: 34, hint: "يحمل السكريات والأحماض الأمينية من المعي إلى الكبد." },
      { id: "lymph-path", label: "الطريق اللمفاوي", x: 34, y: 44, hint: "يحمل الدسم الممتصّة قبل صبّها في الدم." },
    ],
  },
  {
    id: "cell",
    label: "الخلية",
    goal: "أكمل الرحلة: أين تنتهي المغذيات داخل العضوية؟",
    slots: [
      { id: "cell-target", label: "خلايا الجسم", x: 82, y: 12, hint: "المستفيد النهائي من كل مغذٍّ مُمتصّ." },
      { id: "heart", label: "القلب (مضخة التوزيع)", x: 46, y: 24, hint: "يدفع الدم المحمّل بالمغذيات إلى كل العضوية." },
    ],
  },
];

STAGES.forEach((stage) => stage.slots.forEach((slot) => {
  const piece = ANATOMY_PIECES[slot.id];
  if (piece) { slot.x = piece.x + piece.width / 2; slot.y = piece.y + piece.height / 2; }
}));

const TOTAL = STAGES.reduce((n, s) => n + s.slots.length, 0);
const STORAGE_KEY = "svt-digestive-builder-v1";

type PlacedMap = Record<string, boolean>; // slotId -> صحيح

function loadProgress(): { stage: number; placed: PlacedMap } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { stage?: number; placed?: PlacedMap };
      if (typeof parsed.stage === "number" && Number.isInteger(parsed.stage) && parsed.placed) return { stage: Math.max(0, Math.min(parsed.stage, STAGES.length - 1)), placed: parsed.placed };
    }
  } catch { /* تجاهل */ }
  return { stage: 0, placed: {} };
}

export function DigestiveSystemBuilder() {
  const [state, setState] = useState<{ stage: number; placed: PlacedMap }>({ stage: 0, placed: {} });
  const boardRef = useRef<SVGSVGElement>(null);
  const movedRef = useRef(false);
  useEffect(() => { setState(loadProgress()); }, []);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err" | "hint"; text: string } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);

  const stage = STAGES[state.stage] ?? STAGES[0];
  if (!stage) throw new Error("Missing anatomy stages");
  const placed = state.placed;
  const placedCount = useMemo(() => Object.values(placed).filter(Boolean).length, [placed]);
  const stageDone = stage.slots.every((s) => placed[s.id]);
  const allDone = placedCount === TOTAL;
  const remaining = stage.slots.filter((s) => !placed[s.id]);

  const persist = useCallback((stageIdx: number, next: PlacedMap) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ stage: stageIdx, placed: next })); } catch { /* تجاهل */ }
  }, []);

  const tryPlace = useCallback(
    (slotId: string, targetId: string) => {
      if (slotId === targetId) {
        const next = { ...placed, [slotId]: true };
        const slot = stage.slots.find((s) => s.id === slotId);
        setState((prev) => ({ ...prev, placed: next }));
        persist(state.stage, next);
        setFeedback({ kind: "ok", text: `صحيح! ثُبّتت قطعة «${slot?.label}» في مكانها.` });
      } else {
        const target = stage.slots.find((s) => s.id === targetId);
        setFeedback({ kind: "err", text: `ليس مكانها. «${stage.slots.find((s) => s.id === slotId)?.label}» لا تنتمي إلى موضع «${target?.label}». جرّب مجدداً أو اطلب تلميحاً.` });
      }
      setSelected(null);
    },
    [placed, stage, state.stage, persist],
  );

  const pointerPosition = (e: React.PointerEvent<HTMLElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragging || (e.buttons === 0 && e.pointerType === "mouse")) return;
    movedRef.current = true;
    setDragPos(pointerPosition(e));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const pos = pointerPosition(e);
    if (movedRef.current && pos) {
      const hit = remaining.filter((slot) => {
        const piece = ANATOMY_PIECES[slot.id];
        return piece && pos.x >= piece.x - 2 && pos.x <= piece.x + piece.width + 2 && pos.y >= piece.y - 2 && pos.y <= piece.y + piece.height + 2;
      }).sort((a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y))[0];
      if (hit) tryPlace(dragging, hit.id);
      else setFeedback({ kind: "err", text: "أفلت العضو فوق موضعه داخل الجسم." });
    }
    setDragging(null);
    setDragPos(null);
  };

  const hint = () => {
    const next = remaining[0];
    if (next) setFeedback({ kind: "hint", text: `تلميح — ${next.label}: ${next.hint}` });
  };

  const resetStage = () => {
    const next = { ...placed };
    stage.slots.forEach((s) => delete next[s.id]);
    setState((prev) => ({ ...prev, placed: next }));
    persist(state.stage, next);
    setFeedback(null);
    setSelected(null);
  };

  const resetAll = () => {
    const empty: PlacedMap = {};
    setState({ stage: 0, placed: empty });
    persist(0, empty);
    setFeedback(null);
    setSelected(null);
    setShowAnswer(false);
  };

  useEffect(() => {
    if (stageDone && state.stage < STAGES.length - 1) {
      const t = setTimeout(() => {
        setState((prev) => ({ ...prev, stage: prev.stage + 1 }));
        persist(state.stage + 1, placed);
        setFeedback({ kind: "ok", text: `اكتملت مرحلة «${stage.label}»! انتقلنا إلى: ${STAGES[state.stage + 1]?.label}.` });
      }, 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [stageDone, state.stage, stage.label, placed, persist]);

  return (
    <section onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { setDragging(null); setDragPos(null); }} dir="rtl" className="border border-border bg-card shadow-sm" aria-label="بازل تركيب الجهاز الهضمي">
      {/* شريط أدوات النشاط */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-black text-primary">نشاط تفاعلي مميز</p>
          <h3 className="text-xl font-black sm:text-2xl">ركّب جهاز الهضم وامتصاصه أمام القسم</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={hint} disabled={remaining.length === 0}><CircleHelp /> تلميح</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? <X /> : <Sparkles />} {showAnswer ? "إخفاء الحل" : "إظهار المرجع"}</Button>
          <Button type="button" variant="outline" size="sm" onClick={resetStage}><RotateCcw /> إعادة المرحلة</Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetAll}>إعادة النشاط</Button>
          <Button type="button" variant="ghost" size="icon" aria-label="ملء الشاشة" onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()}><Maximize2 /></Button>
        </div>
      </div>

      {/* شريط المراحل والتقدم */}
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {STAGES.map((s, i) => (
            <Button variant="outline"
              key={s.id}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, stage: i }))}
              className={cn(
                "flex items-center gap-2 border px-3 py-2 text-sm font-bold transition",
                i === state.stage ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/60",
              )}
            >
              <span className="grid size-6 place-items-center bg-background/20 text-xs">{i + 1}</span>
              {s.label}
              {s.slots.every((sl) => placed[sl.id]) && <Check className="size-4" />}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 bg-secondary"><div className="h-full bg-success transition-all duration-500" style={{ width: `${(placedCount / TOTAL) * 100}%` }} /></div>
          <span className="text-sm font-black">{placedCount} / {TOTAL}</span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
        {/* لوحة القطع والتعليمات */}
        <div className="border-b border-border p-4 sm:p-6 lg:border-b-0 lg:border-l">
          <p className="border-r-4 border-primary bg-primary/10 p-4 font-bold leading-8">{stage.goal}</p>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-muted-foreground"><MousePointerClick className="size-4" /> اسحب العضو إلى ظله التشريحي، أو انقره ثم انقر الموضع.</p>

          <div className="mt-5 flex min-h-28 flex-wrap items-center gap-3 border-2 border-dashed border-border bg-secondary/20 p-4" aria-label="قطع المرحلة">
            {remaining.length === 0 && <span className="font-bold text-success">اكتملت قطع هذه المرحلة ✔</span>}
            {remaining.map((slot) => (
              <Button variant="outline"
                key={slot.id}
                type="button"
                aria-label={`قطعة ${slot.label}`}
                onClick={() => { if (!movedRef.current) setSelected(selected === slot.id ? null : slot.id); movedRef.current = false; }}
                                onPointerDown={(e) => { if (e.button !== 0) return; movedRef.current = false; setDragging(slot.id); setDragPos(null); e.currentTarget.setPointerCapture(e.pointerId); }}
                className={cn(
                  "h-32 w-36 flex-col whitespace-normal cursor-grab touch-none border-2 p-2 text-sm font-black shadow-sm transition active:cursor-grabbing [&_svg]:size-16",
                  selected === slot.id ? "border-primary bg-primary/15 ring-2 ring-ring" : "border-border bg-card hover:border-primary/60",
                )}
              >
                <AnatomyThumbnail id={slot.id} />
                <span className="text-center leading-5">{slot.label}</span>
              </Button>
            ))}
          </div>

          {feedback && (
            <p className={cn(
              "mt-4 border-r-4 p-4 font-bold leading-8 animate-fade-in",
              feedback.kind === "ok" && "border-success bg-success/10 text-success",
              feedback.kind === "err" && "border-destructive bg-destructive/10 text-destructive",
              feedback.kind === "hint" && "border-warning bg-warning/10",
            )}>
              {feedback.text}
            </p>
          )}

          {allDone && (
            <div className="mt-5 border-2 border-success bg-success/10 p-5 animate-fade-in">
              <h4 className="text-xl font-black text-success">اكتمل البناء! رحلة الغذاء كاملة أمامك.</h4>
              <p className="mt-2 text-lg font-bold leading-9">
                من الفم إلى المعي الدقيق يُهضم الغذاء، تُمتصّ المغذيات عبر الزغابات، فتسلك الطريق الدموي نحو الكبد أو الطريق اللمفاوي، ويضخّها القلب مع الدم إلى كل خلية.
              </p>
              <p className="mt-3 border-t border-success/30 pt-3 text-sm font-bold text-muted-foreground">مهمة القسم: اشرح بصوتك مسار لقمة خبز من الفم حتى خلية عضلية.</p>
            </div>
          )}

          <Button variant="outline" type="button" onClick={() => setReferenceOpen(true)} className="mt-5 w-full border border-border bg-background p-3 text-sm font-bold text-primary transition hover:border-primary">
            فتح الصورة التشريحية الحقيقية للمقارنة
          </Button>
        </div>

        {/* لوحة الجسم */}
        <div className="bg-secondary/20 p-3 sm:p-5">
          <svg
            ref={boardRef}
            viewBox="0 0 100 100"
            role="application"
            aria-label="جسم إنسان أمامي — لوحة تركيب الجهاز الهضمي"
            className="mx-auto aspect-square w-full max-w-xl select-none"
          >
            <AnatomyBody />
            <text x="21" y="26" textAnchor="middle" fontSize="2.4" fill="var(--muted-foreground)">يمين الجسم</text>
            <text x="79" y="26" textAnchor="middle" fontSize="2.4" fill="var(--muted-foreground)">يسار الجسم</text>
            {placed.villi && <path d="M59 65 L74 65" fill="none" stroke="var(--anatomy-absorption)" strokeWidth="0.5" strokeDasharray="1 1" />}
            {STAGES.flatMap((s) => s.slots).filter((slot) => placed[slot.id]).map((slot) => <g key={slot.id} aria-label={`عضو مركب ${slot.label}`}><AnatomyOrgan id={slot.id} /></g>)}
            {placed["cell-target"] && placed.heart && <path d="M56 33 Q65 20 77 29" fill="none" stroke="var(--anatomy-blood)" strokeWidth="0.7" strokeDasharray="1.5 1" />}
            {remaining.map((slot, i) => <g key={slot.id} role="button" tabIndex={0} aria-label={`موضع ${slot.label}`} className="cursor-pointer focus:outline-none"
              onClick={() => selected && tryPlace(selected, slot.id)}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && selected) { e.preventDefault(); tryPlace(selected, slot.id); } }}>
              <AnatomyOrgan id={slot.id} ghost />
              <circle cx={slot.x} cy={slot.y} r="3.1" fill="var(--background)" fillOpacity="0.85" stroke="var(--primary)" strokeWidth="0.45" strokeDasharray={selected ? undefined : "1 0.7"} />
              <text x={slot.x} y={slot.y + 1} textAnchor="middle" fontSize="3" fontWeight="800" fill="var(--primary)">{i + 1}</text>
              {showAnswer && <AnatomyOrgan id={slot.id} />}
            </g>)}
            {dragging && dragPos && (() => {
              const piece = ANATOMY_PIECES[dragging];
              return piece ? <g pointerEvents="none" opacity="0.8" transform={`translate(${dragPos.x - piece.x - piece.width / 2} ${dragPos.y - piece.y - piece.height / 2})`}><AnatomyOrgan id={dragging} /></g> : null;
            })()}
          </svg>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground" aria-label="الأعضاء المركبة">
            {STAGES.flatMap((s) => s.slots).filter((slot) => placed[slot.id]).map((slot) => <span key={slot.id} className="flex items-center gap-1"><Check className="size-3 text-success" />{slot.label}</span>)}
          </div>
        </div>
      </div>

      {/* المرجع التشريحي الحقيقي */}
      {referenceOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="المرجع التشريحي">
          <Button type="button" variant="secondary" onClick={() => setReferenceOpen(false)} className="absolute left-4 top-4 z-10"><X /> إغلاق</Button>
          <ReferenceImage />
        </div>
      )}
    </section>
  );
}

function ReferenceImage() {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/assets/digestion-real/digestive-system.svg.asset.json").then((m) => { if (active) setSrc((m.default as { url: string }).url); });
    return () => { active = false; };
  }, []);
  return src ? <img src={src} alt="الرسم التشريحي الحقيقي للجهاز الهضمي والغدد الملحقة" className="max-h-[90vh] max-w-full object-contain" /> : null;
}
