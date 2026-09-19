/**
 * SVG Sanitization Utility
 * Strips script tags, event handlers, and dangerous attributes.
 */

export function sanitizeSvg(svgContent: string): string {
  if (!svgContent) return "";
  let clean = svgContent;
  // Remove script elements
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove inline on* handlers (onclick, onload, onerror, etc.)
  clean = clean.replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");
  // Remove javascript: pseudo protocol
  clean = clean.replace(/href\s*=\s*['"]javascript:[^'"]*['"]/gi, "");
  return clean;
}
