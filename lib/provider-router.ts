import { demoReply } from "./demo-engine";
import { detectIntent, desiredModelForIntent } from "./model-router";
import type { ResponseMode } from "./conversation-engine";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type ProviderName = "local" | "demo" | "groq" | "ollama" | "openrouter";

export type ProviderRouteInput = {
  messages: ChatMessage[];
  systemPrompt: string;
  latestUser: string;
  memory: string[];
  userKnowledgeAvailable: boolean;
  responseMode: ResponseMode;
  conversationIntent: string;
  preferredProvider?: string;
};

export type ProviderRouteResult = {
  content: string;
  provider: ProviderName;
  model: string;
  intent?: string;
  fallbackUsed: boolean;
  fallbackChain: string[];
  unavailableProviders: Array<{ provider: ProviderName; reason: string }>;
};

type ProviderCandidate = {
  provider: ProviderName;
  reason: string;
};

function compactHistory(messages: ChatMessage[]) {
  return messages.slice(-4).map((m) => ({ role: m.role, content: String(m.content || "").slice(0, 650) }));
}

function compactPrompt(prompt: string) {
  const max = Number(process.env.SYSTEM_PROMPT_MAX_CHARS || 2800);
  if (prompt.length <= max) return prompt;
  const head = prompt.slice(0, Math.floor(max * 0.55));
  const tail = prompt.slice(-Math.floor(max * 0.40));
  return `${head}\n\n[Contexte intermédiaire réduit pour économiser les tokens]\n\n${tail}`;
}

async function callJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur ${response.status}`);
  }
  return response.json();
}

function unique(list: string[]) {
  return Array.from(new Set(list.filter(Boolean)));
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

async function ollamaReply(input: ProviderRouteInput): Promise<Omit<ProviderRouteResult, "provider" | "fallbackChain" | "unavailableProviders">> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const intent = detectIntent(input.latestUser);
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
      messages: [{ role: "system", content: input.systemPrompt }, ...input.messages],
      options: { temperature: intent === "creative" ? 0.82 : 0.68 }
    })
  });
  return { content: data?.message?.content || "Aucune réponse du modèle local.", model: selected.model, intent, fallbackUsed: selected.fallbackUsed };
}

async function groqReply(input: ProviderRouteInput): Promise<Omit<ProviderRouteResult, "provider" | "fallbackChain" | "unavailableProviders">> {
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
      messages: [{ role: "system", content: compactPrompt(input.systemPrompt) }, ...compactHistory(input.messages)]
    })
  });
  return { content: data?.choices?.[0]?.message?.content || "Aucune réponse Groq.", model, fallbackUsed: false };
}

async function openRouterReply(input: ProviderRouteInput): Promise<Omit<ProviderRouteResult, "provider" | "fallbackChain" | "unavailableProviders">> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY manquante");
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
  const data = await callJson("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "http://localhost:3000", "X-Title": "NimbrayAI" },
    body: JSON.stringify({ model, temperature: 0.7, messages: [{ role: "system", content: input.systemPrompt }, ...input.messages] })
  });
  return { content: data?.choices?.[0]?.message?.content || "Aucune réponse OpenRouter.", model, fallbackUsed: false };
}

function demoProvider(input: ProviderRouteInput): Omit<ProviderRouteResult, "provider" | "fallbackChain" | "unavailableProviders"> {
  return {
    content: demoReply(input.messages, input.memory, input.userKnowledgeAvailable, input.responseMode, input.conversationIntent as any),
    model: "nimbray-demo-engine-v90",
    intent: input.conversationIntent,
    fallbackUsed: false
  };
}

function normalizeProvider(value?: string): ProviderName {
  const provider = String(value || process.env.AI_PROVIDER || "demo").toLowerCase();
  if (["groq", "ollama", "openrouter", "demo", "local"].includes(provider)) return provider as ProviderName;
  if (provider === "auto") return "local";
  return "demo";
}

export function providerPlan(input: Pick<ProviderRouteInput, "latestUser" | "conversationIntent" | "preferredProvider">): ProviderCandidate[] {
  const preferred = normalizeProvider(input.preferredProvider);
  const q = input.latestUser.toLowerCase();
  const asksProjectOrFiles = /nimbray|projet|fichier|document|upload|workspace|branche|vercel|api|backend|frontend|provider|router/.test(q);
  const asksResearch = /source|sources|recherche|verifie|actualité|actu|web|internet|citation|preuve/.test(q) || ["research", "document"].includes(input.conversationIntent);

  const base: ProviderCandidate[] = [];
  if (preferred !== "local") base.push({ provider: preferred, reason: "provider configuré" });
  if (preferred === "local" || asksProjectOrFiles) base.push({ provider: "ollama", reason: "raisonnement local / projet" });
  if (asksResearch || preferred !== "groq") base.push({ provider: "groq", reason: "réponse rapide cloud" });
  if (process.env.OPENROUTER_API_KEY) base.push({ provider: "openrouter", reason: "fallback cloud générique" });
  base.push({ provider: "demo", reason: "fallback Vercel sans clé" });

  const seen = new Set<ProviderName>();
  return base.filter((candidate) => {
    if (seen.has(candidate.provider)) return false;
    seen.add(candidate.provider);
    return true;
  });
}

export async function routeProvider(input: ProviderRouteInput): Promise<ProviderRouteResult> {
  const chain = providerPlan(input);
  const unavailableProviders: ProviderRouteResult["unavailableProviders"] = [];

  for (const candidate of chain) {
    try {
      const response =
        candidate.provider === "ollama" ? await ollamaReply(input) :
        candidate.provider === "groq" ? await groqReply(input) :
        candidate.provider === "openrouter" ? await openRouterReply(input) :
        demoProvider(input);

      return {
        ...response,
        provider: candidate.provider,
        fallbackUsed: response.fallbackUsed || unavailableProviders.length > 0,
        fallbackChain: chain.slice(0, unavailableProviders.length + 1).map((item) => item.provider),
        unavailableProviders
      };
    } catch (error: any) {
      unavailableProviders.push({ provider: candidate.provider, reason: friendlyProviderError(candidate.provider, error?.message || String(error)) });
    }
  }

  return {
    content: demoReply(input.messages, input.memory, input.userKnowledgeAvailable, input.responseMode, input.conversationIntent as any),
    provider: "demo",
    model: "nimbray-demo-engine-v90-hard-fallback",
    intent: input.conversationIntent,
    fallbackUsed: true,
    fallbackChain: chain.map((item) => item.provider),
    unavailableProviders
  };
}

export function friendlyProviderError(provider: ProviderName, raw: string) {
  if (/rate_limit|Rate limit|Request too large|tokens per minute|TPM/i.test(raw)) return `${provider}: limite temporaire ou requête trop grande`;
  if (/API_KEY|manquante/i.test(raw)) return `${provider}: clé API absente`;
  if (/fetch failed|ECONNREFUSED|ENOTFOUND/i.test(raw)) return `${provider}: service indisponible`;
  if (/model.*not found|not found/i.test(raw)) return `${provider}: modèle indisponible`;
  return `${provider}: ${raw.slice(0, 140)}`;
}

export async function providerStatus() {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const ollamaModels = await ollamaTags(baseUrl);
  return {
    activeProvider: normalizeProvider(),
    plan: providerPlan({ latestUser: "status", conversationIntent: "status" }).map((item) => item.provider),
    providers: {
      demo: { available: true, model: "nimbray-demo-engine-v90" },
      groq: { available: Boolean(process.env.GROQ_API_KEY), model: process.env.GROQ_MODEL || "llama-3.1-8b-instant" },
      openrouter: { available: Boolean(process.env.OPENROUTER_API_KEY), model: process.env.OPENROUTER_MODEL || "openrouter/auto" },
      ollama: { available: ollamaModels.length > 0, model: process.env.OLLAMA_MODEL || process.env.OLLAMA_MODEL_GENERAL || "qwen2.5:3b", models: ollamaModels }
    }
  };
}
