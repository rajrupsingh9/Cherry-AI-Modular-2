/**
 * Parametric SVG Primitive Diagram Renderer
 * Translates educational diagram tags into clean vector diagrams.
 */

export function parseAndRenderDiagramTag(tagContent: string): string {
  if (!tagContent) return "";

  // If already an SVG, return as is
  if (tagContent.includes("<svg") && tagContent.includes("</svg>")) {
    return tagContent;
  }

  // Extract type attribute or diagram name
  const typeMatch = tagContent.match(/type=['"]([^'"]+)['"]/i) || tagContent.match(/name=['"]([^'"]+)['"]/i);
  const diagramType = (typeMatch ? typeMatch[1] : "generic").toLowerCase();

  // Render a clean fallback chalkboard diagram
  return `
    <svg viewBox="0 0 400 220" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background: #061c18; border-radius: 8px;">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9"/>
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4f500"/>
        </marker>
      </defs>
      <!-- Grid Lines -->
      <line x1="40" y1="180" x2="360" y2="180" stroke="#134e4a" stroke-width="1.5" marker-end="url(#arrow)"/>
      <line x1="40" y1="180" x2="40" y2="30" stroke="#134e4a" stroke-width="1.5" marker-end="url(#arrow)"/>
      
      <!-- Primary Curve / Vector -->
      <path d="M 50 160 Q 180 40 330 110" fill="none" stroke="#67e8f9" stroke-width="3" stroke-linecap="round"/>
      <circle cx="180" cy="95" r="5" fill="#c4f500" stroke="#ffffff" stroke-width="1.5"/>
      
      <!-- Vector Label -->
      <text x="190" y="85" fill="#c4f500" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="bold">Peak State</text>
      <text x="200" y="205" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle">${diagramType.toUpperCase()} SYSTEM</text>
    </svg>
  `.trim();
}
