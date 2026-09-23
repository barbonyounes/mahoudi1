import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LessonDef } from "@/data/lesson";

export type Persisted = {
  index: number;
  stationSeconds: number[];
  totalSeconds: number;
  quizStats: Record<string, { correct: number; total: number }>;
};

function loadPersisted(key: string): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

export function useLessonSession(lesson: LessonDef) {
  const STORAGE_KEY = `lesson-session-${lesson.id}-v2`;
  const stations = lesson.stations;
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [standby, setStandby] = useState(true);
  const [blackout, setBlackout] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState<number | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [reveal, setReveal] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [stationSeconds, setStationSeconds] = useState<number[]>(() => stations.map(() => 0));
  const [quizStats, setQuizStats] = useState<Record<string, { correct: number; total: number }>>(
    {},
  );
  const [activityTimer, setActivityTimer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  // استعادة الحالة المحفوظة محلياً بعد الترطيب فقط
  useEffect(() => {
    const saved = loadPersisted(STORAGE_KEY);
    if (saved) {
      setIndex(Math.min(saved.index, stations.length - 1));
      setTotalSeconds(saved.totalSeconds ?? 0);
      if (Array.isArray(saved.stationSeconds) && saved.stationSeconds.length === stations.length) {
        setStationSeconds(saved.stationSeconds);
      }
      setQuizStats(saved.quizStats ?? {});
    }
    setHydrated(true);
  }, [stations.length, STORAGE_KEY]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = { index, stationSeconds, totalSeconds, quizStats };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* تجاهل امتلاء التخزين */
    }
  }, [hydrated, index, stationSeconds, totalSeconds, quizStats, STORAGE_KEY]);

  // المؤقت الرئيسي
  const indexRef = useRef(index);
  indexRef.current = index;
  useEffect(() => {
    if (!running || breakSeconds !== null) return;
    const id = window.setInterval(() => {
      setTotalSeconds((s) => s + 1);
      setStationSeconds((arr) => {
        const next = [...arr];
        next[indexRef.current] = (next[indexRef.current] ?? 0) + 1;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, breakSeconds]);

  // عدّاد الاستراحة
  useEffect(() => {
    if (breakSeconds === null) return;
    if (breakSeconds <= 0) {
      setBreakSeconds(null);
      return;
    }
    const id = window.setTimeout(() => setBreakSeconds((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [breakSeconds]);

  // مؤقت النشاط المصغّر
  useEffect(() => {
    if (activityTimer === null) return;
    if (activityTimer <= 0) return;
    const id = window.setTimeout(
      () => setActivityTimer((s) => (s === null ? null : s - 1)),
      1000,
    );
    return () => window.clearTimeout(id);
  }, [activityTimer]);

  const station = stations[index]!;
  const maxReveal = station.blocks.length;

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(stations.length - 1, i));
      indexRef.current = clamped;
      setIndex(clamped);
      setReveal(1);
    },
    [stations.length],
  );


  const revealRef = useRef(reveal);
  revealRef.current = reveal;

  const next = useCallback(() => {
    if (revealRef.current < maxReveal) {
      revealRef.current += 1;
      setReveal(revealRef.current);
      return;
    }
    if (indexRef.current < stations.length - 1) {
      indexRef.current += 1;
      setIndex(indexRef.current);
      revealRef.current = 1;
      setReveal(1);
      return;
    }
    // نهاية الحصة: آخر عنصر من آخر محطة
    setFinished(true);
    setRunning(false);
  }, [maxReveal, stations.length]);

  const prev = useCallback(() => {
    if (revealRef.current > 1) {
      revealRef.current -= 1;
      setReveal(revealRef.current);
      return;
    }
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setIndex(indexRef.current);
      revealRef.current = 1;
      setReveal(1);
    }
  }, []);


  const startLesson = useCallback(() => {
    setStandby(false);
    setRunning(true);
  }, []);

  const takeBreak = useCallback((minutes = 5) => {
    setBreakSeconds(minutes * 60);
  }, []);

  const endBreak = useCallback(() => setBreakSeconds(null), []);

  const resetSession = useCallback(() => {
    setIndex(0);
    setReveal(1);
    setTotalSeconds(0);
    setStationSeconds(stations.map(() => 0));
    setQuizStats({});
    setRunning(false);
    setStandby(true);
    setFinished(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* تجاهل */
    }
  }, [stations]);

  const recordAnswer = useCallback((quizId: string, correct: boolean) => {
    setQuizStats((s) => {
      const cur = s[quizId] ?? { correct: 0, total: 0 };
      return { ...s, [quizId]: { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 } };
    });
  }, []);

  const plannedSeconds = station.minutes * 60;
  const stationElapsed = stationSeconds[index] ?? 0;
  const totalPlanned = lesson.totalMinutes * 60;

  const progress = useMemo(
    () => ({
      stationRatio: Math.min(1, stationElapsed / plannedSeconds),
      totalRatio: Math.min(1, totalSeconds / totalPlanned),
      stationRemaining: plannedSeconds - stationElapsed,
      totalRemaining: totalPlanned - totalSeconds,
      overtime: stationElapsed > plannedSeconds,
    }),
    [stationElapsed, plannedSeconds, totalSeconds, totalPlanned],
  );

  return {
    stations,
    station,
    index,
    reveal,
    maxReveal,
    running,
    standby,
    blackout,
    breakSeconds,
    fontScale,
    totalSeconds,
    stationSeconds,
    quizStats,
    activityTimer,
    finished,
    setFinished,
    progress,
    setRunning,
    setBlackout,
    setFontScale,
    setActivityTimer,
    setStandby,
    goTo,
    next,
    prev,
    startLesson,
    takeBreak,
    endBreak,
    resetSession,
    recordAnswer,
  };
}

export function formatClock(totalSeconds: number) {
  const sign = totalSeconds < 0 ? "-" : "";
  const s = Math.abs(Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${sign}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
