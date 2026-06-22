// Guarded service-worker registration.
// Refuses to register in dev, Lovable preview/iframe hosts, or when ?sw=off is set.
// In any refused context, it actively unregisters existing SWs and clears their caches
// so a stale "offline" page from a previous registration cannot keep showing.

const SW_URL = "/sw.js";

async function unregisterAndCleanup() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(SW_URL) || url.includes("/sw.js");
        })
        .map((r) => r.unregister()),
    );
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => /precache|runtime|pages-cache|assets-cache|media-cache|workbox/i.test(n))
          .map((n) => caches.delete(n)),
      );
    }
  } catch {
    /* noop */
  }
}

export function registerPWA() {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const url = new URL(window.location.href);

  const refuse =
    !import.meta.env.PROD ||
    inIframe ||
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev") ||
    url.searchParams.get("sw") === "off";

  if (refuse) {
    void unregisterAndCleanup();
    return;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(SW_URL).catch(() => {
        /* ignore */
      });
    });
  }
}
