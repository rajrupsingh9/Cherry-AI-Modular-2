import { safeGetItem, safeSetItem, safeRemoveItem } from "./safeStorage";

export interface StoredApiKey {
  id: string;
  key: string;
  label: string;
  status: "active" | "standby" | "rate_limited" | "invalid" | "exhausted";
  addedAt: number;
  lastUsed?: number;
  cooldownUntil?: number;
  requestCountInWindow?: number;
  [key: string]: any;
}

const GEMINI_API_KEY_STORAGE = "cherry_custom_gemini_api_key";
const GEMINI_API_KEYS_POOL_STORAGE = "cherry_gemini_api_keys_pool";

export function getAllStoredApiKeys(): StoredApiKey[] {
  try {
    const raw = safeGetItem(GEMINI_API_KEYS_POOL_STORAGE, "[]");
    const list: StoredApiKey[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveAllStoredApiKeys(keys: StoredApiKey[]): void {
  safeSetItem(GEMINI_API_KEYS_POOL_STORAGE, JSON.stringify(keys));
}

export function getActiveApiKey(): string {
  // 1. Check active key from pool
  const pool = getAllStoredApiKeys();
  const activeFromPool = pool.find((k) => k.status === "active");
  if (activeFromPool?.key) {
    return activeFromPool.key.trim();
  }

  // 2. Check legacy single key storage
  const custom = safeGetItem(GEMINI_API_KEY_STORAGE, "");
  if (custom && custom.trim().length > 10) {
    return custom.trim();
  }
  return "";
}

export function addStoredApiKey(key: string, label: string): StoredApiKey {
  const cleanKey = key.trim();
  const pool = getAllStoredApiKeys();
  const id = `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const isFirst = pool.length === 0;

  const newKeyItem: StoredApiKey = {
    id,
    key: cleanKey,
    label: label || `Key ${pool.length + 1}`,
    status: isFirst ? "active" : "standby",
    addedAt: Date.now(),
  };

  const updated = isFirst
    ? [newKeyItem]
    : pool.map((k) => (k.status === "active" ? k : k)).concat(newKeyItem);

  saveAllStoredApiKeys(updated);
  if (isFirst) {
    safeSetItem(GEMINI_API_KEY_STORAGE, cleanKey);
  }
  return newKeyItem;
}

export function removeStoredApiKey(id: string): void {
  const pool = getAllStoredApiKeys();
  const target = pool.find((k) => k.id === id);
  const remaining = pool.filter((k) => k.id !== id);

  if (target?.status === "active" && remaining.length > 0) {
    remaining[0].status = "active";
    safeSetItem(GEMINI_API_KEY_STORAGE, remaining[0].key);
  } else if (remaining.length === 0) {
    safeRemoveItem(GEMINI_API_KEY_STORAGE);
  }

  saveAllStoredApiKeys(remaining);
}

export function setActiveApiKey(idOrKey: string): void {
  const pool = getAllStoredApiKeys();
  const matchedById = pool.find((k) => k.id === idOrKey);

  if (matchedById) {
    const updated = pool.map((k) => ({
      ...k,
      status: (k.id === idOrKey ? "active" : "standby") as StoredApiKey["status"],
    }));
    saveAllStoredApiKeys(updated);
    safeSetItem(GEMINI_API_KEY_STORAGE, matchedById.key);
    return;
  }

  // Handle direct key passed
  if (!idOrKey || !idOrKey.trim()) {
    safeRemoveItem(GEMINI_API_KEY_STORAGE);
  } else {
    safeSetItem(GEMINI_API_KEY_STORAGE, idOrKey.trim());
  }
}

export function removeActiveApiKey(): void {
  safeRemoveItem(GEMINI_API_KEY_STORAGE);
}

export function clearAllStoredApiKeys(): void {
  safeRemoveItem(GEMINI_API_KEYS_POOL_STORAGE);
  safeRemoveItem(GEMINI_API_KEY_STORAGE);
}

export function resetKeyStatus(id: string, newStatus: StoredApiKey["status"]): void {
  const pool = getAllStoredApiKeys();
  const updated = pool.map((k) => (k.id === id ? { ...k, status: newStatus } : k));
  saveAllStoredApiKeys(updated);
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function validateGeminiApiKey(key: string): Promise<{
  valid: boolean;
  message?: string;
  model?: string;
}> {
  const cleanKey = key.trim();
  if (!cleanKey || cleanKey.length < 15) {
    return { valid: false, message: "Invalid API Key format." };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );
    if (res.ok) {
      return { valid: true, model: "gemini-2.5-flash" };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        valid: false,
        message: errData?.error?.message || "Verification rejected by Google API.",
      };
    }
  } catch (err: any) {
    // If client fetch is blocked by CORS, provide graceful fallback
    return {
      valid: true,
      message: "Key saved locally (validation deferred).",
      model: "gemini-2.5-flash",
    };
  }
}

export function hasCustomGeminiApiKey(): boolean {
  const key = getActiveApiKey();
  return Boolean(key && key.length > 10);
}

export const isCustomApiKeyConfigured = hasCustomGeminiApiKey;


export async function fetchWithKeyFailover(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const activeKey = getActiveApiKey();
  const headers = new Headers(options.headers || {});

  if (activeKey) {
    headers.set("x-custom-gemini-key", activeKey);
  }

  const enhancedOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, enhancedOptions);
    // If rate limit hit (429) and multiple keys exist, switch key and retry once
    if (res.status === 429) {
      const pool = getAllStoredApiKeys();
      const standby = pool.find((k) => k.status === "standby");
      if (standby) {
        setActiveApiKey(standby.id);
        headers.set("x-custom-gemini-key", standby.key);
        return fetch(url, { ...options, headers });
      }
    }
    return res;
  } catch (err) {
    throw err;
  }
}

