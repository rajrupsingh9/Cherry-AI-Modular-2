/**
 * readerChapterUtils.ts
 * Utilities for extracting chapters, topic sections, and LaTeX formulas from book contents.
 */
import { ChapterItem, BookFormulaItem } from "../readerTypes";

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function cleanMarkdownForSpeech(text: string): string {
  if (!text) return "";
  return text
    // Replace LaTeX fraction
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2")
    // Replace LaTeX sqrt
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1")
    // Replace LaTeX symbols
    .replace(/\\alpha/g, "alpha")
    .replace(/\\beta/g, "beta")
    .replace(/\\theta/g, "theta")
    .replace(/\\pi/g, "pi")
    .replace(/\\Delta/g, "delta")
    .replace(/\\sum/g, "sum")
    .replace(/\\int/g, "integral")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    // Remove markdown symbols
    .replace(/[\$\#\*\`\_\~]/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/\\quad/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBookChapters(book: any): ChapterItem[] {
  if (!book) return [];
  const list: ChapterItem[] = [];
  const topics: string[] = Array.isArray(book.topics) ? book.topics : [];
  const topicBoards: Record<string | number, string> =
    book.topicBoardsContent || {};
  const fullMarkdown: string =
    book.documentMarkdown ||
    book.activeDocumentMarkdown ||
    book.customBoardContent ||
    "";

  if (topics.length > 0) {
    topics.forEach((top, idx) => {
      const cleanTitle =
        top.replace(/^[\d\.\-\s]+/, "").trim() || `Topic ${idx + 1}`;

      let content =
        topicBoards[idx] || topicBoards[top] || topicBoards[cleanTitle] || "";

      if (!content && fullMarkdown) {
        const headerPattern = new RegExp(
          `#{1,4}\\s*.*${escapeRegex(cleanTitle)}[\\s\\S]*?(?=#{1,4}\\s|$)`,
          "i",
        );
        const match = fullMarkdown.match(headerPattern);
        if (match) {
          content = match[0];
        }
      }
      if (!content && idx === 0 && fullMarkdown) {
        content = fullMarkdown;
      }
      if (!content) {
        content = `### 📋 ${cleanTitle}\n\n*Comprehensive derivations, concepts, and teacher chalkboard notes for this module are archived in the session log.*\n\n$$\\text{Subject: } \\mathbf{${book.inferredSubject || book.subject || "Academic Course"}} \\quad | \\quad \\text{Lesson } \\#${book.index || 1}$$`;
      }
      const formulaMatches =
        content.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || [];
      const words = content
        .replace(/[#*`_$\\]/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      const estMins = Math.max(1, Math.ceil(words / 140));
      list.push({
        id: `topic_${idx}`,
        index: idx,
        title: cleanTitle,
        content,
        formulaCount: formulaMatches.length,
        wordCount: words,
        estReadingMins: estMins,
        extractedFormulas: formulaMatches
          .map((f) => f.replace(/^\${1,2}|\${1,2}$/g, "").trim())
          .filter(Boolean),
      });
    });
  } else if (fullMarkdown.trim()) {
    const sections = fullMarkdown
      .split(/(?=^##\s+)/m)
      .filter((s) => s.trim().length > 0);
    if (sections.length > 1) {
      sections.forEach((sec, idx) => {
        const firstLine =
          sec.trim().split("\n")[0] || `Section ${idx + 1}`;
        const cleanTitle = firstLine
          .replace(/^#+\s*/, "")
          .replace(/[\*\_]/g, "")
          .trim();
        const formulaMatches =
          sec.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || [];
        const words = sec
          .replace(/[#*`_$\\]/g, " ")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        list.push({
          id: `sec_${idx}`,
          index: idx,
          title: cleanTitle || `Chapter Section ${idx + 1}`,
          content: sec,
          formulaCount: formulaMatches.length,
          wordCount: words,
          estReadingMins: Math.max(1, Math.ceil(words / 140)),
          extractedFormulas: formulaMatches
            .map((f) => f.replace(/^\${1,2}|\${1,2}$/g, "").trim())
            .filter(Boolean),
        });
      });
    } else {
      const formulaMatches =
        fullMarkdown.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || [];
      const words = fullMarkdown
        .replace(/[#*`_$\\]/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      list.push({
        id: "main_content",
        index: 0,
        title:
          book.processedTitle || "Comprehensive Blackboard Derivations",
        content: fullMarkdown,
        formulaCount: formulaMatches.length,
        wordCount: words,
        estReadingMins: Math.max(1, Math.ceil(words / 140)),
        extractedFormulas: formulaMatches
          .map((f) => f.replace(/^\${1,2}|\${1,2}$/g, "").trim())
          .filter(Boolean),
      });
    }
  } else {
    list.push({
      id: "empty_content",
      index: 0,
      title: "Session Overview",
      content: `### 📖 ${book.processedTitle || "Classroom Lecture"}\n\n*No blackboard derivations recorded for this session yet.*`,
      formulaCount: 0,
      wordCount: 15,
      estReadingMins: 1,
      extractedFormulas: [],
    });
  }
  return list;
}

export function extractAllBookFormulas(
  chapters: ChapterItem[],
): BookFormulaItem[] {
  const list: BookFormulaItem[] = [];
  chapters.forEach((c) => {
    c.extractedFormulas.forEach((f) => {
      if (
        f.trim() &&
        !list.some((existing) => existing.formula === f.trim())
      ) {
        list.push({
          formula: f.trim(),
          chapterTitle: c.title,
          chapterIndex: c.index,
        });
      }
    });
  });
  return list;
}
