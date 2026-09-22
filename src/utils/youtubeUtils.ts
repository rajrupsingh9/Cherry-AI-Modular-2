/**
 * youtubeUtils.ts
 * Utility for parsing and extracting YouTube Video IDs from various URL formats.
 */

/**
 * Extract YouTube Video ID from standard, mobile, shorts, or embed URLs
 */
export function extractYoutubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Handle standard watch URLs (youtube.com/watch?v=ID)
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // Handle short links (youtu.be/ID)
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) return shortMatch[1];

  // Handle YouTube Shorts (youtube.com/shorts/ID)
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // Handle Embed links (youtube.com/embed/ID)
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  return null;
}
