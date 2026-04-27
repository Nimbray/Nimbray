import { NextResponse } from "next/server";
import { buildSystemPrompt } from "../../../lib/brain";
import { demoReply } from "../../../lib/demo-engine";
import { buildContext } from "../../../lib/free-sources";
import { detectIntent, desiredModelForIntent } from "../../../lib/model-router";
import { detectConversationIntent, inferResponseMode, conversationGuidance, type ResponseMode } from "../../../lib/conversation-engine";
import { assessSafetyWithContext, safetyGuidanceForPrompt } from "../../../lib/safety-router";
import { localBrainReply } from "../../../lib/local-brain";
import { behaviorReply } from "../../../lib/behavior-engine";
import { qualityReply, qualityGuidance } from "../../../lib/quality-engine";
import { detectCompassMode, compassGuidance } from "../../../lib/compass";
import { detectIntelligenceIntent, intentLabel, superBrainGuidance } from "../../../lib/intelligence-platform";
import { naturalIntelligenceReply, naturalIntelligenceGuidance, postProcessNaturalResponse } from "../../../lib/natural-intelligence";
import { buildProjectSnapshot, projectGuidance, projectIntelligenceReply } from "../../../lib/project-intelligence";
import { analyzeMaxIntelligence, maxIntelligenceGuidance, maxIntelligenceReply, maxIntelligenceQualityGate } from "../../../lib/max-intelligence-core";
import { truthfulnessEmergencyReply, truthfulnessEmergencyGuidance, truthfulnessQualityGate } from "../../../lib/truthfulness-emergency";
import { gptSourceIntelligenceReply, gptSourceGuidance } from "../../../lib/gpt-source-intelligence";
import { expertTeamReply, expertTeamGuidance } from "../../../lib/expert-team";
import { buildV87StyleGuidance, polishNimbrayResponse } from "../../../lib/response-polish";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type ProviderResult = { content: string; model: string; intent?: string; fallbackUsed?: boolean; sources?: string[] };

class ChatRequestError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, status = 400, code = "BAD_REQUEST", details?: Record<string, unknown>) {
    super(message);
    this.name = "ChatRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
};

type ChatLogFields = Record<string, string | number | boolean | null | undefined>;

const SUPPORTED_ATTACHMENT_TYPES = new Set([
  "application/octet-stream",
  "application/pdf",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv"
]);

function createRequestId() {
  return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function logChatEvent(level: "info" | "warn" | "error", event: string, fields: ChatLogFields = {}) {
  const payload = { service: "nimbray-api-chat", event, ...fields };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function apiErrorPayload(message: string, code: string, requestId: string, details?: Record<string, unknown>): ApiErrorPayload {
  return { code, message, ...(details ? { details } : {}), requestId };
}

function isSupportedAttachmentType(type: string) {
  const normalized = (type || "application/octet-stream").toLowerCase();
  return normalized.startsWith("image/") || SUPPORTED_ATTACHMENT_TYPES.has(normalized);
}

function norm(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function wantsSources(text: string) {
  return /\b(avec sources?|source\??|sources\??|citation|cite|preuve|preuves|reference|references|référence|références|d ou tu sors|d’où tu sors)\b/i.test(text);
}

function isMicroDialogue(text: string) {
  const q = norm(text);
  return /^(ok|okay|oui|non|merci|merci beaucoup|super|top|nickel|parfait|pas mal|bof|haha|mdr|lol|continue|vas y|vas y continue|go|d accord|je comprends pas|pas compris|tu peux faire mieux|c est faux|c est pas bon|plus simple|plus court|encore)$/.test(q);
}

function localMicroReply(text: string) {
  const q = norm(text);
  if (/^(merci|merci beaucoup)$/.test(q)) return "Avec plaisir 😊";
  if (/^(ok|okay|d accord|oui|parfait|top|nickel|super)$/.test(q)) return "Parfait. On continue quand tu veux.";
  if (/^(non)$/.test(q)) return "D’accord. Dis-moi ce que tu veux changer, et je m’adapte.";
  if (/^(pas mal)$/.test(q)) return "Merci ! On peut encore améliorer si tu veux : plus clair, plus naturel, ou plus complet.";
  if (/^(bof)$/.test(q)) return "Je vois. Qu’est-ce qui te semble moyen : le style, le fond, ou le niveau de détail ? Je peux reprendre mieux.";
  if (/^(haha|mdr|lol)$/.test(q)) return "😄 Content de t’avoir fait réagir. On continue ?";
  if (/^(continue|vas y|vas y continue|go|encore)$/.test(q)) return "Bien sûr, je continue. Donne-moi juste le fil ou la dernière idée à développer.";
  if (/^(je comprends pas|pas compris|plus simple)$/.test(q)) return "Pas de souci. Je peux reprendre plus simplement, étape par étape, sans jargon.";
  if (/^(tu peux faire mieux|c est pas bon)$/.test(q)) return "Tu as raison de me le dire. Je peux faire mieux : je reprends plus clairement, plus utilement, et sans tourner autour du pot.";
  if (/^(c est faux)$/.test(q)) return "Merci de me le signaler. Je peux corriger : dis-moi ce qui est faux, ou colle la bonne info, et je reformule proprement.";
  return "Je te suis. Dis-moi la suite.";
}

function localPracticalReply(text: string) {
  const q = norm(text);
  if (/\b(enterrer|enterrement|inhumation|obseques|deces|grand mere|grand pere|funerailles)\b/.test(q)) {
    return `Je suis désolé pour ta grand-mère. Oui, tu peux participer à l’organisation de son enterrement, mais il faut passer par les démarches officielles.

En France, en général, il faut d’abord que le décès soit constaté, puis déclaré à la mairie du lieu du décès. Ensuite, l’inhumation ou la crémation s’organise avec une entreprise de pompes funèbres, qui peut t’aider pour les autorisations, le transport, le cercueil, la cérémonie et le lien avec la mairie ou le cimetière.

Le plus simple maintenant :
1. contacte une entreprise de pompes funèbres ;
2. contacte la mairie concernée ;
3. rassemble les documents demandés, notamment le certificat de décès et les pièces d’identité ;
4. demande les délais et les possibilités d’inhumation dans la commune ou la concession familiale.

Si tu n’es pas en France, les règles peuvent changer. Dis-moi le pays ou la commune, et je te fais une checklist plus adaptée.`;
  }
  if (/\b(heritage|succession|heriter|notaire)\b/.test(q)) {
    return `Un héritage se règle généralement en plusieurs étapes. En France, on commence par identifier les héritiers, vérifier s’il existe un testament, puis contacter un notaire si la succession contient un bien immobilier, un testament, une donation entre époux, ou si la situation familiale est complexe.

En pratique :
1. récupère l’acte de décès ;
2. rassemble livret de famille, pièces d’identité, documents bancaires et biens connus ;
3. contacte un notaire si nécessaire ;
4. attends l’établissement de l’acte de notoriété ;
5. les héritiers décident ensuite de l’acceptation ou non de la succession.

Je peux te faire une checklist simple si tu me dis le pays et la situation : conjoint, enfants, testament, maison, comptes bancaires, etc.`;
  }
  if (/\b(porter plainte|plainte|menace|menaces|police|gendarmerie)\b/.test(q)) {
    return `Si tu es menacé ou victime d’une infraction, tu peux contacter la police ou la gendarmerie. Si le danger est immédiat, appelle le 17 ou le 112.

Pour une plainte, garde les preuves : messages, captures d’écran, dates, témoins, photos, certificats médicaux si besoin. Tu peux ensuite te rendre au commissariat ou à la gendarmerie, ou te renseigner sur les démarches officielles en ligne selon ta situation.

Si tu veux, raconte-moi brièvement ce qui s’est passé, et je t’aide à préparer un résumé clair des faits.`;
  }
  return null;
}

function localLightKnowledgeReply(text: string) {
  const q = norm(text);
  if (/\b(blague|raconte moi une blague|fais moi rire)\b/.test(q)) {
    return `Pourquoi les plongeurs plongent-ils toujours en arrière ?

Parce que sinon, ils tombent dans le bateau. 😄`;
  }
  if (/\b(recette|jambon|pates|quiche|cuisine)\b/.test(q) && /\b(jambon|recette)\b/.test(q)) {
    return `Bien sûr ! Voici une recette simple :

**Quiche jambon-fromage**

**Ingrédients**
- 1 pâte brisée
- 200 g de jambon en dés
- 150 g de fromage râpé
- 3 œufs
- 20 cl de crème ou de lait
- Sel, poivre

**Préparation**
1. Préchauffe le four à 180 °C.
2. Mets la pâte dans un moule.
3. Mélange les œufs, la crème, le jambon et le fromage.
4. Sale légèrement, poivre, puis verse sur la pâte.
5. Fais cuire 30 à 40 minutes, jusqu’à ce que la quiche soit bien dorée.

Astuce : avec une salade verte, ça fait un repas simple et efficace.`;
  }
  return null;
}

function compactHistory(messages: ChatMessage[]) {
  return messages.slice(-4).map((m) => ({ role: m.role, content: String(m.content || "").slice(0, 650) }));
}

function compactPrompt(prompt: string) {
  const max = Number(process.env.SYSTEM_PROMPT_MAX_CHARS || 2800);
  if (prompt.length <= max) return prompt;
  const head = prompt.slice(0, Math.floor(max * 0.55));
  const tail = prompt.slice(-Math.floor(max * 0.40));
  return `${head}

[Contexte intermédiaire réduit pour économiser les tokens]

${tail}`;
}

function groqFriendlyError(raw: string) {
  if (/rate_limit|Rate limit|Request too large|tokens per minute|TPM/i.test(raw)) {
    return "Je suis un peu ralenti là. Réessaie dans quelques secondes, ou envoie une question plus courte.";
  }
  if (/GROQ_API_KEY/i.test(raw)) return "Groq n’est pas encore configuré. Le site peut continuer en mode démo, mais la vraie IA publique demande une clé Groq dans Vercel.";
  return "Je n’ai pas pu répondre correctement cette fois. Réessaie dans quelques secondes.";
}



type ChatAttachment = {
  id?: string;
  name: string;
  type: string;
  size: number;
  kind: "image" | "document";
  text?: string;
};

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function errorResponse(message: string, status: number, code: string, requestId: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
      requestId,
      apiError: apiErrorPayload(message, code, requestId, details)
    },
    { status }
  );
}

async function readChatBody(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new ChatRequestError("Payload multipart invalide.", 400, "MULTIPART_PAYLOAD_INVALID");
    }

    const rawMessages = form.get("messages");
    const rawMessage = form.get("message");
    const rawMemory = form.get("memory");
    const rawUserKnowledge = form.get("userKnowledge");
    const rawResponseMode = form.get("responseMode");
    const rawProjectContext = form.get("projectContext");
    const rawAttachments = form.get("attachments");

    const parseJsonField = (value: FormDataEntryValue | null, fallback: any) => {
      if (typeof value !== "string" || !value.trim()) return fallback;
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };

    const messages = typeof rawMessages === "string" && rawMessages.trim()
      ? parseJsonField(rawMessages, [])
      : typeof rawMessage === "string" && rawMessage.trim()
      ? [{ role: "user", content: rawMessage }]
      : [];

    const declaredAttachments = parseJsonField(rawAttachments, []);
    const fileEntries = Array.from(form.entries()).filter(([, value]) => typeof File !== "undefined" && value instanceof File);
    const fileAttachments = await Promise.all(
      fileEntries.map(async ([field, value]) => {
        const file = value as File;
        const type = file.type || "application/octet-stream";
        const canReadText = type.startsWith("text/") || ["application/json", "text/markdown", "text/csv"].includes(type);
        const text = canReadText ? (await file.text()).slice(0, 12000) : undefined;
        return {
          id: field,
          name: file.name || field,
          type,
          size: file.size || 0,
          kind: type.startsWith("image/") ? "image" : "document",
          ...(text ? { text } : {})
        };
      })
    );

    return {
      messages,
      memory: parseJsonField(rawMemory, []),
      userKnowledge: parseJsonField(rawUserKnowledge, []),
      responseMode: typeof rawResponseMode === "string" ? rawResponseMode : "auto",
      projectContext: parseJsonField(rawProjectContext, undefined),
      attachments: [...(Array.isArray(declaredAttachments) ? declaredAttachments : []), ...fileAttachments]
    };
  }

  if (contentType.includes("application/json") || !contentType || contentType === "unknown") {
    try {
      return await req.json();
    } catch {
      throw new ChatRequestError("Requête chat invalide : le JSON envoyé n’est pas lisible.", 400, "INVALID_JSON");
    }
  }

  throw new ChatRequestError("Type de contenu non supporté pour /api/chat.", 415, "UNSUPPORTED_CONTENT_TYPE", { contentType: contentType.split(";")[0] });
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const role = item.role === "assistant" || item.role === "system" ? item.role : "user";
      const content = typeof item.content === "string" ? item.content : "";
      return content.trim() ? ({ role, content } as ChatMessage) : null;
    })
    .filter(Boolean) as ChatMessage[];
}

function normalizeAttachments(value: unknown): ChatAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!isRecord(item)) return null;
      const type = String(item.type || item.mimeType || "application/octet-stream").toLowerCase();
      const name = String(item.name || item.filename || `attachment-${index + 1}`);
      const size = Number(item.size || item.sizeBytes || 0);
      const text = typeof item.text === "string" ? item.text.slice(0, 12000) : undefined;
      return {
        id: String(item.id || `attachment-${index + 1}`),
        name,
        type,
        size: Number.isFinite(size) ? Math.max(0, size) : 0,
        kind: type.startsWith("image/") ? "image" : "document",
        ...(text ? { text } : {})
      } as ChatAttachment;
    })
    .filter(Boolean) as ChatAttachment[];
}

function enforceAttachmentLimits(attachments: ChatAttachment[]) {
  const maxFiles = Number(process.env.MAX_UPLOAD_FILES || 5);
  const maxFileBytes = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB || 10) * 1024 * 1024;
  const maxTotalBytes = Number(process.env.MAX_UPLOAD_TOTAL_SIZE_MB || 20) * 1024 * 1024;

  if (attachments.length > maxFiles) {
    throw new ChatRequestError("Trop de pièces jointes envoyées.", 413, "TOO_MANY_ATTACHMENTS", { maxFiles });
  }

  let total = 0;
  for (const attachment of attachments) {
    if (attachment.size <= 0) {
      throw new ChatRequestError("Un fichier envoyé est vide.", 400, "EMPTY_FILE", { name: attachment.name });
    }
    if (attachment.size > maxFileBytes) {
      throw new ChatRequestError("Un fichier dépasse la limite autorisée.", 413, "UPLOAD_TOO_LARGE", { maxFileSizeMb: Number(process.env.MAX_UPLOAD_FILE_SIZE_MB || 10) });
    }
    if (!isSupportedAttachmentType(attachment.type)) {
      throw new ChatRequestError("Type de fichier non supporté.", 415, "UNSUPPORTED_FILE_TYPE", { type: attachment.type });
    }
    total += attachment.size;
  }

  if (total > maxTotalBytes) {
    throw new ChatRequestError("Le total des pièces jointes dépasse la limite autorisée.", 413, "UPLOAD_TOTAL_TOO_LARGE", { maxTotalSizeMb: Number(process.env.MAX_UPLOAD_TOTAL_SIZE_MB || 20) });
  }
}

function attachmentPublicMeta(attachments: ChatAttachment[]) {
  return attachments.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    kind: item.kind,
    hasText: !!item.text
  }));
}

function hasAttachmentSignal(latestUser: string, attachments: ChatAttachment[]) {
  return attachments.length > 0 || /\[(Images?|Fichiers?|Pièces jointes?) jointes?/i.test(latestUser);
}

function attachmentGuidance(attachments: ChatAttachment[]) {
  if (!attachments.length) return "";
  const images = attachments.filter((item) => item.kind === "image");
  const documents = attachments.filter((item) => item.kind !== "image");
  const parts: string[] = [];

  if (images.length) {
    parts.push(`[Images jointes par l’utilisateur : ${images.map((item) => item.name).join(", ")} — analyse vision directe non disponible côté serveur.]`);
  }

  for (const doc of documents) {
    if (doc.text) {
      parts.push(`[Document joint : ${doc.name}]\n${doc.text.slice(0, 4000)}`);
    } else {
      parts.push(`[Document joint : ${doc.name} — contenu texte non extrait.]`);
    }
  }

  return `\n\n${parts.join("\n\n")}`;
}

async function callJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur ${response.status}`);
  }
  return response.json();
}

async function ollamaTags(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { cache: "no-store" });
    if (!res.ok) return [] as string[];
    const data = await res.json();
    return (data?.models || []).map((m: any) => m.name).filter(Boolean) as string[];
  } catch {
    return [] as string[];
  }
}

function unique(list: string[]) {
  return Array.from(new Set(list.filter(Boolean)));
}

async function chooseInstalledModel(baseUrl: string, desired: string) {
  const installed = await ollamaTags(baseUrl);
  if (!installed.length) return { model: desired, installed, fallbackUsed: false };
  if (installed.includes(desired)) return { model: desired, installed, fallbackUsed: false };

  const fallbackCandidates = unique([
    process.env.OLLAMA_MODEL,
    process.env.OLLAMA_MODEL_GENERAL,
    process.env.OLLAMA_MODEL_FAST,
    "qwen2.5:3b",
    "llama3.2",
    "mistral",
    installed[0]
  ] as string[]);

  const found = fallbackCandidates.find((m) => installed.includes(m));
  return { model: found || desired, installed, fallbackUsed: !!found };
}

async function ollamaReply(messages: ChatMessage[], systemPrompt: string, latestUser: string): Promise<ProviderResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const intent = detectIntent(latestUser);
  const desired = process.env.OLLAMA_ENABLE_ROUTER === "false"
    ? process.env.OLLAMA_MODEL || process.env.OLLAMA_MODEL_GENERAL || "qwen2.5:3b"
    : desiredModelForIntent(intent);
  const selected = await chooseInstalledModel(baseUrl, desired);

  const data = await callJson(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selected.model,
      stream: false,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      options: { temperature: intent === "creative" ? 0.82 : 0.68 }
    })
  });
  return { content: data?.message?.content || "Aucune réponse du modèle local.", model: selected.model, intent, fallbackUsed: selected.fallbackUsed };
}

async function groqReply(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY manquante");
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const data = await callJson("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.62,
      max_tokens: Number(process.env.GROQ_MAX_TOKENS || 650),
      messages: [{ role: "system", content: compactPrompt(systemPrompt) }, ...compactHistory(messages)]
    })
  });
  return { content: data?.choices?.[0]?.message?.content || "Aucune réponse Groq.", model };
}

async function openRouterReply(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY manquante");
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
  const data = await callJson("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "http://localhost:3000", "X-Title": "NimbrayAI" },
    body: JSON.stringify({ model, temperature: 0.7, messages: [{ role: "system", content: systemPrompt }, ...messages] })
  });
  return { content: data?.choices?.[0]?.message?.content || "Aucune réponse OpenRouter.", model };
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const contentType = req.headers.get("content-type") || "unknown";
  try {
    const body = await readChatBody(req);
    if (!isRecord(body)) return errorResponse("Requête chat invalide.", 400, "INVALID_BODY", requestId);

    const attachments = normalizeAttachments(body.attachments);
    enforceAttachmentLimits(attachments);
    const messages = normalizeMessages(body.messages);
    if (!messages.length) return errorResponse("Aucun message fourni.", 400, "NO_MESSAGES", requestId);

    logChatEvent("info", "request_validated", {
      requestId,
      contentType: contentType.split(";")[0],
      messages: messages.length,
      attachments: attachments.length,
      attachmentBytes: attachments.reduce((sum, item) => sum + Math.max(0, item.size || 0), 0)
    });

    const memory = process.env.ENABLE_MEMORY === "false" ? [] : (Array.isArray(body.memory) ? body.memory.filter(Boolean).slice(0, 18) : []);
    const userKnowledge = Array.isArray(body.userKnowledge) ? body.userKnowledge.filter(Boolean).slice(0, 18) : [];
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const latestUser = `${latestUserMessage?.content || ""}${attachmentGuidance(attachments)}`.trim();
    if (latestUserMessage) latestUserMessage.content = latestUser;
    const responseMode = inferResponseMode(latestUser, (body.responseMode || "auto") as ResponseMode);
    const imageAttachments = attachments.filter((item) => item.kind === "image");
    const fileAttachments = attachments.filter((item) => item.kind !== "image");
    const hasLegacyImageSignal = /\[Images jointes par l’utilisateur/i.test(latestUser);
    const hasOnlyUnprocessableAttachments = hasAttachmentSignal(latestUser, attachments) && !fileAttachments.some((item) => item.text) && (imageAttachments.length > 0 || hasLegacyImageSignal);
    if (hasOnlyUnprocessableAttachments) {
      return NextResponse.json({
        ok: true,
        content: imageAttachments.length > 1
          ? `J’ai bien reçu les ${imageAttachments.length} images. Je peux les garder affichées dans la conversation, mais cette version serveur ne dispose pas encore d’un modèle vision pour les analyser directement. Décris-moi ce que tu veux vérifier sur les images, et je t’aide précisément à partir de ta description.`
          : "J’ai bien reçu l’image. Je peux l’afficher dans la conversation, mais cette version serveur ne dispose pas encore d’un modèle vision pour l’analyser directement. Décris-moi ce que tu veux vérifier sur l’image, et je t’aide précisément à partir de ta description.",
        provider: "nimbray-local",
        model: "v87-observability-api",
        intent: "attachment-upload",
        responseMode,
        fallbackUsed: false,
        sourcesUsed: [],
        attachments: attachmentPublicMeta(attachments),
        requestId
      });
    }
    const maxProfile = analyzeMaxIntelligence(latestUser, messages);
    const projectSnapshot = buildProjectSnapshot({
      latestUser,
      messages,
      memory,
      projectContext: body?.projectContext || { projectName: "NimbrayAI", focus: "évolution IA conversationnelle, sécurité, mémoire projet et qualité" }
    });
    const safety = assessSafetyWithContext(latestUser, messages);
    if (safety.shouldIntercept && safety.response) {
      return NextResponse.json({
        content: safety.response,
        provider: "safety",
        model: "safe-human-brain",
        intent: safety.category,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    const truthfulness = truthfulnessEmergencyReply(latestUser, messages);
    if (truthfulness) {
      return NextResponse.json({
        content: truthfulness.content,
        provider: "nimbray-local",
        model: "v75-1-truthfulness-emergency-fix",
        intent: truthfulness.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V82 Expert Team Orchestrator : transforme les demandes projet ambitieuses
    // en sprint coordonné Produit + IA + Backend + Frontend avec workspaces séparés.
    const expertTeam = expertTeamReply(latestUser, messages);
    if (expertTeam) {
      return NextResponse.json({
        content: expertTeam.content,
        provider: "nimbray-local",
        model: "v87-natural-product-brain",
        intent: expertTeam.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }
    // V76 GPT Source Intelligence : inspire NimbrayAI des principes GPTs publics
    // sans copier de GPT privé, sans inventer d accès et sans faux liens/actions.
    const gptSource = gptSourceIntelligenceReply(latestUser, messages);
    if (gptSource) {
      return NextResponse.json({
        content: gptSource.content,
        provider: "nimbray-local",
        model: "v76-gpt-source-intelligence",
        intent: gptSource.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }


    // V72 Memory & Project Intelligence : état projet, décisions, roadmap et prochaine action avant les anciens moteurs.
    const projectReply = projectIntelligenceReply(latestUser, projectSnapshot);
    if (projectReply) {
      return NextResponse.json({
        content: projectReply.content,
        provider: "nimbray-local",
        model: "v87-project-intelligence",
        intent: projectReply.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V74 Max Intelligence Core : raisonnement, contraintes et réponses pratiques avant les anciens moteurs.
    const maxReply = maxIntelligenceReply(latestUser, messages);
    if (maxReply) {
      return NextResponse.json({
        content: maxReply.content,
        provider: "nimbray-local",
        model: "v74-max-intelligence-core",
        intent: maxReply.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V71.3 Contextual Safety & Knowledge Boost : micro-intentions, silence persistant,
    // solitude, identité/orientation et dialogue naturel avant les anciens moteurs.
    const natural = naturalIntelligenceReply(latestUser, messages);
    if (natural?.shouldIntercept) {
      return NextResponse.json({
        content: natural.content,
        provider: "nimbray-local",
        model: "v71-3-contextual-safety",
        intent: natural.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V37 Emotional Variation Engine : les émotions simples, conflits, micro-dialogues,
    // humour, empathie et prudence sont traités localement avant Groq.
    const behavior = behaviorReply(latestUser);
    if (behavior) {
      return NextResponse.json({
        content: behavior.content,
        provider: "nimbray-local",
        model: "v71-3-natural-human-engine",
        intent: behavior.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V40 Quality Gate : critiques, corrections, demandes de style et prudence.
    const quality = qualityReply(latestUser);
    if (quality) {
      return NextResponse.json({
        content: quality.content,
        provider: "nimbray-local",
        model: "v71-3-natural-quality-engine",
        intent: quality.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    // V40 Consolidated Local Brain: tout ce qui est stable, répétitif, sensible ou conversationnel
    // est traité localement avant d'appeler Groq. Cela rend le site plus rapide,
    // évite les rate limits et donne une personnalité plus vivante à NimbrayAI.
    const localBrain = localBrainReply(latestUser);
    if (localBrain) {
      return NextResponse.json({
        content: localBrain.content,
        provider: "nimbray-local",
        model: "v71-3-natural-local-brain",
        intent: localBrain.intent,
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }

    const localPractical = localPracticalReply(latestUser);
    const localKnowledge = localLightKnowledgeReply(latestUser);
    if (isMicroDialogue(latestUser) || localPractical || localKnowledge) {
      return NextResponse.json({
        content: localPractical || localKnowledge || localMicroReply(latestUser),
        provider: "nimbray-local",
        model: "v71-3-natural-local-router",
        intent: isMicroDialogue(latestUser) ? "micro-dialogue" : "local-practical",
        responseMode: "auto",
        fallbackUsed: false,
        sourcesUsed: []
      });
    }
    const conversationIntent = detectConversationIntent(latestUser);
    const compassMode = detectCompassMode(latestUser);
    const platformIntent = detectIntelligenceIntent(latestUser);
    const sourceRequested = wantsSources(latestUser);
    // V32: ne charge pas des sources pour tout et rien. Les connaissances stables
    // sont gérées localement ; le contexte externe est réservé aux demandes longues,
    // documentaires, de recherche ou explicitement sourcées.
    const contextUseful = sourceRequested || ["document", "research"].includes(conversationIntent) || ["document", "research", "super_brain", "project"].includes(platformIntent) || latestUser.length > 260;
    const { context, sources } = contextUseful ? await buildContext(latestUser, userKnowledge) : { context: "", sources: [] as any[] };
    const guidance = `${conversationGuidance(conversationIntent, responseMode)}
${naturalIntelligenceGuidance()}
${projectGuidance(projectSnapshot)}
${maxIntelligenceGuidance(maxProfile)}
${truthfulnessEmergencyGuidance()}
${gptSourceGuidance()}
${expertTeamGuidance()}
${safetyGuidanceForPrompt()}
Sécurité détectée : ${safety.category}. ${safety.guidance}
V76 GPT Source Intelligence, V74 Max Intelligence Core, Memory & Project Intelligence, Contextual Safety, Sources & Knowledge Platform : réponse directe, naturelle, fiable et humaine. Priorité aux moteurs locaux consolidés avant Groq. Groq seulement si nécessaire. Sources invisibles sauf demande explicite. Pas de JSON technique. Intent platform détecté : ${intentLabel(platformIntent)}. ${platformIntent === "super_brain" ? `Super Brain : ${superBrainGuidance().join(" ; ")}.` : ""} ${compassGuidance(compassMode)} ${qualityGuidance(latestUser)}`;
    const systemPrompt = buildSystemPrompt(memory.slice(0, 5), context, guidance);
    const provider = (process.env.AI_PROVIDER || "demo").toLowerCase();

    let result: ProviderResult;
    if (provider === "ollama") result = await ollamaReply(messages, systemPrompt, latestUser);
    else if (provider === "groq") result = await groqReply(messages, systemPrompt);
    else if (provider === "openrouter") result = await openRouterReply(messages, systemPrompt);
    else result = { content: demoReply(messages, memory, userKnowledge.length > 0, responseMode, conversationIntent), model: "nimbray-demo-engine-v87", intent: conversationIntent };

    const showSources = wantsSources(latestUser);
    const cleanSources = showSources
      ? sources
          .filter((s) => s.score === undefined || s.score > 1 || s.type !== "local")
          .map((s) => ({ title: s.title, type: s.type, url: (s as any).url }))
          .slice(0, 8)
      : [];

    logChatEvent("info", "request_completed", { requestId, provider, status: 200, elapsedMs: Date.now() - startedAt });

    return NextResponse.json({
      ok: true,
      content: truthfulnessQualityGate(maxIntelligenceQualityGate(postProcessNaturalResponse(result.content, latestUser, messages), latestUser, messages), latestUser, messages),
      provider,
      model: result.model,
      intent: result.intent || platformIntent || conversationIntent || null,
      responseMode,
      fallbackUsed: !!result.fallbackUsed,
      sourcesUsed: cleanSources,
      attachments: attachments.length ? attachmentPublicMeta(attachments) : [],
      requestId
    });
  } catch (error: any) {
    if (error instanceof ChatRequestError) {
      logChatEvent(error.status >= 500 ? "error" : "warn", "request_rejected", {
        requestId,
        status: error.status,
        code: error.code,
        elapsedMs: Date.now() - startedAt
      });
      return errorResponse(error.message, error.status, error.code, requestId, error.details);
    }

    const raw = error?.message || "Erreur inconnue";
    const provider = (process.env.AI_PROVIDER || "demo").toLowerCase();
    const invalidJson = /JSON|Unexpected token|Unexpected end/i.test(raw);
    const friendly = invalidJson
      ? "Requête chat invalide : le JSON envoyé n’est pas lisible."
      : provider === "groq"
      ? groqFriendlyError(raw)
      : raw.includes("model") && raw.includes("not found")
      ? "Le modèle demandé n’est pas disponible. Je peux continuer avec un autre modèle installé ou en mode démo."
      : raw.includes("fetch failed")
      ? "Je n’arrive pas à contacter le moteur IA local. Vérifie qu’Ollama est lancé, ou utilise le mode démo en attendant."
      : "Je n’ai pas pu répondre correctement cette fois. Réessaie dans quelques secondes.";
    const status = invalidJson ? 400 : 500;
    const code = invalidJson ? "INVALID_JSON" : "CHAT_BACKEND_ERROR";
    logChatEvent(status >= 500 ? "error" : "warn", "request_failed", { requestId, status, code, provider, elapsedMs: Date.now() - startedAt });
    return errorResponse(friendly, status, code, requestId);
  }
}
