import { useSyncExternalStore } from "react";
import { loadWorkspace, WORKSPACE_STORAGE_KEY, type WorkspaceDraft } from "@/hooks/useTeacherWorkspace";

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === WORKSPACE_STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("teacher-workspace-saved", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("teacher-workspace-saved", callback);
  };
}

/** يعيد نسخة الأستاذ المحفوظة محلياً إن وُجدت، وإلا null لعرض المحتوى الأصلي. */
export function useTeacherView(): { workspace: WorkspaceDraft | null } {
  const workspace = useSyncExternalStore(
    subscribe,
    () => {
      const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      return raw ?? null;
    },
    () => null,
  );
  if (workspace === null) return { workspace: null };
  return { workspace: loadWorkspace() };
}
