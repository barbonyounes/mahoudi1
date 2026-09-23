import { studentNames } from "@/data/lesson";

export type ClassGroup = {
  id: string;
  name: string;
  levelId: string;
  students: string[];
};

export type LevelDef = {
  id: string;
  name: string;
};

export type ClassroomState = {
  levels: LevelDef[];
  classes: ClassGroup[];
  activeClassId: string | null;
};

export type FeedbackEntry = {
  id: string;
  student: string;
  classId: string | null;
  label: string;
  at: number;
};

export const FEEDBACK_LABELS = [
  "إجابة صحيحة",
  "مشاركة جيدة",
  "إجابة ناقصة",
  "يحتاج مرافقة",
] as const;

export const CLASSROOM_KEY = "classroom-v1";
export const FEEDBACK_KEY = "classroom-feedback-v1";
export const CLASSROOM_EVENT = "classroom-changed";

export function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultClassroom(): ClassroomState {
  const levelId = makeId();
  const classId = makeId();
  return {
    levels: [{ id: levelId, name: "السنة الثانية متوسط" }],
    classes: [{ id: classId, name: "الفوج 1", levelId, students: [...studentNames] }],
    activeClassId: classId,
  };
}

/** يحوّل نصاً متعدد الأسطر/الفواصل إلى قائمة أسماء نظيفة */
export function parseNames(raw: string): string[] {
  return raw
    .split(/[\n,،;]+/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n.length <= 60)
    .slice(0, 120);
}

/** يستخرج أسماء التلاميذ من محتوى ملف CSV (يدعم عمود اللقب + الاسم) */
export function parseCsvNames(raw: string): string[] {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const cells = (line: string) =>
    line
      .split(/[,;\t]/)
      .map((c) => c.trim().replace(/^"(.*)"$/, "$1").trim())
      .filter((c) => c.length > 0);

  const first = cells(lines[0] ?? "").join(" ");
  const isHeader = /(اسم|لقب|name|nom|prénom|prenom|élève|eleve|student)/i.test(first);
  const rows = isHeader ? lines.slice(1) : lines;

  const names: string[] = [];
  for (const line of rows) {
    const parts = cells(line).filter((c) => !/^\d+$/.test(c));
    if (parts.length === 0) continue;
    const name = parts.slice(0, 2).join(" ").trim().slice(0, 60);
    if (name) names.push(name);
    if (names.length >= 120) break;
  }
  return names;
}

/** توحيد شكل الاسم للمقارنة: إزالة التشكيل والمسافات الزائدة وتوحيد الألف والهاء */
export function normalizeStudentName(name: string): string {
  return name
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export type ImportAnalysis = {
  imported: string[];
  /** أسماء جديدة غير موجودة في القسم */
  fresh: string[];
  /** أسماء مكررة مع القائمة الحالية */
  duplicates: string[];
  /** تكرار داخل الملف نفسه */
  internalDuplicates: string[];
  /** نتيجة الدمج: القائمة الحالية + الجديد فقط */
  merged: string[];
};

/** يكشف التكرار (اسم + لقب) بين ملف الاستيراد والقائمة الحالية */
export function analyzeImport(imported: string[], existing: string[]): ImportAnalysis {
  const existingKeys = new Set(existing.map(normalizeStudentName));
  const seen = new Set<string>();
  const fresh: string[] = [];
  const duplicates: string[] = [];
  const internalDuplicates: string[] = [];

  for (const name of imported) {
    const key = normalizeStudentName(name);
    if (!key) continue;
    if (seen.has(key)) {
      internalDuplicates.push(name);
      continue;
    }
    seen.add(key);
    if (existingKeys.has(key)) duplicates.push(name);
    else fresh.push(name);
  }

  return {
    imported,
    fresh,
    duplicates,
    internalDuplicates,
    merged: [...existing, ...fresh].slice(0, 120),
  };
}

