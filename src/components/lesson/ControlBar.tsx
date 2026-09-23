import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Coffee,
  EyeOff,
  Maximize2,
  Minus,
  Pause,
  PenLine,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  ListChecks,
  BookOpen,
  Users,
  Sun,
  Moon,
  MoonStar,
  LayoutGrid,
  X,
} from "lucide-react";
import { formatClock } from "@/hooks/useLessonSession";
import { THEME_LABEL, type ThemeMode } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type Props = {
  running: boolean;
  onToggleRunning: () => void;
  onNext: () => void;
  onPrev: () => void;
  onBreak: () => void;
  onBlackout: () => void;
  onWhiteboard: () => void;
  onPick: () => void;
  onPairs: () => void;
  onSummary: () => void;
  onGlossary: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onFont: (dir: 1 | -1) => void;
  toggle3d: () => void;
  enabled3d: boolean;
  theme: ThemeMode;
  onCycleTheme: () => void;
  activityTimer: number | null;
  onClearActivityTimer: () => void;
};

function Btn({
  label,
  onClick,
  children,
  tone = "default",
  showLabel = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "primary" | "warn";
  /** يعرض النص بجانب الأيقونة في قائمة الأدوات على الهاتف */
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "storybook-pill inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-3 py-2 text-sm font-bold hover:-translate-y-0.5 sm:px-4 sm:py-2.5 sm:text-base",
        tone === "default" && "bg-card text-foreground hover:bg-secondary",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "warn" && "bg-warning text-warning-foreground",
      )}
    >
      {children}
      {showLabel && <span className="truncate">{label}</span>}
    </button>
  );
}

export function ControlBar(props: Props) {
  const [toolsOpen, setToolsOpen] = useState(false);

  const tools = (showLabel: boolean) => (
    <>
      <Btn label="تعتيم الشاشة" onClick={props.onBlackout} showLabel={showLabel}>
        <EyeOff className="size-5 shrink-0" />
      </Btn>
      <Btn label="سبورة الرسم" onClick={props.onWhiteboard} showLabel={showLabel}>
        <PenLine className="size-5 shrink-0" />
      </Btn>
      <Btn label="اختيار تلميذ" onClick={props.onPick} showLabel={showLabel}>
        <Shuffle className="size-5 shrink-0" />
      </Btn>
      <Btn label="أفواج ثنائية" onClick={props.onPairs} showLabel={showLabel}>
        <Users className="size-5 shrink-0" />
      </Btn>
      <Btn label="قاموس المصطلحات" onClick={props.onGlossary} showLabel={showLabel}>
        <BookOpen className="size-5 shrink-0" />
      </Btn>
      <Btn label="ملخص الحصة" onClick={props.onSummary} showLabel={showLabel}>
        <ListChecks className="size-5 shrink-0" />
      </Btn>
      <Btn label="تصغير الخط" onClick={() => props.onFont(-1)} showLabel={showLabel}>
        <Minus className="size-5 shrink-0" />
      </Btn>
      <Btn label="تكبير الخط" onClick={() => props.onFont(1)} showLabel={showLabel}>
        <Plus className="size-5 shrink-0" />
      </Btn>
      <Btn label="خلفية ثلاثية الأبعاد" onClick={props.toggle3d} showLabel={showLabel}>
        <Sparkles className={cn("size-5 shrink-0", !props.enabled3d && "opacity-40")} />
      </Btn>
      <Btn label={THEME_LABEL[props.theme]} onClick={props.onCycleTheme} showLabel={showLabel}>
        {props.theme === "light" ? (
          <Sun className="size-5 shrink-0" />
        ) : props.theme === "dark" ? (
          <Moon className="size-5 shrink-0" />
        ) : (
          <MoonStar className="size-5 shrink-0" />
        )}
      </Btn>
      <Btn label="ملء الشاشة" onClick={props.onFullscreen} showLabel={showLabel}>
        <Maximize2 className="size-5 shrink-0" />
      </Btn>
      <Btn label="إعادة ضبط الحصة" onClick={props.onReset} showLabel={showLabel}>
        <RotateCcw className="size-5 shrink-0" />
      </Btn>
    </>
  );

  return (
    <div className="storybook-band relative z-30 shrink-0 border-t-2">
      {/* لوحة الأدوات على الهاتف */}
      {toolsOpen && (
        <div className="grid max-h-[45vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain border-b-2 px-4 py-3 sm:hidden">
          {tools(true)}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:flex-wrap sm:px-5 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:flex-none sm:flex-wrap sm:overflow-visible">
          <Btn label="المحطة السابقة" onClick={props.onPrev}>
            <ChevronRight className="size-5 shrink-0" />
            <span className="hidden sm:inline">السابق</span>
          </Btn>
          <Btn label="التالي" onClick={props.onNext} tone="primary">
            <span className="hidden sm:inline">التالي</span>
            <ChevronLeft className="size-5 shrink-0" />
          </Btn>
          <Btn
            label={props.running ? "إيقاف المؤقت" : "تشغيل المؤقت"}
            onClick={props.onToggleRunning}
          >
            {props.running ? (
              <Pause className="size-5 shrink-0" />
            ) : (
              <Play className="size-5 shrink-0" />
            )}
          </Btn>
          <Btn label="استراحة 5 دقائق" onClick={props.onBreak} tone="warn">
            <Coffee className="size-5 shrink-0" />
            <span className="hidden sm:inline">5 دقائق</span>
          </Btn>
          {props.activityTimer !== null && (
            <button
              type="button"
              onClick={props.onClearActivityTimer}
              className="storybook-pill shrink-0 bg-primary/15 px-3 py-2 text-sm font-bold tabular-nums text-primary sm:px-4 sm:py-2.5 sm:text-base"
            >
              {formatClock(props.activityTimer)}
            </button>
          )}
        </div>

        {/* زر الأدوات — الهاتف فقط */}
        <button
          type="button"
          onClick={() => setToolsOpen((v) => !v)}
          aria-label="الأدوات"
          aria-expanded={toolsOpen}
          className="storybook-pill inline-flex min-h-11 shrink-0 items-center gap-2 bg-card px-3 py-2 text-sm font-bold sm:hidden"
        >
          {toolsOpen ? <X className="size-5" /> : <LayoutGrid className="size-5" />}
        </button>

        {/* الأدوات على الشاشات الكبيرة */}
        <div className="hidden flex-wrap items-center gap-2 sm:flex">{tools(false)}</div>
      </div>
    </div>
  );
}

