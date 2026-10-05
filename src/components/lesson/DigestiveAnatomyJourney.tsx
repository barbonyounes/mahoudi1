import { Activity, GitBranch, Microscope, MousePointerClick, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentaryJourneyShell, type JourneyStage } from "@/components/lesson/DocumentaryJourneyShell";
import { DigestiveSystemBuilder } from "@/components/lesson/DigestiveSystemBuilder";
import type { LessonDef } from "@/data/lesson";
import digestiveSystem from "@/assets/digestion-real/digestive-system.svg.asset.json";
import intestinalVilli from "@/assets/digestion-real/intestinal-villi-photo.jpg.asset.json";

const stages: JourneyStage[] = [
  { id: "case", short: "المشكلة", kicker: "وضعية الانطلاق", title: "كيف يُنظَّم جهاز الهضم؟", subtitle: "من رسم تشريحي حقيقي نصوغ إشكالية مسار الغذاء ومصيره.", stationIds: ["start", "hypotheses"] },
  { id: "build", short: "التركيب", kicker: "النشاط التفاعلي المركزي", title: "ركّب الجهاز الهضمي بنفسك", subtitle: "بازل تشريحي على جسم إنسان: الأعضاء، الغدد، الامتصاص، طريقا النقل، وصولاً إلى الخلية.", stationIds: ["task", "experiment"] },
  { id: "zoom", short: "الزغابة", kicker: "الاستقصاء المجهري", title: "أين تُمتصّ المغذيات فعلاً؟", subtitle: "نقرب الصورة إلى بنية الزغابة المعوية ونربطها بسطح التبادل.", stationIds: ["analysis"] },
  { id: "synthesis", short: "الحوصلة", kicker: "إرساء الموارد والتقويم", title: "الرحلة كاملة: من اللقمة إلى الخلية", subtitle: "نرتب الأعضاء والعصارات والمسارات في خريطة واحدة قابلة للتدوين.", stationIds: ["summary", "copy", "evaluation", "integration"] },
];

function Reveal({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  return shown ? <div className="border-r-4 border-success bg-success/10 p-5 text-lg font-bold leading-9">{children}</div> : <Button type="button" size="lg" onClick={() => setShown(true)}><Sparkles /> كشف الاستنتاج</Button>;
}

function StageView({ id }: { id: string }) {
  if (id === "case") return (
    <div className="grid gap-7 lg:grid-cols-2 lg:items-center">
      <div>
        <Activity className="size-12 text-primary" />
        <p className="mt-5 text-2xl font-bold leading-[1.9]">يبلغ طول الأنبوب الهضمي عند الإنسان نحو 9 أمتار، ومع ذلك يعمل كمنظومة واحدة متعاونة مع غدد لا يمر الغذاء داخلها.</p>
        <div className="mt-6 border-r-4 border-accent bg-accent/10 p-5"><p className="text-sm font-black text-accent">الإشكالية</p><p className="mt-2 text-xl font-black leading-9">كيف تتوزع أعضاء الهضم والغدد الملحقة؟ وأين تُمتصّ المغذيات وأي طريق تسلك نحو الخلايا؟</p></div>
        <div className="mt-6"><Reveal>الجهاز الهضمي أنبوب متصل تصبّ فيه غدد ملحقة؛ والامتصاص مدخل المغذيات إلى الوسط الداخلي، لا نهاية الهضم فقط.</Reveal></div>
      </div>
      <figure className="border border-border bg-card p-4"><img src={digestiveSystem.url} alt="رسم تشريحي حقيقي للجهاز الهضمي" className="max-h-[62vh] w-full object-contain" /><figcaption className="border-t border-border pt-3 text-center text-sm leading-6 text-muted-foreground">وثيقة تشريحية مفتوحة — Wikimedia Commons، Digestive system diagram</figcaption></figure>
    </div>
  );
  if (id === "build") return (
    <div className="space-y-7">
      <div className="flex items-center gap-3 border-r-4 border-primary bg-primary/10 p-5"><MousePointerClick className="size-8 shrink-0 text-primary" /><p className="text-lg font-bold leading-8">التعليمة: ركّب القطع على جسم الإنسان مرحلةً بعد مرحلة. عند كل خطأ اقرأ التلميح ولا تكشف الحل إلا بعد محاولة القسم.</p></div>
      <DigestiveSystemBuilder />
    </div>
  );
  if (id === "zoom") return (
    <div className="grid gap-7 lg:grid-cols-2 lg:items-center">
      <figure className="overflow-hidden border border-border bg-card"><img src={intestinalVilli.url} alt="صورة مجهرية حقيقية لزغابات المعي الدقيق" className="max-h-[58vh] w-full object-contain" /><figcaption className="border-t border-border p-4 text-sm font-bold leading-7">صورة مجهرية حقيقية — Wikimedia Commons، Histology Small Intestines</figcaption></figure>
      <div>
        <Microscope className="size-12 text-primary" />
        <ol className="mt-5 space-y-3 text-lg font-bold leading-9">
          <li>1. صف شكل البروزات الظاهرة في الصورة.</li>
          <li>2. لماذا يحتوي مركز كل زغابة على شعيرات دموية ووعاء لمفاوي؟</li>
          <li>3. اربط هذه البنية بموضع «مقر الامتصاص» الذي ركّبته في البازل.</li>
        </ol>
        <div className="mt-6"><Reveal>الزغابات توسّع سطح التبادل (نحو 200 م²) وجدارها رقيق؛ تدخل السكريات والأحماض الأمينية إلى الشعيرات الدموية، بينما تدخل الدسم إلى الوعاء اللمفاوي.</Reveal></div>
      </div>
    </div>
  );
  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-3">
        {[{ t: "الأنبوب الهضمي", d: "فم ← بلعوم ← مريء ← معدة ← معي دقيق ← معي غليظ ← شرج" }, { t: "الغدد الملحقة", d: "الغدد اللعابية، الكبد (والمرارة)، البنكرياس — تصبّ ولا يمر الغذاء فيها" }, { t: "من المعي إلى الخلية", d: "الزغابات ← طريق دموي نحو الكبد أو طريق لمفاوي ← الدم ← كل خلية" }].map((c) => (
          <article key={c.t} className="border-t-4 border-primary bg-card p-6"><GitBranch className="size-8 text-primary" /><h3 className="mt-3 text-xl font-black">{c.t}</h3><p className="mt-3 leading-8">{c.d}</p></article>
        ))}
      </div>
      <div className="border-r-4 border-success bg-success/10 p-6 text-xl font-bold leading-10">الهضم يبسّط الأغذية، والامتصاص يُدخل المغذيات إلى الوسط الداخلي، والدورة الدموية واللمفاوية توصلها إلى كل خلية من خلايا العضوية.</div>
    </div>
  );
}

export function DigestiveAnatomyJourney({ lesson, customized = false }: { lesson: LessonDef; customized?: boolean }) {
  return <DocumentaryJourneyShell lesson={lesson} customized={customized} stages={stages} levelId="4am" journeyLabel="ورشة التشريح" renderStage={(id) => <StageView id={id} />} />;
}
