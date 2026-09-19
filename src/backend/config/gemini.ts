import { GoogleGenAI } from "@google/genai";

// Shared Gemini Client Helper
// We must set the 'User-Agent' header to 'aistudio-build' in httpOptions for telemetry.
export function getAiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey && customApiKey.trim().length > 10)
    ? customApiKey.trim()
    : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");
  return new GoogleGenAI({
    apiKey: apiKey || undefined,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      timeout: 300000, // Explicitly configure 5-minute timeout at the SDK layer
    },
  });
}

export function resolveApiKey(reqOrKey?: any): string {
  if (typeof reqOrKey === "string" && reqOrKey.trim().length > 10) {
    return reqOrKey.trim();
  }
  if (reqOrKey && typeof reqOrKey === "object") {
    const fromHeader = reqOrKey.headers?.["x-gemini-api-key"] || reqOrKey.headers?.["x-api-key"];
    if (fromHeader && typeof fromHeader === "string" && fromHeader.trim().length > 10) {
      return fromHeader.trim();
    }
    const fromBody = reqOrKey.body?.apiKey || reqOrKey.body?.geminiApiKey;
    if (fromBody && typeof fromBody === "string" && fromBody.trim().length > 10) {
      return fromBody.trim();
    }
    const fromQuery = reqOrKey.query?.apiKey || reqOrKey.query?.geminiApiKey;
    if (fromQuery && typeof fromQuery === "string" && fromQuery.trim().length > 10) {
      return fromQuery.trim();
    }
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

export const ai = getAiClient();

// In-memory cooldown tracking for models that hit 429 quota exhaustion so we don't repeatedly slam exhausted models
export const modelQuotaCooldownUntil = new Map<string, number>();

export function isModelQuotaExhausted(model: string): boolean {
  const until = modelQuotaCooldownUntil.get(model);
  if (!until) return false;
  if (Date.now() > until) {
    modelQuotaCooldownUntil.delete(model);
    return false;
  }
  return true;
}

export function markModelQuotaExhausted(model: string, cooldownMs = 15 * 60 * 1000) {
  modelQuotaCooldownUntil.set(model, Date.now() + cooldownMs);
  if (model === "gemini-3.8-flash") {
    modelQuotaCooldownUntil.set("gemini-flash-latest", Date.now() + cooldownMs);
  } else if (model === "gemini-flash-latest") {
    modelQuotaCooldownUntil.set("gemini-3.8-flash", Date.now() + cooldownMs);
  }
}

// Robust generateContent helper with retry, backoff, and model fallback to handle 500, 502, 503, 429 quota limits, and high demand errors.
export async function generateContentWithRetry(
  params: { model: string; contents: any; config?: any },
  retries = 5,
  initialDelay = 1500,
  customApiKey?: string,
  customTimeoutMs?: number
) {
  const apiKey = (customApiKey && customApiKey.trim().length > 10)
    ? customApiKey.trim()
    : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please enter your Gemini API Key in Settings.");
  }
  let delay = initialDelay;
  const originalModel = params.model;
  const client = getAiClient(apiKey);
  
  // Valid available Gemini models in priority order: gemini-3.8-flash (primary), gemini-3.1-flash-lite (high quota pool), gemini-flash-latest
  const fullSequence = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let modelSequence: string[];
  if (originalModel && !isModelQuotaExhausted(originalModel)) {
    modelSequence = [originalModel, ...fullSequence.filter((m) => m !== originalModel)];
  } else {
    // If the requested model is on quota cooldown, sort available healthy models first
    modelSequence = [...fullSequence].sort((a, b) => (isModelQuotaExhausted(a) ? 1 : 0) - (isModelQuotaExhausted(b) ? 1 : 0));
  }

  // Ensure we can rotate through all fallback models on transient 503 high demand or quota issues
  const maxAttempts = Math.max(retries, modelSequence.length);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Select model for this attempt
    const modelIndex = (attempt - 1) % modelSequence.length;
    params.model = modelSequence[modelIndex];

    try {
      // Allow realistic timeout for multimodal / large JSON generations (default 90s, or custom timeout if specified)
      const timeoutMs = customTimeoutMs && customTimeoutMs > 10000 ? customTimeoutMs : 90000;
      let timeoutHandle: any;
      const generatePromise = client.models.generateContent(params);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(`Model ${params.model} generation timed out after ${timeoutMs}ms`)), timeoutMs);
      });
      const result = await Promise.race([generatePromise, timeoutPromise]) as any;
      clearTimeout(timeoutHandle);
      return result;
    } catch (err: any) {
      const errMsg = err?.message || "";
      const errStatus = err?.status;
      const errString = (String(err) + " " + JSON.stringify(err)).toLowerCase();

      const isTimeout = errMsg.toLowerCase().includes("timed out") || errMsg.toLowerCase().includes("timeout") || errString.includes("timeout");

      const isQuotaOrStatus429 = errMsg.includes("429") || 
                                 errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED") || 
                                 errMsg.toLowerCase().includes("quota") || 
                                 errStatus === 429 ||
                                 errString.includes("429") ||
                                 errString.includes("resource_exhausted") ||
                                 errString.includes("quota") ||
                                 errString.includes("limit_exceeded");

      if (isQuotaOrStatus429) {
        markModelQuotaExhausted(params.model);
      }

      // Check strictly for authentication errors ONLY (and NOT 429 quota exhaustion)
      const isAuthError = !isQuotaOrStatus429 && (
                          errMsg.includes("403") ||
                          errMsg.includes("401") ||
                          errMsg.includes("insufficient authentication scopes") ||
                          errStatus === 403 ||
                          errStatus === 401 ||
                          errString.includes("permission_denied") ||
                          errString.includes("access_token_scope_insufficient") ||
                          errString.includes("insufficient authentication scopes") ||
                          errString.includes("api_key_invalid") ||
                          errString.includes("unauthenticated")
      );

      if (isAuthError) {
        console.warn(`[REST Server] Gemini API authentication notice (403/401/Scope): ${errMsg || "Check GEMINI_API_KEY in Secrets"}`);
        throw new Error(`Gemini API authentication notice: ${errMsg || "Authentication scope or API key missing"}`);
      }

      const isServerError = errMsg.includes("500") ||
                            errMsg.includes("502") ||
                            errMsg.includes("504") ||
                            errMsg.toLowerCase().includes("internal error") ||
                            errMsg.toLowerCase().includes("internal") ||
                            errStatus === 500 ||
                            errStatus === 502 ||
                            errStatus === 504 ||
                            errString.includes("500") ||
                            errString.includes("internal error") ||
                            errString.includes("bad gateway") ||
                            errString.includes("gateway timeout") ||
                            errString.includes("generation request failed");

      const isTransient = errMsg.includes("503") || 
                          errMsg.toLowerCase().includes("unavailable") || 
                          errMsg.toLowerCase().includes("high demand") || 
                          errMsg.toLowerCase().includes("overloaded") || 
                          errStatus === 503 ||
                          errString.includes("503") ||
                          errString.includes("unavailable") ||
                          errString.includes("high demand") ||
                          errString.includes("overloaded") ||
                          errString.includes("service unavailable");

      const isNetworkError = errString.includes("fetch failed") ||
                             errString.includes("network") ||
                             errString.includes("disconnect") ||
                             errString.includes("econnreset") ||
                             errString.includes("econnrefused") ||
                             errString.includes("closed") ||
                             errString.includes("socket");

      const isRetryable = isTransient || isServerError || isQuotaOrStatus429 || isNetworkError || isTimeout;

      if (isRetryable && attempt < maxAttempts) {
        const nextModelIndex = attempt % modelSequence.length;
        const nextModel = modelSequence[nextModelIndex];
        const waitTime = isQuotaOrStatus429 ? 50 : (isTransient ? 300 : isTimeout ? 500 : delay);
        
        console.warn(
          `[REST Server] API non-fatal issue on model "${params.model}" (Attempt ${attempt}/${maxAttempts}, ` +
          `${isQuotaOrStatus429 ? "quota" : isTimeout ? "timeout" : isServerError ? "server-internal" : isNetworkError ? "network" : "demand spike"}). ` +
          `Falling back to "${nextModel}" in ${waitTime}ms...`
        );
        
        // Wait before retry (rapid 50ms switch for quota fallback to alternative models, 300ms for demand spikes, exponential backoff for server/network errors)
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        if (!isTransient && !isQuotaOrStatus429 && !isTimeout) delay *= 1.5;
      } else {
        console.error(`[REST Server] API Call generated error on model "${params.model}" (Attempt ${attempt}/${maxAttempts}):`, errMsg || err);
        throw err;
      }
    }
  }
}

// Standard API error response handler with 429 quota detection
export function sendApiError(res: any, defaultPrefix: string, err: any) {
  const errMsg = err?.message || err?.toString() || "";
  const isQuota = errMsg.includes("429") || 
                  errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED") || 
                  errMsg.toLowerCase().includes("quota") ||
                  errMsg.toLowerCase().includes("rate limit") ||
                  err?.status === 429;
  const status = isQuota ? 429 : 500;
  return res.status(status).json({ 
    error: `${defaultPrefix}: ${errMsg}`, 
    isQuota, 
    code: status 
  });
}
