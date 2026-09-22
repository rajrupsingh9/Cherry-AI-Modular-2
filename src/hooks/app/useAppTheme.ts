/**
 * useAppTheme.ts
 * Manages blackboard theme preference, local storage sync, and active color tokens.
 */
import { useState, useCallback } from "react";
import { THEME_CONFIGS, ThemeType } from "../../types";

interface UseAppThemeParams {
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useAppTheme({ addToast }: UseAppThemeParams) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem("preferred_classroom_theme");
      if (saved && saved in THEME_CONFIGS) {
        return saved as ThemeType;
      }
    } catch (_) {}
    return "cherry";
  });

  const handleThemeChange = useCallback(
    (newTheme: ThemeType) => {
      const sanitized = (newTheme || "").toString().toLowerCase() as ThemeType;
      let appliedTheme: ThemeType = "cherry";
      if (THEME_CONFIGS[sanitized]) {
        appliedTheme = sanitized;
      }
      setTheme(appliedTheme);
      try {
        localStorage.setItem("preferred_classroom_theme", appliedTheme);
      } catch (_) {}
      const themeNames: Record<ThemeType, string> = {
        cherry: "Teal Forest Cherry 🍒",
        matrix: "Digital Matrix Code 📟",
        cyber: "Neon Cyberpunk ⚡",
        sunset: "Twilight Sunset 🌅",
        slate: "Modern Graphite Slate 📓",
        ivory: "Premium Ice White 🥼",
      };
      addToast(`Blackboard theme changed to: ${themeNames[appliedTheme]}`, "success");
    },
    [addToast]
  );

  const activeColors = THEME_CONFIGS[theme] || THEME_CONFIGS.cherry;

  return {
    theme,
    setTheme,
    handleThemeChange,
    activeColors,
  };
}
