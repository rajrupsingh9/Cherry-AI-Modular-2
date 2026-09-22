/**
 * App.tsx
 * Thin Core Orchestrator for Cherry AI Socratic Classroom & Studyverse.
 * Adheres strictly to the architectural Thin Core Orchestrator standard (< 100 LOC).
 */
import React from "react";
import { useAppController } from "./hooks/app/useAppController";
import { AppShell } from "./components/layout/AppShell";

// Re-export utility for backward-compatibility
export { extractYoutubeId } from "./utils/youtubeUtils";

export default function App() {
  const app = useAppController();

  return <AppShell app={app} />;
}
