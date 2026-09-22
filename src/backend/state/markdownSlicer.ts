import { sanitizeRawBoardData } from "../../utils/boardFilter";

/**
 * Splits extracted syllabus or document Markdown into distinct pedagogical topic blocks.
 */
export function sliceMarkdownToTopics(markdown: string): string[] {
  if (!markdown || !markdown.trim()) return [];

  // Filter out top-level metadata lines like # Chapter:, ## Subject:, or [DOC_TYPE: ...]
  const lines = markdown.split("\n");
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^#+\s*(Chapter|Title|Subject)\s*:/i.test(trimmed) ||
      /^\[DOC_TYPE:[^\]]*\]/i.test(trimmed)
    ) {
      continue;
    }
    cleanedLines.push(line);
  }

  const cleanedMarkdown = cleanedLines.join("\n").trim();
  if (!cleanedMarkdown) {
    return [markdown.trim()];
  }

  // Count Level 1 headers (# ) that represent actual topics
  const level1Matches = cleanedMarkdown.match(/^#\s+[^#\n]+/gm) || [];
  const level1Count = level1Matches.length;
  // Count Level 2 headers (## ) that represent topics or subtopics
  const level2Matches = cleanedMarkdown.match(/^##\s+[^#\n]+/gm) || [];
  const level2Count = level2Matches.length;

  let rawBlocks: string[] = [];

  if (level1Count >= 2) {
    // Split cleanly on Level 1 headers (# ) so all sub-sections (##, ###), formulas, and diagrams remain intact
    const splitRegex = /(?=^#\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else if (level2Count >= 2 && level1Count <= 1) {
    // If only one or zero Level 1 header, split on Level 2 headers (## )
    const splitRegex = /(?=^##\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else {
    // Single topic or notes without standard markdown headings
    const paragraphs = cleanedMarkdown.split(/\n\s*\n+/);
    if (paragraphs.length >= 4) {
      const grouped: string[] = [];
      let temp = "";
      for (const p of paragraphs) {
        if (temp && (temp + "\n\n" + p).length > 600) {
          grouped.push(temp.trim());
          temp = p;
        } else {
          temp = temp ? temp + "\n\n" + p : p;
        }
      }
      if (temp.trim()) grouped.push(temp.trim());
      rawBlocks = grouped;
    } else {
      rawBlocks = [cleanedMarkdown];
    }
  }

  // Sanitize blocks: merge any stub/empty blocks with the following block
  const validTopics: string[] = [];
  let pendingHeader = "";

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const contentWithoutHeader = trimmed.replace(/^#+\s*[^\n]+\n?/, "").trim();
    if (contentWithoutHeader.length < 20 && rawBlocks.length > 1) {
      pendingHeader = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
    } else {
      const combined = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
      pendingHeader = "";
      validTopics.push(combined);
    }
  }

  if (pendingHeader && validTopics.length > 0) {
    validTopics[validTopics.length - 1] += "\n\n" + pendingHeader;
  } else if (pendingHeader) {
    validTopics.push(pendingHeader);
  }

  return validTopics.length > 0 ? validTopics : [markdown.trim()];
}

/**
 * Formats a given topic markdown chunk into a sanitized source blackboard presentation block.
 */
export function generateSourceContentBlock(topicMarkdown: string, topicIndex: number): string {
  if (!topicMarkdown || !topicMarkdown.trim()) return "";

  const lines = topicMarkdown.split("\n");
  let mainTitle = "";
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (!mainTitle && line.trim().startsWith("#")) {
      mainTitle = line.trim();
    } else {
      bodyLines.push(line);
    }
  }

  if (!mainTitle) {
    mainTitle = `# TOPIC PART ${topicIndex + 1}`;
  }

  const cleanBody = bodyLines.join("\n").trim();
  const rawResult = !cleanBody ? `${mainTitle}\n\n${topicMarkdown.trim()}` : `${mainTitle}\n\n${cleanBody}`;
  return sanitizeRawBoardData(rawResult);
}
