CREATE POLICY "Teachers can read own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'teacher-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Teachers can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'teacher-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Teachers can update own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'teacher-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'teacher-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Teachers can delete own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'teacher-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);