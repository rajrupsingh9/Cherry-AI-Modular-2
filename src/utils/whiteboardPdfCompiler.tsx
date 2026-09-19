import React from "react";
import katex from "katex";
import { parseAndRenderDiagramTag } from "./parametricPrimitives";
import { sanitizeSvg } from "./sanitizeSvg";

export const escapeHTML = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const sanitizeTitleForPDF = (
  title: string,
  fallbackSubject?: string,
  topicList?: string[],
): string => {
  let firstTopicHeader = "";
  if (topicList && topicList.length > 0) {
    firstTopicHeader = (topicList[0].split("\n")[0] || "")
      .replace(/[#*_]/g, "")
      .replace(/\.(md|markdown|txt|pdf|docx|jpg|jpeg|png|webp|gif)\b/gi, "")
      .trim();
  }

  if (!title) {
    if (firstTopicHeader) {
      return fallbackSubject
        ? `${fallbackSubject} • ${firstTopicHeader}`
        : firstTopicHeader;
    }
    return fallbackSubject
      ? `${fallbackSubject} Classroom Notes`
      : "Classroom Lecture Notes";
  }

  let clean = (title || "")
    .trim()
    .replace(/\.(md|markdown|txt|pdf|docx|jpg|jpeg|png|webp|gif)$/i, "")
    .replace(/\.(md|markdown|txt|pdf|docx|jpg|jpeg|png|webp|gif)\b/gi, "")
    .replace(/^["']|["']$/g, "")
    .replace(/[\_]/g, " ")
    .trim();

  const isRawFileId =
    /^\d{8,}$/.test(clean) ||
    (clean.length > 20 && /^[0-9a-fA-F\-]+$/.test(clean));

  if (isRawFileId) {
    if (firstTopicHeader) {
      return fallbackSubject
        ? `${fallbackSubject} • ${firstTopicHeader}`
        : firstTopicHeader;
    }
    return fallbackSubject
      ? `${fallbackSubject} Lecture Handout`
      : "Classroom Study Handout";
  }

  return clean;
};

export const compileWhiteboardToHTML = (markdown: string): string => {
  if (!markdown || !markdown.trim()) {
    return `<div style="text-align: center; color: #94a3b8; font-family: sans-serif; padding: 20px; font-size: 12px; font-style: italic; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.12);">No blackboard notes written on this topic yet.</div>`;
  }

  // 1. Strip <board> and </board> tags & markdown code block fences wrapping SVG/diagrams
  let cleaned = markdown
    .replace(/<\/?board>/gi, "")
    .replace(/```(?:xml|html|svg|markdown|text|latex|math)?/gi, "")
    .replace(/```/g, "")
    .trim();

  // Convert geometric LaTeX macros to high-fidelity Unicode symbols
  cleaned = cleaned
    .replace(/\\{1,4}hexagon\b/g, "⬡")
    .replace(/\\{1,4}pentagon\b/g, "⬠")
    .replace(/\\{1,4}octagon\b/g, "⯃")
    .replace(/\\{1,4}heptagon\b/g, "⬡")
    .replace(/\\{1,4}triangle\b/g, "△")
    .replace(/\\{1,4}square\b/g, "☐")
    .replace(/\\{1,4}circle\b/g, "◯")
    .replace(/\\{1,4}bigcirc\b/g, "◯")
    .replace(/\\{1,4}rectangle\b/g, "▭")
    .replace(/\\{1,4}parallelogram\b/g, "▱")
    .replace(/\\{1,4}trapezoid\b/g, "⏢")
    .replace(/\\{1,4}kite\b/g, "⬨")
    .replace(/\\{1,4}rhombus\b/g, "◊");

  // Pre-normalize LaTeX markdown delimiters to standard $ and $$ for easier matching
  let normalized = cleaned
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  // Helper to format an SVG or parametric diagram cleanly into a printable PDF container
  const formatSvgForPDF = (rawSvgOrDiagram: string): string => {
    try {
      let processed = rawSvgOrDiagram.trim();
      if (!processed) return "";

      // 1. Resolve parametric <diagram> or <primitive> tags instantly
      if (
        processed.toLowerCase().includes("<diagram") ||
        processed.toLowerCase().includes("<primitive")
      ) {
        const primitiveSvg = parseAndRenderDiagramTag(processed);
        if (primitiveSvg) {
          processed = primitiveSvg;
        }
      }

      // 2. Auto-close unclosed <svg> tag if cut off
      if (
        processed.toLowerCase().includes("<svg") &&
        !processed.toLowerCase().includes("</svg>")
      ) {
        processed = processed + "\n</svg>";
      }

      // 3. Ensure viewBox exists if missing
      if (!processed.includes("viewBox") && !processed.includes("viewbox")) {
        processed = processed.replace(/<svg/i, "<svg viewBox='0 0 400 250'");
      }

      // 4. Ensure SVG is responsive and max-width constrained for PDF print
      processed = processed.replace(
        /\b(width|height)\s*=\s*(['"])[^'"]*\2/gi,
        "",
      );
      processed = processed.replace(
        /<svg([^>]*)>/i,
        `<svg$1 width="100%" height="auto" style="max-height: 280px; max-width: 520px; margin: 0 auto; display: block;">`,
      );

      // 5. Clean LaTeX formulas inside <text> / <tspan> if present
      processed = processed.replace(
        /<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/gi,
        (match, attrs, content) => {
          return `<tspan${attrs}>${content
            .replace(/\\vec\{([a-zA-Z0-9]+)\}/g, "$1→")
            .replace(/\\([a-zA-Z]+)/g, "$1")
            .replace(/[{}]/g, "")}</tspan>`;
        },
      );
      processed = processed.replace(
        /<text\b([^>]*)>([\s\S]*?)<\/text>/gi,
        (match, attrs, content) => {
          return `<text${attrs}>${content
            .replace(/\\vec\{([a-zA-Z0-9]+)\}/g, "$1→")
            .replace(/\\([a-zA-Z]+)/g, "$1")
            .replace(/[{}]/g, "")}</text>`;
        },
      );

      const safeSvg = sanitizeSvg(processed);

      return `
        <div class="vector-diagram-pdf-card" style="margin: 16px auto; padding: 14px; background: #061c18; border: 1.5px solid rgba(103, 232, 249, 0.4); border-radius: 12px; text-align: center; page-break-inside: avoid; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.25); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
          <div style="font-size: 9.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #67e8f9; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 6px;">
            <span>📐 Blackboard Vector Diagram</span>
          </div>
          <div class="vector-svg-stage" style="display: flex; justify-content: center; align-items: center; width: 100%;">
            ${safeSvg}
          </div>
        </div>
      `;
    } catch (err) {
      console.error("formatSvgForPDF error:", err);
      return "";
    }
  };

  // 2. Extract SVG and Diagram blocks first and replace with unique atomic placeholders
  const svgBlocks: string[] = [];
  let tokenized = "";
  let remaining = normalized;

  while (remaining.length > 0) {
    const lower = remaining.toLowerCase();
    const svgIdx = lower.indexOf("<svg");
    const diagIdx = lower.indexOf("<diagram");
    const primIdx = lower.indexOf("<primitive");

    const validIndices = [svgIdx, diagIdx, primIdx].filter((i) => i !== -1);
    if (validIndices.length === 0) {
      tokenized += remaining;
      break;
    }

    const matchIdx = Math.min(...validIndices);
    if (matchIdx > 0) {
      tokenized += remaining.slice(0, matchIdx);
    }

    const rest = remaining.slice(matchIdx);
    const restLower = rest.toLowerCase();

    if (restLower.startsWith("<svg")) {
      const closeIdx = restLower.indexOf("</svg>");
      if (closeIdx !== -1) {
        const svgContent = rest.slice(0, closeIdx + 6);
        const blockPlaceholder = `\n\n@@SVG_BLOCK_${svgBlocks.length}@@\n\n`;
        svgBlocks.push(formatSvgForPDF(svgContent));
        tokenized += blockPlaceholder;
        remaining = rest.slice(closeIdx + 6);
      } else {
        // Unclosed <svg>
        const blockPlaceholder = `\n\n@@SVG_BLOCK_${svgBlocks.length}@@\n\n`;
        svgBlocks.push(formatSvgForPDF(rest));
        tokenized += blockPlaceholder;
        break;
      }
    } else {
      // <diagram> or <primitive>
      const closeTagIdx = rest.indexOf(">");
      if (closeTagIdx !== -1) {
        const tagContent = rest.slice(0, closeTagIdx + 1);
        const blockPlaceholder = `\n\n@@SVG_BLOCK_${svgBlocks.length}@@\n\n`;
        svgBlocks.push(formatSvgForPDF(tagContent));
        tokenized += blockPlaceholder;
        remaining = rest.slice(closeTagIdx + 1);
      } else {
        const blockPlaceholder = `\n\n@@SVG_BLOCK_${svgBlocks.length}@@\n\n`;
        svgBlocks.push(formatSvgForPDF(rest));
        tokenized += blockPlaceholder;
        break;
      }
    }
  }

  // 3. Split content by display math blocks and SVG placeholders
  const blockRegex =
    /(@@SVG_BLOCK_\d+@@|\$\$[\s\S]*?\$\$|\\begin\s*\{\s*[a-zA-Z*]+\s*\}[\s\S]*?\\end\s*\{\s*[a-zA-Z*]+\s*\})/gi;
  const parts = tokenized.split(blockRegex);

  let htmlResult = "";

  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    // Check if SVG block placeholder
    const svgMatch = trimmed.match(/^@@SVG_BLOCK_(\d+)@@$/);
    if (svgMatch) {
      const blockIndex = parseInt(svgMatch[1], 10);
      if (svgBlocks[blockIndex]) {
        htmlResult += svgBlocks[blockIndex];
      }
      return;
    }

    const isBlockMath =
      (trimmed.startsWith("$$") && trimmed.endsWith("$$")) ||
      /^\\begin\s*\{\s*[a-zA-Z*]+\s*\}/i.test(trimmed);

    if (isBlockMath) {
      const isEnv = /^\\begin\s*\{\s*[a-zA-Z*]+\s*\}/i.test(trimmed);
      let formula = isEnv ? trimmed : trimmed.slice(2, -2).trim();

      // Clean up double-backslashes inside formulas (preventing duplicate escaping)
      formula = formula.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
      formula = formula.replace(/\\\\([{}_^#&%|()[\]])/g, "\\$1");
      // Normalize spaces inside \begin / \end{
      formula = formula.replace(
        /\\begin\s*\{\s*([a-zA-Z*]+)\s*\}/gi,
        "\\begin{$1}",
      );
      formula = formula.replace(
        /\\end\s*\{\s*([a-zA-Z*]+)\s*\}/gi,
        "\\end{$1}",
      );

      try {
        const formulaHtml = katex.renderToString(formula, {
          displayMode: true,
          throwOnError: false,
        });
        htmlResult += `
          <div class="block-math-pdf-container">
            ${formulaHtml}
          </div>
        `;
      } catch (err) {
        htmlResult += `<div class="error-math-pdf">${escapeHTML(formula)}</div>`;
      }
    } else {
      // Process lines for regular text, headings, lists, and inline math
      const lines = part.split(/\n+/);
      lines.forEach((line) => {
        let trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check if standalone SVG placeholder in line
        const inlineSvgMatch = trimmedLine.match(/^@@SVG_BLOCK_(\d+)@@$/);
        if (inlineSvgMatch) {
          const blockIndex = parseInt(inlineSvgMatch[1], 10);
          if (svgBlocks[blockIndex]) {
            htmlResult += svgBlocks[blockIndex];
          }
          return;
        }

        // Convert HEADING: and SUB-HEADING: prefixes (supporting markdown bold/italic variants) to standard headings
        const rawCleanPrefix = trimmedLine.replace(/^[*_~`#\s]+/, "");
        if (
          /^(HEADING|TITLE|MAIN HEADING|MAIN TITLE|TOPIC|MAIN TOPIC|TOPIC HEADING)\s*(1|2)?\s*:\s*/i.test(
            rawCleanPrefix,
          )
        ) {
          const titleContent = rawCleanPrefix
            .replace(
              /^(HEADING|TITLE|MAIN HEADING|MAIN TITLE|TOPIC|MAIN TOPIC|TOPIC HEADING)\s*(1|2)?\s*:\s*/i,
              "",
            )
            .replace(/[*_~`]+$/, "")
            .trim();
          trimmedLine = `### ${titleContent}`;
        } else if (
          /^(SUB-HEADING|SUBHEADING|SUB\s*HEADING|SUB-TITLE|SUBTITLE|SUB\s*TITLE|SUB-TOPIC|SUBTOPIC|SUB\s*TOPIC)\s*(1|2)?\s*:\s*/i.test(
            rawCleanPrefix,
          )
        ) {
          const subTitleContent = rawCleanPrefix
            .replace(
              /^(SUB-HEADING|SUBHEADING|SUB\s*HEADING|SUB-TITLE|SUBTITLE|SUB\s*TITLE|SUB-TOPIC|SUBTOPIC|SUB\s*TOPIC)\s*(1|2)?\s*:\s*/i,
              "",
            )
            .replace(/[*_~`]+$/, "")
            .trim();
          trimmedLine = `#### ${subTitleContent}`;
        }

        // Check if line is a bullet/list item
        const isBullet =
          trimmedLine.startsWith("-") ||
          trimmedLine.startsWith("*") ||
          trimmedLine.startsWith("•");
        // Check if line is a definition list item (contains ":" or labels like "🌟")
        const isDefinition =
          trimmedLine.includes(":") &&
          (trimmedLine.startsWith("🌟") ||
            trimmedLine.startsWith("💡") ||
            trimmedLine.startsWith("📌"));
        // Check if heading
        const isSubHeading = trimmedLine.startsWith("####");
        const isHeading =
          trimmedLine.startsWith("📌") ||
          trimmedLine.startsWith("#") ||
          trimmedLine.startsWith("###");

        // Parse inline math $...$
        let parsedLine = trimmedLine;

        // Find $...$ inline math segments
        const inlineMathRegex = /\$([\s\S]*?)\$/g;
        parsedLine = parsedLine.replace(inlineMathRegex, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return match;
          }
        });

        // Parse Markdown formatting like bold **...** and italics _..._ / *...*
        parsedLine = parsedLine.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>",
        );
        parsedLine = parsedLine.replace(/_([^_]+)_/g, "<em>$1</em>");
        parsedLine = parsedLine.replace(/`([^`]+)`/g, "<code>$1</code>");

        if (isSubHeading) {
          const subHeadingText = parsedLine.replace(/^####\s*/g, "").trim();
          htmlResult += `<h4 class="subheading-pdf" style="color: #67e8f9; font-size: 12.5px; font-weight: 700; margin-top: 12px; margin-bottom: 6px; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.2px;">🔹 ${subHeadingText}</h4>`;
        } else if (isHeading) {
          const headingText = parsedLine.replace(/^📌|^#+\s*/g, "").trim();
          const cleanHeading = headingText.toLowerCase();

          let headingColor = "#fbbf24"; // Rich warm gold default for headings
          if (
            cleanHeading.includes("formula") ||
            cleanHeading.includes("equation") ||
            cleanHeading.includes("math") ||
            cleanHeading.includes("variable")
          ) {
            headingColor = "#bae6fd"; // Pastel sky-blue
          } else if (
            cleanHeading.includes("tip") ||
            cleanHeading.includes("exam") ||
            cleanHeading.includes("warning")
          ) {
            headingColor = "#fca5a5"; // Pastel pink
          }

          htmlResult += `<h3 class="heading-pdf" style="color: ${headingColor}; border-bottom: 1px solid ${headingColor}30; font-size: 14px; font-weight: 800; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.3px;">📌 ${headingText}</h3>`;
        } else if (isDefinition) {
          const colonIdx = parsedLine.indexOf(":");
          const label = parsedLine.substring(0, colonIdx).trim();
          const detail = parsedLine.substring(colonIdx + 1).trim();

          const cleanLabel = label.toLowerCase();
          let borderCol = "#fbbf24"; // Rich warm gold
          let bgCol = "rgba(251, 191, 36, 0.08)";
          let txtCol = "#fbbf24";
          let emoji = "🌟";

          if (
            /^(warning|alert|tip|hint|exam\s*tip|instruction|danger|attention|caution|error|question|answer|exercise|problem|चेतावनी|सुझाव|प्रश्न|उत्तर)$/i.test(
              cleanLabel,
            ) ||
            cleanLabel.includes("tip") ||
            cleanLabel.includes("warning") ||
            cleanLabel.includes("attention") ||
            cleanLabel.includes("danger")
          ) {
            borderCol = "#fca5a5"; // Pink
            bgCol = "rgba(252, 165, 165, 0.05)";
            txtCol = "#fca5a5";
            emoji = "🌸";
          } else if (
            /^(formula|equation|theorem|lemma|corollary|proof|identity|variable|math|physics|equation|maths|सूत्र|समीकरण)$/i.test(
              cleanLabel,
            ) ||
            cleanLabel.includes("formula") ||
            cleanLabel.includes("equation") ||
            cleanLabel.includes("theorem")
          ) {
            borderCol = "#bae6fd"; // Sky-Blue
            bgCol = "rgba(186, 230, 253, 0.05)";
            txtCol = "#bae6fd";
            emoji = "📐";
          }

          htmlResult += `
            <div class="def-pdf-card" style="border-left-color: ${borderCol}; background-color: ${bgCol}; margin-bottom: 8px;">
              <span class="def-pdf-label" style="color: ${txtCol};">${emoji} ${label}</span>
              <span class="def-pdf-detail">${detail}</span>
            </div>
          `;
        } else if (isBullet) {
          const bulletText = parsedLine.replace(/^[-*•]\s*/, "").trim();
          if (
            bulletText &&
            bulletText !== "--" &&
            bulletText !== "---" &&
            bulletText !== "-" &&
            bulletText !== "—"
          ) {
            htmlResult += `<li class="bullet-pdf" style="margin-bottom: 4px;">${bulletText}</li>`;
          }
        } else {
          if (
            parsedLine !== "--" &&
            parsedLine !== "---" &&
            parsedLine !== "-"
          ) {
            htmlResult += `<p class="paragraph-pdf" style="margin-bottom: 8px;">${parsedLine}</p>`;
          }
        }
      });
    }
  });

  return htmlResult;
};

export const renderTextWithKaTeX = (
  text: string,
  search?: string,
): React.ReactNode[] => {
  if (!text) return [];

  // Normalize latex delimiters
  let normalized = text
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  const regex = /(\$\$[\s\S]*?\External?\$\$|\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const standardRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const parts = normalized.split(standardRegex);

  return parts.map((part, index) => {
    const trimmed = part.trim();
    if (!trimmed) return <span key={index}>{part}</span>;

    const isDisplayMath = trimmed.startsWith("$$") && trimmed.endsWith("$$");
    const isInlineMath = trimmed.startsWith("$") && trimmed.endsWith("$");

    if (isDisplayMath) {
      const formula = trimmed.slice(2, -2).trim();
      try {
        const html = katex.renderToString(formula, {
          displayMode: true,
          throwOnError: false,
        });
        return (
          <div
            key={index}
            className="my-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-transparent"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return (
          <code
            key={index}
            className="block text-red-500 bg-red-50 p-2 rounded text-[10px]"
          >
            {formula}
          </code>
        );
      }
    } else if (isInlineMath) {
      const formula = trimmed.slice(1, -1).trim();
      try {
        const html = katex.renderToString(formula, {
          displayMode: false,
          throwOnError: false,
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (err) {
        return (
          <code
            key={index}
            className="text-red-500 bg-red-50 px-1 rounded text-[10px]"
          >
            {formula}
          </code>
        );
      }
    }

    if (search && search.trim()) {
      const cleanSearch = search
        .trim()
        .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // escape regex
      const highlightRegex = new RegExp(`(${cleanSearch})`, "gi");
      const textParts = part.split(highlightRegex);
      return (
        <span key={index}>
          {textParts.map((tPart, tIdx) =>
            highlightRegex.test(tPart) ? (
              <mark
                key={tIdx}
                className="bg-yellow-200 text-slate-900 font-extrabold rounded-xs px-0.5 shadow-xs border border-yellow-300/30"
              >
                {tPart}
              </mark>
            ) : (
              tPart
            ),
          )}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

// KaTeX HTML rendering memoization cache for ultra-smooth UI transitions
const katexRenderCache: Record<string, string> = {};
export const renderKaTeXHtmlSafe = (formulaStr?: string): string => {
  if (!formulaStr) return "";
  if (katexRenderCache[formulaStr]) return katexRenderCache[formulaStr];
  try {
    const rendered = katex.renderToString(formulaStr, {
      displayMode: false,
      throwOnError: false,
    });
    katexRenderCache[formulaStr] = rendered;
    return rendered;
  } catch {
    return formulaStr;
  }
};
