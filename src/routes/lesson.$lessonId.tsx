import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { usePrefs } from "@/hooks/usePrefs";
import { useTeacherView } from "@/hooks/useTeacherView";
import { getLessonById } from "@/data/lessons";
import { useLessonSession } from "@/hooks/useLessonSession";
import { useTheme } from "@/hooks/useTheme";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import { ProgressHeader } from "@/components/lesson/ProgressHeader";
import { ControlBar } from "@/components/lesson/ControlBar";
import { BlockView } from "@/components/lesson/ContentBlocks";
import { useGlossary } from "@/components/lesson/Glossary";
import { Whiteboard } from "@/components/lesson/Whiteboard";
import {
  BlackoutOverlay,
  BreakOverlay,
  StandbyScreen,
  StudentPicker,
  SummaryOverlay,
  PairsOverlay,
  EndScreen,
} from "@/components/lesson/Overlays";

export const Route = createFileRoute("/lesson/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLessonById(params.lessonId);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "الحصة غير متوفرة" }, { name: "robots", content: "noindex" }],
      };
    }
    const { lesson } = loaderData;
    const description = `حصة رقمية تفاعلية — ${lesson.title} (${lesson.level})، ${lesson.stations.length} محطات بيداغوجية مع مؤقت زمني وأدوات القسم.`;
    return {
      meta: [
        { title: `${lesson.title} — حصة تفاعلية` },
        { name: "description", content: description },
        { property: "og:title", content: `${lesson.title} — حصة تفاعلية` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { lesson: fallback } = Route.useLoaderData();
  const { workspace } = useTeacherView();
  const lesson = workspace?.lessons.find((l) => l.id === fallback.id) ?? fallback;
  const s = useLessonSession(lesson);
  const { theme, cycleTheme } = useTheme();
  const glossary = useGlossary();
  const navigate = useNavigate();
  const [enabled3d, setEnabled3d] = useState(false);
  const [whiteboard, setWhiteboard] = useState(false);
  const [picker, setPicker] = useState(false);
  const [summary, setSummary] = useState(false);
  const [pairs, setPairs] = useState(false);
  const [note, setNote] = useState(true);
  const [focusBlock, setFocusBlock] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { prefs } = usePrefs();

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  }, []);

  const handleStart = useCallback(() => {
    s.startLesson();
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, [s]);


  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowLeft":
        case " ":
          e.preventDefault();
          s.next();
          break;
        case "ArrowRight":
          e.preventDefault();
          s.prev();
          break;
        case "b":
        case "B":
          s.setBlackout(!s.blackout);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "p":
        case "P":
          s.takeBreak(5);
          break;
        case "Escape":
          setExpanded(null);
          s.setBlackout(false);
          setWhiteboard(false);
          setSummary(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s, toggleFullscreen]);

  const visibleBlocks = s.station.blocks.slice(0, s.reveal);

  return (
    <div
      dir="rtl"
      className="relative isolate flex h-dvh flex-col overflow-hidden"
      style={{ fontSize: `${s.fontScale}rem` }}
    >
      <ThreeBackground
        index={s.index}
        model={s.station.model}
        enabled={enabled3d}
        onDegraded={() => setEnabled3d(false)}
      />

      <ProgressHeader
        lesson={lesson}
        index={s.index}
        onGoTo={s.goTo}
        stationElapsed={s.stationSeconds[s.index] ?? 0}
        stationPlanned={s.station.minutes * 60}
        totalSeconds={s.totalSeconds}
        overtime={s.progress.overtime}
      />

      <main className="lesson-scroll relative z-10 flex-1 overflow-y-auto px-3 py-5 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-[1600px]">

          <p className="mb-2 text-[0.8rem] font-semibold tracking-[0.15em] text-primary sm:text-[0.95rem] sm:tracking-[0.2em]">
            {s.station.kicker}
          </p>
          <h2 className="glass-panel mb-6 inline-block max-w-full rounded-3xl px-5 py-2.5 text-[clamp(1.25rem,5vw,3rem)] font-bold leading-tight text-primary sm:mb-8 sm:rounded-full sm:px-8 sm:py-3">
            {s.station.title}
          </h2>

          <div className="space-y-5 sm:space-y-8">
            {visibleBlocks.map((block, i) => (
              <div
                key={i}
                onClick={() => setFocusBlock(focusBlock === i ? null : i)}
                className={`glass-panel animate-fade-in relative rounded-2xl p-4 transition-all duration-300 sm:rounded-3xl sm:p-7 ${
                  focusBlock !== null && focusBlock !== i
                    ? "opacity-25 blur-[1px]"
                    : "opacity-100 blur-0"
                }`}
              >
                <button
                  type="button"
                  aria-label="عرض الوثيقة بملء الشاشة"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(i);
                  }}
                  className="absolute left-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1.5 text-[0.7rem] font-semibold text-foreground/80 backdrop-blur transition hover:border-primary hover:text-primary sm:left-3 sm:top-3 sm:text-xs"
                >
                  <Maximize2 className="size-4" /> ملء الشاشة
                </button>
                <BlockView
                  block={block}
                  terms={lesson.terms}
                  quizId={`${s.station.id}-${i}`}
                  stats={s.quizStats[`${s.station.id}-${i}`]}
                  onAnswer={(correct) => s.recordAnswer(`${s.station.id}-${i}`, correct)}
                  onStartActivityTimer={(sec) => s.setActivityTimer(sec)}
                />
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground sm:mt-8 sm:text-sm">
            العنصر {s.reveal} من {s.maxReveal}
          </p>
        </div>
      </main>

      {whiteboard && <Whiteboard onClose={() => setWhiteboard(false)} />}

      {note && prefs.showTeacherNotes && (
        <div className="relative z-20 shrink-0 flex max-h-24 items-start gap-2 overflow-y-auto border-t-2 border-warning/60 bg-warning/25 px-3 py-2 text-xs sm:max-h-none sm:gap-3 sm:px-5 sm:py-3 sm:text-sm">
          <span className="shrink-0 rounded-full bg-warning px-2 py-0.5 text-[0.65rem] font-bold text-warning-foreground sm:px-3 sm:text-xs">
            تعليمة الأستاذة
          </span>
          <p className="min-w-0 flex-1 leading-relaxed text-foreground/85">{s.station.teacherNote}</p>
          <button
            type="button"
            onClick={() => setNote(false)}
            className="shrink-0 text-[0.65rem] text-muted-foreground hover:text-foreground sm:text-xs"
          >
            إخفاء
          </button>
        </div>
      )}

      {expanded !== null &&
        visibleBlocks[expanded] &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            dir="rtl"
            className="fixed inset-0 z-[80] flex flex-col bg-background"
            style={{ fontSize: `${s.fontScale * 1.15}rem` }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-primary sm:text-base">
                {s.station.title}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <X className="size-4" /> إغلاق
              </button>
            </div>
            <div className="lesson-scroll flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto w-full max-w-[1800px] [&_img]:max-h-[70vh] [&_img]:w-full [&_img]:object-contain">
                <BlockView
                  block={visibleBlocks[expanded]!}
                  terms={lesson.terms}
                  quizId={`${s.station.id}-${expanded}-fs`}
                  stats={s.quizStats[`${s.station.id}-${expanded}`]}
                  onAnswer={(correct) => s.recordAnswer(`${s.station.id}-${expanded}`, correct)}
                  onStartActivityTimer={(sec) => s.setActivityTimer(sec)}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      <ControlBar
        running={s.running}
        onToggleRunning={() => s.setRunning(!s.running)}
        onNext={s.next}
        onPrev={s.prev}
        onBreak={() => s.takeBreak(5)}
        onBlackout={() => s.setBlackout(true)}
        onWhiteboard={() => setWhiteboard((v) => !v)}
        onPick={() => setPicker(true)}
        onPairs={() => setPairs(true)}
        onSummary={() => setSummary(true)}
        onGlossary={() => glossary?.open()}
        onReset={s.resetSession}
        onFullscreen={toggleFullscreen}
        onFont={(dir) => s.setFontScale(Math.min(1.6, Math.max(0.8, s.fontScale + dir * 0.1)))}
        toggle3d={() => setEnabled3d((v) => !v)}
        enabled3d={enabled3d}
        theme={theme}
        onCycleTheme={cycleTheme}
        activityTimer={s.activityTimer}
        onClearActivityTimer={() => s.setActivityTimer(null)}
      />

      {s.standby && <StandbyScreen lesson={lesson} onStart={handleStart} />}
      {s.breakSeconds !== null && <BreakOverlay seconds={s.breakSeconds} onEnd={s.endBreak} />}
      {s.blackout && <BlackoutOverlay onExit={() => s.setBlackout(false)} />}
      {pairs && <PairsOverlay onClose={() => setPairs(false)} />}
      {picker && <StudentPicker onClose={() => setPicker(false)} />}
      {s.finished && !summary && (
        <EndScreen
          lesson={lesson}
          stationSeconds={s.stationSeconds}
          totalSeconds={s.totalSeconds}
          quizStats={s.quizStats}
          onReview={() => setSummary(true)}
          onRestart={() => {
            s.resetSession();
            s.setFinished(false);
          }}
          onHome={() => {
            if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
            void navigate({ to: "/" });
          }}
        />
      )}
      {summary && (
        <SummaryOverlay
          lesson={lesson}
          onClose={() => setSummary(false)}
          stationSeconds={s.stationSeconds}
          totalSeconds={s.totalSeconds}
        />
      )}
    </div>
  );
}
