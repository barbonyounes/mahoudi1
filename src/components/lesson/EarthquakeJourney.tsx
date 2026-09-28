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

type ActivityDocument = { src: string; title: string; caption: string };

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

function DocumentActivity({ number, title, instruction, documents: activityDocuments, conclusion }: { number: string; title: string; instruction: string; documents: ActivityDocument[]; conclusion: React.ReactNode }) {
  const [selected, setSelected] = useState<ActivityDocument | null>(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="border border-border bg-card p-5 sm:p-7">
      <div className="border-r-4 border-primary pr-4">
        <p className="text-sm font-black text-primary">النشاط {number}</p>
        <h3 className="mt-1 text-2xl font-black">{title}</h3>
        <p className="mt-3 text-lg font-bold leading-8">{instruction}</p>
      </div>
      <div className={`mt-6 grid gap-4 ${activityDocuments.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {activityDocuments.map((document) => (
            <Button
              key={document.title}
              type="button"
              variant="outline"
              onClick={() => setSelected(document)}
              className="group relative h-auto w-full flex-col items-stretch justify-start overflow-hidden whitespace-normal p-0 text-right"
            >
              <span className="relative block aspect-[16/10] w-full overflow-hidden bg-secondary">
                <img src={document.src} alt={document.title} className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
                <span className="absolute left-3 top-3 grid size-9 place-items-center bg-background/90 text-primary shadow-sm backdrop-blur"><Maximize2 className="size-4" /></span>
              </span>
              <span className="block w-full p-4">
                <span className="block text-lg font-black text-foreground">{document.title}</span>
                <span className="mt-2 block text-sm font-medium leading-7 text-muted-foreground">{document.caption}</span>
              </span>
            </Button>
        ))}
      </div>
      <div className="mt-6 border-t border-border pt-5">
        {revealed ? <div className="animate-fade-in border-r-4 border-success bg-success/10 p-5 text-lg leading-9">{conclusion}</div> : <Button type="button" onClick={() => setRevealed(true)}><Sparkles /> كشف نتيجة النشاط</Button>}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 p-3 backdrop-blur sm:p-8" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-3">
            <h3 className="text-lg font-black sm:text-2xl">{selected.title}</h3>
            <Button type="button" variant="secondary" onClick={() => setSelected(null)}><X /> إغلاق</Button>
          </div>
          <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 place-items-center overflow-hidden bg-card">
            <img src={selected.src} alt={selected.title} className="max-h-full max-w-full object-contain" />
          </div>
          <p className="mx-auto mt-3 w-full max-w-6xl text-center text-sm font-bold leading-7 text-muted-foreground sm:text-base">{selected.caption}</p>
        </div>
      )}
    </section>
  );
}

function StartStage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-2xl font-bold leading-[1.9]">يُعتقد دائماً أن سطح الأرض صلب ومستقر تماماً، لكنه في تغير مستمر؛ فلا يزال الكثير من أشكاله آخذاً في التشكل بفعل نشاط زلزالي وبركاني قويين قد تكون لهما عواقب وخيمة.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" className="overflow-hidden border border-border bg-card text-right" onClick={() => undefined}><img src={boumerdesDamage.url} alt="آثار زلزال بومرداس" className="aspect-[16/10] w-full object-cover" /><span className="block p-4 font-black">سند 1 — آثار زلزال</span></button>
          <button type="button" className="overflow-hidden border border-border bg-card text-right" onClick={() => undefined}><img src={roadDamage.url} alt="طريق متشقق بفعل الزلزال" className="aspect-[16/10] w-full object-cover" /><span className="block p-4 font-black">سند 2 — تشوه سطح الأرض</span></button>
        </div>
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
    <div className="space-y-8">
      <DocumentActivity number="1-أ" title="الخسائر داخل المناطق العمرانية" instruction="لاحظ الوثائق، صنّف الآثار إلى خسائر مادية وخسائر بشرية، ثم فسّر لماذا تختلف الخسائر في المكان نفسه من بناية إلى أخرى." documents={[
        { src: buildingDamage.url, title: "الوثيقة 1 — أضرار عمرانية", caption: "قارن درجة انهيار المباني وانتبه إلى اختلاف مقاومتها للهزات." },
        { src: humanImpact.url, title: "الوثيقة 2 — أضرار بشرية وتدخل الإنقاذ", caption: "حدد الخسائر البشرية واستخرج أهداف تدخل فرق الحماية المدنية." },
      ]} conclusion={<p>خلّف الزلزال خسائر مادية وبشرية؛ وترتبط فداحة الأضرار بقوة الهزة، والقرب من موقعها، ومدى مقاومة البنايات، وسرعة الإنقاذ.</p>} />
      <DocumentActivity number="1-ب" title="آثار الزلزال خارج العمران" instruction="قارن الوثيقتين وحدد التشوهات التي أصابت سطح الأرض وشبكات النقل. ماذا تدل هذه التشوهات عن طبيعة الهزة؟" documents={[
        { src: roadDamage.url, title: "الوثيقة 3 — تخرب الطرقات", caption: "تشققات وانزياحات تقطع الطريق وتكشف إزاحة سطح الأرض." },
        { src: railwayDamage.url, title: "الوثيقة 4 — تشوه السكك الحديدية", caption: "لاحظ انحناء القضبان وحدد القوة التي سببت هذا التشوه." },
      ]} conclusion={<p>لا تقتصر آثار الزلزال على المباني؛ بل تُحدث الهزات تشققات وإزاحات وتشوهات في القشرة الأرضية والمنشآت الممتدة فوقها.</p>} />
      <DocumentActivity number="1-ج" title="الآثار الساحلية" instruction="رتب ما تعرضه الوثيقتان زمنياً: ماذا يحدث لمياه البحر أولاً، وما الخطر الذي قد يأتي بعد ذلك؟ اقترح سلوكاً وقائياً مناسباً." documents={[
        { src: coastalRetreat.url, title: "الوثيقة 5 — تراجع مفاجئ لمياه البحر", caption: "انحسار غير عادي للمياه بعد هزة ساحلية علامة إنذار تستوجب الابتعاد عن الشاطئ." },
        { src: tsunami.url, title: "الوثيقة 6 — موجة تسونامي", caption: "موجات بحرية قوية قد تنتج عن زلزال شديد تحت قاع البحر." },
      ]} conclusion={<p>قد يسبب الزلزال البحري تراجعاً مفاجئاً للمياه ثم أمواجاً خطرة؛ لذلك يجب إخلاء الساحل سريعاً والتوجه إلى مكان مرتفع.</p>} />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><QA items={[
        { q: "اعتماداً على نتائج النشاطات السابقة، عرّف الزلزال.", a: <p><strong>الزلزال</strong> ظاهرة طبيعية فجائية تتجلى في هزات سريعة ومتكررة ومتباينة الشدة، وتسبب تشوهات للقشرة الأرضية وخسائر مادية وبشرية.</p> },
        { q: "استخرج من مذكرة الأستاذ خصائص زلزال الجريدة وسلوك السكان.", a: <p>حدد مركزه في البحر على بعد <strong>19 km</strong> من بولوغين، وبلغ مقداره <strong>5.6</strong> على سلم ريشتر، تلته هزة 4.6 ونحو 30 هزة ارتدادية. زادت السلوكات غير السوية من عدد الضحايا.</p> },
      ]} /><div className="space-y-4"><SourceDocument index={1} caption="النشاط 1 — التعليمات والإجابات" /><SourceDocument index={2} caption="الاستنتاج ونشاط 2" /></div></div>
    </div>
  );
}

const cities = [
  { name: "المركز السطحي في البحر شمال زموري", x: 50, y: 42 },
  { name: "زموري", x: 50, y: 58 },
  { name: "بومرداس", x: 37, y: 63 },
  { name: "الجزائر", x: 20, y: 67 },
  { name: "تيزي وزو", x: 72, y: 70 },
  { name: "بجاية", x: 91, y: 62 },
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
         <p className="text-lg font-bold leading-8">اضغط على المواقع، ثم استعمل شكل الخطوط المتساوية الشدة لتعيين المركز السطحي والاستنتاج النوعي دون قيم غير واردة في المذكرة.</p>
        {c ? (
          <div className="border border-border bg-card p-6"><p className="text-sm font-black text-primary">الموقع المحدد</p><p className="mt-2 text-2xl font-black">{c.name}</p><p className="mt-2 text-muted-foreground">قارن موقعه بمركز الخطوط، ثم صف الشدة: أكبر قرب المركز وتتناقص بالابتعاد عنه.</p></div>
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
    <div className="space-y-8">
      <DocumentActivity number="3-أ" title="أين يتركز الخطر الزلزالي في الجزائر؟" instruction="اقرأ مفتاح الخريطة، قارن الشمال والجنوب، ثم استخرج المناطق الأكثر تعرضاً للخطر الزلزالي." documents={[{ src: riskMap.url, title: "الوثيقة 1 — خريطة الخطر الزلزالي في الجزائر", caption: "استعمل ألوان المفتاح لتحديد اتجاه تزايد الخطر دون اختراع قيم عددية." }]} conclusion={<p>يتركز الخطر الزلزالي الأكبر في الشريط الشمالي للجزائر، ويتناقص عموماً كلما اتجهنا نحو الجنوب.</p>} />
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
      </div></div>
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

export function EarthquakeJourney({ lesson }: { lesson: LessonDef }) {
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
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-primary">{lesson.level} · {lesson.unit}</p><h1 className="truncate text-sm font-black sm:text-lg">{lesson.title}</h1></div>
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
