/**
 * useAppToasts.ts
 * Isolated hook for managing floating toast notifications.
 */
import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

export function useAppToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "info" | "success" | "error") => {
    const id = Math.random().toString(36).substring(3);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
}
