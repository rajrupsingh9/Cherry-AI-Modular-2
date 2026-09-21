/**
 * boardPdfExport.ts
 * Standalone PDF generation service for the Classroom Blackboard
 */
// @ts-ignore
import html2pdf from "html2pdf.js";

export const resolveOklch = (prop: string, val: string): string => {
  if (!val || typeof val !== "string") return val;

  const replaced = val.replace(/(oklch|oklab)\(([^)]+)\)/gi, (match, type, content) => {
    const normalizedContent = content.replace(/,/g, " ").replace(/\//g, " ");
    const parts = normalizedContent.trim().split(/\s+/);
    const cleanParts = parts.filter(p => p !== "");

    let l = 1;
    const lPart = cleanParts[0];
    if (lPart) {
      if (lPart.endsWith("%")) {
        l = parseFloat(lPart) / 100;
      } else {
        l = parseFloat(lPart);
      }
    }
    if (isNaN(l)) l = 1;

    let opacity = 1;
    const lastPart = cleanParts[cleanParts.length - 1];
    if (cleanParts.length >= 4) {
      if (lastPart.endsWith("%")) {
        opacity = parseFloat(lastPart) / 100;
      } else {
        opacity = parseFloat(lastPart);
      }
    }
    if (isNaN(opacity)) opacity = 1;

    const tLow = type.toLowerCase();
    if (tLow === "oklch" && cleanParts.length >= 3) {
      let h = parseFloat(cleanParts[2]);
      if (isNaN(h)) h = 0;
      let c = parseFloat(cleanParts[1]);
      if (isNaN(c)) c = 0;
      const s = Math.min(100, Math.round(c * 150));
      const lightness = Math.min(100, Math.round(l * 100));
      return `hsla(${Math.round(h)}, ${s}%, ${lightness}%, ${opacity})`;
    }

    if (tLow === "oklab" && cleanParts.length >= 3) {
      let a = parseFloat(cleanParts[1]);
      let b = parseFloat(cleanParts[2]);
      if (isNaN(a)) a = 0;
      if (isNaN(b)) b = 0;

      let r = Math.round(l * 255);
      let g = Math.round(l * 255);
      let bl = Math.round(l * 255);

      if (a > 0.02) {
        r = Math.min(255, r + 50);
        g = Math.max(0, g - 20);
      } else if (a < -0.02) {
        g = Math.min(255, g + 50);
        r = Math.max(0, r - 20);
      }
      if (b > 0.02) {
        r = Math.min(255, r + 30);
        g = Math.min(255, g + 30);
        bl = Math.max(0, bl - 40);
      } else if (b < -0.02) {
        bl = Math.min(255, bl + 50);
        r = Math.max(0, r - 20);
      }

      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(bl)}, ${opacity})`;
    }

    const val255 = Math.round(l * 255);
    return `rgba(${val255}, ${val255}, ${val255}, ${opacity})`;
  });

  return replaced;
};

const makeSafeComputedStyle = (style: CSSStyleDeclaration) => {
  return new Proxy(style, {
    get(target, prop) {
      if (prop === "getPropertyValue") {
        return function(propertyName: string) {
          const val = target.getPropertyValue(propertyName);
          return resolveOklch(propertyName, val);
        };
      }
      const val = Reflect.get(target, prop);
      if (typeof val === "string") {
        return resolveOklch(String(prop), val);
      }
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    }
  });
};

const PROPERTIES_TO_COPY = [
  "display", "flex-direction", "justify-content", "align-items", "flex-wrap", "flex-grow", "flex-shrink", "gap",
  "position", "top", "right", "bottom", "left", "z-index",
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "box-sizing", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "font-family", "font-size", "font-weight", "line-height", "text-align", "text-transform", "letter-spacing",
  "color", "background-color", "background-image", "background-size", "background-position", "background-repeat",
  "border-top-width", "border-top-style", "border-top-color",
  "border-right-width", "border-right-style", "border-right-color",
  "border-bottom-width", "border-bottom-style", "border-bottom-color",
  "border-left-width", "border-left-style", "border-left-color",
  "border-radius", "border-collapse", "border-spacing",
  "box-shadow", "opacity", "overflow", "transform", "vertical-align"
];

const inlineStylesRecursively = (srcNode: Element, destNode: Element) => {
  if (srcNode instanceof HTMLElement && destNode instanceof HTMLElement) {
    const computed = window.getComputedStyle(srcNode);
    for (const prop of PROPERTIES_TO_COPY) {
      const rawVal = computed.getPropertyValue(prop);
      const cleanVal = resolveOklch(prop, rawVal);
      destNode.style.setProperty(prop, cleanVal);
    }
  }
  const srcChildren = srcNode.children;
  const destChildren = destNode.children;
  for (let i = 0; i < srcChildren.length; i++) {
    if (srcChildren[i] && destChildren[i]) {
      inlineStylesRecursively(srcChildren[i], destChildren[i]);
    }
  }
};

export async function exportChalkboardPdf(
  primaryColor: string = "#0c201a",
  silentFileName?: string
): Promise<Blob | undefined> {
  const originalGetComputedStyle = window.getComputedStyle;
  let iframeOriginalGetComputedStyle: any = null;
  let iframeWindowRef: any = null;

  try {
    const element = document.getElementById("chalkboard-main-slate");
    if (!element) return undefined;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = `${element.clientWidth || 1024}px`;
    iframe.style.height = `${element.clientHeight || 768}px`;
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWindow?.document;
    if (!iframeDoc || !iframeWindow) {
      throw new Error("Could not access iframe document");
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Reenie+Beanie&family=Schoolbell&display=swap');
            body {
              margin: 0;
              padding: 0;
              background-color: ${primaryColor || "#0c201a"} !important;
              color: #ffffff !important;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    iframeDoc.close();

    window.getComputedStyle = function(el, pseudoElt) {
      const style = originalGetComputedStyle.call(window, el, pseudoElt);
      return makeSafeComputedStyle(style);
    };

    iframeOriginalGetComputedStyle = iframeWindow.getComputedStyle;
    iframeWindowRef = iframeWindow;
    iframeWindow.getComputedStyle = function(el, pseudoElt) {
      const style = iframeOriginalGetComputedStyle.call(iframeWindow, el, pseudoElt);
      return makeSafeComputedStyle(style);
    };

    const parentStyleSheets = document.querySelectorAll("link[rel='stylesheet'], style");
    parentStyleSheets.forEach(sheetNode => {
      const href = sheetNode.getAttribute("href") || "";
      const isTailwind = href.includes("tailwind") || sheetNode.textContent?.includes("@import");
      if (!isTailwind) {
        iframeDoc.head.appendChild(sheetNode.cloneNode(true));
      }
    });

    const clone = element.cloneNode(true) as HTMLElement;
    const controls = clone.querySelectorAll("button, form, input, textarea, a");
    controls.forEach(ctrl => ctrl.remove());

    inlineStylesRecursively(element, clone);

    clone.style.width = `${element.getBoundingClientRect().width || 1024}px`;
    clone.style.height = "auto";
    clone.style.maxHeight = "none";
    clone.style.overflow = "visible";

    const clonedInnerSheet = clone.querySelector(".overflow-y-auto");
    if (clonedInnerSheet instanceof HTMLElement) {
      clonedInnerSheet.style.height = "auto";
      clonedInnerSheet.style.maxHeight = "none";
      clonedInnerSheet.style.overflow = "visible";
      clonedInnerSheet.style.paddingBottom = "40px";
    }

    iframeDoc.body.appendChild(clone);

    const nameToUse = silentFileName || `Cherry_Classroom_Session_${new Date().toISOString().slice(0, 10)}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: nameToUse,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: primaryColor || "#0c201a",
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    if (silentFileName) {
      const pdfBlob = await html2pdf().from(clone).set(opt).outputPdf("blob");
      document.body.removeChild(iframe);
      return pdfBlob;
    } else {
      await html2pdf().from(clone).set(opt).save();
    }

    document.body.removeChild(iframe);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  } finally {
    window.getComputedStyle = originalGetComputedStyle;
    if (iframeWindowRef && iframeOriginalGetComputedStyle) {
      iframeWindowRef.getComputedStyle = iframeOriginalGetComputedStyle;
    }
  }
  return undefined;
}
