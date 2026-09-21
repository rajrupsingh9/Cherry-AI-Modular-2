/**
 * readerExportUtils.ts
 * Export, download, and clipboard utilities for book chapters and formulas.
 */
import { ChapterItem } from "../readerTypes";

export async function copyChapterNotes(
  book: any,
  currentChapter: ChapterItem,
  activeChapterIndex: number,
): Promise<boolean> {
  if (!currentChapter || typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  const formatted = `# ${book.processedTitle || "Handbook"}\n## Chapter ${activeChapterIndex + 1}: ${currentChapter.title}\n\n${currentChapter.content}\n\n---\n*Archived via Cherry AI Classroom Handbook*`;
  try {
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch (err) {
    console.error("Failed to copy chapter notes:", err);
    return false;
  }
}

export async function copyFormulaLatex(formulaStr: string): Promise<boolean> {
  if (!formulaStr || typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(formulaStr);
    return true;
  } catch (err) {
    console.error("Failed to copy LaTeX formula:", err);
    return false;
  }
}

export function exportFullHandbookMarkdown(
  book: any,
  chapters: ChapterItem[],
  subject: string,
): void {
  if (!book || typeof document === "undefined") return;

  let fullText = `# ${book.processedTitle || "Academic Handbook"}\n`;
  fullText += `*Subject: ${subject} | Lesson #${book.index || 1} | Date: ${book.formattedDateTime || "Live Session"}*\n\n`;
  fullText += `---\n\n`;

  chapters.forEach((c, idx) => {
    fullText += `## Chapter ${idx + 1}: ${c.title}\n\n`;
    fullText += `${c.content}\n\n`;
    fullText += `---\n\n`;
  });

  const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(book.processedTitle || "Lecture_Book").replace(/[^a-zA-Z0-9_-]/g, "_")}_Handbook.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
