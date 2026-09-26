import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import type { CurriculumLevel } from "@/data/curriculum";
import type { LessonDef } from "@/data/lesson";

const workspaceSchema = z.object({
  curriculum: z.array(z.unknown()).max(20),
  lessons: z.array(z.unknown()).max(500),
});

export type TeacherWorkspace = {
  curriculum: CurriculumLevel[];
  lessons: LessonDef[];
  updatedAt: string | null;
};

export const getTeacherWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeacherWorkspace | null> => {
    const { data, error } = await context.supabase
      .from("teacher_workspaces")
      .select("curriculum, lessons, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("تعذّر تحميل مساحة الأستاذ");
    if (!data) return null;
    return {
      curriculum: data.curriculum as unknown as CurriculumLevel[],
      lessons: data.lessons as unknown as LessonDef[],
      updatedAt: data.updated_at,
    };
  });

export const saveTeacherWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => workspaceSchema.parse(input))
  .handler(async ({ data, context }) => {
    const serialized = JSON.stringify(data);
    if (serialized.length > 8_000_000) throw new Error("حجم مساحة العمل كبير جداً");
    const { error } = await context.supabase.from("teacher_workspaces").upsert({
      user_id: context.userId,
      curriculum: data.curriculum as unknown as Json,
      lessons: data.lessons as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("تعذّر حفظ التعديلات");
    return { savedAt: new Date().toISOString() };
  });
