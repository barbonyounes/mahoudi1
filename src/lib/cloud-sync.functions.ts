import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BUCKET = "teacher-sync-media";
const keySchema = z.string().trim().min(16).max(128);
const idSchema = z.string().regex(/^[\w-]{8,64}$/);

async function hashKey(key: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** رفع نسخة المساحة للسحابة؛ يعيد روابط رفع للوسائط غير الموجودة بعد. */
export const pushWorkspace = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      syncKey: keySchema,
const workspaceSchema = z.object({ curriculum: z.array(z.unknown()), lessons: z.array(z.unknown()) });


      mediaIds: z.array(idSchema).max(500),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const h = await hashKey(data.syncKey);
    const { error } = await supabaseAdmin
      .from("teacher_cloud_sync")
      .upsert({ key_hash: h, workspace: data.workspace as never, updated_at: new Date().toISOString() });
    if (error) throw new Error("تعذّر الحفظ في السحابة");
    const { data: existing } = await supabaseAdmin.storage.from(BUCKET).list(h, { limit: 1000 });
    const have = new Set((existing ?? []).map((f) => f.name));
    const uploads: { id: string; path: string; token: string }[] = [];
    for (const id of data.mediaIds.filter((m) => !have.has(m))) {
      const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(`${h}/${id}`);
      if (signed) uploads.push({ id, path: signed.path, token: signed.token });
    }
    return { uploads, savedAt: new Date().toISOString() };
  });

/** جلب نسخة المساحة من السحابة مع روابط تنزيل مؤقتة للوسائط. */
export const pullWorkspace = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ syncKey: keySchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const h = await hashKey(data.syncKey);
    const { data: row } = await supabaseAdmin
      .from("teacher_cloud_sync").select("workspace, updated_at").eq("key_hash", h).maybeSingle();
    if (!row) return { found: false as const };
    const { data: files } = await supabaseAdmin.storage.from(BUCKET).list(h, { limit: 1000 });
    const media: { id: string; url: string }[] = [];
    for (const f of files ?? []) {
      const { data: s } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(`${h}/${f.name}`, 3600);
      if (s) media.push({ id: f.name, url: s.signedUrl });
    }
    return { found: true as const, workspace: row.workspace as Record<string, unknown>, updatedAt: row.updated_at, media };
  });
