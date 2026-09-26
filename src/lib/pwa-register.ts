/** المسجّل الوحيد لعامل الخدمة — يرفض التسجيل في المعاينة والتطوير. */
export async function registerAppServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const host = window.location.hostname;
  const refused =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    host.startsWith("id-preview--") || host.startsWith("preview--") ||
    /(^|\.)lovableproject(-dev)?\.com$/.test(host) ||
    /(^|\.)beta\.lovable\.dev$/.test(host) ||
    new URLSearchParams(window.location.search).get("sw") === "off";
  if (refused) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  // تسخين الصفحات الأساسية لتعمل بدون إنترنت حتى قبل زيارتها
  reg.active && warm();
  navigator.serviceWorker.ready.then(warm).catch(() => undefined);
}

let warmed = false;
function warm() {
  if (warmed || !navigator.onLine) return;
  warmed = true;
  ["/", "/teacher", "/level/3am", "/level/4am", "/settings"].forEach((p) => void fetch(p, { mode: "same-origin" }).catch(() => undefined));
}
