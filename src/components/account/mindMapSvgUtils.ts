/**
 * Mind Map SVG generation & high-definition download utilities
 * Handles high-resolution vector layout, LaTeX transliteration, and multi-format export (SVG, PDF, PNG).
 */

export interface DownloadMindMapOptions {
  format: "png" | "svg" | "pdf";
  revisionDeckData: any;
  activeRevisionSession?: any;
  subject?: string;
  grade?: any;
  mindMapStyle?: "slate" | "pastel";
}

export const getPastelTheme = (index: number) => {
  const themes = [
    {
      fill: "#ffccd5",
      stroke: "#db2777",
      text: "#831843",
      badgeBg: "#fbc4b6",
      badgeText: "#450a0a",
    }, // Pink
    {
      fill: "#ffe3cc",
      stroke: "#ea580c",
      text: "#7c2d12",
      badgeBg: "#fed7aa",
      badgeText: "#431407",
    }, // Peach Orange
    {
      fill: "#f3e8ff",
      stroke: "#7c3aed",
      text: "#4c1d95",
      badgeBg: "#e9d5ff",
      badgeText: "#2e1065",
    }, // Lavender Purple
    {
      fill: "#e2faf5",
      stroke: "#0d9488",
      text: "#115e59",
      badgeBg: "#ccfbf1",
      badgeText: "#042f2e",
    }, // Mint Green
    {
      fill: "#fff9db",
      stroke: "#eab308",
      text: "#713f12",
      badgeBg: "#fef08a",
      badgeText: "#422006",
    }, // Soft Yellow
  ];
  return themes[index % themes.length];
};

export const getSubNodePastelTheme = (parentIdx: number) => {
  const subThemes = [
    { fill: "#ccfbf1", stroke: "#0d9488", text: "#042f2e" }, // Mint Green
    { fill: "#f3e8ff", stroke: "#7c3aed", text: "#2e1065" }, // Lavender Purple
    { fill: "#ffe3cc", stroke: "#ea580c", text: "#431407" }, // Orange/Peach
    { fill: "#ffccd5", stroke: "#db2777", text: "#831843" }, // Coral/Pink
    { fill: "#fff9db", stroke: "#eab308", text: "#422006" }, // Soft Yellow
  ];
  return subThemes[(parentIdx + 1) % subThemes.length];
};

export const getSubItems = (node: any) => {
  if (!node) return [];
  const concepts = node.keyConcepts || node.coreConcepts || [];
  const takeaways = node.subNodes || node.quickTakeaways || [];
  const items: {
    type: "concept" | "formula" | "tip";
    text: string;
    label: string;
  }[] = [];
  if (node.keyFormula) {
    items.push({
      type: "formula",
      text: node.keyFormula,
      label: "📐 Formula",
    });
  }
  concepts.forEach((concept: string, idx: number) => {
    items.push({
      type: "concept",
      text: concept,
      label: `🧠 Concept ${idx + 1}`,
    });
  });
  takeaways.forEach((takeaway: string, idx: number) => {
    items.push({
      type: "tip",
      text: takeaway,
      label: `💡 Exam Tip ${idx + 1}`,
    });
  });
  return items;
};

export function downloadMindMap({
  format,
  revisionDeckData,
  activeRevisionSession,
  subject,
  grade,
  mindMapStyle = "slate",
}: DownloadMindMapOptions) {
  // Helper to transform LaTeX formulas into clean, readable Unicode math text
  const formatLatexToReadable = (text: string): string => {
    if (!text) return "";
    let formatted = text;

    const subscripts: { [key: string]: string } = {
      "0": "₀",
      "1": "₁",
      "2": "₂",
      "3": "₃",
      "4": "₄",
      "5": "₅",
      "6": "₆",
      "7": "₇",
      "8": "₈",
      "9": "₉",
      a: "ₐ",
      e: "ₑ",
      o: "ₒ",
      x: "ₓ",
      h: "ₕ",
      k: "ₖ",
      l: "ₗ",
      m: "ₘ",
      n: "ₙ",
      p: "ₚ",
      s: "ₛ",
      t: "ₜ",
      i: "ᵢ",
      j: "ⱼ",
    };

    // Convert subscripts first to eliminate nested braces
    for (let i = 0; i < 5; i++) {
      formatted = formatted.replace(/_\{([a-zA-Z0-9]+)\}/g, (_, chars) => {
        return chars
          .split("")
          .map((c: string) => subscripts[c] || c)
          .join("");
      });
      formatted = formatted.replace(
        /_([a-zA-Z0-9])/g,
        (_, char) => subscripts[char] || char,
      );
    }

    // Replace LaTeX frac with division slash
    for (let i = 0; i < 5; i++) {
      formatted = formatted.replace(
        /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
        "$1/$2",
      );
      formatted = formatted.replace(
        /\\frac\(([^()]+)\)\(([^()]+)\)/g,
        "$1/$2",
      );
    }

    // LaTeX macros mapping
    formatted = formatted.replace(/\\neq\b/g, "≠");
    formatted = formatted.replace(/\\neq/g, "≠");
    formatted = formatted.replace(/\\quad\b/g, "  ");
    formatted = formatted.replace(/\\text\{([^{}]+)\}/g, "$1");
    formatted = formatted.replace(/\\Rightarrow\b/g, "⇒");
    formatted = formatted.replace(/\\Rightarrow/g, "⇒");
    formatted = formatted.replace(/\\dots\b/g, "...");
    formatted = formatted.replace(/\\dots/g, "...");
    formatted = formatted.replace(/\\cdot\b/g, "·");
    formatted = formatted.replace(/\\cdot/g, "·");
    formatted = formatted.replace(/\\pm\b/g, "±");
    formatted = formatted.replace(/\\pm/g, "±");
    formatted = formatted.replace(/\\ge\b/g, "≥");
    formatted = formatted.replace(/\\le\b/g, "≤");
    formatted = formatted.replace(/\\geq\b/g, "≥");
    formatted = formatted.replace(/\\leq\b/g, "≤");
    formatted = formatted.replace(/\\ge/g, "≥");
    formatted = formatted.replace(/\\le/g, "≤");
    formatted = formatted.replace(/\\geq/g, "≥");
    formatted = formatted.replace(/\\leq/g, "≤");
    formatted = formatted.replace(/\\approx\b/g, "≈");
    formatted = formatted.replace(/\\approx/g, "≈");

    // Greek letters mapping
    formatted = formatted.replace(/\\alpha\b/g, "α");
    formatted = formatted.replace(/\\beta\b/g, "β");
    formatted = formatted.replace(/\\gamma\b/g, "γ");
    formatted = formatted.replace(/\\theta\b/g, "θ");
    formatted = formatted.replace(/\\delta\b/g, "δ");
    formatted = formatted.replace(/\\Delta\b/g, "Δ");
    formatted = formatted.replace(/\\lambda\b/g, "λ");
    formatted = formatted.replace(/\\pi\b/g, "π");
    formatted = formatted.replace(/\\omega\b/g, "ω");
    formatted = formatted.replace(/\\phi\b/g, "φ");
    formatted = formatted.replace(/\\sigma\b/g, "σ");
    formatted = formatted.replace(/\\mu\b/g, "μ");
    formatted = formatted.replace(/\\tau\b/g, "τ");

    // Remove math dollar boundaries
    formatted = formatted.replace(/\$\$/g, "");
    formatted = formatted.replace(/\$/g, "");

    // Normalize spaces
    formatted = formatted.replace(/ \s+/g, " ");

    return formatted.trim();
  };

  // Utility functions to wrap text elegantly
  const wrapText = (text: string, maxCharsPerLine: number = 28): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapParentText = (text: string, maxLen: number = 22): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length <= maxLen) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper to generate the beautifully crafted, high-definition complete SVG
  const generateFullDetailedMindMapSVG = () => {
    const nodes = revisionDeckData?.mindMap?.nodes || [];
    const subjectName =
      activeRevisionSession?.subject || subject || "Syllabus";
    const chapterTitle =
      activeRevisionSession?.processedTitle ||
      revisionDeckData?.mindMap?.title ||
      "Concept Mind Map";
    const gradeLevel = grade || "10";

    // Canvas config for complete layout
    const width = 1600;
    const height = 1200;
    const cx = 800;
    const cy = 600;
    const rx = 380;
    const ry = 280;
    const subDist = 210; // Comfortable distance for fanning out cards

    let svgContent = "";

    // 1. Gradients and Filters definition
    if (mindMapStyle === "pastel") {
      svgContent += `
        <defs>
          <linearGradient id="dl-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF6F0" />
            <stop offset="100%" stop-color="#FAF6F0" />
          </linearGradient>
          <linearGradient id="dl-hub-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#b4a4eb" />
            <stop offset="100%" stop-color="#9f86f0" />
          </linearGradient>
          <linearGradient id="dl-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#fcfbf9" />
          </linearGradient>
          <filter id="dl-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.08" />
          </filter>
          <marker id="dl-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4b5563" />
          </marker>
        </defs>
      `;
    } else {
      svgContent += `
        <defs>
          <linearGradient id="dl-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#021417" />
            <stop offset="50%" stop-color="#051e22" />
            <stop offset="100%" stop-color="#0c2e2c" />
          </linearGradient>
          <linearGradient id="dl-hub-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0d9488" />
            <stop offset="100%" stop-color="#0f766e" />
          </linearGradient>
          <linearGradient id="dl-node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#114c47" />
            <stop offset="100%" stop-color="#0d3c38" />
          </linearGradient>
          <linearGradient id="dl-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#071b1e" />
            <stop offset="100%" stop-color="#031113" />
          </linearGradient>
          <filter id="dl-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.6" />
          </filter>
        </defs>
      `;
    }

    // Backdrop
    svgContent += `
      <rect width="${width}" height="${height}" fill="url(#dl-bg-grad)" />
      
      <!-- Background organic grid design -->
      <g opacity="${mindMapStyle === "pastel" ? "0.6" : "0.12"}">
    `;
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        svgContent += `<circle cx="${x}" cy="${y}" r="1" fill="${mindMapStyle === "pastel" ? "#e5dcd0" : "#2dd4bf"}" />`;
      }
    }
    svgContent += `</g>`;

    // Outer safety border ring
    svgContent += `
      <circle cx="${cx}" cy="${cy}" r="${rx}" fill="none" stroke="${mindMapStyle === "pastel" ? "#e5dcd0" : "#114c47"}" stroke-width="1.5" stroke-dasharray="12 12" opacity="0.4" />
      <circle cx="${cx}" cy="${cy}" r="${rx + subDist}" fill="none" stroke="${mindMapStyle === "pastel" ? "#e5dcd0" : "#2dd4bf"}" stroke-width="1" stroke-dasharray="6 8" opacity="0.3" />
    `;

    // 2. Draw Connection Lines: Hub to Parent Nodes
    const N = nodes.length || 1;
    nodes.forEach((_: any, index: number) => {
      const angle = (2 * Math.PI * index) / N - Math.PI / 2;
      const targetX = cx + rx * Math.cos(angle);
      const targetY = cy + ry * Math.sin(angle);

      const pTheme = getPastelTheme(index);

      if (mindMapStyle === "pastel") {
        svgContent += `
          <!-- Connection to Topic ${index + 1} -->
          <line 
            x1="${cx}" 
            y1="${cy}" 
            x2="${targetX}" 
            y2="${targetY}" 
            stroke="${pTheme.stroke}" 
            stroke-width="2" 
            stroke-linecap="round"
            marker-end="url(#dl-arrow-head)"
          />
        `;
      } else {
        svgContent += `
          <!-- Connection to Topic ${index + 1} -->
          <line 
            x1="${cx}" 
            y1="${cy}" 
            x2="${targetX}" 
            y2="${targetY}" 
            stroke="#114c47" 
            stroke-width="3.5" 
            stroke-linecap="round"
          />
          <line 
            x1="${cx}" 
            y1="${cy}" 
            x2="${targetX}" 
            y2="${targetY}" 
            stroke="#2dd4bf" 
            stroke-width="1.5" 
            stroke-dasharray="8 6" 
            opacity="0.75"
          />
        `;
      }
    });

    // 3. Draw Sub-branch Connections and Detailed Cards
    nodes.forEach((node: any, index: number) => {
      const angle = (2 * Math.PI * index) / N - Math.PI / 2;
      const targetX = cx + rx * Math.cos(angle);
      const targetY = cy + ry * Math.sin(angle);

      const subItems = getSubItems(node);
      const K = subItems.length;
      if (K === 0) return;

      // Categorize node into sector (left, right, top, bottom) to prevent overlapping
      let sector: "top" | "bottom" | "left" | "right" = "top";
      if (targetX < cx - 80) {
        sector = "left";
      } else if (targetX > cx + 80) {
        sector = "right";
      } else if (targetY < cy) {
        sector = "top";
      } else {
        sector = "bottom";
      }

      subItems.forEach((subItem: any, i: number) => {
        let subX = targetX;
        let subY = targetY;
        let parentConnectorX = targetX;
        let parentConnectorY = targetY;
        let childConnectorX = targetX;
        let childConnectorY = targetY;

        const cardW = 195;
        const cardH = 95;

        if (sector === "left") {
          // Stack vertically in a column on the left side
          const vSpacing = 112;
          const startY = targetY - ((K - 1) * vSpacing) / 2;
          subX = targetX - 225;
          subY = startY + i * vSpacing;

          parentConnectorX = targetX - 105; // Left edge of parent capsule
          parentConnectorY = targetY;
          childConnectorX = subX + cardW / 2; // Right edge of child card
          childConnectorY = subY;
        } else if (sector === "right") {
          // Stack vertically in a column on the right side
          const vSpacing = 112;
          const startY = targetY - ((K - 1) * vSpacing) / 2;
          subX = targetX + 225;
          subY = startY + i * vSpacing;

          parentConnectorX = targetX + 105; // Right edge of parent capsule
          parentConnectorY = targetY;
          childConnectorX = subX - cardW / 2; // Left edge of child card
          childConnectorY = subY;
        } else if (sector === "top") {
          // Align horizontally above
          if (K <= 3) {
            const hSpacing = 215;
            const startX = targetX - ((K - 1) * hSpacing) / 2;
            subX = startX + i * hSpacing;
            subY = targetY - 145;
          } else {
            // Split into two neat rows to prevent side-clipping
            const row1Count = Math.min(3, Math.ceil(K / 2));
            const row2Count = K - row1Count;
            if (i < row1Count) {
              const startX = targetX - ((row1Count - 1) * 215) / 2;
              subX = startX + i * 215;
              subY = targetY - 105;
            } else {
              const row2Idx = i - row1Count;
              const startX = targetX - ((row2Count - 1) * 215) / 2;
              subX = startX + row2Idx * 215;
              subY = targetY - 220;
            }
          }

          parentConnectorX = targetX;
          parentConnectorY = targetY - 28; // Top edge of parent capsule
          childConnectorX = subX;
          childConnectorY = subY + cardH / 2; // Bottom edge of child card
        } else {
          // Align horizontally below
          if (K <= 3) {
            const hSpacing = 215;
            const startX = targetX - ((K - 1) * hSpacing) / 2;
            subX = startX + i * hSpacing;
            subY = targetY + 145;
          } else {
            const row1Count = Math.min(3, Math.ceil(K / 2));
            const row2Count = K - row1Count;
            if (i < row1Count) {
              const startX = targetX - ((row1Count - 1) * 215) / 2;
              subX = startX + i * 215;
              subY = targetY + 105;
            } else {
              const row2Idx = i - row1Count;
              const startX = targetX - ((row2Count - 1) * 215) / 2;
              subX = startX + row2Idx * 215;
              subY = targetY + 220;
            }
          }

          parentConnectorX = targetX;
          parentConnectorY = targetY + 28; // Bottom edge of parent capsule
          childConnectorX = subX;
          childConnectorY = subY - cardH / 2; // Top edge of child card
        }

        const cardX = subX - cardW / 2;
        const cardY = subY - cardH / 2;

        const pTheme = getPastelTheme(index);
        const subTheme = getSubNodePastelTheme(index);

        let typeLabel = "";
        let accentColor = "#38bdf8"; // Concept (sky blue)
        if (subItem.type === "formula") {
          typeLabel = "📐 RULE / FORMULA";
          accentColor =
            mindMapStyle === "pastel" ? subTheme.stroke : "#f59e0b"; // Formula (amber)
        } else if (subItem.type === "tip") {
          typeLabel = "💡 EXAM PRO-TIP";
          accentColor =
            mindMapStyle === "pastel" ? subTheme.stroke : "#10b981"; // Tip (emerald)
        } else {
          typeLabel = "🧠 KEY CONCEPT";
          accentColor =
            mindMapStyle === "pastel" ? subTheme.stroke : "#38bdf8";
        }

        // Connector line from parent node to sub-card
        if (mindMapStyle === "pastel") {
          svgContent += `
            <line 
              x1="${parentConnectorX}" 
              y1="${parentConnectorY}" 
              x2="${childConnectorX}" 
              y2="${childConnectorY}" 
              stroke="${pTheme.stroke}" 
              stroke-width="1.5" 
              marker-end="url(#dl-arrow-head)"
            />
          `;
        } else {
          svgContent += `
            <line 
              x1="${parentConnectorX}" 
              y1="${parentConnectorY}" 
              x2="${childConnectorX}" 
              y2="${childConnectorY}" 
              stroke="${accentColor}" 
              stroke-width="1.8" 
              stroke-dasharray="4 3.5" 
              opacity="0.85"
            />
            <circle cx="${childConnectorX}" cy="${childConnectorY}" r="3.5" fill="${accentColor}" />
          `;
        }

        const cardFill =
          mindMapStyle === "pastel" ? subTheme.fill : "url(#dl-card-grad)";
        const cardStroke =
          mindMapStyle === "pastel" ? subTheme.stroke : accentColor;
        const labelFill =
          mindMapStyle === "pastel" ? subTheme.text : accentColor;
        const textFill =
          mindMapStyle === "pastel" ? subTheme.text : "#e2e8f0";

        // Beautiful detailed card container with shadow
        svgContent += `
          <g filter="url(#dl-shadow)">
            <rect 
              x="${cardX}" 
              y="${cardY}" 
              width="${cardW}" 
              height="${cardH}" 
              rx="12" 
              ry="12" 
              fill="${cardFill}" 
              stroke="${cardStroke}" 
              stroke-width="1.5" 
            />
            
            <!-- Subtle accent top header plate -->
            <path 
              d="M ${cardX + 12} ${cardY} L ${cardX + cardW - 12} ${cardY} A 12 12 0 0 1 ${cardX + cardW} ${cardY + 12} L ${cardX + cardW} ${cardY + 22} L ${cardX} ${cardY + 22} L ${cardX} ${cardY + 12} A 12 12 0 0 1 ${cardX + 12} ${cardY} Z" 
              fill="${cardStroke}" 
              opacity="0.08"
            />
            
            <!-- Header badge text inside card -->
            <text 
              x="${subX}" 
              y="${cardY + 14}" 
              text-anchor="middle" 
              fill="${labelFill}" 
              font-size="8.5" 
              font-weight="900" 
              font-family="'JetBrains Mono', monospace" 
              letter-spacing="1"
            >
              ${typeLabel}
            </text>
        `;

        // Wrap actual detailed text content beautifully
        const readableText = formatLatexToReadable(subItem.text);
        const wrappedLines = wrapText(readableText, 28);
        const displayLines = wrappedLines.slice(0, 4); // Show maximum 4 lines to fit card neatly
        const lineCount = displayLines.length;

        // Vertically center the text lines inside card body
        const textBlockHeight = lineCount * 12;
        const startY = subY + 11 - textBlockHeight / 2;

        displayLines.forEach((lineText: string, lineIdx: number) => {
          // Escape any XML entities to ensure output SVG parses cleanly
          const escapedText = lineText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

          const isLastLineTruncated =
            lineIdx === 3 && wrappedLines.length > 4;
          const lineToRender = isLastLineTruncated
            ? escapedText.slice(0, 24) + "..."
            : escapedText;

          svgContent += `
            <text 
              x="${subX}" 
              y="${startY + lineIdx * 12}" 
              text-anchor="middle" 
              fill="${textFill}" 
              font-size="8.5" 
              font-weight="600" 
              font-family="'Inter', system-ui, sans-serif"
            >
              ${lineToRender}
            </text>
          `;
        });

        svgContent += `</g>`;
      });
    });

    // 4. Draw Parent Node Capsules (Drawn on top of lines for high-quality layering)
    nodes.forEach((node: any, index: number) => {
      const angle = (2 * Math.PI * index) / N - Math.PI / 2;
      const targetX = cx + rx * Math.cos(angle);
      const targetY = cy + ry * Math.sin(angle);

      const capW = 210;
      const capH = 56;
      const capX = targetX - capW / 2;
      const capY = targetY - capH / 2;

      const topicName = node.topicName || `Topic ${index + 1}`;
      const wrappedName = wrapParentText(topicName, 22);

      const pTheme = getPastelTheme(index);

      if (mindMapStyle === "pastel") {
        svgContent += `
          <!-- Topic Capsule ${index + 1} -->
          <g filter="url(#dl-shadow)">
            <rect 
              x="${capX}" 
              y="${capY}" 
              width="${capW}" 
              height="${capH}" 
              rx="14" 
              ry="14" 
              fill="${pTheme.fill}" 
              stroke="${pTheme.stroke}" 
              stroke-width="2" 
            />
            
            <!-- Left-side vertical indicator strip -->
            <rect 
              x="${capX + 8}" 
              y="${capY + 8}" 
              width="4" 
              height="${capH - 16}" 
              rx="2" 
              fill="${pTheme.stroke}" 
            />
            
            <!-- Bullet Badge counter index -->
            <circle 
              cx="${capX + 26}" 
              cy="${targetY}" 
              r="10" 
              fill="${pTheme.stroke}" 
              stroke="${pTheme.text}" 
              stroke-width="1.5" 
            />
            <text 
              x="${capX + 26}" 
              y="${targetY + 3.5}" 
              text-anchor="middle" 
              fill="#ffffff" 
              font-size="9" 
              font-weight="900" 
              font-family="'JetBrains Mono', monospace"
            >
              ${index + 1}
            </text>
        `;

        if (wrappedName.length <= 1) {
          const line = wrappedName[0] || topicName;
          svgContent += `
            <text 
              x="${capX + 46}" 
              y="${targetY + 4}" 
              fill="${pTheme.text}" 
              font-size="11.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${line.toUpperCase()}
            </text>
          `;
        } else {
          svgContent += `
            <text 
              x="${capX + 46}" 
              y="${targetY - 2}" 
              fill="${pTheme.text}" 
              font-size="10.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${wrappedName[0].toUpperCase()}
            </text>
            <text 
              x="${capX + 46}" 
              y="${targetY + 10}" 
              fill="${pTheme.stroke}" 
              font-size="9.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${wrappedName[1].toUpperCase()}
            </text>
          `;
        }
      } else {
        svgContent += `
          <!-- Topic Capsule ${index + 1} -->
          <g filter="url(#dl-shadow)">
            <rect 
              x="${capX}" 
              y="${capY}" 
              width="${capW}" 
              height="${capH}" 
              rx="14" 
              ry="14" 
              fill="url(#dl-node-grad)" 
              stroke="#0f766e" 
              stroke-width="2" 
            />
            
            <!-- Left-side vertical indicator strip -->
            <rect 
              x="${capX + 8}" 
              y="${capY + 8}" 
              width="4" 
              height="${capH - 16}" 
              rx="2" 
              fill="#2dd4bf" 
            />
            
            <!-- Bullet Badge counter index -->
            <circle 
              cx="${capX + 26}" 
              cy="${targetY}" 
              r="10" 
              fill="#0c2e2c" 
              stroke="#2dd4bf" 
              stroke-width="1.5" 
            />
            <text 
              x="${capX + 26}" 
              y="${targetY + 3.5}" 
              text-anchor="middle" 
              fill="#2dd4bf" 
              font-size="9" 
              font-weight="900" 
              font-family="'JetBrains Mono', monospace"
            >
              ${index + 1}
            </text>
        `;

        if (wrappedName.length <= 1) {
          const line = wrappedName[0] || topicName;
          svgContent += `
            <text 
              x="${capX + 46}" 
              y="${targetY + 4}" 
              fill="#ffffff" 
              font-size="11.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${line.toUpperCase()}
            </text>
          `;
        } else {
          svgContent += `
            <text 
              x="${capX + 46}" 
              y="${targetY - 2}" 
              fill="#ffffff" 
              font-size="10.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${wrappedName[0].toUpperCase()}
            </text>
            <text 
              x="${capX + 46}" 
              y="${targetY + 10}" 
              fill="#2dd4bf" 
              font-size="9.5" 
              font-weight="800" 
              font-family="'Inter', system-ui, sans-serif"
              letter-spacing="0.3"
            >
              ${wrappedName[1].toUpperCase()}
            </text>
          `;
        }
      }

      svgContent += `</g>`;
    });

    // 5. Draw Central Hub Bubble (Drawn on top at exact center)
    const hubW = 290;
    const hubH = 92;
    const hubX = cx - hubW / 2;
    const hubY = cy - hubH / 2;

    if (mindMapStyle === "pastel") {
      svgContent += `
        <!-- Central Hub -->
        <g filter="url(#dl-shadow)">
          <rect 
            x="${hubX}" 
            y="${hubY}" 
            width="${hubW}" 
            height="${hubH}" 
            rx="24" 
            ry="24" 
            fill="url(#dl-hub-grad)" 
            stroke="#7c3aed" 
            stroke-width="3" 
          />
          <!-- Highlighting Yellow crown banner -->
          <rect 
            x="${cx - 65}" 
            y="${hubY - 6}" 
            width="130" 
            height="18" 
            rx="6" 
            ry="6" 
            fill="#ffca28" 
          />
          <text 
            x="${cx}" 
            y="${hubY + 6}" 
            text-anchor="middle" 
            fill="#3e2723" 
            font-size="8.5" 
            font-weight="900" 
            font-family="'JetBrains Mono', monospace" 
            letter-spacing="1.5"
          >
            REVISION CENTER
          </text>
          
          <text 
            x="${cx}" 
            y="${cy + 8}" 
            text-anchor="middle" 
            fill="#ffffff" 
            font-size="14" 
            font-weight="900" 
            font-family="'Inter', system-ui, sans-serif" 
            letter-spacing="0.5"
          >
            ${subjectName.toUpperCase()}
          </text>
          
          <text 
            x="${cx}" 
            y="${cy + 27}" 
            text-anchor="middle" 
            fill="#fdfaf6" 
            font-size="9.5" 
            font-weight="800" 
            font-family="'Inter', system-ui, sans-serif" 
            letter-spacing="0.5"
            opacity="0.9"
          >
            CLASS ${gradeLevel} • ${chapterTitle.toUpperCase().slice(0, 36)}
          </text>
        </g>
      `;
    } else {
      svgContent += `
        <!-- Central Hub -->
        <g filter="url(#dl-shadow)">
          <rect 
            x="${hubX}" 
            y="${hubY}" 
            width="${hubW}" 
            height="${hubH}" 
            rx="24" 
            ry="24" 
            fill="url(#dl-hub-grad)" 
            stroke="#2dd4bf" 
            stroke-width="3" 
          />
          <!-- Highlighting Orange crown banner -->
          <rect 
            x="${cx - 65}" 
            y="${hubY - 6}" 
            width="130" 
            height="18" 
            rx="6" 
            ry="6" 
            fill="#f59e0b" 
          />
          <text 
            x="${cx}" 
            y="${hubY + 6}" 
            text-anchor="middle" 
            fill="#0f172a" 
            font-size="8.5" 
            font-weight="900" 
            font-family="'JetBrains Mono', monospace" 
            letter-spacing="1.5"
          >
            REVISION CENTER
          </text>
          
          <text 
            x="${cx}" 
            y="${cy + 8}" 
            text-anchor="middle" 
            fill="#ffffff" 
            font-size="14" 
            font-weight="900" 
            font-family="'Inter', system-ui, sans-serif" 
            letter-spacing="0.5"
          >
            ${subjectName.toUpperCase()}
          </text>
          
          <text 
            x="${cx}" 
            y="${cy + 27}" 
            text-anchor="middle" 
            fill="#e2e8f0" 
            font-size="9.5" 
            font-weight="800" 
            font-family="'Inter', system-ui, sans-serif" 
            letter-spacing="0.5"
            opacity="0.9"
          >
            CLASS ${gradeLevel} • ${chapterTitle.toUpperCase().slice(0, 36)}
          </text>
        </g>
      `;
    }

    // Wrapping inside proper standard XML container
    const finalSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg 
xmlns="http://www.w3.org/2000/svg" 
viewBox="0 0 ${width} ${height}" 
width="${width}" 
height="${height}"
>
<style>
  text {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    user-select: none;
  }
</style>
${svgContent}
</svg>`;

    return finalSvg;
  };

  const title = revisionDeckData?.mindMap?.title || "Concept_Mind_Map";
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_").replace(/__+/g, "_");
  const subName = (
    activeRevisionSession?.subject ||
    subject ||
    "Syllabus"
  ).replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${cleanTitle}_${subName}`;

  const svgString = generateFullDetailedMindMapSVG();

  if (format === "svg") {
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (format === "pdf") {
    // PDF print window with embedded high-resolution SVG
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title} - Concept Mind Map</title>
            <style>
              @page { size: landscape; margin: 8mm; }
              body {
                margin: 0;
                padding: 12px;
                background: #ffffff;
                color: #0f172a;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .header {
                text-align: center;
                margin-bottom: 12px;
                width: 100%;
              }
              .header h1 {
                font-size: 18px;
                font-weight: 900;
                color: #0d9488;
                margin: 0 0 4px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .header p {
                font-size: 11px;
                color: #64748b;
                margin: 0;
                font-weight: 600;
              }
              .svg-container {
                width: 100%;
                max-width: 1000px;
                display: flex;
                justify-content: center;
              }
              .svg-container svg {
                width: 100%;
                height: auto;
                max-height: 85vh;
                border-radius: 12px;
              }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <p>Cherry AI Smart Revision Concept Map • Class ${grade} • ${subName.replace(/_/g, " ")}</p>
            </div>
            <div class="svg-container">
              ${svgString}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  } else {
    // PNG format - convert SVG to high-definition Canvas
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Super high resolution rendering (1600x1200)
      canvas.width = 1600;
      canvas.height = 1200;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw SVG onto canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Clean up object URL
      URL.revokeObjectURL(url);

      // Download PNG
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.onerror = () => {
      // Fallback to direct SVG if PNG rendering fails due to canvas security/conversions
      const fallbackLink = document.createElement("a");
      fallbackLink.href = url;
      fallbackLink.download = `${filename}.svg`;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    };

    img.src = url;
  }
}
