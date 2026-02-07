"use client";

import { useState, useEffect } from "react";

export type ServiceWorkerStatus = {
  /** This page is controlled by a service worker (so fetch is intercepted). */
  isControlled: boolean;
  /** SW registration exists and is active. */
  isActive: boolean;
  /** Precached start URL "/" is available in cache (for offline reopen). */
  hasStartUrlInCache: boolean;
  /** Fallback document "/~offline" is available in cache. */
  hasOfflinePageInCache: boolean;
  /** Whether the status has been resolved (async cache check done). */
  ready: boolean;
};

/**
 * Returns service worker and cache status for debugging "reopen offline" issues.
 * Use in dev or on the offline fallback page to verify SW control and precache.
 */
export function useServiceWorkerStatus(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isControlled: false,
    isActive: false,
    hasStartUrlInCache: false,
    hasOfflinePageInCache: false,
    ready: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("caches" in window)) {
      setStatus((s) => ({ ...s, ready: true }));
      return;
    }

    const update = () => {
      const controller = navigator.serviceWorker.controller;
      setStatus((s) => ({
        ...s,
        isControlled: !!controller,
        isActive: !!navigator.serviceWorker.controller,
      }));
    };

    navigator.serviceWorker.ready.then(() => {
      update();
      // Check if "/" and "/~offline" are in any cache (precache stores with possible query).
      Promise.all([
        caches.match("/", { ignoreSearch: true }),
        caches.match("/~offline", { ignoreSearch: true }),
      ]).then(([startResp, offlineResp]) => {
        setStatus((s) => ({
          ...s,
          hasStartUrlInCache: !!startResp,
          hasOfflinePageInCache: !!offlineResp,
          ready: true,
        }));
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", update);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", update);
  }, []);

  return status;
}
