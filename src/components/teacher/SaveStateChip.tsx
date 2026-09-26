import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaveState } from "@/hooks/useTeacherWorkspace";

const messages: Record<SaveState, string> = {
  idle: "",
  pending: "تغييرات غير محفوظة…",
  saving: "جارٍ الحفظ…",
  saved: "تم الحفظ",
  error: "تعذّر الحفظ",
};

export function SaveStateChip({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === "idle") return null;
  const tone =
    state === "saved"
      ? "bg-primary/10 text-primary"
      : state === "error"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}>
      {state === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
      {messages[state]}
      {state === "error" && (
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </span>
  );
}
