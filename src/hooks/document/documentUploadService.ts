import { compressImageIfPossible } from "../../utils/imageCompressor";
import { getActiveApiKey } from "../../utils/geminiKeyStorage";

export interface UploadFileOptions {
  file: File;
  uploadMode: string;
  sessionId: string | null;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export interface UploadFileResult {
  success: boolean;
  filename?: string;
  mimeType?: string;
  markdown?: string;
  mode?: string;
  detectedSubject?: string;
  error?: string;
}

export async function uploadDocumentFile({
  file,
  uploadMode,
  sessionId,
  addToast,
}: UploadFileOptions): Promise<UploadFileResult | null> {
  const isImage = (file.type && file.type.startsWith("image/")) || /\.(jpe?g|png|webp|gif|bmp|heic|tiff)$/i.test(file.name);
  const isPDFOrDoc = !isImage;

  if (isPDFOrDoc && file.size > 5 * 1024 * 1024) {
    addToast(
      `Syllabus document size of ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the 5MB gateway limit for non-image files. Please upload a more compact PDF or text file.`,
      "error"
    );
    return null;
  }

  addToast(isImage ? "Optimizing calculations image..." : "Analyzing document with Gemini...", "info");

  const result = await compressImageIfPossible(file, 1200, 0.70);
  if (!result) {
    throw new Error("Failed to read document contents safely.");
  }

  const splitResult = result.split(",");
  if (splitResult.length < 2) {
    throw new Error("Invalid base64 payload returned from document reader.");
  }

  let resolvedMime = file.type || "";
  if (!resolvedMime || resolvedMime === "application/octet-stream") {
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".pdf")) resolvedMime = "application/pdf";
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) resolvedMime = "image/jpeg";
    else if (lower.endsWith(".png")) resolvedMime = "image/png";
    else if (lower.endsWith(".webp")) resolvedMime = "image/webp";
    else if (lower.endsWith(".gif")) resolvedMime = "image/gif";
    else if (lower.endsWith(".txt")) resolvedMime = "text/plain";
    else if (lower.endsWith(".md") || lower.endsWith(".markdown")) resolvedMime = "text/markdown";
    else if (lower.endsWith(".json")) resolvedMime = "application/json";
    else if (lower.endsWith(".csv")) resolvedMime = "text/csv";
    else resolvedMime = isImage ? "image/jpeg" : "application/pdf";
  }

  const base64Data = splitResult[1];
  const activeKey = getActiveApiKey();
  const payload = {
    filename: file.name,
    mimeType: resolvedMime,
    base64Data,
    mode: uploadMode,
    sessionId,
    apiKey: activeKey || undefined,
  };

  let response: Response | null = null;
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("/api/upload-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeKey ? { "x-gemini-api-key": activeKey } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      response = res;
      if (res.ok || res.status === 413 || res.status === 500) {
        break;
      }
      throw new Error(`Server returned HTTP status ${res.status}`);
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.warn(`Upload attempt ${attempt} failed:`, fetchErr);
      if (attempt === attempts) throw fetchErr;
      addToast(`Upload interrupted. Retrying automatically (attempt ${attempt + 1}/${attempts})...`, "info");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!response || !response.ok) {
    let errorMsg = "Internal server or gateway error during upload";
    if (response) {
      try {
        const rawText = await response.text();
        if (rawText.trim().startsWith("{")) {
          const errData = JSON.parse(rawText);
          errorMsg = errData.error || errorMsg;
        } else if (rawText.toLowerCase().includes("payload too large") || response.status === 413) {
          errorMsg = "File is too large! Please upload a syllabus document or image smaller than 3MB to avoid network timeouts.";
        } else {
          errorMsg = `Server error (Status ${response.status}). Please try optimizing your document content or try again.`;
        }
      } catch (_) {
        if (response.status === 413) {
          errorMsg = "Request entity too large! Please upload a smaller document (< 4MB) to bypass server buffers.";
        }
      }
    }
    addToast(errorMsg, "error");
    return null;
  }

  const rawText = await response.text();
  if (!rawText.trim().startsWith("{")) {
    throw new Error("Invalid response format received from the server.");
  }
  return JSON.parse(rawText);
}
