export type ApiErrorCode =
  | "BAD_REQUEST"
  | "INVALID_JSON"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_ERROR"
  | "CONFIGURATION_ERROR"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function apiError(status: number, code: ApiErrorCode, message: string) {
  return new ApiError(status, code, message);
}

export function jsonError(error: unknown) {
  const maybe = error as Partial<ApiError> & { message?: string };
  const status = typeof maybe.status === "number" ? maybe.status : 500;
  const code = maybe.code || (status < 500 ? "BAD_REQUEST" : "INTERNAL_ERROR");
  return {
    error: maybe.message || "Erreur inconnue.",
    code,
    ok: false
  };
}

export function assertRequestSize(req: Request, maxBytes: number) {
  const rawLength = req.headers.get("content-length");
  if (!rawLength) return;
  const length = Number(rawLength);
  if (Number.isFinite(length) && length > maxBytes) {
    throw apiError(413, "PAYLOAD_TOO_LARGE", `Requête trop lourde. Limite actuelle : ${Math.round(maxBytes / 1024 / 1024)} Mo.`);
  }
}

export function safeJsonParse<T>(value: string, fallback: T, label = "JSON") {
  if (!value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    throw apiError(400, "INVALID_JSON", `${label} invalide.`);
  }
}

export async function fetchJsonWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw apiError(response.status >= 500 ? 502 : response.status, "UPSTREAM_ERROR", text || `Erreur fournisseur ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    if (error?.name === "AbortError") throw apiError(504, "UPSTREAM_TIMEOUT", "Le moteur IA a mis trop longtemps à répondre.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
