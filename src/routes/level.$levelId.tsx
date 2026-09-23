import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Clock, Hourglass, Play } from "lucide-react";
import { getLevel } from "@/data/curriculum";

export const Route = createFileRoute("/level/$levelId")({
  loader: ({ params }) => {
    const level = getLevel(params.levelId);
    if (!level) throw notFound();
    return { level };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "المستوى غير متوفر" }, { name: "robots", content: "noindex" }] };
    }
    const { level } = loaderData;
    const description = `المقاطع التعلمية والموارد المعرفية لمادة علوم الطبيعة والحياة — ${level.title}، مع الحصص الرقمية التفاعلية (50 دقيقة لكل حصة).`;
    return {
      meta: [
        { title: `${level.title} — مقاطع علوم الطبيعة والحياة` },
        { name: "description", content: description },
        { property: "og:title", content: `${level.title} — مقاطع علوم الطبيعة والحياة` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LevelPage,
});

function LevelPage() {
  const { level } = Route.useLoaderData();

  return (
    <div dir="rtl" className="min-h-dvh bg-background px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
        >
          <ArrowRight className="size-4" /> كل المستويات
        </Link>

        <h1 className="mt-4 text-[clamp(1.6rem,4.5vw,2.8rem)] font-bold leading-tight text-primary">
          {level.title}
        </h1>

        {level.segments.length === 0 && (
          <p className="mt-6 rounded-3xl border-2 border-dashed border-border p-8 text-center text-lg text-muted-foreground">
            لم تُضف مقاطع هذا المستوى بعد. أرسل المذكرات الخاصة به لإدراجها.
          </p>
        )}

        <div className="mt-8 space-y-10">
          {level.segments.map((segment) => (
            <section key={segment.id}>
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                الميدان: {segment.field}
              </p>
              <h2 className="mt-1 text-2xl font-bold">{segment.title}</h2>

              <div className="mt-5 space-y-5">
                {segment.resources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-3xl border-2 border-border bg-secondary/25 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        المورد {resource.order}
                      </span>
                      <h3 className="text-xl font-bold">{resource.title}</h3>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" /> {resource.plannedSessions} حصة
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-foreground/75">
                      {resource.competence}
                    </p>

                    <ul className="mt-4 space-y-3">
                      {resource.sessions.map((session) => (
                        <li key={session.order}>
                          {session.status === "ready" && session.lessonId ? (
                            <Link
                              to="/lesson/$lessonId"
                              params={{ lessonId: session.lessonId }}
                              className="group flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-background p-4 transition hover:border-primary hover:bg-primary/5"
                            >
                              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
                                {session.order}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-bold">{session.title}</span>
                                <span className="block text-sm text-muted-foreground">
                                  {session.summary}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                                <Play className="size-4" /> فتح الحصة
                              </span>
                            </Link>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 opacity-80">
                              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-base font-bold text-muted-foreground">
                                {session.order}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-bold">{session.title}</span>
                                <span className="block text-sm text-muted-foreground">
                                  {session.summary}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground">
                                <Hourglass className="size-4" /> قيد الإنجاز
                              </span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
