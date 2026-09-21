/**
 * useReaderKeyboard.ts
 * Sub-hook for managing global keyboard navigation shortcuts inside the book reader.
 */
import React, { useEffect, Dispatch, SetStateAction } from "react";
import { ReaderTheme } from "../readerTypes";

interface UseReaderKeyboardParams {
  isOpen: boolean;
  isFullscreen: boolean;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  chaptersLength: number;
  setActiveChapterIndex: Dispatch<SetStateAction<number>>;
  setTheme: Dispatch<SetStateAction<ReaderTheme>>;
}

export const useReaderKeyboard = ({
  isOpen,
  isFullscreen,
  setIsFullscreen,
  onClose,
  chaptersLength,
  setActiveChapterIndex,
  setTheme,
}: UseReaderKeyboardParams) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        setActiveChapterIndex((prev) => Math.min(chaptersLength - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveChapterIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "t" || e.key === "T") {
        setTheme((prev) =>
          prev === "chalkboard"
            ? "paper"
            : prev === "paper"
            ? "obsidian"
            : "chalkboard",
        );
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    isFullscreen,
    setIsFullscreen,
    onClose,
    chaptersLength,
    setActiveChapterIndex,
    setTheme,
  ]);
};
