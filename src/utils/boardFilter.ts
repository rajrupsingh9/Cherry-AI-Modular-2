/**
 * Dynamic filtering and extraction utility for the Whiteboard Display System.
 * Separates textbook-quality lecture notes from conversational Hinglish chatter/filler words.
 */

export function extractBoardContent(text: string): string {
  if (!text) return "";

  if (text.toLowerCase().includes("<board>")) {
    const blocks: string[] = [];
    let currentIndex = 0;
    const lowerText = text.toLowerCase();
    
    while (true) {
      const openIdx = lowerText.indexOf("<board>", currentIndex);
      if (openIdx === -1) break;
      
      const startContent = openIdx + 7;
      const closeIdx = lowerText.indexOf("</board>", startContent);
      
      if (closeIdx !== -1) {
        let content = text.slice(startContent, closeIdx).trim();
        content = content.replace(/^([\\/nN\s]+)/gi, "");
        content = content.replace(/[\\/]+n$/gi, "");
        content = content.replace(/[\\/]n(?![a-z])/gi, "\n");
        blocks.push(content.trim());
        currentIndex = closeIdx + 8;
      } else {
        let content = text.slice(startContent).trim();
        content = content.replace(/^([\\/nN\s]+)/gi, "");
        content = content.replace(/[\\/]+n$/gi, "");
        content = content.replace(/[\\/]n(?![a-z])/gi, "\n");
        blocks.push(content.trim());
        break;
      }
    }
    
    return blocks.filter(Boolean).join("\n\n");
  }

  return text.trim();
}

export function sanitizeRawBoardData(data: string): string {
  if (!data) return "";
  let cleaned = data;
  cleaned = cleaned.replace(/<board>/gi, "").replace(/<\/board>/gi, "");
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\r\n/g, "\n");
  return cleaned.trim();
}

export function cleanTopicHeader(rawText: string, fallbackSubject?: string, fallbackIndex?: number): string {
  if (!rawText || !rawText.trim()) {
    const idx = (fallbackIndex !== undefined) ? fallbackIndex + 1 : 1;
    return `${fallbackSubject || "Topic"} ${idx}`;
  }
  let title = rawText.split("\n")[0].trim();
  title = title.replace(/^[#*\-•\d.]+\s*/, "").replace(/[*_~`]/g, "").trim();
  if (!title) {
    const idx = (fallbackIndex !== undefined) ? fallbackIndex + 1 : 1;
    return `${fallbackSubject || "Topic"} ${idx}`;
  }
  return title.slice(0, 80);
}

export function filterBoardContentByPhase(content: string, phase?: string, isCurrent?: boolean): string {
  if (!content) return "";
  const sanitized = sanitizeRawBoardData(content);
  return sanitized;
}

export function smartMergeWhiteboardNotes(prev: string, incoming: string, append?: boolean): string {
  const cleanIncoming = sanitizeRawBoardData(incoming);
  if (!prev || !prev.trim() || !append) {
    return cleanIncoming;
  }
  if (!cleanIncoming || !cleanIncoming.trim()) {
    return prev;
  }
  if (prev.includes(cleanIncoming)) {
    return prev;
  }
  return `${prev.trim()}\n\n---\n\n${cleanIncoming}`;
}
