import { useCallback, useEffect, useState } from "react";

export const PREFS_KEY = "teacher-prefs-v1";
export const PREFS_EVENT = "teacher-prefs-changed";

export type Prefs = {
  /** إظهار الملاحظات الموجهة للأستاذة داخل الحصة */
  showTeacherNotes: boolean;
};

export const defaultPrefs: Prefs = { showTeacherNotes: true };

function readPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    const sync = () => setPrefs(readPrefs());
    sync();
    window.addEventListener(PREFS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    const next = { ...readPrefs(), [key]: value };
    setPrefs(next);
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(PREFS_EVENT));
    } catch {
      /* تجاهل */
    }
  }, []);

  return { prefs, setPref };
}
