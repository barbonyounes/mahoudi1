import { useCallback, useEffect, useRef, useState } from "react";

export type SoilKey = "sand" | "clay" | "humus";

export const SOILS: Record<
  SoilKey,
  { label: string; short: string; retention: number; k: number; color: string; hex: string }
> = {
  sand: {
    label: "تربة رملية",
    short: "رملية",
    retention: 0.15,
    k: 0.95,
    color: "#d9b979",
    hex: "#d9b979",
  },
  clay: {
    label: "تربة غضارية",
    short: "غضارية",
    retention: 0.7,
    k: 0.11,
    color: "#b07a5a",
    hex: "#b07a5a",
  },
  humus: {
    label: "تربة دبالية",
    short: "دبالية",
    retention: 0.4,
    k: 0.38,
    color: "#5b4632",
    hex: "#5b4632",
  },
};

export type FunnelState = { soil: SoilKey; percolated: number; rate: number };

/**
 * محاكاة نفاذية التربة: كمية الماء النافذ تتبع منحنى تشبّع
 * V(t) = Vmax × (1 − e^(−k·t))، وVmax يتعلق بقدرة التربة على الاحتفاظ بالماء.
 */
export function usePermeabilitySim(initialSoils: SoilKey[] = ["sand", "clay", "humus"]) {
  const [soils, setSoils] = useState<SoilKey[]>(initialSoils);
  const [volume, setVolume] = useState(150);
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<
    { soil: SoilKey; volume: number; percolated: number; seconds: number }[]
  >([]);

  const raf = useRef(0);
  const last = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000) * speedRef.current;
      last.current = now;
      setElapsed((t) => {
        const next = t + dt;
        if (next >= 40) {
          setRunning(false);
          return 40;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const funnels: FunnelState[] = soils.map((key) => {
    const s = SOILS[key];
    const max = volume * (1 - s.retention);
    const percolated = max * (1 - Math.exp(-s.k * elapsed));
    const rate = max * s.k * Math.exp(-s.k * elapsed);
    return { soil: key, percolated, rate };
  });

  const start = useCallback(() => {
    setElapsed(0);
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  const finish = useCallback(() => {
    setRunning(false);
    setElapsed(40);
  }, []);

  const setSoil = useCallback((i: number, key: SoilKey) => {
    setSoils((arr) => arr.map((v, j) => (j === i ? key : v)));
  }, []);

  const record = useCallback(() => {
    setRecords((r) => [
      ...r,
      ...funnels.map((f) => ({
        soil: f.soil,
        volume,
        percolated: Math.round(f.percolated),
        seconds: Math.round(elapsed),
      })),
    ]);
  }, [funnels, volume, elapsed]);

  const clearRecords = useCallback(() => setRecords([]), []);

  return {
    soils,
    setSoil,
    volume,
    setVolume,
    speed,
    setSpeed,
    running,
    setRunning,
    elapsed,
    funnels,
    records,
    start,
    reset,
    finish,
    record,
    clearRecords,
  };
}
