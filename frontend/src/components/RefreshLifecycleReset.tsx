"use client";

import { useEffect } from "react";
import { ADOPTER_FAVORITES_STORAGE_KEY } from "@/lib/adoptante/favoritesStorage";

function wasPageReloaded(): boolean {
  if (typeof performance === "undefined") return false;
  const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return navigation?.type === "reload";
}

export function RefreshLifecycleReset() {
  useEffect(() => {
    if (!wasPageReloaded()) return;

    try {
      window.localStorage.removeItem(ADOPTER_FAVORITES_STORAGE_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Favorites are best-effort client state; a blocked storage API must not stop logout.
    }

    const pathname = window.location.pathname;
    const isProtectedProtectoraRoute = pathname.startsWith("/protectora")
      && !pathname.startsWith("/protectora/login");

    if (!isProtectedProtectoraRoute) return;

    void (async () => {
      try {
        await fetch("/api/protectora/logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
      } finally {
        window.location.replace("/protectora/login");
      }
    })();
  }, []);

  return null;
}
