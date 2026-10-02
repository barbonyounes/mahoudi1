import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronLeft, Home, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockView } from "@/components/lesson/ContentBlocks";
import type { LessonDef } from "@/data/lesson";

export type JourneyStage = {
  id: string;
  short: string;
  kicker: string;
  title: string;
  subtitle: string;
  stationIds: string[];
};

export function DocumentaryJourneyShell({
  lesson,
  customized = false,
  stages,
  levelId,
  journeyLabel,
  renderStage,
}: {
  lesson: LessonDef;
  customized?: boolean;
  stages: JourneyStage[];
  levelId: "3am" | "4am";
  journeyLabel: string;
  renderStage: (stageId: string) => ReactNode;
}) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const stage = stages[index];
  const progress = useMemo(() => ((index + 1) / stages.length) * 100, [index, stages.length]);
  if (!stage) return null;

  const stations = lesson.stations.filter((station) => stage.stationIds.includes(station.id));
  const move = (next: number) => {
    setIndex(Math.min(stages.length - 1, Math.max(0, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="h-1 bg-secondary"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => void navigate({ to: "/level/$levelId", params: { levelId } })} aria-label="العودة إلى المستوى"><Home /></Button>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-primary">{lesson.level} · {journeyLabel}</p><h1 className="truncate text-sm font-black sm:text-lg">{lesson.title}</h1></div>
          <Button type="button" variant="ghost" size="icon" onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()} aria-label="ملء الشاشة"><Maximize2 /></Button>
        </div>
      </header>

      <nav className="mx-auto max-w-[1500px] overflow-x-auto border-b border-border px-3 sm:px-6" aria-label="مراحل الدرس">
        <div className="flex min-w-max items-center py-3">{stages.map((item, itemIndex) => <div key={item.id} className="flex items-center"><Button type="button" variant={itemIndex === index ? "default" : "ghost"} size="sm" onClick={() => move(itemIndex)} className="min-w-20">{itemIndex + 1}. {item.short}</Button>{itemIndex < stages.length - 1 ? <ChevronLeft className="mx-1 size-4 text-muted-foreground" /> : null}</div>)}</div>
      </nav>

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 sm:px-8 sm:pt-12">
        <section className="mb-9 border-b-2 border-border pb-7"><div className="flex items-center gap-3 text-sm font-black text-primary"><span className="grid size-9 place-items-center bg-primary text-primary-foreground">{index + 1}</span>{stage.kicker}</div><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{stage.title}</h2><p className="mt-3 max-w-4xl text-lg leading-8 text-muted-foreground sm:text-xl">{stage.subtitle}</p></section>
        {renderStage(stage.id)}
        {customized && stations.length > 0 ? <section className="mt-12 border-t-2 border-primary pt-8" aria-label="أنشطة الأستاذ المخصصة">
          <p className="text-sm font-black text-primary">تخصيص الأستاذ</p><h3 className="mt-1 text-2xl font-black">أنشطة هذه المرحلة</h3>
          <div className="mt-6 space-y-7">{stations.map((station) => <article key={station.id} className="border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-black text-primary">{station.kicker}</p><h4 className="mt-1 text-xl font-black">{station.title}</h4></div><span className="bg-secondary px-3 py-2 text-sm font-bold">{station.minutes} دقائق</span></div>{station.teacherNote ? <p className="mt-5 border-r-4 border-accent bg-accent/10 p-4 text-sm font-bold leading-7">ملاحظة الأستاذ: {station.teacherNote}</p> : null}<div className="mt-6 space-y-5">{station.blocks.map((block, blockIndex) => <div key={`${station.id}-${blockIndex}`} className="border border-border bg-background p-4 sm:p-6"><BlockView block={block} terms={lesson.terms} quizId={`${lesson.id}-${station.id}-${blockIndex}`} onAnswer={() => undefined} onStartActivityTimer={() => undefined} /></div>)}</div></article>)}</div>
        </section> : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><Button type="button" variant="outline" size="lg" onClick={() => move(index - 1)} disabled={index === 0}><ArrowRight /> السابق</Button><span className="hidden text-sm font-bold text-muted-foreground sm:block">{index + 1} / {stages.length}</span>{index < stages.length - 1 ? <Button type="button" size="lg" onClick={() => move(index + 1)}>التالي <ArrowLeft /></Button> : <Button type="button" size="lg" onClick={() => move(0)}><RotateCcw /> إعادة الدرس</Button>}</div></footer>
    </div>
  );
}