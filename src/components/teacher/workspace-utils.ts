import type { CurriculumSegment, CurriculumResource, CurriculumSession, LessonDef, Station } from "@/data/lesson";

export function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** يحرّك عنصراً داخل مصفوفة بمقدار -1 أو +1 */
export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const LEVEL_TITLES: Record<string, string> = {
  "3am": "السنة الثالثة متوسط",
  "4am": "السنة الرابعة متوسط",
};

const STATION_TEMPLATE: { id: string; title: string; minutes: number }[] = [
  { id: "start", title: "وضعية الانطلاق — التقويم التشخيصي وصياغة الفرضيات", minutes: 5 },
  { id: "hypotheses", title: "صياغة الفرضيات", minutes: 3 },
  { id: "task", title: "التعليمة — تحديد المهمة قبل الاستقصاء", minutes: 3 },
  { id: "inquiry", title: "النشاط الاستقصائي", minutes: 10 },
  { id: "analysis", title: "التحليل والتفسير", minutes: 7 },
  { id: "resources", title: "إرساء الموارد — الحوصلة", minutes: 4 },
  { id: "copy", title: "الأثر الكتابي — التدوين على الكراس", minutes: 4 },
  { id: "assess", title: "التقويم", minutes: 7 },
  { id: "integration", title: "الإدماج", minutes: 7 },
];

export function blankStation(index: number): Station {
  const template = STATION_TEMPLATE[index] ?? { id: "station", title: "محطة جديدة", minutes: 5 };
  return {
    id: uid(template.id),
    kicker: `المرحلة ${index + 1}`,
    title: template.title,
    minutes: template.minutes,
    model: "biome",
    teacherNote: "",
    blocks: [],
    keyPoints: [],
  };
}

export function makeBlankLesson(levelTitle: string): LessonDef {
  return {
    id: uid("lesson"),
    subject: "علوم الطبيعة والحياة",
    level: levelTitle,
    unit: "",
    title: "حصة جديدة",
    competence: "",
    totalMinutes: 50,
    terms: [],
    stations: STATION_TEMPLATE.map((_, i) => blankStation(i)),
  };
}

export function makeLessonCopy(original: LessonDef): LessonDef {
  const copy = structuredClone(original);
  copy.id = uid("lesson");
  return copy;
}

export function makeSession(lesson: LessonDef, order: number, originalLessonId?: string): CurriculumSession {
  return {
    order,
    title: lesson.title,
    lessonId: lesson.id,
    status: "ready",
    summary: "",
    ...(originalLessonId ? { originalLessonId } : {}),
  };
}

export function newSegment(order: number): CurriculumSegment {
  return { id: uid("seg"), order, title: "مقطع جديد", field: "", resources: [] };
}

export function newResource(order: number): CurriculumResource {
  return { id: uid("res"), order, title: "مورد جديد", plannedSessions: 1, competence: "", sessions: [] };
}

export function patchList<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}
