import type { NormalizedUpload } from "./upload-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type VisionResult = {
  content: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  warning?: string;
};

function compactVisionHistory(messages: ChatMessage[]) {
  return messages.slice(-4).map((m) => ({ role: m.role, content: String(m.content || "").slice(0, 900) }));
}

export function visionStatus() {
  const provider = (process.env.VISION_PROVIDER || "").toLowerCase();
  const configured =
    (provider === "groq" && !!process.env.GROQ_API_KEY && !!process.env.VISION_MODEL) ||
    (provider === "openrouter" && !!process.env.OPENROUTER_API_KEY && !!process.env.VISION_MODEL);
  return {
    enabled: process.env.ENABLE_VISION_UPLOADS !== "false",
    provider: provider || "none",
    model: process.env.VISION_MODEL || "not-configured",
    configured
  };
}

function fallbackVisionResponse(images: NormalizedUpload[], unsupported: NormalizedUpload[]) {
  const imageList = images.map((img) => `- ${img.name} (${img.type}, ${Math.round(img.size / 1024)} Ko)`).join("\n");
  const unsupportedList = unsupported.length
    ? `\n\nFichiers non analysés directement :\n${unsupported.map((file) => `- ${file.name} : ${file.warning || "format non supporté"}`).join("\n")}`
    : "";
  return `J’ai bien reçu ${images.length > 1 ? "les images" : "l’image"}. Le serveur peut maintenant les router vers un provider vision, mais aucun provider vision complet n’est configuré pour cet environnement.\n\n${imageList || "Aucune image exploitable détectée."}${unsupportedList}\n\nJe peux quand même t’aider si tu décris ce qu’il faut vérifier, ou analyser le texte des documents joints quand il est disponible.`;
}

async function callOpenAICompatibleVision(url: string, key: string, model: string, messages: ChatMessage[], latestUser: string, images: NormalizedUpload[]) {
  const content: any[] = [
    { type: "text", text: latestUser || "Analyse l’image jointe et réponds clairement en français." },
    ...images.map((image) => ({ type: "image_url", image_url: { url: image.dataUrl } }))
  ];
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "http://localhost:3000", "X-Title": "NimbrayAI" },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: Number(process.env.VISION_MAX_TOKENS || 700),
      messages: [
        { role: "system", content: "Tu es NimbrayAI. Analyse les images de façon honnête. Ne prétends jamais voir un détail incertain. Réponds en français, clairement et utilement." },
        ...compactVisionHistory(messages).filter((m) => m.role !== "system").slice(0, -1),
        { role: "user", content }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Vision provider HTTP ${response.status}`);
  }
  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

export async function visionReply(messages: ChatMessage[], latestUser: string, images: NormalizedUpload[], unsupported: NormalizedUpload[] = []): Promise<VisionResult> {
  const status = visionStatus();
  if (!status.enabled) {
    return { content: fallbackVisionResponse(images, unsupported), provider: "nimbray-local", model: "vision-disabled", fallbackUsed: true, warning: "vision-disabled" };
  }
  if (!images.length) {
    return { content: fallbackVisionResponse(images, unsupported), provider: "nimbray-local", model: "no-image", fallbackUsed: true, warning: "no-image" };
  }
  if (!status.configured) {
    return { content: fallbackVisionResponse(images, unsupported), provider: "nimbray-local", model: "vision-provider-not-configured", fallbackUsed: true, warning: "provider-not-configured" };
  }

  try {
    const provider = status.provider;
    const model = status.model;
    const content = provider === "groq"
      ? await callOpenAICompatibleVision("https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY!, model, messages, latestUser, images)
      : await callOpenAICompatibleVision("https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_API_KEY!, model, messages, latestUser, images);

    if (!content) throw new Error("Réponse vision vide");
    return { content, provider: `vision-${provider}`, model, fallbackUsed: false };
  } catch (error: any) {
    return {
      content: `${fallbackVisionResponse(images, unsupported)}\n\nDétail technique masqué : le provider vision configuré n’a pas répondu correctement.`,
      provider: "nimbray-local",
      model: "vision-provider-fallback",
      fallbackUsed: true,
      warning: error?.message || "vision-provider-error"
    };
  }
}
