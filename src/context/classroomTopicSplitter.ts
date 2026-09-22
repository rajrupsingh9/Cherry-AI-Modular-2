/**
 * classroomTopicSplitter.ts
 * Parses syllabus or uploaded document markdown into separate pedagogical topics.
 */

export function splitDocumentIntoTopics(rawMarkdown: string): string[] {
  const raw = rawMarkdown || "";
  if (!raw.trim()) {
    return [];
  }

  const lines = raw.split("\n");
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
    return [raw];
  }

  const level1Matches = cleanedMarkdown.match(/^#\s+[^#\n]+/gm) || [];
  const level1Count = level1Matches.length;
  const level2Matches = cleanedMarkdown.match(/^##\s+[^#\n]+/gm) || [];
  const level2Count = level2Matches.length;

  let rawBlocks: string[] = [];

  if (level1Count >= 2) {
    const splitRegex = /(?=^#\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else if (level2Count >= 2 && level1Count <= 1) {
    const splitRegex = /(?=^##\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else {
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

  return validTopics.length > 0 ? validTopics : [raw];
}
