import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * حارس WebGL: يمنع تجاوز ذاكرة كرت الرسوميات على الهاتف
 * بالسماح بعدد محدود من مشاهد ثلاثية الأبعاد نشطة في وقت واحد.
 */

type Req = { id: number; priority: number };

let reqs: Req[] = [];
let maxContexts = 3;
let allowedKey = "";
let nextId = 1;
const subs = new Set<() => void>();

function recompute() {
  const key = [...reqs]
    .sort((a, b) => b.priority - a.priority || a.id - b.id)
    .slice(0, maxContexts)
    .map((r) => r.id)
    .sort((a, b) => a - b)
    .join(",");
  if (key !== allowedKey) {
    allowedKey = key;
    subs.forEach((f) => f());
  }
}

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function setMaxWebglContexts(n: number) {
  if (maxContexts === n) return;
  maxContexts = n;
  recompute();
}

/** أجهزة ضعيفة الإمكانيات (هاتف/ذاكرة أو أنوية قليلة) */
export function useLowPowerDevice() {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const evaluate = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.innerWidth < 900;
      const mem = nav.deviceMemory;
      const cores = nav.hardwareConcurrency ?? 8;
      const value =
        (coarse && narrow) || (typeof mem === "number" && mem <= 4) || cores <= 4 || narrow;
      setLow(value);
      setMaxWebglContexts(value ? 1 : 3);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);
  return low;
}

/**
 * يحجز «فتحة» سياق WebGL. الأولوية الأعلى تفوز عند ضيق الموارد.
 * priority: 0 خلفية زخرفية، 2 محاكاة تعليمية.
 */
export function useWebglSlot(enabled: boolean, priority = 0) {
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = nextId++;
  const id = idRef.current;

  useEffect(() => {
    if (!enabled) return;
    reqs = [...reqs, { id, priority }];
    recompute();
    return () => {
      reqs = reqs.filter((r) => r.id !== id);
      recompute();
    };
  }, [enabled, priority, id]);

  const key = useSyncExternalStore(
    subscribe,
    () => allowedKey,
    () => "",
  );

  return enabled && key.split(",").includes(String(id));
}

/**
 * مراقب الأداء: يقيس معدل الإطارات لمدة قصيرة بعد التشغيل،
 * وإذا انخفض دون العتبة يستدعي onDegrade للتحويل إلى العرض ثنائي الأبعاد.
 */
export function useFpsGuard(active: boolean, onDegrade: () => void, threshold = 20) {
  const cb = useRef(onDegrade);
  cb.current = onDegrade;

  useEffect(() => {
    if (!active) return;
    let frames = 0;
    let raf = 0;
    let low = 0;
    let windowStart = performance.now();
    const tick = () => {
      frames += 1;
      const now = performance.now();
      if (now - windowStart >= 1500) {
        const fps = (frames * 1000) / (now - windowStart);
        low = fps < threshold ? low + 1 : 0;
        frames = 0;
        windowStart = now;
        if (low >= 2) {
          cb.current();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, threshold]);
}
