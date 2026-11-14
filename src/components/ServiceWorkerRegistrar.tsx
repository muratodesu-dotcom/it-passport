"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// An installed app is suspended and resumed for weeks without navigating, so
// it never notices a deploy unless something asks. Check on return, focus,
// reconnect and hourly, at most once a minute.
const CHECK_EVERY_MS = 60 * 60 * 1000;
const CHECK_THROTTLE_MS = 60 * 1000;

// Pages with nothing in progress: a new build may land on them by reloading
// while the app is in the background. Quizzes, study sessions and games keep
// running and get a small "update" pill instead, so no answer is lost.
// Settings is left out: its form holds unsaved edits (a pasted API key) in
// memory, and switching apps to copy a key must not throw them away.
const SAFE_TO_RELOAD = new Set(["/", "/glossary", "/history", "/games"]);

export default function ServiceWorkerRegistrar() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const sw = navigator.serviceWorker;
    // The first install also fires controllerchange; only a page that was
    // already controlled is running an older build.
    const wasControlled = Boolean(sw.controller);
    let registration: ServiceWorkerRegistration | undefined;
    let lastCheck = 0;
    let pending = false;

    const check = () => {
      if (!registration || Date.now() - lastCheck < CHECK_THROTTLE_MS) return;
      lastCheck = Date.now();
      registration.update().catch(() => {});
    };
    const reloadIfSafe = () => {
      if (pending && document.visibilityState === "hidden" && SAFE_TO_RELOAD.has(pathRef.current)) {
        window.location.reload();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
      else reloadIfSafe();
    };
    const onControllerChange = () => {
      if (!wasControlled || pending) return;
      pending = true;
      setUpdateReady(true);
      reloadIfSafe();
    };

    const register = () => {
      sw.register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          registration = reg;
        })
        .catch(() => {
          // Offline support is a progressive enhancement.
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const timer = window.setInterval(check, CHECK_EVERY_MS);
    sw.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("load", register);
      sw.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
    };
  }, []);

  if (!updateReady) return null;
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="fade-in fixed bottom-24 left-1/2 z-50 md:bottom-4 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] shadow-lg transition-colors hover:bg-[var(--card-hover)]"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg className="h-4 w-4 text-[var(--primary)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5V6h-2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      新しいバージョン · 再読み込み
    </button>
  );
}
