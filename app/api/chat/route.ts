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
  return /\b(avec sources?|source\??|sources\??|citation|cite|preuve|preuves|reference|references|rÃ©fÃ©rence|rÃ©fÃ©rences|d ou tu sors|dâ€™oÃ¹ tu sors)\b/i.test(text);
}

function isMicroDialogue(text: string) {
  const q = norm(text);
  return /^(ok|okay|oui|non|merci|merci beaucoup|super|top|nickel|parfait|pas mal|bof|haha|mdr|lol|continue|vas y|vas y continue|go|d accord|je comprends pas|pas compris|tu peux faire mieux|c est faux|c est pas bon|plus simple|plus court|encore)$/.test(q);
}

function localMicroReply(text: string) {
  const q = norm(text);
  if (/^(merci|merci beaucoup)$/.test(q)) return "Avec plaisir ðŸ˜Š";
  if (/^(ok|okay|d accord|oui|parfait|top|nickel|super)$/.test(q)) return "Parfait. On continue quand tu veux.";
  if (/^(non)$/.test(q)) return "Dâ€™accord. Dis-moi ce que tu veux changer, et je mâ€™adapte.";
  if (/^(pas mal)$/.test(q)) return "Merci ! On peut encore amÃ©liorer si tu veux : plus clair, plus naturel, ou plus complet.";
  if (/^(bof)$/.test(q)) return "Je vois. Quâ€™est-ce qui te semble moyen : le style, le fond, ou le niveau de dÃ©tail ? Je peux reprendre mieux.";
  if (/^(haha|mdr|lol)$/.test(q)) return "ðŸ˜„ Content de tâ€™avoir fait rÃ©agir. On continue ?";
  if (/^(continue|vas y|vas y continue|go|encore)$/.test(q)) return "Bien sÃ»r, je continue. Donne-moi juste le fil ou la derniÃ¨re idÃ©e Ã  dÃ©velopper.";
  if (/^(je comprends pas|pas compris|plus simple)$/.test(q)) return "Pas de souci. Je peux reprendre plus simplement, Ã©tape par Ã©tape, sans jargon.";
  if (/^(tu peux faire mieux|c est pas bon)$/.test(q)) return "Tu as raison de me le dire. Je peux faire mieux : je reprends plus clairement, plus utilement, et sans tourner autour du pot.";
  if (/^(c est faux)$/.test(q)) return "Merci de me le signaler. Je peux corriger : dis-moi ce qui est faux, ou colle la bonne info, et je reformule proprement.";
  return "Je te suis. Dis-moi la suite.";
}

function localPracticalReply(text: string) {
  const q = norm(text);
  if (/\b(enterrer|enterrement|inhumation|obseques|deces|grand mere|grand pere|funerailles)\b/.test(q)) {
    return `Je suis dÃ©solÃ© pour ta grand-mÃ¨re. Oui, tu peux participer Ã  lâ€™organisation de son enterrement, mais il faut passer par les dÃ©marches officielles.

En France, en gÃ©nÃ©ral, il faut dâ€™abord que le dÃ©cÃ¨s soit constatÃ©, puis dÃ©clarÃ© Ã  la mairie du lieu du dÃ©cÃ¨s. Ensuite, lâ€™inhumation ou la crÃ©mation sâ€™organise avec une entreprise de pompes funÃ¨bres, qui peut tâ€™aider pour les autorisations, le transport, le cercueil, la cÃ©rÃ©monie et le lien avec la mairie ou le cimetiÃ¨re.

Le plus simple maintenant :
1. contacte une entreprise de pompes funÃ¨bres ;
2. contacte la mairie concernÃ©e ;
3. rassemble les documents demandÃ©s, notamment le certificat de dÃ©cÃ¨s et les piÃ¨ces dâ€™identitÃ© ;
4. demande les dÃ©lais et les possibilitÃ©s dâ€™inhumation dans la commune ou la concession familiale.

Si tu nâ€™es pas en France, les rÃ¨gles peuvent changer. Dis-moi le pays ou la commune, et je te fais une checklist plus adaptÃ©e.`;
  }
  if (/\b(heritage|succession|heriter|notaire)\b/.test(q)) {
    return `Un hÃ©ritage se rÃ¨gle gÃ©nÃ©ralement en plusieurs Ã©tapes. En France, on commence par identifier les hÃ©ritiers, vÃ©rifier sâ€™il existe un testament, puis contacter un notaire si la succession contient un bien immobilier, un testament, une donation entre Ã©poux, ou si la situation familiale est complexe.

En pratique :
1. rÃ©cupÃ¨re lâ€™acte de dÃ©cÃ¨s ;
2. rassemble livret de famille, piÃ¨ces dâ€™identitÃ©, documents bancaires et biens connus ;
3. contacte un notaire si nÃ©cessaire ;
4. attends lâ€™Ã©tablissement de lâ€™acte de notoriÃ©tÃ© ;
5. les hÃ©ritiers dÃ©cident ensuite de lâ€™acceptation ou non de la succession.

Je peux te faire une checklist simple si tu me dis le pays et la situation : conjoint, enfants, testament, maison, comptes bancaires, etc.`;
  }
  if (/\b(porter plainte|plainte|menace|menaces|police|gendarmerie)\b/.test(q)) {
    return `Si tu es menacÃ© ou victime dâ€™une infraction, tu peux contacter la police ou la gendarmerie. Si le danger est immÃ©diat, appelle le 17 ou le 112.

Pour une plainte, garde les preuves : messages, captures dâ€™Ã©cran, dates, tÃ©moins, photos, certificats mÃ©dicaux si besoin. Tu peux ensuite te rendre au commissariat ou Ã  la gendarmerie, ou te renseigner sur les dÃ©marches officielles en ligne selon ta situation.

Si tu veux, raconte-moi briÃ¨vement ce qui sâ€™est passÃ©, et je tâ€™aide Ã  prÃ©parer un rÃ©sumÃ© clair des faits.`;
  }
  return null;
}

function localLightKnowledgeReply(text: string) {
  const q = norm(text);
  if (/\b(blague|raconte moi une blague|fais moi rire)\b/.test(q)) {
    return `Pourquoi les plongeurs plongent-ils toujours en arriÃ¨re ?

Parce que sinon, ils tombent dans le bateau. ðŸ˜„`;
  }
  if (/\b(recette|jambon|pates|quiche|cuisine)\b/.test(q) && /\b(jambon|recette)\b/.test(q)) {
    return `Bien sÃ»r ! Voici une recette simple :

**Quiche jambon-fromage**

**IngrÃ©dients**
- 1 pÃ¢te brisÃ©e
- 200 g de jambon en dÃ©s
- 150 g de fromage rÃ¢pÃ©
- 3 Å“ufs
- 20 cl de crÃ¨me ou de lait
- Sel, poivre

**PrÃ©paration**
1. PrÃ©chauffe le four Ã  180 Â°C.
2. Mets la pÃ¢te dans un moule.
3. MÃ©lange les Å“ufs, la crÃ¨me, le jambon et le fromage.
4. Sale lÃ©gÃ¨rement, poivre, puis verse sur la pÃ¢te.
5. Fais cuire 30 Ã  40 minutes, jusquâ€™Ã  ce que la quiche soit bien dorÃ©e.

Astuce : avec une salade verte, Ã§a fait un repas simple et efficace.`;
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

[Contexte intermÃ©diaire rÃ©duit pour Ã©conomiser les tokens]

${tail}`;
}

function groqFriendlyError(raw: string) {
  if (/rate_limit|Rate limit|Request too large|tokens per minute|TPM/i.test(raw)) {
    return "Je suis un peu ralenti lÃ . RÃ©essaie dans quelques secondes, ou envoie une question plus courte.";
  }
  if (/GROQ_API_KEY/i.test(raw)) return "Groq nâ€™est pas encore configurÃ©. Le site peut continuer en mode dÃ©mo, mais la vraie IA publique demande une clÃ© Groq dans Vercel.";
  return "Je nâ€™ai pas pu rÃ©pondre correctement cette fois. RÃ©essaie dans quelques secondes.";
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
      throw new ChatRequestError("RequÃªte chat invalide : le JSON envoyÃ© nâ€™est pas lisible.", 400, "INVALID_JSON");
    }
  }

  throw new ChatRequestError("Type de contenu non supportÃ© pour /api/chat.", 415, "UNSUPPORTED_CONTENT_TYPE", { contentType: contentType.split(";")[0] });
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
    throw new ChatRequestError("Trop de piÃ¨ces jointes envoyÃ©es.", 413, "TOO_MANY_ATTACHMENTS", { maxFiles });
  }

  let total = 0;
  for (const attachment of attachments) {
    if (attachment.size <= 0) {
      throw new ChatRequestError("Un fichier envoyÃ© est vide.", 400, "EMPTY_FILE", { name: attachment.name });
    }
    if (attachment.size > maxFileBytes) {
      throw new ChatRequestError("Un fichier dÃ©passe la limite autorisÃ©e.", 413, "UPLOAD_TOO_LARGE", { maxFileSizeMb: Number(process.env.MAX_UPLOAD_FILE_SIZE_MB || 10) });
    }
    if (!isSupportedAttachmentType(attachment.type)) {
      throw new ChatRequestError("Type de fichier non supportÃ©.", 415, "UNSUPPORTED_FILE_TYPE", { type: attachment.type });
    }
    total += attachment.size;
  }

  if (total > maxTotalBytes) {
    throw new ChatRequestError("Le total des piÃ¨ces jointes dÃ©passe la limite autorisÃ©e.", 413, "UPLOAD_TOTAL_TOO_LARGE", { maxTotalSizeMb: Number(process.env.MAX_UPLOAD_TOTAL_SIZE_MB || 20) });
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
  return attachments.length > 0 || /\[(Images?|Fichiers?|PiÃ¨ces jointes?) jointes?/i.test(latestUser);
}

function attachmentGuidance(attachments: ChatAttachment[]) {
  if (!attachments.length) return "";
  const images = attachments.filter((item) => item.kind === "image");
  const documents = attachments.filter((item) => item.kind !== "image");
  const parts: string[] = [];

  if (images.length) {
    parts.push(`[Images jointes par lâ€™utilisateur : ${images.map((item) => item.name).join(", ")} â€” analyse vision directe non disponible cÃ´tÃ© serveur.]`);
  }

  for (const doc of documents) {
    if (doc.text) {
      parts.push(`[Document joint : ${doc.name}]\n${doc.text.slice(0, 4000)}`);
    } else {
      parts.push(`[Document joint : ${doc.name} â€” contenu texte non extrait.]`);
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
  return { content: data?.message?.content || "Aucune rÃ©ponse du modÃ¨le local.", model: selected.model, intent, fallbackUsed: selected.fallbackUsed };
}

async function groqReply(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY manquante");
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
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
  return { content: data?.choices?.[0]?.message?.content || "Aucune rÃ©ponse Groq.", model };
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
  return { content: data?.choices?.[0]?.message?.content || "Aucune rÃ©ponse OpenRouter.", model };
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const contentType = req.headers.get("content-type") || "unknown";
  try {
    const body = await readChatBody(req);
    if (!isRecord(body)) return errorResponse("RequÃªte chat invalide.", 400, "INVALID_BODY", requestId);

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
    const hasLegacyImageSignal = /\[Images jointes par lâ€™utilisateur/i.test(latestUser);
    const hasOnlyUnprocessableAttachments = hasAttachmentSignal(latestUser, attachments) && !fileAttachments.some((item) => item.text) && (imageAttachments.length > 0 || hasLegacyImageSignal);
    if (hasOnlyUnprocessableAttachments) {
      return NextResponse.json({
        ok: true,
        content: imageAttachments.length > 1
          ? `Jâ€™ai bien reÃ§u les ${imageAttachments.length} images. Je peux les garder affichÃ©es dans la conversation, mais cette version serveur ne dispose pas encore dâ€™un modÃ¨le vision pour les analyser directement. DÃ©cris-moi ce que tu veux vÃ©rifier sur les images, et je tâ€™aide prÃ©cisÃ©ment Ã  partir de ta description.`
          : "Jâ€™ai bien reÃ§u lâ€™image. Je peux lâ€™afficher dans la conversation, mais cette version serveur ne dispose pas encore dâ€™un modÃ¨le vision pour lâ€™analyser directement. DÃ©cris-moi ce que tu veux vÃ©rifier sur lâ€™image, et je tâ€™aide prÃ©cisÃ©ment Ã  partir de ta description.",
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
      projectContext: body?.projectContext || { projectName: "NimbrayAI", focus: "Ã©volution IA conversationnelle, sÃ©curitÃ©, mÃ©moire projet et qualitÃ©" }
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
    // en sprint coordonnÃ© Produit + IA + Backend + Frontend avec workspaces sÃ©parÃ©s.
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
    // sans copier de GPT privÃ©, sans inventer d accÃ¨s et sans faux liens/actions.
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


    // V72 Memory & Project Intelligence : Ã©tat projet, dÃ©cisions, roadmap et prochaine action avant les anciens moteurs.
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

    // V74 Max Intelligence Core : raisonnement, contraintes et rÃ©ponses pratiques avant les anciens moteurs.
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
    // solitude, identitÃ©/orientation et dialogue naturel avant les anciens moteurs.
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

    // V37 Emotional Variation Engine : les Ã©motions simples, conflits, micro-dialogues,
    // humour, empathie et prudence sont traitÃ©s localement avant Groq.
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

    // V40 Consolidated Local Brain: tout ce qui est stable, rÃ©pÃ©titif, sensible ou conversationnel
    // est traitÃ© localement avant d'appeler Groq. Cela rend le site plus rapide,
    // Ã©vite les rate limits et donne une personnalitÃ© plus vivante Ã  NimbrayAI.
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
    // sont gÃ©rÃ©es localement ; le contexte externe est rÃ©servÃ© aux demandes longues,
    // documentaires, de recherche ou explicitement sourcÃ©es.
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
SÃ©curitÃ© dÃ©tectÃ©e : ${safety.category}. ${safety.guidance}
V76 GPT Source Intelligence, V74 Max Intelligence Core, Memory & Project Intelligence, Contextual Safety, Sources & Knowledge Platform : rÃ©ponse directe, naturelle, fiable et humaine. PrioritÃ© aux moteurs locaux consolidÃ©s avant Groq. Groq seulement si nÃ©cessaire. Sources invisibles sauf demande explicite. Pas de JSON technique. Intent platform dÃ©tectÃ© : ${intentLabel(platformIntent)}. ${platformIntent === "super_brain" ? `Super Brain : ${superBrainGuidance().join(" ; ")}.` : ""} ${compassGuidance(compassMode)} ${qualityGuidance(latestUser)}`;
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
      ? "RequÃªte chat invalide : le JSON envoyÃ© nâ€™est pas lisible."
      : provider === "groq"
      ? groqFriendlyError(raw)
      : raw.includes("model") && raw.includes("not found")
      ? "Le modÃ¨le demandÃ© nâ€™est pas disponible. Je peux continuer avec un autre modÃ¨le installÃ© ou en mode dÃ©mo."
      : raw.includes("fetch failed")
      ? "Je nâ€™arrive pas Ã  contacter le moteur IA local. VÃ©rifie quâ€™Ollama est lancÃ©, ou utilise le mode dÃ©mo en attendant."
      : "Je nâ€™ai pas pu rÃ©pondre correctement cette fois. RÃ©essaie dans quelques secondes.";
    const status = invalidJson ? 400 : 500;
    const code = invalidJson ? "INVALID_JSON" : "CHAT_BACKEND_ERROR";
    logChatEvent(status >= 500 ? "error" : "warn", "request_failed", { requestId, status, code, provider, elapsedMs: Date.now() - startedAt });
    return errorResponse(friendly, status, code, requestId);
  }
}

