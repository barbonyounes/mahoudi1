import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { formatClock } from "@/hooks/useLessonSession";
import type { LessonDef } from "@/data/lesson";
import { cn } from "@/lib/utils";

export function ProgressHeader({
  lesson,
  index,
  onGoTo,
  stationElapsed,
  stationPlanned,
  totalSeconds,
  overtime,
}: {
  lesson: LessonDef;
  index: number;
  onGoTo: (i: number) => void;
  stationElapsed: number;
  stationPlanned: number;
  totalSeconds: number;
  overtime: boolean;
}) {
  const totalPlanned = lesson.totalMinutes * 60;

  return (
    <header className="storybook-band relative z-30 shrink-0 border-b-2 px-3 py-2.5 sm:px-5 sm:py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/"
            title="اختيار حصة أخرى"
            className="shrink-0 rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Home className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[0.7rem] text-muted-foreground sm:text-sm">
              {lesson.subject} — {lesson.level}
            </p>
            <h1 className="truncate text-base font-bold sm:text-xl">{lesson.title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 tabular-nums sm:gap-6">
          <div className="text-right">
            <p className="text-[0.65rem] text-muted-foreground sm:text-xs">زمن المحطة</p>
            <p
              className={cn(
                "text-lg font-bold sm:text-2xl",
                overtime ? "text-destructive" : "text-primary",
              )}
            >
              {formatClock(stationPlanned - stationElapsed)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] text-muted-foreground sm:text-xs">المتبقي</p>
            <p className="text-lg font-bold sm:text-2xl">{formatClock(totalPlanned - totalSeconds)}</p>
          </div>
        </div>
      </div>

      {/* شريط المحطات */}
      <div className="mt-2.5 flex gap-1 sm:mt-3 sm:gap-1.5">
        {lesson.stations.map((s, i) => {
          const done = i < index;
          const active = i === index;
          const ratio = active ? Math.min(1, stationElapsed / stationPlanned) : done ? 1 : 0;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onGoTo(i)}
              title={`${s.title} — ${s.minutes} د`}
              className="group relative min-w-0 flex-1 text-right"
              style={{ flexGrow: s.minutes }}
            >
              <span className="block h-2 w-full overflow-hidden rounded-full bg-secondary sm:h-2.5">
                <span
                  className={cn(
                    "block h-full rounded-full transition-all duration-500",
                    overtime && active ? "bg-destructive" : "bg-primary",
                  )}
                  style={{ width: `${ratio * 100}%` }}
                />
              </span>
              <span
                className={cn(
                  "mt-1.5 hidden truncate text-xs transition sm:block",
                  active ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* اسم المحطة الحالية على الهاتف */}
      <p className="mt-1.5 truncate text-xs font-bold text-primary sm:hidden">
        {lesson.stations[index]?.title}
      </p>
    </header>
  );
}

