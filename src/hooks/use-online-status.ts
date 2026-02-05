import { useState, useEffect } from "react";

/**
 * Custom hook to detect online/offline status
 * @returns {boolean} isOnline - true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Set initial status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check initial status
    updateOnlineStatus();

    // Add event listeners for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline;
}
