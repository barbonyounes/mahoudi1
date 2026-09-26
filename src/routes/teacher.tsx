import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FilePlus2,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherWorkspace } from "@/hooks/useTeacherWorkspace";
import { SaveStateChip } from "@/components/teacher/SaveStateChip";
import { CloudSyncPanel } from "@/components/teacher/CloudSyncPanel";
import { TextField } from "@/components/teacher/EditorFields";
import {
  LEVEL_TITLES,
  makeBlankLesson,
  makeLessonCopy,
  makeSession,
  moveItem,
  newResource,
  newSegment,
  patchList,
} from "@/components/teacher/workspace-utils";
import { lessons as defaultLessons } from "@/data/lessons";
import type { CurriculumLevel, CurriculumResource, CurriculumSegment, CurriculumSession } from "@/data/curriculum";
import type { LessonDef } from "@/data/lesson";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "مساحة الأستاذ — إدارة المقاطع والموارد والحصص" },
      { name: "description", content: "مساحة آمنة للأستاذ لتخصيص مقاطع وموارد وحصص علوم الطبيعة والحياة." },
      { property: "og:title", content: "مساحة الأستاذ — منصة الحصص الرقمية" },
      { property: "og:description", content: "أنشئ وحرّر ورتّب مقاطعك ومواردك وحصصك، وانسخ الحصص الجاهزة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherLibrary,
});

function TeacherLibrary() {
  const { draft, isLoading, update, saveState, retrySave } = useTeacherWorkspace();
  const [activeLevel, setActiveLevel] = useState("3am");
  const [editing, setEditing] = useState<string | null>(null);
  const [copyPanel, setCopyPanel] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div dir="rtl" className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!draft) {
    return (
      <div dir="rtl" className="grid min-h-dvh place-items-center bg-background px-4 text-center">
        <p className="rounded-3xl border-2 border-border p-8 text-lg">تعذّر تحميل مساحة الأستاذ. أعد المحاولة.</p>
      </div>
    );
  }

  const level = draft.curriculum.find((l) => l.id === activeLevel);
  const originals = defaultLessons.filter((lesson) =>
    lesson.level.includes(activeLevel === "3am" ? "الثالثة" : "الرابعة"),
  );

  const mapLevel = (levelId: string, fn: (l: CurriculumLevel) => CurriculumLevel) =>
    update((d) => ({ ...d, curriculum: d.curriculum.map((l) => (l.id === levelId ? fn(l) : l)) }));
  const mapSegment = (levelId: string, segId: string, fn: (s: CurriculumSegment) => CurriculumSegment) =>
    mapLevel(levelId, (l) => ({ ...l, segments: l.segments.map((s) => (s.id === segId ? fn(s) : s)) }));
  const mapResource = (levelId: string, segId: string, resId: string, fn: (r: CurriculumResource) => CurriculumResource) =>
    mapSegment(levelId, segId, (s) => ({ ...s, resources: s.resources.map((r) => (r.id === resId ? fn(r) : r)) }));
  const mapSession = (
    levelId: string,
    segId: string,
    resId: string,
    sesIndex: number,
    fn: (s: CurriculumSession) => CurriculumSession,
  ) =>
    mapResource(levelId, segId, resId, (r) => ({
      ...r,
      sessions: r.sessions.map((s, i) => (i === sesIndex ? fn(s) : s)),
    }));

  const addLessonToResource = (segId: string, resId: string, lesson: LessonDef, originalLessonId?: string) => {
    update((d) => ({
      ...d,
      lessons: [...d.lessons, lesson],
      curriculum: d.curriculum.map((l) =>
        l.id !== activeLevel
          ? l
          : {
              ...l,
              segments: l.segments.map((s) =>
                s.id !== segId
                  ? s
                  : {
                      ...s,
                      resources: s.resources.map((r) =>
                        r.id !== resId
                          ? r
                          : { ...r, sessions: [...r.sessions, makeSession(lesson, r.sessions.length + 1, originalLessonId)] },
                      ),
                    },
              ),
            },
      ),
    }));
    setCopyPanel(null);
  };

  const deleteSession = (segId: string, resId: string, session: CurriculumSession) => {
    if (!window.confirm(`حذف الحصة «${session.title}» نهائياً؟ لا يمكن التراجع.`)) return;
    update((d) => {
      const isCopy = (session.lessonId ?? "").startsWith("lesson-");
      const keepLesson = !isCopy;
      return {
        ...d,
        lessons: keepLesson ? d.lessons : d.lessons.filter((l) => l.id !== session.lessonId),
        curriculum: d.curriculum.map((l) =>
          l.id !== activeLevel
            ? l
            : {
                ...l,
                segments: l.segments.map((s) =>
                  s.id !== segId
                    ? s
                    : {
                        ...s,
                        resources: s.resources.map((r) =>
                          r.id !== resId ? r : { ...r, sessions: r.sessions.filter((x) => x !== session) },
                        ),
                      },
                ),
              },
        ),
      };
    });
  };

  const restoreSession = (segId: string, resId: string, session: CurriculumSession) => {
    if (!session.originalLessonId || !session.lessonId) return;
    if (!window.confirm("استرجاع النسخة الأصلية؟ ستُلغى كل تعديلاتك على هذه الحصة.")) return;
    const copyId = session.lessonId;
    const originalId = session.originalLessonId;
    update((d) => ({
      ...d,
      lessons: d.lessons.filter((l) => l.id !== copyId),
      curriculum: d.curriculum.map((l) =>
        l.id !== activeLevel
          ? l
          : {
              ...l,
              segments: l.segments.map((s) =>
                s.id !== segId
                  ? s
                  : {
                      ...s,
                      resources: s.resources.map((r) =>
                        r.id !== resId
                          ? r
                          : {
                              ...r,
                              sessions: r.sessions.map((x) => {
                                if (x !== session) return x;
                                const { originalLessonId: _omit, ...rest } = x;
                                return { ...rest, lessonId: originalId, status: "ready" as const };
                              }),
                            },
                      ),
                    },
              ),
            },
      ),
    }));
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-sm font-bold text-muted-foreground transition hover:text-primary">
            ← كل المستويات
          </Link>
          <SaveStateChip state={saveState} onRetry={retrySave} />
        </div>
        <h1 className="mt-3 text-3xl font-bold text-primary">مساحة الأستاذ</h1>
        <p className="mt-2 text-muted-foreground">
          نظّم مقاطعك ومواردك، وانسخ الحصص الجاهزة وحرّرها. التعديلات تُحفظ تلقائياً على هذا الجهاز وتعمل بدون إنترنت.
        </p>
        {draft && <CloudSyncPanel draft={draft} />}

        <div className="mt-6 flex gap-2">
          {["3am", "4am"].map((id) => (
            <Button key={id} variant={activeLevel === id ? "default" : "outline"} onClick={() => setActiveLevel(id)}>
              {LEVEL_TITLES[id]}
            </Button>
          ))}
        </div>

        {level && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{level.title}</h2>
              <Button
                variant="outline"
                onClick={() =>
                  mapLevel(level.id, (l) => ({ ...l, segments: [...l.segments, newSegment(l.segments.length + 1)] }))
                }
              >
                <Plus className="size-4" /> مقطع جديد
              </Button>
            </div>

            {level.segments.length === 0 && (
              <p className="rounded-3xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
                لا توجد مقاطع بعد. أضف أول مقطع للبدء.
              </p>
            )}

            {level.segments.map((segment, segIndex) => (
              <section key={segment.id} className="rounded-3xl border-2 border-border bg-secondary/25 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    المقطع {segment.order}
                  </span>
                  <h3 className="text-lg font-bold">{segment.title}</h3>
                  {segment.field && <span className="text-sm text-muted-foreground">— {segment.field}</span>}
                  <div className="me-auto flex gap-1">
                    <Button size="icon" variant="ghost" aria-label="تحريك المقطع للأعلى" onClick={() => mapLevel(level.id, (l) => ({ ...l, segments: moveItem(l.segments, segIndex, -1) }))}><ChevronUp className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="تحريك المقطع للأسفل" onClick={() => mapLevel(level.id, (l) => ({ ...l, segments: moveItem(l.segments, segIndex, 1) }))}><ChevronDown className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="تعديل المقطع" onClick={() => setEditing(editing === segment.id ? null : segment.id)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="حذف المقطع" className="text-destructive" onClick={() => { if (window.confirm(`حذف المقطع «${segment.title}» وكل موارده وحصصه؟`)) mapLevel(level.id, (l) => ({ ...l, segments: l.segments.filter((s) => s.id !== segment.id) })); }}><Trash2 className="size-4" /></Button>
                  </div>
                </div>

                {editing === segment.id && (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">
                    <TextField label="اسم المقطع" value={segment.title} onChange={(title) => mapSegment(level.id, segment.id, (s) => ({ ...s, title }))} />
                    <TextField label="الميدان" value={segment.field} onChange={(field) => mapSegment(level.id, segment.id, (s) => ({ ...s, field }))} />
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {segment.resources.map((resource, resIndex) => (
                    <article key={resource.id} className="rounded-2xl border-2 border-border bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">المورد {resource.order}</span>
                        <h4 className="font-bold">{resource.title}</h4>
                        <div className="me-auto flex gap-1">
                          <Button size="icon" variant="ghost" aria-label="تحريك المورد للأعلى" onClick={() => mapSegment(level.id, segment.id, (s) => ({ ...s, resources: moveItem(s.resources, resIndex, -1) }))}><ChevronUp className="size-4" /></Button>
                          <Button size="icon" variant="ghost" aria-label="تحريك المورد للأسفل" onClick={() => mapSegment(level.id, segment.id, (s) => ({ ...s, resources: moveItem(s.resources, resIndex, 1) }))}><ChevronDown className="size-4" /></Button>
                          <Button size="icon" variant="ghost" aria-label="تعديل المورد" onClick={() => setEditing(editing === resource.id ? null : resource.id)}><Pencil className="size-4" /></Button>
                          <Button size="icon" variant="ghost" aria-label="حذف المورد" className="text-destructive" onClick={() => { if (window.confirm(`حذف المورد «${resource.title}» وحصصه؟`)) mapSegment(level.id, segment.id, (s) => ({ ...s, resources: s.resources.filter((r) => r.id !== resource.id) })); }}><Trash2 className="size-4" /></Button>
                        </div>
                      </div>
                      {editing === resource.id && (
                        <div className="mt-3 grid gap-3 rounded-2xl border border-border bg-secondary/20 p-4 sm:grid-cols-2">
                          <TextField label="اسم المورد" value={resource.title} onChange={(title) => mapResource(level.id, segment.id, resource.id, (r) => ({ ...r, title }))} />
                          <TextField label="عدد الحصص المبرمجة" value={String(resource.plannedSessions)} onChange={(v) => mapResource(level.id, segment.id, resource.id, (r) => ({ ...r, plannedSessions: Math.max(1, Number(v) || 1) }))} />
                          <div className="sm:col-span-2">
                            <TextField label="الكفاءة المستهدفة" value={resource.competence} onChange={(competence) => mapResource(level.id, segment.id, resource.id, (r) => ({ ...r, competence }))} multiline />
                          </div>
                        </div>
                      )}

                      <ul className="mt-3 space-y-2">
                        {resource.sessions.map((session, sesIndex) => (
                          <li key={`${session.order}-${session.title}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                              {session.order}
                            </span>
                            <span className="min-w-0 flex-1">
                              {session.lessonId ? (
                                <Link to="/teacher/lesson/$lessonId" params={{ lessonId: session.lessonId }} className="block truncate font-bold hover:text-primary">
                                  {session.title}
                                </Link>
                              ) : (
                                <span className="block truncate font-bold">{session.title}</span>
                              )}
                              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${session.status === "ready" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {session.status === "ready" ? "جاهزة للعرض" : "مسودة"}
                              </span>
                            </span>
                            <div className="flex gap-1">
                              {session.lessonId && (
                                <>
                                  <Button size="icon" variant="ghost" aria-label="تحرير الحصة" asChild><Link to="/teacher/lesson/$lessonId" params={{ lessonId: session.lessonId }}><Pencil className="size-4" /></Link></Button>
                                  <Button size="icon" variant="ghost" aria-label="معاينة الحصة" asChild><Link to="/lesson/$lessonId" params={{ lessonId: session.lessonId }} target="_blank"><ExternalLink className="size-4" /></Link></Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" aria-label={session.status === "ready" ? "تحويل إلى مسودة" : "جاهزة للعرض"} onClick={() => mapSession(level.id, segment.id, resource.id, sesIndex, (x) => ({ ...x, status: x.status === "ready" ? "planned" : "ready" }))}>
                                {session.status === "ready" ? <FilePlus2 className="size-4" /> : <Pencil className="size-4" />}
                              </Button>
                              {session.originalLessonId && (
                                <Button size="icon" variant="ghost" aria-label="استرجاع النسخة الأصلية" onClick={() => restoreSession(segment.id, resource.id, session)}><RotateCcw className="size-4" /></Button>
                              )}
                              <Button size="icon" variant="ghost" aria-label="تحريك الحصة للأعلى" onClick={() => mapResource(level.id, segment.id, resource.id, (r) => ({ ...r, sessions: moveItem(r.sessions, sesIndex, -1).map((x, i) => ({ ...x, order: i + 1 })) }))}><ChevronUp className="size-4" /></Button>
                              <Button size="icon" variant="ghost" aria-label="تحريك الحصة للأسفل" onClick={() => mapResource(level.id, segment.id, resource.id, (r) => ({ ...r, sessions: moveItem(r.sessions, sesIndex, 1).map((x, i) => ({ ...x, order: i + 1 })) }))}><ChevronDown className="size-4" /></Button>
                              <Button size="icon" variant="ghost" aria-label="حذف الحصة" className="text-destructive" onClick={() => deleteSession(segment.id, resource.id, session)}><Trash2 className="size-4" /></Button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {copyPanel === resource.id ? (
                        <div className="mt-3 space-y-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
                          <p className="text-sm font-bold">إضافة حصة إلى «{resource.title}»</p>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addLessonToResource(segment.id, resource.id, makeBlankLesson(LEVEL_TITLES[activeLevel] ?? ""))}
                          >
                            <Plus className="size-4" /> حصة فارغة (9 محطات جاهزة للملء)
                          </Button>
                          <p className="mt-2 text-xs text-muted-foreground">أو انسخ حصة جاهزة ثم عدّلها كما تشاء:</p>
                          <div className="max-h-64 space-y-1 overflow-y-auto">
                            {originals.map((original) => (
                              <Button
                                key={original.id}
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                onClick={() => addLessonToResource(segment.id, resource.id, makeLessonCopy(original), original.id)}
                              >
                                <Copy className="size-4" /> {original.title}
                              </Button>
                            ))}
                          </div>
                          <Button variant="ghost" className="w-full" onClick={() => setCopyPanel(null)}>إلغاء</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => setCopyPanel(resource.id)}>
                          <Plus className="size-4" /> إضافة حصة
                        </Button>
                      )}
                    </article>
                  ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      mapSegment(level.id, segment.id, (s) => ({ ...s, resources: [...s.resources, newResource(s.resources.length + 1)] }))
                    }
                  >
                    <Plus className="size-4" /> مورد جديد
                  </Button>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
