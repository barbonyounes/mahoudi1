import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  FlaskConical,
  Focus,
  Home,
  ImageIcon,
  Maximize2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonDef } from "@/data/lesson";
import digestiveSystem from "@/assets/digestive-system.jpg";
import starchExperiment from "@/assets/starch-digestion-experiment.jpg";
import document1 from "@/assets/digestion-docs/document-1.jpeg.asset.json";
import document2 from "@/assets/digestion-docs/document-2.jpeg.asset.json";
import document3 from "@/assets/digestion-docs/document-3.jpeg.asset.json";
import document4 from "@/assets/digestion-docs/document-4.jpeg.asset.json";
import document5 from "@/assets/digestion-docs/document-5.jpeg.asset.json";

const documents = [document1.url, document2.url, document3.url, document4.url, document5.url];

type Stage = {
  id: string;
  short: string;
  kicker: string;
  title: string;
  subtitle: string;
};

const stages: Stage[] = [
  { id: "story", short: "المشكلة", kicker: "وضعية الانطلاق", title: "لماذا أصبح الخبز حلواً؟", subtitle: "نبدأ من ملاحظة أحمد ونحوّلها إلى سؤال علمي قابل للتحقق." },
  { id: "mouth", short: "الفم", kicker: "النشاط 1", title: "تحولات الخبز في الفم", subtitle: "نميّز بين التفتيت الآلي والتحول الكيميائي للنشاء." },
  { id: "lab", short: "التجربة", kicker: "الاستقصاء التجريبي", title: "الهضم الاصطناعي للنشاء", subtitle: "تجربة شاهدة وتجربة باللعاب في شروط الجسم نفسها." },
  { id: "stomach", short: "المعدة", kicker: "النشاط 2 — المحطة الثانية", title: "ماذا يحدث في المعدة؟", subtitle: "العصارة المعدية وسط حامضي يؤثر نوعياً في البروتينات." },
  { id: "intestine", short: "المعي", kicker: "النشاط 2 — المحطة الثالثة", title: "المعي الدقيق: محطة الإتمام", subtitle: "ثلاث عصارات تتعاون لتحويل ما تبقى إلى مغذيات." },
  { id: "enzyme", short: "الإنزيم", kicker: "النشاط 3", title: "الإنزيم: عامل حيّ ونوعي", subtitle: "نستنتج خاصيتي السرعة والتخصص من نتائج التجارب." },
  { id: "map", short: "الحوصلة", kicker: "الدعامة التشريحية والتقويم", title: "رحلة الغذاء كاملة", subtitle: "نربط الأعضاء بالعصارات ونواتج الهضم والمعنى البيولوجي." },
];

function Reveal({ label = "كشف المناقشة", children }: { label?: string; children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  return shown ? (
    <div className="animate-fade-in border-r-4 border-success bg-success/10 p-5 text-lg leading-9">
      {children}
    </div>
  ) : (
    <Button type="button" size="lg" onClick={() => setShown(true)} className="h-12 px-6 text-base">
      <Sparkles /> {label}
    </Button>
  );
}

function SourceDocument({ index, caption }: { index: number; caption: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative min-h-40 overflow-hidden border border-border bg-card text-right shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`فتح الوثيقة الأصلية ${index + 1}`}
      >
        <img src={documents[index]} alt={caption} className="h-52 w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/90 px-4 py-3 text-sm font-bold backdrop-blur">
          <span>{caption}</span><Maximize2 className="size-4 text-primary" />
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 p-3 backdrop-blur sm:p-8" role="dialog" aria-modal="true">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="absolute left-4 top-4 z-10"><X /> إغلاق</Button>
          <img src={documents[index]} alt={caption} className="max-h-[92vh] max-w-full object-contain" />
        </div>
      )}
    </>
  );
}

function StoryStage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 bg-accent/15 px-4 py-2 font-bold text-accent"><BookOpen className="size-5" /> وضعية أحمد</div>
        <p className="text-2xl font-bold leading-[1.9] sm:text-3xl">
          تناول أحمد وجبة الإفطار، ثم لاحظ أثناء حصة العلوم أن قطعة الخبز التي مضغها طويلاً تغيّر شكلها الخارجي وأصبح مذاقها حلواً.
        </p>
        <div className="mt-8 border-r-4 border-primary bg-primary/10 p-6">
          <p className="text-sm font-bold text-primary">المشكلة العلمية</p>
          <p className="mt-2 text-2xl font-black leading-relaxed">ما التحولات التي تطرأ على الغذاء على طول الأنبوب الهضمي؟</p>
        </div>
        <div className="mt-6">
          <Reveal label="كشف الفرضيات المقترحة">
            <ul className="space-y-2"><li>• يتفتت الخبز ويختلط باللعاب.</li><li>• قد يتحول النشاء إلى مادة سكرية بفعل اللعاب.</li><li>• تتدخل عصارات أخرى في المعدة والمعي الدقيق.</li></ul>
          </Reveal>
        </div>
      </div>
      <SourceDocument index={0} caption="الوثيقة الأصلية — وضعية الانطلاق والنشاط الأول" />
    </div>
  );
}

function MouthStage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[{n:"01",t:"الملاحظة",d:"قطعة الخبز جافة ومتماسكة قبل المضغ، ثم تصبح لينة ومبللة وحلوة."},{n:"02",t:"الهضم الآلي",d:"تقطع الأسنان الخبز وتمزقه، ويقلبه اللسان ويخلطه اللعاب."},{n:"03",t:"الفرضية",d:"التحول الكيميائي المحتمل: تحوّل النشاء إلى سكر."}].map((item) => (
          <article key={item.n} className="border-t-4 border-primary bg-card p-6 shadow-sm"><span className="text-sm font-black text-primary">{item.n}</span><h3 className="mt-3 text-xl font-black">{item.t}</h3><p className="mt-3 leading-8 text-foreground/75">{item.d}</p></article>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-secondary/50 p-6">
          <p className="text-sm font-black text-primary">تعليمة النشاط</p>
          <p className="mt-3 text-xl font-bold leading-9">اقطع قطعة خبز، امضغها طويلاً دون بلع، ثم قارن الطعم والقوام قبل المضغ وبعده.</p>
          <div className="mt-6"><Reveal label="كشف الاستنتاج"><p><strong>الفم مقر هضم أولي:</strong> هضم آلي بالتقطيع والطحن والخلط، وهضم كيميائي يحوّل فيه اللعاب النشاء إلى سكر الشعير (مالتوز).</p></Reveal></div>
        </div>
        <SourceDocument index={1} caption="الوثيقة الأصلية — نتيجة نشاط الفم وبداية نشاط المعدة" />
      </div>
    </div>
  );
}

function LabStage() {
  const [selected, setSelected] = useState<"control" | "saliva">("control");
  const data = selected === "control"
    ? { title: "الأنبوب الشاهد", mix: "مطبوخ النشاء + ماء عند 37°م", iodine: "أزرق بنفسجي", fehling: "يبقى أزرق", result: "النشاء موجود، ولا يوجد سكر مختزل." }
    : { title: "أنبوب التجربة", mix: "مطبوخ النشاء + لعاب عند 37°م", iodine: "لا يظهر الأزرق", fehling: "راسب أحمر آجري", result: "اختفى النشاء وظهر سكر مختزل." };
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden border border-border bg-card">
        <img src={starchExperiment} alt="تجربة الهضم الاصطناعي للنشاء في حمام مائي" width={1600} height={1008} className="aspect-[16/10] w-full object-cover" />
        <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground">حمام مائي عند 37°م يحاكي حرارة الجسم، وماء اليود وفهلنج يكشفان المواد.</p>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-2 bg-secondary p-1">
          <Button type="button" variant={selected === "control" ? "default" : "ghost"} className="h-12" onClick={() => setSelected("control")}>الأنبوب الشاهد</Button>
          <Button type="button" variant={selected === "saliva" ? "default" : "ghost"} className="h-12" onClick={() => setSelected("saliva")}>مع اللعاب</Button>
        </div>
        <div className="mt-4 border border-border bg-card p-6">
          <p className="text-sm font-black text-primary">{data.title}</p><h3 className="mt-2 text-xl font-bold">{data.mix}</h3>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2"><div className="bg-secondary/60 p-4"><dt className="text-sm text-muted-foreground">مع ماء اليود</dt><dd className="mt-1 font-black">{data.iodine}</dd></div><div className="bg-secondary/60 p-4"><dt className="text-sm text-muted-foreground">مع فهلنج والتسخين</dt><dd className="mt-1 font-black">{data.fehling}</dd></div></dl>
          <p className="mt-5 border-r-4 border-accent bg-accent/10 p-4 text-lg font-bold">{data.result}</p>
        </div>
        <div className="mt-5"><Reveal label="كشف الاستنتاج النهائي"><p>يحتوي اللعاب على إنزيم <strong>الأميلاز اللعابي</strong> الذي يفكك النشاء إلى مالتوز. هذا تحول كيميائي، بخلاف المضغ الذي يمثل تحولاً آلياً.</p></Reveal></div>
      </div>
    </div>
  );
}

function StomachStage() {
  const rows = [
    ["غلوتين + ماء + 37°م", "لا يتغير محلول الغلوتين", "لا هضم دون عصارة معدية"],
    ["غلوتين + لعاب + 37°م", "لا يتغير محلول الغلوتين", "اللعاب لا يؤثر في البروتين"],
    ["غلوتين + عصارة معدية + 37°م", "زوال عكر محلول الغلوتين", "العصارة المعدية تفكك البروتين"],
  ];
  return (
    <div className="space-y-7">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <SourceDocument index={1} caption="السند — المعدة وتجربة الغلوتين" />
        <div className="overflow-x-auto border border-border bg-card"><table className="w-full min-w-[660px] text-right"><thead className="bg-primary text-primary-foreground"><tr><th className="p-4">محتوى الأنبوب</th><th className="p-4">الملاحظة</th><th className="p-4">الدلالة</th></tr></thead><tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-border"><td className="p-4 font-bold">{r[0]}</td><td className="p-4">{r[1]}</td><td className="p-4 text-muted-foreground">{r[2]}</td></tr>)}</tbody></table></div>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><div className="bg-secondary/60 p-5"><span className="text-sm font-black text-primary">الوسط</span><p className="mt-2 text-xl font-bold">حامضي</p></div><div className="bg-secondary/60 p-5"><span className="text-sm font-black text-primary">الإنزيم</span><p className="mt-2 text-xl font-bold">بيبسين</p></div><div className="bg-secondary/60 p-5"><span className="text-sm font-black text-primary">الناتج</span><p className="mt-2 text-xl font-bold">ببتيدات</p></div></div>
      <Reveal label="كشف حوصلة المعدة"><p>تنتهي فعالية اللعاب في حموضة المعدة، وتؤثر العصارة المعدية في البروتينات فتفككها إلى ببتيدات. يتحول الغذاء إلى مزيج نصف سائل يسمى <strong>الكيموس</strong>.</p></Reveal>
    </div>
  );
}

function IntestineStage() {
  const juices = [
    { name: "العصارة البنكرياسية", organ: "البنكرياس", work: "تفكك النشاء والبروتين والدسم" },
    { name: "الصفراء", organ: "الكبد والمرارة", work: "تستحلب الدسم إلى قطيرات دقيقة" },
    { name: "العصارة المعوية", organ: "جدار المعي", work: "تتمم الهضم إلى مغذيات بسيطة" },
  ];
  return (
    <div className="space-y-7">
      <div className="grid gap-5 md:grid-cols-3">{juices.map((j, i) => <article key={j.name} className="relative overflow-hidden border border-border bg-card p-6"><span className="absolute left-3 top-2 text-5xl font-black text-primary/10">{i + 1}</span><p className="text-sm font-bold text-primary">{j.organ}</p><h3 className="mt-3 text-xl font-black">{j.name}</h3><p className="mt-4 leading-8 text-foreground/75">{j.work}</p></article>)}</div>
      <div className="grid gap-6 lg:grid-cols-2"><SourceDocument index={2} caption="الوثيقة الأصلية — الغدد الملحقة والعصارات" /><SourceDocument index={3} caption="الوثيقة الأصلية — حوصلة مستويات الهضم" /></div>
      <Reveal label="كشف نواتج الهضم النهائية"><div className="grid gap-3 sm:grid-cols-3"><p><strong>النشاء</strong><br />غلوكوز</p><p><strong>البروتينات</strong><br />أحماض أمينية</p><p><strong>الدسم</strong><br />أحماض دسمة + غليسرول</p></div></Reveal>
    </div>
  );
}

function EnzymeStage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <p className="text-2xl font-bold leading-[1.8]">الإنزيم جزيء موجود في العصارات الهاضمة، يسرّع تحول غذاء محدد في شروط مناسبة دون أن يُستهلك.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="border-r-4 border-primary bg-primary/10 p-5"><Focus className="size-7 text-primary" /><h3 className="mt-3 text-xl font-black">عمل نوعي</h3><p className="mt-2 leading-7">كل إنزيم يؤثر في غذاء معين؛ الأميلاز لا يهضم البروتين.</p></div><div className="border-r-4 border-accent bg-accent/10 p-5"><FlaskConical className="size-7 text-accent" /><h3 className="mt-3 text-xl font-black">عمل سريع</h3><p className="mt-2 leading-7">وجود الإنزيم يسرّع التحول في حرارة الجسم، بينما الغلي يبطل فعاليته.</p></div></div>
        <div className="mt-6"><Reveal label="تعريف الإنزيم"><p><strong>الإنزيم:</strong> مادة بروتينية ذات تأثير نوعي، تسرّع تحول مادة غذائية معقدة إلى مادة أبسط في شروط ملائمة.</p></Reveal></div>
      </div>
      <SourceDocument index={4} caption="الوثيقة الأصلية — مفهوم الإنزيم والدعامة التشريحية" />
    </div>
  );
}

function MapStage() {
  const [answer, setAnswer] = useState<number | null>(null);
  const organs = ["الفم", "المريء", "المعدة", "الكبد", "المرارة", "البنكرياس", "المعي الدقيق", "المعي الغليظ"];
  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <figure className="border border-border bg-card p-4"><img src={digestiveSystem} alt="رسم علمي للجهاز الهضمي والغدد الملحقة" width={1200} height={1504} className="max-h-[64vh] w-full object-contain" /><figcaption className="border-t border-border pt-3 text-center text-sm text-muted-foreground">الدعامة التشريحية للجهاز الهضمي والغدد الملحقة</figcaption></figure>
      <div>
        <div className="flex flex-wrap gap-2">{organs.map((organ, i) => <span key={organ} className="inline-flex items-center gap-2 border border-border bg-secondary/60 px-3 py-2 font-bold"><span className="grid size-6 place-items-center bg-primary text-xs text-primary-foreground">{i + 1}</span>{organ}</span>)}</div>
        <div className="mt-6 border-r-4 border-success bg-success/10 p-6"><h3 className="text-xl font-black">المعنى البيولوجي للهضم</h3><p className="mt-3 text-lg leading-9">تبسيط جزيئي للأغذية العضوية المركبة بواسطة إنزيمات متخصصة، وتحويلها إلى مغذيات بسيطة قابلة للامتصاص.</p></div>
        <div className="mt-7 bg-card p-6 shadow-sm"><p className="text-sm font-black text-primary">تقويم ختامي</p><h3 className="mt-2 text-xl font-bold">أي عضو يُعدّ مقر إتمام الهضم؟</h3><div className="mt-4 grid grid-cols-2 gap-2">{["الفم", "المعدة", "المعي الدقيق", "المعي الغليظ"].map((option, i) => <Button key={option} type="button" variant={answer === i ? (i === 2 ? "default" : "destructive") : "outline"} className="h-12" onClick={() => setAnswer(i)}>{option}</Button>)}</div>{answer !== null && <p className={`mt-4 p-4 font-bold ${answer === 2 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{answer === 2 ? "إجابة صحيحة: تصب العصارات البنكرياسية والمعوية والصفراء في المعي الدقيق." : "راجع مسار العصارات: أين تكتمل التحولات الكيميائية؟"}</p>}</div>
      </div>
    </div>
  );
}

const stageViews = [StoryStage, MouthStage, LabStage, StomachStage, IntestineStage, EnzymeStage, MapStage];

export function DigestionJourney({ lesson }: { lesson: LessonDef }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const stage = stages[index];
  const StageView = stageViews[index];
  const progress = useMemo(() => ((index + 1) / stages.length) * 100, [index]);
  if (!stage || !StageView) return null;

  const move = (next: number) => {
    setIndex(Math.min(stages.length - 1, Math.max(0, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="h-1 bg-secondary"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => void navigate({ to: "/level/$levelId", params: { levelId: "4am" } })} aria-label="العودة إلى السنة الرابعة"><Home /></Button>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-primary">السنة الرابعة متوسط · رحلة الهضم</p><h1 className="truncate text-sm font-black sm:text-lg">تحولات الأغذية خلال الهضم</h1></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowSources(true)}><ImageIcon /> <span className="hidden sm:inline">الوثائق الأصلية</span></Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()} aria-label="ملء الشاشة"><Maximize2 /></Button>
        </div>
      </header>

      <nav className="mx-auto max-w-[1500px] overflow-x-auto border-b border-border px-3 sm:px-6" aria-label="مراحل الدرس">
        <div className="flex min-w-max items-center py-3">{stages.map((item, i) => <div key={item.id} className="flex items-center"><Button type="button" variant={i === index ? "default" : "ghost"} size="sm" onClick={() => move(i)} className="min-w-20">{i + 1}. {item.short}</Button>{i < stages.length - 1 && <ChevronLeft className="mx-1 size-4 text-muted-foreground" />}</div>)}</div>
      </nav>

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 sm:px-8 sm:pt-12">
        <section className="mb-9 border-b-2 border-border pb-7"><div className="flex items-center gap-3 text-sm font-black text-primary"><span className="grid size-9 place-items-center bg-primary text-primary-foreground">{index + 1}</span>{stage.kicker}</div><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{stage.title}</h2><p className="mt-3 max-w-4xl text-lg leading-8 text-muted-foreground sm:text-xl">{stage.subtitle}</p></section>
        <StageView />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><Button type="button" variant="outline" size="lg" onClick={() => move(index - 1)} disabled={index === 0}><ArrowRight /> السابق</Button><span className="hidden text-sm font-bold text-muted-foreground sm:block">{index + 1} / {stages.length}</span>{index < stages.length - 1 ? <Button type="button" size="lg" onClick={() => move(index + 1)}>التالي <ArrowLeft /></Button> : <Button type="button" size="lg" onClick={() => move(0)}><RotateCcw /> إعادة الدرس</Button>}</div></footer>

      {showSources && <div className="fixed inset-0 z-[90] overflow-y-auto bg-background/95 p-4 backdrop-blur sm:p-8"><div className="mx-auto max-w-6xl"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-bold text-primary">ملف الأستاذ</p><h2 className="text-2xl font-black">الوثائق الأصلية المرفقة</h2></div><Button type="button" variant="secondary" onClick={() => setShowSources(false)}><X /> إغلاق</Button></div><div className="grid gap-5 md:grid-cols-2">{documents.map((src, i) => <figure key={src} className="border border-border bg-card p-3"><img src={src} alt={`الوثيقة الأصلية ${i + 1}`} className="w-full object-contain" loading="lazy" /><figcaption className="pt-3 text-center font-bold">الوثيقة {i + 1}</figcaption></figure>)}</div></div></div>}
    </div>
  );
}
