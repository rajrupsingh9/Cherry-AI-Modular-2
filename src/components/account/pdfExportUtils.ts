import {
  compileWhiteboardToHTML,
  sanitizeTitleForPDF,
  escapeHTML,
} from "../../utils/whiteboardPdfCompiler";

export const formatDate = (ts: any) => {
  if (!ts) return "Just now";
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Saved Topic";
  }
};

export interface ExportSessionPDFOptions {
  sess?: any;
  sessionId?: string;
  topics?: string[];
  topicBoardsContent?: Record<string, string>;
  customBoardContent?: string;
  subject?: string;
  grade?: any;
  board?: string;
  studentName?: string;
}

export function exportSessionToPDF({
  sess,
  sessionId = "",
  topics = [],
  topicBoardsContent = {},
  customBoardContent = "",
  subject = "Science",
  grade = "10",
  board = "CBSE",
  studentName = "Student",
}: ExportSessionPDFOptions) {
    try {
      const isCurrentSessionObj = !sess || sess.sessionId === sessionId;
      const sessTopics =
        sess && sess.topics ? sess.topics : isCurrentSessionObj ? topics : [];
      const sessTopicBoards =
        sess && sess.topicBoardsContent
          ? sess.topicBoardsContent
          : isCurrentSessionObj
            ? topicBoardsContent
            : {};
      const sessCustomBoard =
        sess && sess.customBoardContent
          ? sess.customBoardContent
          : isCurrentSessionObj
            ? customBoardContent
            : "";

      const activeSubjectName = sess?.subject || subject || "Hindi";
      const rawTitle =
        sess && sess.activeDocumentName
          ? sess.activeDocumentName
          : isCurrentSessionObj
            ? `${activeSubjectName} - Active Classroom Session`
            : "Classroom Lecture Notes";

      const cleanSessionTitle = sanitizeTitleForPDF(
        rawTitle,
        activeSubjectName,
        sessTopics,
      );

      const sessionDateStr =
        sess && sess.updatedAt?.seconds
          ? new Date(sess.updatedAt.seconds * 1000).toLocaleString()
          : new Date().toLocaleString();

      let compiledHtml = "";

      if (sessTopics && sessTopics.length > 0) {
        // Compile all topic sequential parts with their chalk content!
        sessTopics.forEach((topicText: string, index: number) => {
          const headerLine = topicText.split("\n")[0] || "";
          const rawHeader =
            headerLine.replace(/[\#\*\_]/g, "").trim() ||
            `Topic Part ${index + 1}`;
          const cleanHeader = sanitizeTitleForPDF(rawHeader);

          const boardContentForTopic = sessTopicBoards[index] || "";

          // Fallback to custom board content for first page if empty
          let displayNotes = boardContentForTopic;
          if (index === 0 && !displayNotes && sessCustomBoard) {
            displayNotes = sessCustomBoard;
          }

          const cleanNotes = displayNotes ? displayNotes.trim() : "";
          const hasContent = Boolean(cleanNotes && cleanNotes.length > 0);

          if (hasContent) {
            const notesHTML = compileWhiteboardToHTML(cleanNotes);

            compiledHtml += `
              <div class="pdf-page-wrapper" style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1.5px dashed rgba(255, 255, 255, 0.15); page-break-inside: avoid;">
                <div class="slide-header" style="display: flex; justify-content: space-between; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #67e8f9; font-weight: bold; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <span>📝 TOPIC SECTION ${index + 1}</span>
                  <span>CHERRY LECTURE HANDOUT</span>
                </div>
                <h2 class="slide-title" style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #ffffff; margin-top: 0; margin-bottom: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  📌 ${cleanHeader}
                </h2>
                <div class="parsed-latex-topic-content font-chalk text-left" style="background-color: #0b241e; border: 1.5px solid rgba(103, 232, 249, 0.2); color: #f3f4f6; padding: 20px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 12.5px; line-height: 1.7; box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);">
                  ${notesHTML}
                </div>
              </div>
            `;
          }
        });
      } else {
        // Fallback for single general topic
        const cleanContent = sessCustomBoard ? sessCustomBoard.trim() : "";
        const notesHTML = compileWhiteboardToHTML(cleanContent);
        compiledHtml += `
          <div class="pdf-page-wrapper" style="margin-bottom: 24px; page-break-inside: avoid;">
            <div class="slide-header" style="display: flex; justify-content: space-between; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #67e8f9; font-weight: bold; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span>📝 BLACKBOARD SHEET</span>
              <span>CHERRY LECTURE HANDOUT</span>
            </div>
            <h2 class="slide-title" style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #ffffff; margin-top: 0; margin-bottom: 12px; font-weight: 800; text-transform: uppercase;">
              📌 Main Chalkboard Calculations
            </h2>
            <div class="parsed-latex-topic-content font-chalk text-left" style="background-color: #0b241e; border: 1.5px solid rgba(103, 232, 249, 0.2); color: #f3f4f6; padding: 20px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 12.5px; line-height: 1.7; box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);">
              ${notesHTML}
            </div>
          </div>
        `;
      }

      // 2. Open pop-up window formatted perfectly as a digital Blackboard hand-book
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert(
          "Pop-up blocker is preventing PDF generation. Please allow pop-ups for this site to export study materials!",
        );
        return;
      }

      const bookTitle = `${cleanSessionTitle} - Blackboard Book`;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${bookTitle.replace(/[^a-zA-Z0-9]/g, "_")}</title>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;505;600;700;850&family=Space+Grotesk:wght@600;750;850&family=JetBrains+Mono&display=swap">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #f1f5f9;
              line-height: 1.6;
              margin: 0;
              padding: 30px;
              background-color: #041411; /* Dark aesthetic blackboard classroom canvas background */
            }
            .book-container {
              max-width: 860px;
              margin: 0 auto;
              background: #061c18; /* Rich slate dark green board sheet */
              border: 1.5px solid rgba(245, 158, 11, 0.25);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            }
            .print-header {
              border-bottom: 2px solid #f59e0b;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .print-title {
              font-family: 'Space Grotesk', sans-serif;
              color: #ffffff;
              font-size: 20px;
              font-weight: 850;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .print-subtitle {
              color: #fbbf24;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin: 4px 0 0 0;
            }
            .print-brand {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 800;
              font-size: 11px;
              color: #061c18;
              background-color: #f59e0b;
              padding: 6px 14px;
              border-radius: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              background-color: rgba(245, 158, 11, 0.05);
              padding: 18px;
              border-radius: 12px;
              margin-bottom: 30px;
              border: 1px solid rgba(245, 158, 11, 0.15);
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-label {
              font-size: 9px;
              font-family: 'JetBrains Mono', monospace;
              text-transform: uppercase;
              color: #94a3b8;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .meta-value {
              font-size: 12px;
              font-weight: 700;
              color: #ffffff;
              margin-top: 2px;
            }
            .block-math-pdf-container {
              background: rgba(255,255,255,0.04);
              border-radius: 8px;
              padding: 16px;
              margin: 16px 0;
              overflow-x: auto;
              border-left: 3.5px solid #f59e0b;
              text-align: center;
              box-shadow: inset 0 1px 4px rgba(0,0,0,0.2);
            }
            .block-math-pdf-container .katex-display {
              margin: 0;
            }
            .def-pdf-card {
              border-left: 4px solid #f59e0b;
              background-color: rgba(255,255,255,0.03);
              padding: 12px;
              border-radius: 0 8px 8px 0;
              margin: 12px 0;
            }
            .def-pdf-label {
              display: block;
              font-weight: 800;
              font-family: 'Space Grotesk', sans-serif;
              font-size: 11px;
              color: #fbbf24;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .def-pdf-detail {
              font-size: 12px;
              color: #e2e8f0;
            }
            .heading-pdf {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 13px;
              color: #fbbf24;
              border-bottom: 1px solid rgba(255,255,255,0.1);
              padding-bottom: 4px;
              margin-top: 20px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .vector-diagram-pdf-card {
              margin: 16px auto;
              padding: 14px;
              background: #061c18 !important;
              border: 1.5px solid rgba(103, 232, 249, 0.4) !important;
              border-radius: 12px;
              text-align: center;
              page-break-inside: avoid;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .vector-diagram-pdf-card svg {
              max-height: 280px;
              max-width: 520px;
              width: 100%;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .print-footer {
              margin-top: 40px;
              border-top: 1px solid rgba(245, 158, 11, 0.2);
              padding-top: 16px;
              font-size: 10.5px;
              color: #cbd5e1;
              font-weight: 600;
              text-transform: uppercase;
              text-align: center;
              letter-spacing: 1px;
            }
            .action-panel {
              background: #082621;
              border: 1.5px dashed rgba(245, 158, 11, 0.3);
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: white;
            }
            .action-btn {
              background-color: #f59e0b;
              color: #061c18;
              border: none;
              padding: 10px 20px;
              font-size: 12px;
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 800;
              border-radius: 8px;
              cursor: pointer;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.2s;
            }
            .action-btn:hover {
              background-color: #d97706;
              transform: translateY(-1px);
            }
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                padding: 0;
                background-color: transparent;
                color: #000000 !important;
              }
              .book-container {
                border: none;
                padding: 0;
                box-shadow: none;
                background: transparent !important;
              }
              .print-header {
                border-bottom: 2px solid #0f766e !important;
              }
              .print-title {
                color: #1e293b !important;
              }
              .print-subtitle {
                color: #0f766e !important;
                font-weight: 800 !important;
              }
              .print-brand {
                border: 1.5px solid #0f766e !important;
                background-color: transparent !important;
                color: #0f766e !important;
              }
              .slide-header {
                color: #0f766e !important;
                border-bottom-color: #e2e8f0 !important;
              }
              .slide-title {
                color: #0f172a !important;
              }
              .meta-grid {
                background-color: #f1f5f9 !important;
                border: 1px solid #cbd5e1 !important;
              }
              .meta-value {
                color: #1e293b !important;
              }
              .meta-label {
                color: #64748b !important;
              }
              .parsed-latex-topic-content {
                background-color: #f8fafc !important;
                border: 1.5px solid #e2e8f0 !important;
                color: #1e293b !important;
                box-shadow: none !important;
              }
              .block-math-pdf-container {
                background: #f1f5f9 !important;
                border-left-color: #0f766e !important;
              }
              .heading-pdf {
                color: #0f766e !important;
                border-bottom-color: #cbd5e1 !important;
                font-weight: 800 !important;
              }
              .subheading-pdf {
                color: #0369a1 !important;
                font-weight: 700 !important;
              }
              .def-pdf-card {
                border-left-color: #0f766e !important;
              }
              .def-pdf-label {
                color: #0f766e !important;
              }
              .def-pdf-detail {
                color: #334155 !important;
              }
              .empty-topic-compact {
                background-color: #f8fafc !important;
                border-color: #cbd5e1 !important;
              }
              .empty-topic-compact .empty-topic-title {
                color: #475569 !important;
              }
              .empty-topic-compact .empty-topic-badge {
                color: #94a3b8 !important;
              }
              .vector-diagram-pdf-card {
                background: #061c18 !important;
                border: 1.5px solid #0284c7 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
              }
              .vector-diagram-pdf-card svg {
                display: block !important;
                max-height: 280px !important;
              }
              .print-footer {
                border-top-color: #cbd5e1 !important;
                color: #64748b !important;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="action-panel no-print">
            <div style="text-align: left;">
              <span style="font-size: 13px; font-weight: 850; color: #ffffff;">Board-Book Generation Center</span>
              <p style="font-size: 11px; color: #cbd5e1; margin: 4px 0 0 0;">Review your formatted math calculations & chalkboard slides, then tap below to download as a secure PDF.</p>
            </div>
            <button class="action-btn" onclick="window.print()">🖨️ Save as PDF / Print Book</button>
          </div>

          <div class="book-container">
            <div class="print-header">
              <div style="text-align: left;">
                <h1 class="print-title">${cleanSessionTitle}</h1>
                <p class="print-subtitle">Maestry Whiteboard Session Study Handout</p>
              </div>
              <div class="print-brand">
                Cherry Ma'am
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Prepared For</span>
                <span class="meta-value">${studentName || "Cherry's Student"}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Class Year & Subject</span>
                <span class="meta-value">${grade} • ${subject}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Class Topic</span>
                <span class="meta-value">${cleanSessionTitle}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Saved Time</span>
                <span class="meta-value">${sessionDateStr}</span>
              </div>
            </div>

            <div class="notes-section">
              ${compiledHtml}
            </div>

            <div class="print-footer">
              Study material synchronized via Maestry Cloud Sync • Optimized for PDF Printout 🌸
            </div>
          </div>

          <script>
            window.addEventListener('DOMContentLoaded', () => {
              if (window.renderMathInElement) {
                renderMathInElement(document.body, {
                  delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                  ]
                });
              }
              setTimeout(() => {
                window.print();
              }, 800);
            });
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Single Session PDF download compilation failed:", err);
    }
  };

export interface ExportSnapshotPDFOptions {
  sessionTitle: string;
  latexContent: string;
  timestampStr?: string;
  subject?: string;
  topics?: string[];
  grade?: any;
  board?: string;
  studentName?: string;
}

export function exportSnapshotToPDF({
  sessionTitle,
  latexContent,
  timestampStr = "",
  subject = "Science",
  topics = [],
  grade = "10",
  board = "CBSE",
  studentName = "Student",
}: ExportSnapshotPDFOptions) {
    try {
      const cleanTitle = sanitizeTitleForPDF(sessionTitle, subject, topics);
      // 1. Compile LaTeX blackboard to highly formatted print-ready HTML
      const parsedHTML = compileWhiteboardToHTML(latexContent);

      // 2. Open pop-up window for clean native system printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert(
          "Pop-up blocker is preventing PDF generation. Please allow pop-ups for this site to export study materials!",
        );
        return;
      }

      // 3. Populate HTML template styled perfectly for print-to-PDF output
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Session Study Notes - ${sessionTitle.replace(/[^a-zA-Z0-9]/g, "_")}</title>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono&display=swap');
            
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              margin: 0;
              padding: 45px;
              background-color: #ffffff;
            }
            .print-header {
              border-bottom: 2px dashed #0f766e;
              padding-bottom: 16px;
              margin-bottom: 28px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-main {
              flex: 1;
            }
            .print-title {
              font-family: 'Space Grotesk', sans-serif;
              color: #0f3c42;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .print-subtitle {
              color: #0f766e;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin: 6px 0 0 0;
            }
            .print-brand {
              text-align: right;
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 700;
              font-size: 11px;
              color: #0f766e;
              border: 1.5px solid #0f766e;
              padding: 4px 10px;
              border-radius: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              background: #f0fdfa;
              border: 1px solid #ccfbf1;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 32px;
              font-size: 12.5px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-label {
              color: #0d9488;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9.5px;
              letter-spacing: 0.8px;
            }
            .meta-value {
              color: #1e293b;
              font-weight: 650;
              margin-top: 3px;
            }
            .notes-section {
              margin-top: 20px;
              min-height: 300px;
            }
            .heading-pdf {
              font-family: 'Space Grotesk', sans-serif;
              color: #0c4f52;
              font-size: 17px;
              font-weight: 750;
              margin-top: 28px;
              margin-bottom: 12px;
              border-left: 4.5px solid #14b8a6;
              padding-left: 12px;
              page-break-after: avoid;
            }
            .paragraph-pdf {
              font-size: 13px;
              margin-bottom: 12px;
              color: #334155;
              text-align: justify;
            }
            .bullet-pdf {
              font-size: 13px;
              margin-bottom: 8px;
              color: #334155;
              margin-left: 24px;
              list-style-type: square;
            }
            .block-math-pdf-container {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
              overflow-x: auto;
              page-break-inside: avoid;
              box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
            }
            .katex-display {
              margin: 0.5em 0 !important;
              overflow-x: auto;
              overflow-y: hidden;
            }
            .def-pdf-card {
              background: #fffbeb;
              border-left: 4.5px solid #f59e0b;
              border-radius: 4px 10px 10px 4px;
              padding: 14px 18px;
              margin: 18px 0;
              page-break-inside: avoid;
            }
            .def-pdf-label {
              display: block;
              font-size: 10px;
              text-transform: uppercase;
              font-weight: 800;
              color: #b45309;
              letter-spacing: 0.8px;
            }
            .def-pdf-detail {
              display: block;
              font-size: 12.5px;
              color: #78350f;
              margin-top: 5px;
              font-weight: 500;
            }
            code {
              font-family: 'JetBrains Mono', monospace;
              background-color: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              color: #0f172a;
              border: 1px solid #e2e8f0;
            }
            strong {
              color: #0f172a;
              font-weight: 700;
            }
            .error-math-pdf {
              color: #ef4444;
              font-family: 'JetBrains Mono', monospace;
              background: #fef2f2;
              border: 1px solid #fee2e2;
              padding: 12px;
              border-radius: 10px;
              margin: 12px 0;
              font-size: 11px;
            }
            .print-footer {
              margin-top: 60px;
              border-top: 1.5px solid #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 10.5px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              page-break-inside: avoid;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
              @page {
                size: A4;
                margin: 2cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="header-main">
              <h1 class="print-title">${cleanTitle}</h1>
              <p class="print-subtitle">Maestry Interactive Classroom Handout</p>
            </div>
            <div class="print-brand">
              Cherry Ma'am
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Prepared For</span>
              <span class="meta-value">\${studentName || "Cherry's Student"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Class Year & Subject</span>
              <span class="meta-value">\${grade} • \${subject}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Class Topic</span>
              <span class="meta-value">\${cleanTitle}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Saved Time</span>
              <span class="meta-value">\${timestampStr}</span>
            </div>
          </div>

          <div class="notes-section">
            \${parsedHTML}
          </div>

          <div class="print-footer">
            Study material synchronized via Maestry Cloud Sync • Optimized for PDF Printout 🌸
          </div>

          <script>
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
              }, 600);
            });
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("PDF generator crash details:", err);
    }
  };

export interface ExportCombinedPDFOptions {
  allSnapshots?: any[];
  subject?: string;
  grade?: any;
  board?: string;
  studentName?: string;
  pastSessions?: any[];
  topics?: string[];
  topicBoardsContent?: Record<string, string>;
  customBoardContent?: string;
  sessionId?: string;
}

export function exportCombinedPDF({
  allSnapshots = [],
  subject = "Science",
  grade = "10",
  board = "CBSE",
  studentName = "Student",
  pastSessions = [],
  topics = [],
  topicBoardsContent = {},
  customBoardContent = "",
  sessionId = "",
}: ExportCombinedPDFOptions) {
    try {
      const isSnapshotsEmpty = !allSnapshots || allSnapshots.length === 0;

      const bookTitle = `${subject} Combined Blackboard Lecture-Book`;
      const subTitle = isSnapshotsEmpty
        ? "Syllabus Taught Sequence Handouts"
        : "Whiteboard Snapped Lecture Pages";

      let combinedHtml = "";

      const sortedSnapshots = [...allSnapshots].sort((a, b) => {
        const timeA = a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : new Date(b.timestamp).getTime();
        return timeA - timeB;
      });

      if (!isSnapshotsEmpty) {
        sortedSnapshots.forEach((item, index) => {
          const dateStr = formatDate(item.timestamp);
          const cleanSlideTitle = sanitizeTitleForPDF(item.topicTitle);
          combinedHtml += `
            <div class="pdf-page-wrapper">
              <div class="slide-header">
                <span class="slide-number">BOARD SLIDE #${String(index + 1).padStart(2, "0")}</span>
                <span class="slide-time">📅 ${dateStr}</span>
              </div>
              
              <h2 class="slide-title">📌 ${cleanSlideTitle}</h2>
              
              <div class="chalkboard-frame-container">
                ${
                  item.imgData
                    ? `
                  <img src="${item.imgData}" alt="${cleanSlideTitle}" class="chalkboard-image" referrerpolicy="no-referrer" />
                `
                    : `
                  <div class="no-image-placeholder">Visual Board Frame Preview Pending</div>
                `
                }
              </div>

              <div class="slide-notes-card">
                <div class="notes-badge">🎓 TOPIC EXPLANATION & STUDY NOTE</div>
                <p class="notes-text">${item.description || "Interactive whiteboard derivations, drawings, and chalkboard notes."}</p>
              </div>
            </div>
          `;
        });
      } else if (topics && topics.length > 0) {
        // Compile ALL topics/slides from active syllabus in chronological sequence! This is an amazing feature!
        topics.forEach((topicContent, index) => {
          const rawHeading =
            topicContent.split("\n")[0].replace(/[#*]/g, "").trim() ||
            `Topic ${index + 1}`;
          const headingText = sanitizeTitleForPDF(rawHeading);
          const contentHTML = compileWhiteboardToHTML(topicContent);

          combinedHtml += `
            <div class="pdf-page-wrapper">
              <div class="slide-header">
                <span class="slide-number">SYLLABUS TOPIC #${String(index + 1).padStart(2, "0")}</span>
                <span class="slide-time">📚 Sequence Taught Material</span>
              </div>
              
              <h2 class="slide-title">📌 ${headingText}</h2>
              
              <div class="parsed-latex-topic-content">
                ${contentHTML}
              </div>
            </div>
          `;
        });
      } else {
        const fallbackHTML = compileWhiteboardToHTML(
          customBoardContent ||
            "No active whiteboard chalkboard notes compiled in active lecture workspace yet.",
        );
        combinedHtml += `
          <div class="pdf-page-wrapper">
            <div class="slide-header">
              <span class="slide-number">ACTIVE SLATE BOARD</span>
              <span class="slide-time">📸 Instant Handout</span>
            </div>
            <h2 class="slide-title">📌 Active Whiteboard Formulas</h2>
            <div class="parsed-latex-topic-content">
              ${fallbackHTML}
            </div>
          </div>
        `;
      }

      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${bookTitle} - ${studentName || "Cherry's Student"}</title>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono&display=swap">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              margin: 0;
              padding: 30px;
              background-color: #f8fafc;
            }
            .book-container {
              max-width: 840px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            }
            .print-header {
              border-bottom: 2px solid #0f766e;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .print-title {
              font-family: 'Space Grotesk', sans-serif;
              color: #0f3c42;
              font-size: 21px;
              font-weight: 850;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .print-subtitle {
              color: #0d9488;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin: 4px 0 0 0;
            }
            .print-brand {
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 800;
              font-size: 11px;
              color: #0f766e;
              border: 2px solid #0f766e;
              padding: 6px 12px;
              border-radius: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              background: #f0fdfa;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 18px;
              margin-bottom: 30px;
              font-size: 11px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
              text-align: left;
            }
            .meta-label {
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.8px;
            }
            .meta-value {
              color: #0f172a;
              font-weight: 700;
              margin-top: 2px;
            }
            .instructions-box {
              background-color: #fffbeb;
              border: 1px solid #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 24px;
              text-align: left;
              font-size: 11.5px;
              color: #78350f;
            }
            .pdf-page-wrapper {
              page-break-after: always;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 30px;
              background: #ffffff;
            }
            .pdf-page-wrapper:last-child {
              page-break-after: avoid;
              margin-bottom: 0;
            }
            .slide-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 10px;
              margin-bottom: 16px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10.5px;
              color: #0d9488;
              font-weight: bold;
            }
            .slide-number {
              background: rgba(13, 148, 136, 0.1);
              color: #0f766e;
              padding: 2px 8px;
              border-radius: 4px;
            }
            .slide-time {
              color: #64748b;
            }
            .slide-title {
              font-family: 'Space Grotesk', sans-serif;
              color: #0f3c42;
              font-size: 16.5px;
              font-weight: 800;
              margin: 0 0 16px 0;
              text-align: left;
            }
            .chalkboard-frame-container {
              background: #0c201a;
              border-radius: 12px;
              padding: 8px;
              aspect-ratio: 16 / 9;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #0a2d24;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              margin-bottom: 16px;
              overflow: hidden;
            }
            .chalkboard-image {
              width: 100%;
              height: 105%;
              object-fit: contain;
              border-radius: 8px;
            }
            .no-image-placeholder {
              color: #10b981;
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
            }
            .slide-notes-card {
              background: #f0fdfa;
              border-left: 4px solid #0d9488;
              border-radius: 4px 12px 12px 4px;
              padding: 12px 16px;
              text-align: left;
            }
            .notes-badge {
              font-family: 'JetBrains Mono', monospace;
              color: #0d9488;
              font-size: 9px;
              font-weight: bold;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .notes-text {
              font-size: 11.5px;
              color: #334155;
              margin: 0;
              font-weight: 500;
              line-height: 1.5;
            }
            .parsed-latex-topic-content {
              text-align: left;
              font-size: 12px;
              color: #0f172a;
              background: #faf8f5;
              border: 1px solid #edd1d1;
              padding: 18px;
              border-radius: 12px;
              font-family: 'Inter', system-ui, sans-serif;
              line-height: 1.6;
            }
            .parsed-latex-topic-content h1, .parsed-latex-topic-content h2, .parsed-latex-topic-content h3 {
              font-family: 'Space Grotesk', sans-serif;
              color: #0f3c42;
              margin-top: 0;
            }
            .parsed-latex-topic-content code {
              font-family: 'JetBrains Mono', monospace;
              background: #eaebf0;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
            }
            .vector-diagram-pdf-card {
              margin: 16px auto;
              padding: 14px;
              background: #061c18 !important;
              border: 1.5px solid rgba(103, 232, 249, 0.4) !important;
              border-radius: 12px;
              text-align: center;
              page-break-inside: avoid;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .vector-diagram-pdf-card svg {
              max-height: 280px;
              max-width: 520px;
              width: 100%;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .print-footer {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .action-blocks {
              display: flex;
              gap: 12px;
              margin-bottom: 24px;
              justify-content: center;
            }
            .action-btn {
              background: #0f766e;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: bold;
              font-family: 'Space Grotesk', sans-serif;
              cursor: pointer;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: background 0.2s;
            }
            .action-btn:hover {
              background: #0d9488;
            }
            .action-btn-alt {
              background: #e2e8f0;
              color: #334155;
            }
            .action-btn-alt:hover {
              background: #cbd5e1;
            }

            @media print {
              body {
                padding: 0;
                background-color: #ffffff;
              }
              .book-container {
                border: none;
                padding: 0;
                box-shadow: none;
                max-width: 100%;
              }
              .instructions-box, .action-blocks {
                display: none !important;
              }
              .pdf-page-wrapper {
                border: none;
                padding: 20px 0;
                margin-bottom: 0;
                page-break-after: always;
              }
              .pdf-page-wrapper:last-child {
                page-break-after: avoid;
              }
              .vector-diagram-pdf-card {
                background: #061c18 !important;
                border: 1.5px solid #0284c7 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
              }
              .vector-diagram-pdf-card svg {
                display: block !important;
                max-height: 280px !important;
              }
              @page {
                size: A4 portrait;
                margin: 1.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="book-container">
            <div class="action-blocks">
              <button class="action-btn" onclick="window.print()">🖨️ Save as PDF / Print Book</button>
              <button class="action-btn action-btn-alt" onclick="window.close()">❌ Close Book</button>
            </div>

            <div class="instructions-box">
              <strong>📘 Direct PDF Save Option:</strong> Click the <strong>"Save as PDF / Print Book"</strong> button above, or press <strong>Ctrl + P</strong> (Cmd + P on Mac). Choose <strong>"Save as PDF"</strong> as your destination, and hit save!
            </div>

            <div class="print-header">
              <div class="header-main">
                <h1 class="print-title">${bookTitle}</h1>
                <p class="print-subtitle">${subTitle}</p>
              </div>
              <div class="print-brand">
                Maestry Learning Sync
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Student Name</span>
                <span class="meta-value">${escapeHTML(studentName || "Cherry's Student")}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Class Year</span>
                <span class="meta-value">${escapeHTML(grade)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Subject Standard</span>
                <span class="meta-value">${escapeHTML(subject)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Taught Chronology</span>
                <span class="meta-value">${new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div class="board-pages-container">
              ${combinedHtml}
            </div>

            <div class="print-footer">
              Digital Lecture Copy Synchronized via Maestry Cloud • Secure Verification PDF
            </div>
          </div>

          <script>
            document.addEventListener("DOMContentLoaded", function() {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\\\(', right: '\\\\)', display: false},
                  {left: '\\\\[', right: '\\\\]', display: true}
                ],
                throwOnError: false
              });
              setTimeout(() => {
                window.print();
              }, 600);
            });
          </script>
        </body>
        </html>
      `;

      const blob = new Blob([finalHtml], { type: "text/html;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Maestry_Lecture_Book_${subject.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Combined PDF export error:", err);
    }
  };

