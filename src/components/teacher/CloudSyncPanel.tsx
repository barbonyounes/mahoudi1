import { useEffect, useState } from "react";
import { CloudDownload, CloudUpload, Copy, KeyRound, Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { pullWorkspace, pushWorkspace } from "@/lib/cloud-sync.functions";
import { getLocalMedia, listLocalMediaIds, mediaIdsInWorkspace, saveLocalMedia } from "@/lib/local-media";
import { WORKSPACE_STORAGE_KEY, type WorkspaceDraft } from "@/hooks/useTeacherWorkspace";

const KEY_STORAGE = "svt-sync-key";
const LAST_SYNC = "svt-last-sync";
const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("").match(/.{4}/g)!.join("-");

/** مزامنة يدوية مع السحابة برمز خاص (بدون حساب). */
export function CloudSyncPanel({ draft }: { draft: WorkspaceDraft }) {
  const [online, setOnline] = useState(true);
  const [key, setKey] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [busy, setBusy] = useState<"push" | "pull" | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    setKey(localStorage.getItem(KEY_STORAGE) ?? "");
    setLast(localStorage.getItem(LAST_SYNC));
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const ensureKey = () => {
    let k = key.trim();
    if (k.length < 16) { k = newKey(); setKey(k); }
    localStorage.setItem(KEY_STORAGE, k);
    return k;
  };
  const markSynced = () => { const t = new Date().toLocaleString("ar-DZ"); localStorage.setItem(LAST_SYNC, t); setLast(t); };

  const push = async () => {
    setBusy("push");
    try {
      const syncKey = ensureKey();
      const local = new Set(await listLocalMediaIds());
      const mediaIds = mediaIdsInWorkspace(draft).filter((id) => local.has(id));
      const res = await pushWorkspace({ data: { syncKey, workspace: draft, mediaIds } });
      for (const u of res.uploads) {
        const blob = await getLocalMedia(u.id);
        if (blob) await supabase.storage.from("teacher-sync-media").uploadToSignedUrl(u.path, u.token, blob);
      }
      markSynced();
      toast.success(`تم رفع المساحة للسحابة${res.uploads.length ? ` مع ${res.uploads.length} وسيط` : ""}`);
    } catch { toast.error("تعذّر الرفع للسحابة، حاول لاحقاً"); } finally { setBusy(null); }
  };

  const pull = async () => {
    if (!window.confirm("سيتم استبدال المساحة المحلية بالنسخة المحفوظة في السحابة. متابعة؟")) return;
    setBusy("pull");
    try {
      const syncKey = ensureKey();
      const res = await pullWorkspace({ data: { syncKey } });
      if (!res.found) { toast.error("لا توجد نسخة سحابية بهذا الرمز"); return; }
      const local = new Set(await listLocalMediaIds());
      for (const m of res.media.filter((x) => !local.has(x.id))) {
        const r = await fetch(m.url);
        if (r.ok) await saveLocalMedia(await r.blob(), m.id);
      }
      localStorage.setItem(WORKSPACE_STORAGE_KEY, (JSON.parse(res.workspaceJson) as WorkspaceDraft) && JSON.stringify(res.workspaceJson ? JSON.parse(res.workspaceJson) : null));
      markSynced();
      toast.success("تم جلب المساحة من السحابة");
      setTimeout(() => window.location.reload(), 600);
    } catch { toast.error("تعذّر الجلب من السحابة"); } finally { setBusy(null); }
  };

  return <section className="mt-6 rounded-2xl border border-border bg-card p-5">
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-lg font-bold text-primary">المزامنة مع السحابة</h2>
      {!online && <span className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-bold text-muted-foreground"><WifiOff className="size-3" />بدون إنترنت — العمل محلياً</span>}
      {last && <span className="text-xs text-muted-foreground">آخر مزامنة: {last}</span>}
    </div>
    <p className="mt-1 text-sm text-muted-foreground">كل عملك يُحفظ على هذا الجهاز ويعمل بدون إنترنت. عند الرغبة ارفع نسخة للسحابة، واستعمل نفس الرمز على جهاز آخر لجلبها. احتفظ بالرمز سرّياً.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-64 flex-1"><KeyRound className="absolute start-3 top-2.5 size-4 text-muted-foreground" /><Input dir="ltr" className="ps-9 font-mono" placeholder="يُنشأ تلقائياً عند أول رفع" value={key} onChange={(e) => setKey(e.target.value)} /></div>
      <Button variant="ghost" size="icon" aria-label="نسخ الرمز" disabled={!key} onClick={() => { void navigator.clipboard.writeText(key); toast.success("تم نسخ الرمز"); }}><Copy /></Button>
      <Button disabled={!online || !!busy} onClick={() => void push()}>{busy === "push" ? <Loader2 className="animate-spin" /> : <CloudUpload />}رفع للسحابة</Button>
      <Button variant="outline" disabled={!online || !!busy || key.trim().length < 16} onClick={() => void pull()}>{busy === "pull" ? <Loader2 className="animate-spin" /> : <CloudDownload />}جلب من السحابة</Button>
    </div>
  </section>;
}
