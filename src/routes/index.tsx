import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, Settings } from "lucide-react";
import { curriculum, countReadySessions, countTotalSessions } from "@/data/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منصة الحصص الرقمية — علوم الطبيعة والحياة (التعليم المتوسط)" },
      {
        name: "description",
        content:
          "اختر المستوى الدراسي ثم المقطع التعلمي والمورد المعرفي لعرض الحصة الرقمية التفاعلية وفق المنهاج الجزائري لعلوم الطبيعة والحياة.",
      },
      { property: "og:title", content: "منصة الحصص الرقمية — علوم الطبيعة والحياة" },
      {
        property: "og:description",
        content:
          "حصص رقمية تفاعلية للتعليم المتوسط: محطات بيداغوجية، محاكاة مخبرية، مؤقت زمني وأدوات القسم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LevelChooser,
});

function LevelChooser() {
  return (
    <div dir="rtl" className="min-h-dvh bg-background px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary sm:text-base">
            علوم الطبيعة والحياة — التعليم المتوسط
          </p>
          <Link
            to="/settings"
            aria-label="الإعدادات — المستويات والأقسام والتلاميذ"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-border px-4 py-2.5 text-sm font-bold transition hover:border-primary hover:bg-primary/5"
          >
            <Settings className="size-5" />
            <span className="hidden sm:inline">الإعدادات</span>
          </Link>
        </div>

        <h1 className="mt-3 text-[clamp(1.8rem,5vw,3.2rem)] font-bold leading-tight">
          اختر المستوى الدراسي
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          كل مستوى منظّم حسب المنهاج الجزائري: مقاطع تعلمية ← موارد معرفية ← حصص رقمية مدة كل
          واحدة 50 دقيقة.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {curriculum.map((level) => {
            const ready = countReadySessions(level);
            const total = countTotalSessions(level);
            return (
              <Link
                key={level.id}
                to="/level/$levelId"
                params={{ levelId: level.id }}
                className="group flex flex-col rounded-3xl border-2 border-border bg-secondary/30 p-6 transition hover:border-primary hover:bg-primary/5"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                  {level.short}
                </span>
                <h2 className="mt-4 text-2xl font-bold leading-snug text-primary">{level.title}</h2>
                <p className="mt-2 flex-1 text-base text-foreground/75">
                  {level.segments.length > 0
                    ? `${level.segments.length} مقاطع تعلمية`
                    : "قيد التحضير — لم تُضف المقاطع بعد"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-4" /> {total} حصة مبرمجة
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-primary" /> {ready} جاهزة
                  </span>
                </div>
                <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground">
                  فتح المستوى
                  <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
