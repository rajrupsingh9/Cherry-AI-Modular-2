import { toJpeg } from "html-to-image";
import html2canvas from "html2canvas";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { safeSetItem } from "./safeStorage";

/**
 * Helper to test if whiteboard content is substantial & academically complete (Anti-Adha-Adhura Gate)
 */
export function isBoardContentComplete(content: string): boolean {
  if (!content || !content.trim()) return false;
  const clean = content
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/[#*`_📌💡❓⚡]/g, "")
    .trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);

  // If it's merely an intro placeholder, a raw single question, or fewer than 2 meaningful lines without math
  const hasMathOrDiagram = content.includes("<svg") || content.includes("$$") || content.includes("\\[") || content.includes("\\frac");
  const hasRulesOrDerivation = /Rule\s*\d+|Step\s*\d+|Formula|Theorem|Definition|Derivation|Proof|Example/i.test(content);

  if (lines.length < 2 && !hasMathOrDiagram && !hasRulesOrDerivation) {
    return false;
  }

  // Must have at least 80 characters of academic substance or multiple formatted lines
  return lines.length >= 3 || content.trim().length >= 90 || hasMathOrDiagram || hasRulesOrDerivation;
}

/**
 * Intelligent Subject Auto-Detection for Canvas Snapshot Styling
 */
export function detectSubjectForSnapshot(text: string, titleStr: string, fallbackSub: string) {
  const norm = `${text} ${titleStr}`.toLowerCase();

  const chemMatches = (norm.match(/chemistry|reaction|acid|base|salt|organic|inorganic|molecule|atom|bond|covalent|periodic|element|carbon|h2o|co2|catalyst|molecular|equation|valency|hydrocarbon|alkane|alkene|alkyne|ester|saponification|displacement|neutralization|precipitate|litmus|रसायन|अभिक्रिया|अम्ल|क्षारक|लवण|धातु|अधातु|कार्बन|तत्व|परमाणु|अणु|संयोजकता/g) || []).length;
  const physMatches = (norm.match(/physics|gravity|velocity|acceleration|quantum|photon|relativity|newton|joule|einstein|kinematics|optics|lens|mirror|current|voltage|ohm|resistance|mechanics|motion|reflection|refraction|dispersion|solenoid|fleming|generator|भौतिक|गति|वेग|त्वरण|दूरी|विस्थापन|गुरुत्वाकर्षण|कार्य|ऊर्जा|शक्ति|प्रकाश|परावर्तन|अपवर्तन|दर्पण|लेंस|विद्युत|धारा|प्रतिरोध|चुंबक/g) || []).length;
  const bioMatches = (norm.match(/biology|cell|mitochondria|photosynthesis|dna|neuron|organism|organelle|plant|animal|chloroplast|genetics|evolution|anatomy|botany|zoology|excretion|respiration|circulation|nephron|synapse|reflex|hormone|जीव विज्ञान|जैव प्रक्रम|पोषण|श्वसन|परिवहन|उत्सर्जन|तंत्रिका|हार्मोन|जनन|कोशिका|प्रकाश संश्लेषण/g) || []).length;
  const mathMatches = (norm.match(/\\frac|\\sum|\\prod|\\int|quadratic|theorem|trigonometr|algebra|math|matrix|calculus|derive|proof|geometry|triangle|integral|arithmetic progression|hypotenuse|tangent|गणित|वास्तविक संख्याएं|बहुपद|द्विघात|समांतर श्रेढ़ी|त्रिभुज|त्रिकोणमिति|प्रमेय/g) || []).length;

  if (chemMatches > 0 && chemMatches >= physMatches && chemMatches >= bioMatches && chemMatches >= mathMatches) {
    return { name: "CHEMISTRY", icon: "🧪", color: "#34d399", bg: "rgba(52, 211, 153, 0.2)" };
  }
  if (physMatches > 0 && physMatches >= chemMatches && physMatches >= bioMatches && physMatches >= mathMatches) {
    return { name: "PHYSICS", icon: "⚛️", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.2)" };
  }
  if (bioMatches > 0 && bioMatches >= chemMatches && bioMatches >= physMatches && bioMatches >= mathMatches) {
    return { name: "BIOLOGY", icon: "🌿", color: "#4ade80", bg: "rgba(74, 222, 128, 0.2)" };
  }
  if (mathMatches > 0 && mathMatches >= chemMatches && mathMatches >= physMatches && mathMatches >= bioMatches) {
    return { name: "MATHEMATICS", icon: "📐", color: "#facc15", bg: "rgba(250, 204, 21, 0.2)" };
  }
  const cleanDef = (fallbackSub || "STUDY SESSION").toUpperCase();
  return { name: cleanDef, icon: "📖", color: "#c4f500", bg: "rgba(196, 245, 0, 0.2)" };
}

/**
 * Synthesize a high-definition blackboard snapshot matching the exact live classroom screen using Canvas 2D
 */
export async function generateFallbackChalkboardImage(
  topicTitle: string,
  content: string,
  boardBg: string,
  defaultSubject: string,
  topicIndexNum: number = 0
): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 1480; // High-resolution authentic vertical classroom chalkboard slate
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const detectedSub = detectSubjectForSnapshot(content, topicTitle, defaultSubject);

    // 1. Blackboard Dark Slate Background with subtle Green Chalk Texture
    ctx.fillStyle = boardBg || "#071712";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid Dots (Identical to live screen .blackboard-chalk radial-gradient)
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 30; x < canvas.width - 30; x += 32) {
      for (let y = 30; y < canvas.height - 30; y += 32) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // 2. Sleek Neon Interactive Frame
    ctx.strokeStyle = "rgba(196, 245, 0, 0.35)";
    ctx.lineWidth = 2.5;
    const radius = 16;
    ctx.beginPath();
    ctx.roundRect(14, 14, canvas.width - 28, canvas.height - 28, radius);
    ctx.stroke();

    // Inner subtle glow border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(22, 22, canvas.width - 44, canvas.height - 44, 12);
    ctx.stroke();

    // 3. Top Header Bar
    const headerY = 55;

    // Dynamic Topic Badge Pill
    const topicPillLabel = `TOPIC ${topicIndexNum + 1}`;
    ctx.font = "bold 13px monospace";
    const pillW = Math.max(92, ctx.measureText(topicPillLabel).width + 26);

    ctx.fillStyle = "rgba(196, 245, 0, 0.22)";
    ctx.beginPath();
    ctx.roundRect(46, headerY - 18, pillW, 28, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(196, 245, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(46, headerY - 18, pillW, 28, 6);
    ctx.stroke();

    ctx.fillStyle = "#c4f500";
    ctx.fillText(topicPillLabel, 58, headerY + 1);

    // Classroom Brand Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const cleanTitleText = topicTitle ? topicTitle.replace(/^[#*\s📌]+/, "").slice(0, 38) : "Live Classroom";
    ctx.fillText(`🎙️ ${cleanTitleText}`, 54 + pillW + 10, headerY + 2);

    // Subject Badge Pill on Top Right
    ctx.fillStyle = detectedSub.bg || "rgba(250, 204, 21, 0.2)";
    ctx.beginPath();
    ctx.roundRect(canvas.width - 170, headerY - 18, 124, 28, 6);
    ctx.fill();
    ctx.strokeStyle = detectedSub.color || "#facc15";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(canvas.width - 170, headerY - 18, 124, 28, 6);
    ctx.stroke();

    ctx.fillStyle = detectedSub.color || "#facc15";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${detectedSub.icon} ${detectedSub.name.slice(0, 11)}`, canvas.width - 158, headerY + 1);

    // Subtle horizontal divider under header
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(46, headerY + 24);
    ctx.lineTo(canvas.width - 46, headerY + 24);
    ctx.stroke();

    // 4. Extract SVG diagram if present
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
    let svgImageElement: HTMLImageElement | null = null;

    if (svgMatch && svgMatch[0]) {
      try {
        let cleanedSvg = svgMatch[0];
        if (!cleanedSvg.includes("xmlns=")) {
          cleanedSvg = cleanedSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        svgImageElement = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new window.Image();
          const timer = setTimeout(() => resolve(null), 800);
          img.onload = () => { clearTimeout(timer); resolve(img); };
          img.onerror = () => { clearTimeout(timer); resolve(null); };
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
        });
      } catch (_) {
        svgImageElement = null;
      }
    }

    // 5. Clean Markdown text content and render line by line
    const textWithoutSvg = content
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    const cleanContent = textWithoutSvg
      .replace(/[#*`_]/g, "")
      .trim();

    const rawLines = cleanContent
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("<") && !l.includes("</"));

    const textStartX = 54;
    const maxTextWidth = canvas.width - 110;
    let currentY = 125;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (currentY > canvas.height - 90) break;

      const isHeading = (line.toUpperCase() === line && line.length > 3 && line.length < 50) || line.endsWith("?");
      const isRuleCard = /^(Rule \d+|\d+\.\s*Rule|Step \d+|Theorem|Key Concept|Formula)/i.test(line);
      const isBulletExample = line.startsWith("•") || line.startsWith("-") || line.toLowerCase().includes("example :");

      if (isHeading) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(line.slice(0, 60), textStartX, currentY);
        currentY += 36;
      } else if (isRuleCard) {
        ctx.fillStyle = "rgba(6, 78, 59, 0.28)";
        ctx.beginPath();
        ctx.roundRect(textStartX - 10, currentY - 24, canvas.width - (textStartX * 2) + 20, 42, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(textStartX - 10, currentY - 24, canvas.width - (textStartX * 2) + 20, 42, 10);
        ctx.stroke();

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const badgePrefix = line.slice(0, 12);
        ctx.fillText(badgePrefix, textStartX, currentY + 3);

        ctx.fillStyle = "#fef08a";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(line.slice(12, 75), textStartX + 105, currentY + 3);
        currentY += 54;
      } else if (isBulletExample) {
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("•", textStartX + 12, currentY);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Example :", textStartX + 28, currentY);

        const formulaPart = line.replace(/^[•\-]\s*example\s*:\s*/i, "").trim();
        if (formulaPart) {
          ctx.fillStyle = "rgba(8, 47, 73, 0.75)";
          ctx.beginPath();
          ctx.roundRect(textStartX + 115, currentY - 20, Math.min(600, formulaPart.length * 12 + 24), 30, 8);
          ctx.fill();
          ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(textStartX + 115, currentY - 20, Math.min(600, formulaPart.length * 12 + 24), 30, 8);
          ctx.stroke();

          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 16px monospace, sans-serif";
          ctx.fillText(formulaPart.slice(0, 48), textStartX + 127, currentY);
        }
        currentY += 46;
      } else {
        ctx.fillStyle = "rgba(244, 244, 245, 0.95)";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

        if (line.toLowerCase().includes("undefined") || line.toLowerCase().includes("indeterminate")) {
          ctx.fillStyle = "#ffffff";
          ctx.fillText("Definition states it is ", textStartX, currentY);
          ctx.fillStyle = "#facc15";
          ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("undefined", textStartX + 162, currentY);
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(" or an ", textStartX + 242, currentY);
          ctx.fillStyle = "#facc15";
          ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("indeterminate form .", textStartX + 295, currentY);
          currentY += 34;
        } else {
          const words = line.split(" ");
          let lineBuffer = "";
          for (let wIdx = 0; wIdx < words.length; wIdx++) {
            const testLine = lineBuffer ? `${lineBuffer} ${words[wIdx]}` : words[wIdx];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && wIdx > 0) {
              ctx.fillText(lineBuffer, textStartX, currentY);
              currentY += 32;
              lineBuffer = words[wIdx];
            } else {
              lineBuffer = testLine;
            }
          }
          if (lineBuffer) {
            ctx.fillText(lineBuffer, textStartX, currentY);
            currentY += 34;
          }
        }
      }
    }

    // 6. Draw SVG Diagram if present
    if (svgImageElement) {
      const diagW = Math.min(canvas.width - 100, 780);
      const diagH = 340;
      const diagX = (canvas.width - diagW) / 2;
      const diagY = Math.min(currentY + 20, canvas.height - 400);

      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(diagX, diagY, diagW, diagH, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(diagX, diagY, diagW, diagH, 12);
      ctx.stroke();

      ctx.drawImage(svgImageElement, diagX + 20, diagY + 20, diagW - 40, diagH - 40);
    }

    // 7. Chalk Tray & Watermark at Bottom
    ctx.fillStyle = "#27150c";
    ctx.beginPath();
    ctx.roundRect(30, canvas.height - 42, canvas.width - 60, 16, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff"; ctx.fillRect(60, canvas.height - 38, 20, 8);
    ctx.fillStyle = "#fde047"; ctx.fillRect(90, canvas.height - 38, 18, 8);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(116, canvas.height - 38, 20, 8);
    ctx.fillStyle = "#34d399"; ctx.fillRect(144, canvas.height - 38, 16, 8);

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (_) {
    return "";
  }
}

export interface CaptureSnapshotParams {
  topicIndex: number;
  boardContent: string;
  isManual?: boolean;
  topics: string[];
  boardBg: string;
  subject: string;
  grade: string;
  sessionId?: string | null;
  currentUser?: any;
  onSnapshotSaved?: (snapshot: any) => void;
  addToast?: (msg: string, type?: "info" | "success" | "error" | "warning") => void;
}

/**
 * Capture whiteboard content as a high-fidelity image snapshot and synchronize locally and to Firestore
 */
export async function captureClassroomSnapshot({
  topicIndex,
  boardContent,
  isManual = false,
  topics,
  boardBg,
  subject,
  grade,
  sessionId,
  currentUser,
  onSnapshotSaved,
  addToast,
}: CaptureSnapshotParams): Promise<any | null> {
  if (!boardContent || !boardContent.trim()) return null;

  const topicContent = topics[topicIndex] || "";
  let topicTitle = `Topic ${topicIndex + 1}`;
  let topicDescription = "Interactive whiteboard mathematical derivation or chalkboard notes.";

  if (topicContent) {
    const lines = topicContent.split("\n");
    for (const line of lines) {
      const trimmed = line.replace(/[#*📌$]/g, "").trim();
      if (trimmed) {
        topicTitle = trimmed;
        break;
      }
    }

    let descCandidate = "";
    for (let i = 1; i < lines.length; i++) {
      const lineVal = lines[i].replace(/[#*📌$]/g, "").trim();
      if (lineVal && lineVal.length > 8) {
        descCandidate = lineVal;
        break;
      }
    }
    if (descCandidate) {
      topicDescription = descCandidate;
    }
  }

  if (topicDescription.length > 90) {
    topicDescription = topicDescription.substring(0, 87) + "...";
  }

  try {
    let imgData = "";

    // 1. High-fidelity DOM capture using html-to-image
    const slateEl =
      document.getElementById("chalkboard-main-slate") ||
      document.getElementById("active-chalkboard-topic-block") ||
      document.querySelector(".chalkboard-frame");

    const textWithoutHeaders = (slateEl?.textContent || "")
      .replace(/TOPIC \d+|Cherry Ma'am Live 1-on-1 Classroom|PAST LECTURE NOTE|Option A|Option B/gi, "")
      .trim();

    const isDomReady = slateEl && textWithoutHeaders.length >= Math.min(80, boardContent.trim().length * 0.7);

    if (isDomReady && slateEl) {
      try {
        imgData = await toJpeg(slateEl as HTMLElement, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: boardBg,
          cacheBust: true,
          skipFonts: true,
          fontEmbedCSS: "",
          filter: (domNode) => {
            if (domNode instanceof HTMLElement) {
              if (domNode.tagName === "BUTTON" || domNode.classList?.contains("no-snapshot")) return false;
              if ((domNode.getAttribute("title") || "").toLowerCase().includes("exit")) return false;
            }
            return true;
          },
        });
      } catch (htmlToImgErr) {
        console.warn("DOM html-to-image capture failed, trying html2canvas fallback:", htmlToImgErr);
        try {
          const canvas = await html2canvas(slateEl as HTMLElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: boardBg,
            scale: 1.5,
            logging: false,
            ignoreElements: (el) => {
              return (
                el.tagName === "BUTTON" ||
                el.classList?.contains("no-snapshot") ||
                (el.getAttribute("title") || "").includes("Exit")
              );
            },
          });
          imgData = canvas.toDataURL("image/jpeg", 0.9);
        } catch (domErr) {
          console.warn("DOM html2canvas fallback failed:", domErr);
        }
      }
    }

    // 2. High-definition blackboard canvas fallback
    if (!imgData || imgData.length < 50) {
      imgData = await generateFallbackChalkboardImage(
        topicTitle,
        boardContent,
        boardBg,
        subject || "Mathematics",
        topicIndex
      );
    }

    if (!imgData) return null;

    const effectiveUid = currentUser?.uid || "local_guest_student";

    const newSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      snapshotId: `auto_snap_${sessionId ? sessionId.replace(/[^a-zA-Z0-9]/g, "_") : "sess"}_top_${topicIndex}`,
      userId: effectiveUid,
      topicTitle,
      description: topicDescription,
      imgData,
      subject: subject || "Mathematics",
      grade: grade || "Class 10",
      topicIndex: topicIndex,
      timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    };

    if (onSnapshotSaved) {
      onSnapshotSaved(newSnapshot);
    }

    // Save locally
    const saveToLocal = (cacheKey: string) => {
      try {
        const cachedStr = localStorage.getItem(cacheKey);
        let localSnaps: any[] = [];
        if (cachedStr) {
          try {
            localSnaps = JSON.parse(cachedStr);
          } catch (_) {}
        }
        const filtered = localSnaps.filter(
          (s) => !(s.topicIndex === topicIndex || s.topicTitle?.trim().toLowerCase() === topicTitle.trim().toLowerCase())
        );
        const bounded = [newSnapshot, ...filtered].slice(0, 20);
        safeSetItem(cacheKey, JSON.stringify(bounded));
      } catch (storageErr) {
        console.warn(`Could not save snapshot to localStorage key ${cacheKey}:`, storageErr);
      }
    };

    saveToLocal(`snapshots_${effectiveUid}`);
    saveToLocal("snapshots_local_guest_student");
    saveToLocal("all_board_snapshots");

    // Cloud firestore sync
    if (effectiveUid !== "local_guest_student" && !effectiveUid.startsWith("local_")) {
      try {
        const docId = `snap_${sessionId ? sessionId.replace(/[^a-zA-Z0-9]/g, "_") : "sess"}_top_${topicIndex}`;
        const snapDocRef = doc(db, "studentProfiles", effectiveUid, "boardSnapshots", docId);
        await setDoc(
          snapDocRef,
          {
            snapshotId: newSnapshot.snapshotId,
            userId: effectiveUid,
            topicTitle,
            description: topicDescription,
            imgData,
            subject: subject || "Mathematics",
            grade: grade || "Class 10",
            topicIndex: topicIndex,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn("Could not sync snapshot to firestore database:", dbErr);
      }
    }

    if (addToast) {
      addToast(
        isManual
          ? `Chalkboard snapshot saved of "${topicTitle}"! 📸📘`
          : `Captured complete whiteboard notes for: "${topicTitle}"! 📸☁️`,
        "success"
      );
    }

    return newSnapshot;
  } catch (err) {
    console.warn("captureClassroomSnapshot failed:", err);
    return null;
  }
}
