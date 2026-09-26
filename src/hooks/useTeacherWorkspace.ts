import { useCallback, useEffect, useRef, useState } from "react";
import { curriculum as defaultCurriculum, type CurriculumLevel } from "@/data/curriculum";
import { lessons as defaultLessons } from "@/data/lessons";
import type { LessonDef } from "@/data/lesson";

export type WorkspaceDraft = { curriculum: CurriculumLevel[]; lessons: LessonDef[] };
export type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

export const WORKSPACE_STORAGE_KEY = "svt-teacher-workspace-v1";

const cloneDefaults = (): WorkspaceDraft => ({
  curriculum: structuredClone(defaultCurriculum.filter((level) => level.id === "3am" || level.id === "4am")),
  lessons: structuredClone(defaultLessons.filter((lesson) => lesson.level.includes("الثالثة") || lesson.level.includes("الرابعة"))),
});

export function loadWorkspace(): WorkspaceDraft {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkspaceDraft;
      if (Array.isArray(parsed.curriculum) && Array.isArray(parsed.lessons)) return parsed;
    }
  } catch {
    // تجاهل التلف ونعود للافتراضي
  }
  return cloneDefaults();
}

/** مساحة الأستاذ بدون حساب: تُحفظ المسودة محلياً في المتصفح مع حفظ تلقائي مؤجل. */
export function useTeacherWorkspace() {
  const [draft, setDraft] = useState<WorkspaceDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(loadWorkspace());
  }, []);

  const schedule = useCallback((next: WorkspaceDraft) => {
    setSaveState("pending");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSaveState("saving");
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("teacher-workspace-saved"));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
  }, []);

  const update = useCallback(
    (mutate: (d: WorkspaceDraft) => WorkspaceDraft) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = mutate(prev);
        schedule(next);
        return next;
      });
    },
    [schedule],
  );

  const retrySave = useCallback(() => {
    if (!draft) return;
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(draft));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [draft]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { draft, isLoading: draft === null, update, saveState, retrySave, updatedAt: null };
}
