import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { loadWorkspace, WORKSPACE_STORAGE_KEY } from "@/hooks/useTeacherWorkspace";
import type { LessonDef } from "@/data/lesson";

/**
 * زر يظهر فقط عندما تختلف الحصة المعروضة عن نسختها الأصلية،
 * ويعيدها إلى المحتوى الأصلي المخصّص داخل مسودة الأستاذ المحفوظة محلياً.
 */
export function RestoreOriginalButton({ original }: { original: LessonDef }) {
  const [confirming, setConfirming] = useState(false);

  const restore = () => {
    const ws = loadWorkspace();
    const next = {
      ...ws,
      lessons: ws.lessons.map((l) => (l.id === original.id ? structuredClone(original) : l)),
    };
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("teacher-workspace-saved"));
    setConfirming(false);
  };

  return (
    <div dir="rtl" className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {confirming ? (
        <div className="rounded-2xl border-2 border-border bg-card p-4 shadow-xl">
          <p className="mb-3 max-w-[16rem] text-sm font-bold text-card-foreground">
            سيتم حذف تعديلاتك على هذه الحصة والرجوع إلى النسخة الأصلية. هل تؤكد؟
          </p>
          <div className="flex gap-2">
            <button
              onClick={restore}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              نعم، أرجع الأصل
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-foreground"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card/90 px-4 py-2 text-sm font-bold text-card-foreground shadow-lg backdrop-blur hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" />
          الرجوع إلى النسخة الأصلية
        </button>
      )}
    </div>
  );
}
