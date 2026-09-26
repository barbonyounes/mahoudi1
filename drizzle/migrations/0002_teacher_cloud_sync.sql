CREATE TABLE IF NOT EXISTS public.teacher_cloud_sync (
  key_hash text PRIMARY KEY,
  workspace jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.teacher_cloud_sync TO service_role;
ALTER TABLE public.teacher_cloud_sync ENABLE ROW LEVEL SECURITY;