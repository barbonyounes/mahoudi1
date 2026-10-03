import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, ExternalLink, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddBlock, BlockEditor } from "@/components/teacher/BlockEditor";
import { Field, LinesField, TextField } from "@/components/teacher/EditorFields";
import { SaveStateChip } from "@/components/teacher/SaveStateChip";
import { useTeacherWorkspace } from "@/hooks/useTeacherWorkspace";
import { blankStation, moveItem, uid } from "@/components/teacher/workspace-utils";
import type { Block, LessonDef, Station, Term } from "@/data/lesson";

export const Route = createFileRoute("/teacher_/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "محرر الحصة — مساحة الأستاذ" },
      { name: "description", content: "تحرير كامل لبيانات الحصة: المحطات والعناصر والوثائق والمصطلحات." },
      { property: "og:title", content: "محرر الحصة — مساحة الأستاذ" },
      { property: "og:description", content: "حرّر محطات حصتك وعناصرها ووثائقها ثم عاينها قبل العرض." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LessonEditorPage,
});

const MODELS: { value: Station["model"]; label: string }[] = [
  { value: "biome", label: "الوسط الحي" },
  { value: "climate", label: "المناخ" },
  { value: "soil", label: "التربة" },
  { value: "desert", label: "الصحراء" },
];

function LessonEditorPage() {
  const { lessonId } = Route.useParams();
  const { draft, isLoading, update, saveState, retrySave } = useTeacherWorkspace();

  if (isLoading) {
    return (
      <div dir="rtl" className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const lesson = draft?.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return (
      <div dir="rtl" className="grid min-h-dvh place-items-center bg-background px-4 text-center">
        <div>
          <p className="rounded-3xl border-2 border-dashed border-border p-8 text-lg">لم يتم العثور على هذه الحصة في مساحتك.</p>
          <Button asChild className="mt-4"><Link to="/teacher">العودة إلى مساحة الأستاذ</Link></Button>
        </div>
      </div>
    );
  }

  // مزامنة عنوان الحصة مع بطاقاتها في مقاطع المستوى
  const patchLesson = (patch: Partial<LessonDef>) =>
    update((d) => ({
      ...d,
      lessons: d.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
      curriculum:
        patch.title === undefined
          ? d.curriculum
          : d.curriculum.map((lvl) => ({
              ...lvl,
              segments: lvl.segments.map((seg) => ({
                ...seg,
                resources: seg.resources.map((res) => ({
                  ...res,
                  sessions: res.sessions.map((ses) => (ses.lessonId === lessonId ? { ...ses, title: patch.title! } : ses)),
                })),
              })),
            })),
    }));
  const setStations = (stations: Station[]) => patchLesson({ stations });

  const stationOps = {
    onChange: (index: number, next: Station) => setStations(lesson.stations.map((s, i) => (i === index ? next : s))),
    onDelete: (index: number) => {
      if (!window.confirm(`حذف المحطة «${lesson.stations[index]?.title}»؟`)) return;
      setStations(lesson.stations.filter((_, i) => i !== index).map((s, i) => ({ ...s, kicker: `المرحلة ${i + 1}` })));
    },
    onDuplicate: (index: number) => {
      const copy = structuredClone(lesson.stations[index]!);
      copy.id = uid(copy.id);
      const next = [...lesson.stations];
      next.splice(index + 1, 0, copy);
      setStations(next.map((s, i) => ({ ...s, kicker: `المرحلة ${i + 1}` })));
    },
    onMove: (index: number, dir: -1 | 1) => setStations(moveItem(lesson.stations, index, dir)),
    onAdd: () => setStations([...lesson.stations, blankStation(lesson.stations.length)]),
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/teacher" className="text-sm font-bold text-muted-foreground transition hover:text-primary">
            ← مساحة الأستاذ
          </Link>
          <div className="flex items-center gap-2">
            <SaveStateChip state={saveState} onRetry={retrySave} />
            <Button asChild variant="outline" size="sm">
              <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }} target="_blank">
                <ExternalLink className="size-4" /> معاينة
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-bold text-primary">تعديل مباشر للحصة</p><h1 className="text-2xl font-bold">{lesson.title}</h1></div>
          <Button asChild><Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }} target="_blank"><Eye className="size-4" /> فتح العرض المخصص</Link></Button>
        </div>
        {["eq-phenomenon", "dig-mouth", "eq-causes", "dig-stomach"].includes(lesson.id) ? <p className="mt-3 border-r-4 border-primary bg-primary/10 p-4 text-sm font-bold leading-7">يمكنك تعديل بيانات الحصة، ترتيب المحطات والنشاطات، وإضافة الوثائق في موضعها. تبقى الحصة في عرضها الوثائقي المخصص بعد الحفظ.</p> : null}

        <section className="mt-6 rounded-3xl border-2 border-border bg-secondary/25 p-5">
          <h2 className="mb-4 font-bold">بيانات الحصة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField label="اسم الحصة" value={lesson.title} onChange={(title) => patchLesson({ title })} />
            </div>
            <TextField label="المستوى" value={lesson.level} onChange={(level) => patchLesson({ level })} />
            <TextField label="المقطع التعلمي (الوحدة)" value={lesson.unit} onChange={(unit) => patchLesson({ unit })} />
            <div className="sm:col-span-2">
              <TextField label="الكفاءة المستهدفة" value={lesson.competence} onChange={(competence) => patchLesson({ competence })} multiline />
            </div>
            <Field label="المدة الإجمالية (دقيقة)">
              <Input type="number" min={1} value={lesson.totalMinutes} onChange={(e) => patchLesson({ totalMinutes: Number(e.target.value) || 50 })} />
            </Field>
          </div>

          <div className="mt-5">
            <TermsEditor terms={lesson.terms} onChange={(terms) => patchLesson({ terms })} />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">المحطات ({lesson.stations.length})</h2>
            <Button variant="outline" size="sm" onClick={stationOps.onAdd}>
              <Plus className="size-4" /> محطة جديدة
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {lesson.stations.map((station, index) => (
              <StationEditor
                key={station.id}
                station={station}
                index={index}
                terms={lesson.terms}
                lessonId={lesson.id}
                onChange={(next) => stationOps.onChange(index, next)}
                onDelete={() => stationOps.onDelete(index)}
                onDuplicate={() => stationOps.onDuplicate(index)}
                onMove={(dir) => stationOps.onMove(index, dir)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TermsEditor({ terms, onChange }: { terms: Term[]; onChange: (terms: Term[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-bold">المصطلحات ({terms.length})</p>
        <Button variant="ghost" size="sm" onClick={() => onChange([...terms, { term: "", def: "" }])}>
          <Plus className="size-4" /> إضافة مصطلح
        </Button>
      </div>
      <div className="mt-2 space-y-2">
        {terms.map((term, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <Input placeholder="المصطلح" value={term.term} onChange={(e) => onChange(terms.map((t, i) => (i === index ? { ...t, term: e.target.value } : t)))} />
              <Input placeholder="التعريف" value={term.def} onChange={(e) => onChange(terms.map((t, i) => (i === index ? { ...t, def: e.target.value } : t)))} />
            </div>
            <Button size="icon" variant="ghost" aria-label="حذف المصطلح" className="text-destructive" onClick={() => onChange(terms.filter((_, i) => i !== index))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {terms.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مصطلحات بعد.</p>}
      </div>
    </div>
  );
}

function StationEditor({
  station,
  index,
  terms,
  lessonId,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
}: {
  station: Station;
  index: number;
  terms: Term[];
  lessonId: string;
  onChange: (station: Station) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(station.id === "start");
  const patch = (p: Partial<Station>) => onChange({ ...station, ...p });

  const setBlocks = (blocks: Block[]) => patch({ blocks });
  const blockOps = {
    onChange: (i: number, block: Block) => setBlocks(station.blocks.map((b, bi) => (bi === i ? block : b))),
    onDelete: (i: number) => setBlocks(station.blocks.filter((_, bi) => bi !== i)),
    onDuplicate: (i: number) => {
      const next = [...station.blocks];
      next.splice(i + 1, 0, structuredClone(station.blocks[i]!));
      setBlocks(next);
    },
    onMove: (i: number, dir: -1 | 1) => setBlocks(moveItem(station.blocks, i, dir)),
  };

  return (
    <div className="rounded-3xl border-2 border-border bg-secondary/25 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{station.kicker}</span>
        <h3 className="font-bold">{station.title}</h3>
        <span className="text-sm text-muted-foreground">{station.minutes} د</span>
        <div className="me-auto flex gap-1">
          <Button size="icon" variant="ghost" aria-label="تحريك المحطة للأعلى" onClick={() => onMove(-1)}><ChevronUp className="size-4" /></Button>
          <Button size="icon" variant="ghost" aria-label="تحريك المحطة للأسفل" onClick={() => onMove(1)}><ChevronDown className="size-4" /></Button>
          <Button size="icon" variant="ghost" aria-label="نسخ المحطة" onClick={onDuplicate}><Copy className="size-4" /></Button>
          <Button size="icon" variant="ghost" aria-label={open ? "طي المحطة" : "فتح المحطة"} onClick={() => setOpen((v) => !v)}><PencilToggle open={open} /></Button>
          <Button size="icon" variant="ghost" aria-label="حذف المحطة" className="text-destructive" onClick={onDelete}><Trash2 className="size-4" /></Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">
            <TextField label="الشريط العلوي (المرحلة)" value={station.kicker} onChange={(kicker) => patch({ kicker })} />
            <TextField label="عنوان المحطة" value={station.title} onChange={(title) => patch({ title })} />
            <Field label="المدة (دقائق)">
              <Input type="number" min={1} value={station.minutes} onChange={(e) => patch({ minutes: Number(e.target.value) || 5 })} />
            </Field>
            <Field label="الخلفية البصرية">
              <Select value={station.model} onValueChange={(model) => patch({ model: model as Station["model"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <TextField label="تعليمة الأستاذ (لا تُعرض للتلاميذ إلا في شريط الملاحظات)" value={station.teacherNote} onChange={(teacherNote) => patch({ teacherNote })} multiline />
            </div>
            <div className="sm:col-span-2">
              <LinesField label="النقاط الأساسية" value={station.keyPoints} onChange={(keyPoints) => patch({ keyPoints })} />
            </div>
          </div>

          <div className="space-y-3">
            {station.blocks.map((block, i) => (
              <BlockEditor
                key={i}
                block={block}
                terms={terms}
                lessonId={lessonId}
                onChange={(next) => blockOps.onChange(i, next)}
                onDelete={() => blockOps.onDelete(i)}
                onDuplicate={() => blockOps.onDuplicate(i)}
                onMove={(dir) => blockOps.onMove(i, dir)}
              />
            ))}
            <AddBlock onAdd={(block) => setBlocks([...station.blocks, block])} />
          </div>
        </div>
      )}
    </div>
  );
}

function PencilToggle({ open }: { open: boolean }) {
  return open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />;
}
