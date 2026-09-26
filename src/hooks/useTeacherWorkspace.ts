import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { curriculum as defaultCurriculum, type CurriculumLevel } from "@/data/curriculum";
import { lessons as defaultLessons } from "@/data/lessons";
import type { LessonDef } from "@/data/lesson";
import { getTeacherWorkspace, saveTeacherWorkspace } from "@/lib/teacher-workspace.functions";

export type WorkspaceDraft = { curriculum: CurriculumLevel[]; lessons: LessonDef[] };
export type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

const cloneDefaults = (): WorkspaceDraft => ({
  curriculum: structuredClone(defaultCurriculum.filter((level) => level.id === "3am" || level.id === "4am")),
  lessons: structuredClone(defaultLessons.filter((lesson) => lesson.level.includes("الثالثة") || lesson.level.includes("الرابعة"))),
});

export function useTeacherWorkspace() {
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getTeacherWorkspace);
  const saveWorkspace = useServerFn(saveTeacherWorkspace);
  const query = useQuery({
    queryKey: ["teacher-workspace"],
    queryFn: async () => (await fetchWorkspace()) ?? { ...cloneDefaults(), updatedAt: null },
  });

  const [draft, setDraft] = useState<WorkspaceDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<WorkspaceDraft | null>(null);
  const inFlight = useRef(false);

  // مزامنة أولية: لا نستبدل المسودة المحلية بعد بدء التحرير
  useEffect(() => {
    setDraft((prev) => prev ?? (query.data ? structuredClone(query.data) : null));
  }, [query.data]);

  const flush = useCallback(async () => {
    if (inFlight.current || !pending.current) return;
    const toSave = pending.current;
    pending.current = null;
    inFlight.current = true;
    setSaveState("saving");
    try {
      const result = await saveWorkspace({ data: toSave });
      queryClient.setQueryData(["teacher-workspace"], { ...toSave, updatedAt: result.savedAt });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      inFlight.current = false;
      if (pending.current) void flush();
    }
  }, [queryClient, saveWorkspace]);

  const schedule = useCallback(
    (next: WorkspaceDraft) => {
      pending.current = next;
      setSaveState((s) => (s === "saving" || s === "saved" ? s : "pending"));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1200);
    },
    [flush],
  );

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

  const retrySave = useCallback(() => void flush(), [flush]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { draft, isLoading: query.isLoading || draft === null, update, saveState, retrySave, updatedAt: query.data?.updatedAt ?? null };
}
