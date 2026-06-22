// Guarded service-worker registration.
// Refuses to register in dev, Lovable preview/iframe hosts, or when ?sw=off is set.
// In any refused context, it actively unregisters existing SWs and clears their caches
// so a stale "offline" page from a previous registration cannot keep showing.

const SW_URL = "/sw.js";

async function unregisterAndCleanup(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  let didCleanup = false;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    const matching = regs.filter((r) => {
      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
      return url.endsWith(SW_URL) || url.includes("/sw.js");
    });
    if (matching.length > 0) didCleanup = true;
    await Promise.all(matching.map((r) => r.unregister()));
    if ("caches" in window) {
      const names = await caches.keys();
      const toDelete = names.filter((n) =>
        /precache|runtime|pages-cache|assets-cache|media-cache|workbox/i.test(n),
      );
      if (toDelete.length > 0) didCleanup = true;
      await Promise.all(toDelete.map((n) => caches.delete(n)));
    }
    if (navigator.serviceWorker.controller) didCleanup = true;
  } catch {
    /* noop */
  }
  return didCleanup;
}

export function registerPWA() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);

  void unregisterAndCleanup().then((didCleanup) => {
    if (didCleanup && !url.searchParams.get("__swcleaned")) {
      const reloadUrl = new URL(window.location.href);
      reloadUrl.searchParams.set("__swcleaned", "1");
      window.location.replace(reloadUrl.toString());
    }
  });
}
