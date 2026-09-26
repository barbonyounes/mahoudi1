import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: typeof search["next"] === "string" ? search["next"] : "/teacher" }),
  head: () => ({ meta: [
    { title: "دخول الأستاذ — منصة الحصص" },
    { name: "description", content: "الدخول الآمن إلى مساحة تخصيص حصص علوم الطبيعة والحياة." },
    { property: "og:title", content: "دخول الأستاذ — منصة الحصص" },
    { property: "og:description", content: "الدخول الآمن إلى مساحة تخصيص الحصص." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
  component: AuthPage,
});

function safeNext(value: string) { return value.startsWith("/") && !value.startsWith("//") ? value : "/teacher"; }
function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async () => {
    setBusy(true); setMessage("");
    const result = signup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(safeNext(next))}` } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (signup && !result.data.session) return setMessage("تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.");
    void navigate({ to: safeNext(next) });
  };
  const google = async () => {
    sessionStorage.setItem("teacher-next", safeNext(next));
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) setMessage("تعذّر الدخول بواسطة Google.");
  };
  return <main dir="rtl" className="grid min-h-dvh place-items-center bg-background px-4 py-10">
    <section className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-6 shadow-xl sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><BookOpen /></div>
      <h1 className="mt-5 text-3xl font-bold">مساحة الأستاذ</h1>
      <p className="mt-2 text-muted-foreground">احفظ حصصك وخصصها بأمان من أي جهاز.</p>
      <div className="mt-6 space-y-3">
        <Input type="email" dir="ltr" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
        <Input type="password" dir="ltr" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
        {message && <p className="rounded-xl bg-secondary p-3 text-sm">{message}</p>}
        <Button className="h-12 w-full text-base" disabled={busy || !email || password.length < 6} onClick={() => void submit()}>
          {busy && <Loader2 className="animate-spin" />}{signup ? "إنشاء حساب" : "تسجيل الدخول"}
        </Button>
        <Button variant="outline" className="h-12 w-full" onClick={() => void google()}>المتابعة بواسطة Google</Button>
      </div>
      <button type="button" className="mt-5 w-full text-sm font-bold text-primary" onClick={() => { setSignup((v) => !v); setMessage(""); }}>
        {signup ? "لديك حساب؟ سجّل الدخول" : "أستاذ جديد؟ أنشئ حساباً"}
      </button>
    </section>
  </main>;
}
