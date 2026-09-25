CREATE TABLE public.teacher_workspaces (
  user_id uuid PRIMARY KEY,
  curriculum jsonb NOT NULL DEFAULT '[]'::jsonb,
  lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_workspaces_curriculum_array CHECK (jsonb_typeof(curriculum) = 'array'),
  CONSTRAINT teacher_workspaces_lessons_array CHECK (jsonb_typeof(lessons) = 'array')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_workspaces TO authenticated;
GRANT ALL ON public.teacher_workspaces TO service_role;
ALTER TABLE public.teacher_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can read their workspace"
ON public.teacher_workspaces FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Teachers can create their workspace"
ON public.teacher_workspaces FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can update their workspace"
ON public.teacher_workspaces FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can delete their workspace"
ON public.teacher_workspaces FOR DELETE TO authenticated
USING (auth.uid() = user_id);
CREATE INDEX teacher_workspaces_updated_at_idx ON public.teacher_workspaces(updated_at DESC);