import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { curriculum as defaultCurriculum, type CurriculumLevel } from "@/data/curriculum";
import { lessons as defaultLessons } from "@/data/lessons";
import type { LessonDef } from "@/data/lesson";
import { getTeacherWorkspace, saveTeacherWorkspace } from "@/lib/teacher-workspace.functions";

export type WorkspaceDraft = { curriculum: CurriculumLevel[]; lessons: LessonDef[] };
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
  const mutation = useMutation({
    mutationFn: (draft: WorkspaceDraft) => saveWorkspace({ data: draft }),
    onSuccess: (result, draft) => queryClient.setQueryData(["teacher-workspace"], { ...draft, updatedAt: result.savedAt }),
  });
  return { ...query, save: mutation.mutateAsync, saving: mutation.isPending, saveError: mutation.error };
}
