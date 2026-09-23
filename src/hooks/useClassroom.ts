import { useCallback, useEffect, useState } from "react";
import {
  CLASSROOM_EVENT,
  CLASSROOM_KEY,
  FEEDBACK_KEY,
  defaultClassroom,
  makeId,
  type ClassGroup,
  type ClassroomState,
  type FeedbackEntry,
  type LevelDef,
} from "@/data/classroom";
import { studentNames } from "@/data/lesson";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CLASSROOM_EVENT));
  } catch {
    /* تجاهل امتلاء التخزين */
  }
}

export function useClassroom() {
  const [state, setState] = useState<ClassroomState>(() => defaultClassroom());
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const sync = useCallback(() => {
    setState(read<ClassroomState>(CLASSROOM_KEY, defaultClassroom()));
    setFeedback(read<FeedbackEntry[]>(FEEDBACK_KEY, []));
  }, []);

  useEffect(() => {
    sync();
    setHydrated(true);
    const onChange = () => sync();
    window.addEventListener(CLASSROOM_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CLASSROOM_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [sync]);

  const save = useCallback((next: ClassroomState) => {
    setState(next);
    write(CLASSROOM_KEY, next);
  }, []);

  const addLevel = useCallback(
    (name: string) => {
      const level: LevelDef = { id: makeId(), name: name.trim().slice(0, 60) };
      if (!level.name) return;
      save({ ...state, levels: [...state.levels, level] });
    },
    [save, state],
  );

  const renameLevel = useCallback(
    (id: string, name: string) => {
      save({
        ...state,
        levels: state.levels.map((l) => (l.id === id ? { ...l, name: name.slice(0, 60) } : l)),
      });
    },
    [save, state],
  );

  const removeLevel = useCallback(
    (id: string) => {
      const classes = state.classes.filter((c) => c.levelId !== id);
      save({
        levels: state.levels.filter((l) => l.id !== id),
        classes,
        activeClassId: classes.some((c) => c.id === state.activeClassId)
          ? state.activeClassId
          : (classes[0]?.id ?? null),
      });
    },
    [save, state],
  );

  const addClass = useCallback(
    (levelId: string, name: string) => {
      const group: ClassGroup = {
        id: makeId(),
        name: name.trim().slice(0, 60) || "فوج جديد",
        levelId,
        students: [],
      };
      save({
        ...state,
        classes: [...state.classes, group],
        activeClassId: state.activeClassId ?? group.id,
      });
    },
    [save, state],
  );

  const updateClass = useCallback(
    (id: string, patch: Partial<Omit<ClassGroup, "id">>) => {
      save({
        ...state,
        classes: state.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      });
    },
    [save, state],
  );

  const removeClass = useCallback(
    (id: string) => {
      const classes = state.classes.filter((c) => c.id !== id);
      save({
        ...state,
        classes,
        activeClassId: state.activeClassId === id ? (classes[0]?.id ?? null) : state.activeClassId,
      });
    },
    [save, state],
  );

  const setActiveClass = useCallback(
    (id: string) => save({ ...state, activeClassId: id }),
    [save, state],
  );

  const activeClass = state.classes.find((c) => c.id === state.activeClassId) ?? null;
  const roster =
    activeClass && activeClass.students.length > 0 ? activeClass.students : studentNames;

  const addFeedback = useCallback(
    (student: string, label: string) => {
      const entry: FeedbackEntry = {
        id: makeId(),
        student,
        classId: state.activeClassId,
        label,
        at: Date.now(),
      };
      const next = [entry, ...feedback].slice(0, 300);
      setFeedback(next);
      write(FEEDBACK_KEY, next);
    },
    [feedback, state.activeClassId],
  );

  const clearFeedback = useCallback(() => {
    setFeedback([]);
    write(FEEDBACK_KEY, []);
  }, []);

  return {
    hydrated,
    ...state,
    activeClass,
    roster,
    feedback,
    addLevel,
    renameLevel,
    removeLevel,
    addClass,
    updateClass,
    removeClass,
    setActiveClass,
    addFeedback,
    clearFeedback,
  };
}
