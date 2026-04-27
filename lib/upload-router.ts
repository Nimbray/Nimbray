export type UploadKind = "image" | "document" | "unsupported";

export type NormalizedUpload = {
  kind: UploadKind;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  text?: string;
  warning?: string;
};

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const TEXT_EXTENSIONS = new Set(["txt", "md", "csv", "json", "log", "yaml", "yml", "xml", "html", "css", "js", "ts", "tsx", "jsx", "py", "sql"]);

export function uploadLimits() {
  return {
    maxImageMb: Number(process.env.MAX_UPLOAD_IMAGE_MB || 8),
    maxDocumentMb: Number(process.env.MAX_UPLOAD_FILE_MB || 12),
    maxInlineDocumentChars: Number(process.env.MAX_CHAT_INLINE_DOCUMENT_CHARS || 24000),
    maxImagesPerMessage: Number(process.env.MAX_CHAT_IMAGES || 4),
    maxDocumentsPerMessage: Number(process.env.MAX_CHAT_DOCUMENTS || 4)
  };
}

export function extension(name: string) {
  return String(name || "").toLowerCase().split(".").pop() || "";
}

export function isSupportedImage(type: string) {
  return IMAGE_TYPES.has(String(type || "").toLowerCase());
}

export function isPlainTextDocument(name: string, type: string) {
  const mime = String(type || "").toLowerCase();
  return mime.startsWith("text/") || ["application/json", "application/xml", "application/yaml", "application/x-yaml"].includes(mime) || TEXT_EXTENSIONS.has(extension(name));
}

export function sanitizeUploadText(text: string, maxChars = uploadLimits().maxInlineDocumentChars) {
  const clean = String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}\n\n[Document tronqué par NimbrayAI pour protéger la requête.]` : clean;
}

export function dataUrlToUpload(input: any): NormalizedUpload | null {
  if (!input) return null;
  const dataUrl = String(input.dataUrl || input.url || "");
  const match = dataUrl.match(/^data:([^;,]+);base64,/i);
  if (!match) return null;
  const type = String(input.type || match[1] || "application/octet-stream").toLowerCase();
  if (!isSupportedImage(type)) return null;
  const base64 = dataUrl.split(",")[1] || "";
  const size = Number(input.size || Math.ceil((base64.length * 3) / 4));
  return { kind: "image", name: String(input.name || "image"), type, size, dataUrl };
}

export async function fileToUpload(file: File): Promise<NormalizedUpload> {
  const name = file.name || "upload";
  const type = file.type || "application/octet-stream";
  const limits = uploadLimits();

  if (isSupportedImage(type)) {
    if (file.size > limits.maxImageMb * 1024 * 1024) {
      return { kind: "unsupported", name, type, size: file.size, warning: `Image trop lourde. Limite actuelle : ${limits.maxImageMb} Mo.` };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return { kind: "image", name, type, size: file.size, dataUrl: `data:${type};base64,${buffer.toString("base64")}` };
  }

  if (file.size > limits.maxDocumentMb * 1024 * 1024) {
    return { kind: "unsupported", name, type, size: file.size, warning: `Fichier trop lourd. Limite actuelle : ${limits.maxDocumentMb} Mo.` };
  }

  if (isPlainTextDocument(name, type)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return { kind: "document", name, type, size: file.size, text: sanitizeUploadText(buffer.toString("utf8")) };
  }

  return { kind: "unsupported", name, type, size: file.size, warning: `Format non supporté dans /api/chat : ${extension(name) || type}. Utilise /api/parse-doc pour PDF/DOCX.` };
}

export function summarizeUploads(uploads: NormalizedUpload[]) {
  const images = uploads.filter((u) => u.kind === "image");
  const documents = uploads.filter((u) => u.kind === "document");
  const unsupported = uploads.filter((u) => u.kind === "unsupported");
  return { images, documents, unsupported };
}
