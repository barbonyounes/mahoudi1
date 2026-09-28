import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, ArrowRight, ChevronLeft, Home, ImageIcon, MapPin, Maximize2, RotateCcw, Sparkles, Waves, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonDef } from "@/data/lesson";
import p3 from "@/assets/eq-docs/p-03.jpg.asset.json";
import p4 from "@/assets/eq-docs/p-04.jpg.asset.json";
import p5 from "@/assets/eq-docs/p-05.jpg.asset.json";
import p6 from "@/assets/eq-docs/p-06.jpg.asset.json";
import p7 from "@/assets/eq-docs/p-07.jpg.asset.json";
import riskMap from "@/assets/eq-effects/risk-map.jpeg.asset.json";
import tsunami from "@/assets/eq-effects/tsunami.jpeg.asset.json";
import coastalRetreat from "@/assets/eq-effects/coastal-retreat.jpeg.asset.json";
import buildingDamage from "@/assets/eq-effects/building-damage.jpeg.asset.json";
import humanImpact from "@/assets/eq-effects/human-impact.jpeg.asset.json";
import railwayDamage from "@/assets/eq-effects/railway-damage.jpeg.asset.json";
import roadDamage from "@/assets/eq-effects/road-damage.jpeg.asset.json";
import boumerdesDamage from "@/assets/eq-effects/boumerdes-damage.jpeg.asset.json";

const documents = [p3.url, p4.url, p5.url, p6.url, p7.url];

const effectImages = [
  { src: boumerdesDamage.url, title: "آثار زلزال بومرداس", description: "وثيقة مركبة تُظهر حجم الدمار وعمليات الإنقاذ داخل المناطق العمرانية.", category: "وثيقة تمهيدية" },
  { src: buildingDamage.url, title: "أضرار عمرانية", description: "انهيار وتشقق المباني والمنشآت نتيجة قوة الهزات الأرضية.", category: "خسائر مادية" },
  { src: humanImpact.url, title: "أضرار بشرية", description: "ضحايا وجرحى وعمليات إجلاء وإنقاذ السكان من تحت الأنقاض.", category: "خسائر بشرية" },
  { src: roadDamage.url, title: "تخرب الطرقات", description: "تشققات وانزياحات أرضية تقطع شبكة الطرق خارج المناطق العمرانية.", category: "تشوه سطح الأرض" },
  { src: railwayDamage.url, title: "تشوه السكك الحديدية", description: "انحناء القضبان بسبب إزاحة طبقات الأرض أثناء الزلزال.", category: "تشوه سطح الأرض" },
  { src: coastalRetreat.url, title: "تراجع مياه البحر", description: "تغير مفاجئ في مستوى الساحل وتشققات أرضية مرتبطة بالنشاط الزلزالي.", category: "آثار ساحلية" },
  { src: tsunami.url, title: "موجة تسونامي", description: "أمواج بحرية قوية قد تنشأ عندما يحدث زلزال شديد تحت قاع البحر.", category: "آثار ساحلية" },
  { src: riskMap.url, title: "خريطة الخطر الزلزالي في الجزائر", description: "توضح تركز الخطر الأكبر في الشريط الشمالي وتدرجه نحو الجنوب.", category: "توزع الخطر" },
];

const stages = [
  { id: "start", short: "الانطلاق", kicker: "الوضعية الانطلاقية للمقطع", title: "هل سطح الأرض ثابت حقاً؟", subtitle: "براكين، زلازل، فيضانات وطرق متشققة: شواهد على نشاط داخلي مستمر." },
  { id: "problem", short: "المشكل", kicker: "وضعية تعلم — المورد 01", title: "الجزائر تهتز كل سنة", subtitle: "معظم الهزات لا نشعر بها، لكن بعضها قوي يترك خسائر مادية وبشرية." },
  { id: "effects", short: "العواقب", kicker: "النشاط 1 — ص 10-11", title: "مظاهر وعواقب زلزال بومرداس", subtitle: "نستخرج الخسائر، نفسر تباين الآثار، ونعرّف الزلزال." },
  { id: "epicenter", short: "المركز السطحي", kicker: "النشاط 2 (أ) — ص 12", title: "أين كانت الهزة أقوى؟", subtitle: "خريطة الخطوط متساوية الشدة تكشف المركز السطحي." },
  { id: "focus", short: "البؤرة", kicker: "النشاط 2 (ب) — ص 13", title: "البؤرة وانتشار الأمواج الزلزالية", subtitle: "تجربة الحوض، مسجل الزلازل، وسلم ريشتر." },
  { id: "africa", short: "شمال إفريقيا", kicker: "النشاط 3 — ص 14-15", title: "النشاط الزلزالي في شمال إفريقيا", subtitle: "نقارن خريطة الزلازل بخريطة الجبال: خط GLA." },
  { id: "synthesis", short: "الإرساء", kicker: "إرساء الموارد وتقييمها", title: "ما هو الزلزال؟", subtitle: "حوصلة المفاهيم، الرسم التخطيطي، وتقويم ختامي." },
];

function Reveal({ label = "كشف الإجابة", children }: { label?: string; children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  return shown ? (
    <div className="animate-fade-in border-r-4 border-success bg-success/10 p-5 text-lg leading-9">{children}</div>
  ) : (
    <Button type="button" size="lg" onClick={() => setShown(true)} className="h-12 px-6 text-base"><Sparkles /> {label}</Button>
  );
}

function SourceDocument({ index, caption }: { index: number; caption: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`فتح ${caption}`} className="group relative overflow-hidden border border-border bg-card text-right shadow-sm transition hover:border-primary">
        <img src={documents[index]} alt={caption} className="h-60 w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/90 px-4 py-3 text-sm font-bold backdrop-blur"><span>{caption}</span><Maximize2 className="size-4 text-primary" /></span>
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

function QA({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <ol className="space-y-4">
      {items.map((it, i) => (
        <li key={it.q} className="border border-border bg-card p-5">
          <p className="text-lg font-bold leading-8"><span className="ml-2 text-primary">{i + 1}.</span>{it.q}</p>
          <div className="mt-3"><Reveal>{it.a}</Reveal></div>
        </li>
      ))}
    </ol>
  );
}

function EffectsGallery() {
  const [selected, setSelected] = useState<(typeof effectImages)[number] | null>(null);
  return (
    <>
      <section className="mt-10" aria-labelledby="effects-gallery-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-sm font-black text-primary">وثائق النشاط 1</p>
            <h3 id="effects-gallery-title" className="mt-1 text-2xl font-black">اقرأ آثار الزلزال من الصور</h3>
          </div>
          <p className="text-sm font-bold text-muted-foreground">اضغط على أي وثيقة لتكبيرها</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {effectImages.map((image, index) => (
            <Button
              key={image.title}
              type="button"
              variant="outline"
              onClick={() => setSelected(image)}
              className={`group relative h-auto min-h-80 w-full flex-col items-stretch justify-start overflow-hidden whitespace-normal p-0 text-right ${index === 0 || index === 7 ? "sm:col-span-2" : ""}`}
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary">
                <img src={image.src} alt={image.title} className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
                <span className="absolute left-3 top-3 grid size-9 place-items-center bg-background/90 text-primary shadow-sm backdrop-blur"><Maximize2 className="size-4" /></span>
              </span>
              <span className="block w-full p-4">
                <span className="text-xs font-black text-primary">{image.category}</span>
                <span className="mt-1 block text-lg font-black text-foreground">{image.title}</span>
                <span className="mt-2 block text-sm font-medium leading-7 text-muted-foreground">{image.description}</span>
              </span>
            </Button>
          ))}
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 p-3 backdrop-blur sm:p-8" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-3">
            <div><p className="text-xs font-black text-primary">{selected.category}</p><h3 className="text-lg font-black sm:text-2xl">{selected.title}</h3></div>
            <Button type="button" variant="secondary" onClick={() => setSelected(null)}><X /> إغلاق</Button>
          </div>
          <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 place-items-center overflow-hidden bg-card">
            <img src={selected.src} alt={selected.title} className="max-h-full max-w-full object-contain" />
          </div>
          <p className="mx-auto mt-3 w-full max-w-6xl text-center text-sm font-bold leading-7 text-muted-foreground sm:text-base">{selected.description}</p>
        </div>
      )}
    </>
  );
}

function StartStage() {
  const cards = [
    { t: "بركان نشط", d: "مظهر من مظاهر النشاط الداخلي." },
    { t: "آثار زلزال", d: "هزات مفاجئة تهدم المباني." },
    { t: "فيضان", d: "مظهر من مظاهر النشاط الخارجي." },
    { t: "طريق متشقق", d: "تشوهات تصيب سطح الأرض." },
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-2xl font-bold leading-[1.9]">يُعتقد دائماً أن سطح الأرض صلب ومستقر تماماً، لكنه في تغير مستمر؛ فلا يزال الكثير من أشكاله آخذاً في التشكل بفعل نشاط زلزالي وبركاني قويين قد تكون لهما عواقب وخيمة.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">{cards.map((c) => <article key={c.t} className="border-t-4 border-primary bg-card p-4 shadow-sm"><h3 className="font-black">{c.t}</h3><p className="mt-1 text-sm leading-7 text-foreground/75">{c.d}</p></article>)}</div>
        <div className="mt-6 space-y-3 border-r-4 border-accent bg-accent/10 p-5 text-lg font-bold leading-8">
          <p>1- كيف يمكن لهذه الظواهر الجيولوجية أن تكون شاهدة على النشاط الداخلي للكرة الأرضية؟</p>
          <p>2- ما الإجراءات التي يجب اتخاذها للوقاية من مخاطر هذه الظواهر؟</p>
        </div>
      </div>
      <SourceDocument index={0} caption="المذكرة — الوضعية الانطلاقية للمقطع الأول" />
    </div>
  );
}

function ProblemStage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-2xl font-bold leading-[1.9]">تتعرض الجزائر سنوياً للعديد من الهزات الأرضية، معظمها لا يشعر به السكان لضعف شدتها، إلا أن بعضها قوي يسبب تشوهات على سطح الأرض وخسائر مادية وبشرية متفاوتة.</p>
        <div className="mt-6 border-r-4 border-primary bg-primary/10 p-6"><p className="text-sm font-bold text-primary">المشكل</p><p className="mt-2 text-2xl font-black leading-relaxed">فيمَ تتمثل مظاهر الزلزال على سطح الأرض؟ وما هي أهم خصائصه؟</p></div>
        <div className="mt-6"><Reveal label="كشف فرضيات مقترحة"><ul className="space-y-2"><li>• يظهر الزلزال في شكل هزات تهدم المباني وتشقق الأرض.</li><li>• تختلف قوة الزلزال من مكان إلى آخر.</li><li>• للزلزال نقطة انطلاق في باطن الأرض.</li></ul></Reveal></div>
      </div>
      <SourceDocument index={1} caption="المذكرة — مذكرة الحصة ومركبات الكفاءة" />
    </div>
  );
}

function EffectsStage() {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <QA items={[
          { q: "استخرج المظاهر التي خلفها زلزال بومرداس.", a: <p>انهيار المباني والمنشآت (خسائر مادية)، موت وإصابة الأشخاص (خسائر بشرية).</p> },
          { q: "فسّر تباين آثار الزلزال كلما ابتعدنا عن موقعه، وأثره في نفس الموقع.", a: <p>تقل الخسائر كلما ابتعدنا عن موقع الزلزال (تباين الشدة من منطقة لأخرى)، أما في نفس الموقع فالأثر مرتبط بمقاومة البناية للهزات.</p> },
          { q: "ما هدف تدخل فرق الإنقاذ؟", a: <p>إنقاذ من هم تحت الركام، إسعاف الجرحى، منع اندلاع الحرائق وحماية المنطقة.</p> },
          { q: "استخرج آثار الزلزال خارج المناطق العمرانية من الوثائق المصوّرة.", a: <p>انهيار الطرق وتشوه السكك الحديدية، تشققات على سطح الأرض، وتغير مفاجئ في مياه البحر قد ترافقه أمواج تسونامي.</p> },
          { q: "من مقتطف الجريدة (الوثيقة 3): استخرج خصائص الزلزال وعلّق على سلوك السكان.", a: <p>المركز في البحر على بعد <strong>19 km</strong> من بولوغين، شدته <strong>5.6</strong> على سلم ريشتر، تلته هزة ارتدادية 4.6 ونحو 30 هزة ارتدادية. وقع ضحايا بسبب سلوكات غير سوية (انعدام الثقافة الزلزالية).</p> },
          { q: "بناءً على ما توصلت إليه، قدّم تعريفاً للزلزال.", a: <p><strong>الزلزال</strong> ظاهرة طبيعية تحدث فجأة، تتجلى في هزات أرضية سريعة متكررة متباينة الشدة، تسبب تشوهات للقشرة الأرضية وخسائر مادية وبشرية تزداد فداحتها بنقص الوعي والثقافة الزلزالية.</p> },
        ]} />
        <div className="space-y-4"><SourceDocument index={1} caption="النشاط 1 — التعليمات والإجابات" /><SourceDocument index={2} caption="الاستنتاج ونشاط 2" /></div>
      </div>
      <EffectsGallery />
    </div>
  );
}

const cities = [
  { name: "زموري", km: 0, intensity: "X", x: 50, y: 50 },
  { name: "بومرداس", km: 15, intensity: "IX", x: 38, y: 55 },
  { name: "الجزائر", km: 50, intensity: "VIII", x: 22, y: 60 },
  { name: "تيزي وزو", km: 60, intensity: "VII", x: 72, y: 66 },
  { name: "البويرة", km: 90, intensity: "VI", x: 62, y: 86 },
  { name: "بجاية", km: 170, intensity: "V", x: 92, y: 60 },
];

function EpicenterStage() {
  const [sel, setSel] = useState<number | null>(null);
  const c = sel !== null ? cities[sel] : null;
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative aspect-[4/3] overflow-hidden border border-border bg-secondary/40" aria-label="خريطة تفاعلية للخطوط متساوية الشدة">
        {[88, 70, 52, 36, 22, 10].map((r, i) => (
          <div key={r} className="absolute rounded-full border-2 border-dashed border-destructive" style={{ width: `${r}%`, height: `${r * 1.33}%`, left: `${50 - r / 2}%`, top: `${50 - (r * 1.33) / 2}%`, background: `hsl(from var(--destructive) h s l / ${0.04 + i * 0.05})` }} />
        ))}
        <div className="absolute inset-x-0 top-0 h-[38%] bg-primary/15"><span className="absolute right-3 top-2 text-sm font-bold text-primary">البحر الأبيض المتوسط</span></div>
        {cities.map((city, i) => (
          <button key={city.name} type="button" onClick={() => setSel(i)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${city.x}%`, top: `${city.y}%` }}>
            <MapPin className={`mx-auto size-7 ${sel === i ? "text-accent" : "text-foreground"}`} />
            <span className="block whitespace-nowrap bg-background/90 px-2 text-xs font-bold">{city.name}</span>
          </button>
        ))}
      </div>
      <div className="space-y-5">
        <p className="text-lg font-bold leading-8">اضغط على المدن لقراءة شدة الهزة (سلم MSK) وبُعدها عن زموري.</p>
        {c ? (
          <div className="border border-border bg-card p-6"><p className="text-sm font-black text-primary">{c.name}</p><p className="mt-2 text-4xl font-black">الشدة {c.intensity}</p><p className="mt-2 text-muted-foreground">البعد عن زموري ≈ {c.km} km</p></div>
        ) : <div className="border border-dashed border-border p-6 text-muted-foreground">لم تُختر مدينة بعد.</div>}
        <QA items={[
          { q: "ماذا توضح خريطة الخطوط متساوية الشدة؟", a: <p>المناطق التي تكون فيها الهزات بنفس الشدة.</p> },
          { q: "حدد المركز السطحي، ولماذا كانت زموري أكثر ضرراً؟", a: <p>المركز السطحي هو زموري: يقع في مركز الخطوط حيث أكبر شدة.</p> },
          { q: "فسّر تباين الشدة من مدينة لأخرى.", a: <p>كلما ابتعدنا عن المركز السطحي تقل شدة الهزة.</p> },
        ]} />
      </div>
    </div>
  );
}

function FocusStage() {
  const [knocks, setKnocks] = useState(0);
  const [depth, setDepth] = useState(10);
  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <p className="text-sm font-black text-primary">تجربة الوثيقة 2 — حوض ماء فوق طاولة</p>
          <div className="relative mt-4 h-64 overflow-hidden bg-primary/10">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-primary/20" />
            {knocks > 0 && [0, 1, 2].map((i) => <span key={`${knocks}-${i}`} className="absolute left-1/2 top-1/4 size-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-primary" style={{ animationDelay: `${i * 0.3}s`, animationIterationCount: 2 }} />)}
            <div className="absolute inset-x-6 top-1/2 h-3 bg-foreground/70" />
            <span className="absolute left-1/2 top-[calc(50%+14px)] size-4 -translate-x-1/2 rounded-full bg-destructive" />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-bold">نقطة الطرق = البؤرة</span>
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-sm font-bold text-primary">المركز السطحي</span>
          </div>
          <Button type="button" className="mt-4 h-12 w-full" onClick={() => setKnocks((k) => k + 1)}><Waves /> اطرق الوجه السفلي للطاولة</Button>
          {knocks > 0 && <p className="mt-3 font-bold leading-8">تنطلق الأمواج من نقطة الطرق وتنتشر عمودياً نحو السطح: للهزات مصدر واحد هو <strong>البؤرة</strong>.</p>}
        </div>
        <div className="border border-border bg-card p-5">
          <p className="text-sm font-black text-primary">محاكاة: عمق البؤرة والخسائر</p>
          <label className="mt-4 block font-bold">عمق البؤرة: {depth} km<input type="range" min={5} max={300} value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="mt-3 w-full accent-[var(--primary)]" /></label>
          <div className="mt-5 h-4 bg-secondary"><div className="h-full bg-destructive transition-all" style={{ width: `${Math.max(8, 100 - depth / 3)}%` }} /></div>
          <p className="mt-2 text-sm text-muted-foreground">شدة الأضرار على السطح</p>
          <p className="mt-4 leading-8">كلما كانت البؤرة سطحية كانت الخسائر أكبر؛ تتعلق كثافة الخسائر بعمق البؤرة ونمط المباني.</p>
          <div className="mt-5 flex items-end gap-1 overflow-hidden bg-secondary/60 p-3" aria-label="تسجيل زلزالي مبسط">
            {Array.from({ length: 48 }, (_, i) => { const amp = i > 12 && i < 32 ? Math.abs(Math.sin(i * 1.7)) * (1 - depth / 400) * 60 + 4 : 4; return <span key={i} className="w-1 bg-primary" style={{ height: `${amp}px` }} />; })}
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Activity className="size-4" /> التسجيل الزلزالي (سيسموغرام)</p>
        </div>
      </div>
      <QA items={[
        { q: "حدد دور مسجل الزلازل.", a: <p>يسجل الهزات الأرضية على شكل أمواج.</p> },
        { q: "ماذا يوضح لنا التسجيل الزلزالي؟", a: <p>مقدار الزلزال (الطاقة المحررة في البؤرة)، توقيت ومدة الهزات، ومكان البؤرة على عمق معين.</p> },
        { q: "كيف تؤكد تسجيلات زلزال إيران في محطتين بعيدتين تباين الشدة؟", a: <p>تنتشر الأمواج وتضعف كلما ابتعدت عن المركز إلى غاية اختفائها.</p> },
        { q: "بمَ يقاس مقدار الزلزال؟", a: <p>بسلم <strong>ريشتر</strong> (شارل ريشتر 1935)، وهو أدق من سلم ميركالي (MSK) الذي يقيس الشدة حسب الآثار.</p> },
      ]} />
      <div className="border-r-4 border-accent bg-accent/10 p-5 text-lg leading-9"><strong>الاستنتاج:</strong> البؤرة نقطة انطلاق الأمواج الزلزالية، تقع في العمق على امتداد شاقولي للمركز السطحي.</div>
    </div>
  );
}

function AfricaStage() {
  const quakes = [
    { n: "أغادير", x: 12, y: 70 }, { n: "الحسيمة", x: 26, y: 30 }, { n: "الشلف", x: 45, y: 34 },
    { n: "بومرداس", x: 55, y: 30 }, { n: "قسنطينة", x: 68, y: 34 }, { n: "الأغواط", x: 52, y: 62 }, { n: "قابس", x: 86, y: 52 },
  ];
  const [mountains, setMountains] = useState(false);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="relative aspect-[16/9] overflow-hidden border border-border bg-secondary/50">
          <div className="absolute inset-x-0 top-0 h-[22%] bg-primary/15"><span className="absolute right-3 top-2 text-xs font-bold text-primary">البحر الأبيض المتوسط</span></div>
          {mountains && <div className="absolute animate-fade-in bg-accent/35" style={{ left: "8%", right: "10%", top: "24%", height: "34%", transform: "skewY(-6deg)" }}><span className="absolute bottom-1 right-3 text-sm font-black">سلاسل الأطلس</span></div>}
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="12,70 52,62 86,52" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 1.5" className="text-destructive" /></svg>
          {quakes.map((q) => <span key={q.n} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${q.x}%`, top: `${q.y}%` }}><span className="mx-auto block size-4 rounded-full bg-destructive ring-4 ring-destructive/25" /><span className="mt-1 block whitespace-nowrap bg-background/85 px-1 text-xs font-bold">{q.n}</span></span>)}
          <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 text-xs font-black text-destructive">خط GLA: قابس — الأغواط — أغادير</span>
        </div>
        <Button type="button" variant={mountains ? "default" : "outline"} className="mt-4 h-12" onClick={() => setMountains((v) => !v)}>{mountains ? "إخفاء" : "تركيب"} خريطة الجبال</Button>
      </div>
      <div className="space-y-5">
        <QA items={[
          { q: "عبّر عن النشاط الزلزالي وشدته في شمال إفريقيا.", a: <p>تعرضت المنطقة كلها لزلازل متفاوتة الشدة، يمتد نشاطها على خط من قابس (تونس) إلى أغادير (المغرب) مروراً بالأغواط.</p> },
          { q: "قارن خريطة الزلازل بخريطة الجبال. ماذا تستنتج؟", a: <p>تطابق بين الخريطتين: المناطق الجبلية (الأطلس) هي مناطق زلزالية؛ هناك علاقة بين ظهور الجبال وحدوث الزلازل.</p> },
        ]} />
        <SourceDocument index={3} caption="النشاط 3 والإرساء — المذكرة" />
      </div>
    </div>
  );
}

function SynthesisStage() {
  const [answer, setAnswer] = useState<number | null>(null);
  const points = [
    "ظاهرة طبيعية تتجلى في تشوهات القشرة الأرضية كالفوالق والتشققات، وخسائر مادية.",
    "هزات أرضية سريعة (بضع ثوانٍ) ضعيفة أو قوية تتبعها ارتدادات.",
    "المركز السطحي: المنطقة الأكثر ضرراً، وفيها أكبر شدة.",
    "تُسجل الهزات بجهاز مسجل الزلازل على شكل أمواج.",
    "يقاس مقدار الزلزال بسلم ريشتر (magnitude).",
    "البؤرة: نقطة انطلاق الأمواج في العمق على امتداد شاقولي للمركز السطحي.",
    "كثافة الخسائر تتعلق بعمق البؤرة ونمط المباني.",
    "المنطقة الزلزالية لشمال إفريقيا تقع في القسم الشمالي للأطلس.",
  ];
  const opts = ["المركز السطحي", "البؤرة", "الفالق", "سلم ريشتر"];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <ul className="space-y-3">{points.map((p, i) => <li key={p} className="flex gap-3 border border-border bg-card p-4 leading-8"><span className="grid size-7 shrink-0 place-items-center bg-primary text-sm font-black text-primary-foreground">{i + 1}</span>{p}</li>)}</ul>
        <div className="mt-6 bg-card p-6 shadow-sm"><p className="text-sm font-black text-primary">تقويم ختامي</p><h3 className="mt-2 text-xl font-bold">نقطة انطلاق الأمواج الزلزالية في العمق تسمى:</h3><div className="mt-4 grid grid-cols-2 gap-2">{opts.map((o, i) => <Button key={o} type="button" className="h-12" variant={answer === i ? (i === 1 ? "default" : "destructive") : "outline"} onClick={() => setAnswer(i)}>{o}</Button>)}</div>{answer !== null && <p className={`mt-4 p-4 font-bold ${answer === 1 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{answer === 1 ? "صحيح: البؤرة تقع شاقولياً تحت المركز السطحي." : "راجع النشاط 2 (ب): تجربة الحوض."}</p>}</div>
        <div className="mt-6 border-r-4 border-accent bg-accent/10 p-5 leading-8"><strong>تقييم الموارد:</strong> تمرين 02 ص 54 — ارسم مقطعاً عرضياً في منطقة الزلزال يوضح انتشار الأمواج انطلاقاً من البؤرة.</div>
      </div>
      <figure className="border border-border bg-card p-3"><img src={documents[4]} alt="رسم تخطيطي لمقطع عرضي يوضح البؤرة والمركز السطحي وانتشار الأمواج في زلزال بومرداس" className="w-full object-contain" /><figcaption className="border-t border-border pt-3 text-center text-sm text-muted-foreground">رسم تخطيطي — انتشار الأمواج الزلزالية انطلاقاً من البؤرة (بومرداس)</figcaption></figure>
    </div>
  );
}

const stageViews = [StartStage, ProblemStage, EffectsStage, EpicenterStage, FocusStage, AfricaStage, SynthesisStage];

export function EarthquakeJourney(_: { lesson: LessonDef }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const stage = stages[index];
  const StageView = stageViews[index];
  const progress = useMemo(() => ((index + 1) / stages.length) * 100, [index]);
  if (!stage || !StageView) return null;
  const move = (n: number) => { setIndex(Math.min(stages.length - 1, Math.max(0, n))); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div dir="rtl" className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="h-1 bg-secondary"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => void navigate({ to: "/level/$levelId", params: { levelId: "3am" } })} aria-label="العودة إلى السنة الثالثة"><Home /></Button>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-primary">السنة الثالثة متوسط · الديناميكية الداخلية</p><h1 className="truncate text-sm font-black sm:text-lg">الزلازل ظاهرة طبيعية</h1></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowSources(true)}><ImageIcon /> <span className="hidden sm:inline">مذكرة الأستاذ</span></Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()} aria-label="ملء الشاشة"><Maximize2 /></Button>
        </div>
      </header>
      <nav className="mx-auto max-w-[1500px] overflow-x-auto border-b border-border px-3 sm:px-6" aria-label="مراحل الدرس">
        <div className="flex min-w-max items-center py-3">{stages.map((s, i) => <div key={s.id} className="flex items-center"><Button type="button" variant={i === index ? "default" : "ghost"} size="sm" onClick={() => move(i)}>{i + 1}. {s.short}</Button>{i < stages.length - 1 && <ChevronLeft className="mx-1 size-4 text-muted-foreground" />}</div>)}</div>
      </nav>
      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 sm:px-8 sm:pt-12">
        <section className="mb-9 border-b-2 border-border pb-7"><div className="flex items-center gap-3 text-sm font-black text-primary"><span className="grid size-9 place-items-center bg-primary text-primary-foreground">{index + 1}</span>{stage.kicker}</div><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{stage.title}</h2><p className="mt-3 max-w-4xl text-lg leading-8 text-muted-foreground sm:text-xl">{stage.subtitle}</p></section>
        <StageView />
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><Button type="button" variant="outline" size="lg" onClick={() => move(index - 1)} disabled={index === 0}><ArrowRight /> السابق</Button><span className="hidden text-sm font-bold text-muted-foreground sm:block">{index + 1} / {stages.length}</span>{index < stages.length - 1 ? <Button type="button" size="lg" onClick={() => move(index + 1)}>التالي <ArrowLeft /></Button> : <Button type="button" size="lg" onClick={() => move(0)}><RotateCcw /> إعادة الدرس</Button>}</div></footer>
      {showSources && <div className="fixed inset-0 z-[90] overflow-y-auto bg-background/95 p-4 backdrop-blur sm:p-8"><div className="mx-auto max-w-6xl"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-bold text-primary">مذكرة الأستاذين محمودي ومريخ</p><h2 className="text-2xl font-black">الصفحات الأصلية</h2></div><Button type="button" variant="secondary" onClick={() => setShowSources(false)}><X /> إغلاق</Button></div><div className="grid gap-5 md:grid-cols-2">{documents.map((src, i) => <figure key={src} className="border border-border bg-card p-3"><img src={src} alt={`صفحة المذكرة ${i + 3}`} className="w-full object-contain" loading="lazy" /><figcaption className="pt-3 text-center font-bold">صفحة {i + 3}</figcaption></figure>)}</div></div></div>}
    </div>
  );
}
