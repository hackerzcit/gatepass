import { useState, useEffect } from "react";

/**
 * Custom hook to detect online/offline status
 * @returns {boolean} isOnline - true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Re-check when app becomes visible (e.g. user reopens tab/PWA after being in background).
    // The browser may not fire "online" while the page was hidden, so we re-read on visibility.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateOnlineStatus();
      }
    };
    const onPageShow = (e: PageTransitionEvent) => {
      // pageshow fires on bfcache restore (e.g. back navigation) and initial load
      if (e.persisted) updateOnlineStatus();
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return isOnline;
}
