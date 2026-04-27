export type NaturalChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type NaturalReply = {
  content: string;
  intent: string;
  confidence: "high" | "medium";
  shouldIntercept: boolean;
};

function norm(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(q: string) {
  return q.split(" ").filter(Boolean);
}

function isShort(q: string, max = 8) {
  return words(q).length <= max;
}

function hasAny(q: string, list: string[]) {
  return list.some((item) => q.includes(norm(item)));
}

function exactAny(q: string, list: string[]) {
  return list.map(norm).includes(q);
}

function pick(items: string[], seed: string) {
  let hash = 2166136261;
  for (const c of seed) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return items[hash % items.length];
}

function recentMessages(messages: NaturalChatMessage[], role: NaturalChatMessage["role"], count = 6) {
  return messages.filter((m) => m.role === role).slice(-count).map((m) => norm(m.content));
}

function recentUsers(messages: NaturalChatMessage[], count = 6) {
  return recentMessages(messages, "user", count);
}

function recentAssistants(messages: NaturalChatMessage[], count = 6) {
  return recentMessages(messages, "assistant", count);
}

function askedHardSilence(q: string) {
  return exactAny(q, [
    "ne reponds plus",
    "ne parle plus",
    "arrete de repondre",
    "arrete de parler",
    "tais toi",
    "tais-toi",
    "silence",
    "laisse moi tranquille",
    "fous moi la paix"
  ]) || /\b(ne reponds plus|ne parle plus|arrete de repondre|arrete de parler|laisse moi tranquille|fous moi la paix)\b/.test(q);
}

function askedSoftStop(q: string) {
  return exactAny(q, ["arrete", "arrette", "stop", "pause", "laisse", "laisse tomber"]);
}

function askedAnyStop(q: string) {
  return askedHardSilence(q) || askedSoftStop(q);
}

function resumesConversation(q: string) {
  // V71.3 : une salutation ne suffit plus à casser un silence persistant.
  // Il faut une demande claire de reprise.
  return exactAny(q, [
    "reprends",
    "tu peux reparler",
    "tu peux repondre",
    "reponds",
    "parle",
    "parle moi",
    "reviens",
    "continue",
    "on reprend",
    "c est bon tu peux parler"
  ]) || /\b(tu peux repondre|tu peux reparler|tu peux parler|on reprend|reprends|reponds maintenant|parle moi|tu peux reprendre)\b/.test(q);
}

function repeatedNothing(history: string[]) {
  return history.filter((q) => exactAny(q, ["rien", "rien du tout", "aucune idee", "aucune idée"])).length >= 2;
}

function previousHardSilence(previousUsers: string[]) {
  // On ne considère que les demandes fortes comme persistantes.
  // "arrête" est respecté, mais ne bloque pas forcément toute la suite.
  return previousUsers.some(askedHardSilence);
}

function previousAssistantAlreadyStopped(previousAssistants: string[]) {
  return previousAssistants.some((a) =>
    hasAny(a, ["j arrete", "je me tais", "je m arrete", "je ne continue pas", "je reste silencieux", "compris"])
  );
}

function crisisOverrideSignal(q: string) {
  return (
    hasAny(q, [
      "je veux mourir",
      "je vais mourir",
      "je vais mourrir",
      "je veux me tuer",
      "je vais me tuer",
      "je vais me suicider",
      "je veux me suicider",
      "je vais me faire du mal",
      "je veux me faire du mal",
      "plus envie de vivre",
      "mettre fin a mes jours",
      "je vais tuer quelqu un",
      "je veux tuer quelqu un",
      "je vais faire du mal a quelqu un",
      "je vais frapper quelqu un"
    ]) || exactAny(q, ["adieu", "bye definitif", "dernier message"])
  );
}

export function naturalIntelligenceReply(text: string, messages: NaturalChatMessage[] = []): NaturalReply | null {
  const q = norm(text);
  if (!q) return null;

  const history = recentUsers(messages);
  const previous = history.slice(0, -1);
  const assistantHistory = recentAssistants(messages);
  const hardSilenceActive = previousHardSilence(previous) && !resumesConversation(q);

  // Défense en profondeur : normalement le safety-router passe avant cette couche.
  // Mais si l'ordre change un jour, un signal de crise ne doit jamais être avalé par le silence.
  if (hardSilenceActive && crisisOverrideSignal(q)) {
    return null;
  }

  if (hardSilenceActive) {
    return {
      content: "",
      intent: "v71-3-persistent-silence",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (askedAnyStop(q) && isShort(q, 10)) {
    const alreadyStopped = previousAssistantAlreadyStopped(assistantHistory);
    return {
      content: alreadyStopped
        ? "Compris."
        : pick([
            "D’accord, j’arrête.",
            "Ok, je me tais.",
            "Compris. Je ne continue pas.",
            "Bien reçu. Je m’arrête là."
          ], q),
      intent: askedHardSilence(q) ? "v71-3-hard-silence-request" : "v71-3-soft-stop-respected",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (resumesConversation(q) && previousHardSilence(previous)) {
    return {
      content: pick([
        "D’accord, on reprend doucement.",
        "Ok, je reviens. On reprend simplement.",
        "Très bien, je reparle. On repart tranquillement."
      ], q + history.join("|")),
      intent: "v71-3-resume-after-silence",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (exactAny(q, ["bonjour", "salut", "coucou", "hey", "hello"]) && isShort(q, 3)) {
    return {
      content: pick([
        "Bonjour ! Content de te retrouver.",
        "Salut. On part sur quelque chose de léger ou on avance sur un sujet précis ?",
        "Hey. On reprend tranquillement.",
        "Bonjour. Tu veux discuter un peu ou passer à l’action ?",
        "Salut ! Belle énergie, sans pression."
      ], q + history.join("|")),
      intent: "v87-greeting-natural",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (exactAny(q, ["rien", "rien du tout", "aucune idee", "aucune idée"])) {
    return {
      content: repeatedNothing(history)
        ? "D’accord. Je ne vais pas insister."
        : pick([
            "Ok. Pas besoin de forcer.",
            "Ça marche. On peut juste rester tranquilles.",
            "Compris. Je ne vais pas te bombarder de questions.",
            "Pas de souci. On laisse comme ça pour l’instant."
          ], q + history.join("|")),
      intent: "v71-3-nothing-soft",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (exactAny(q, ["parle", "dis quelque chose", "parle moi", "j ai besoin de parler"])) {
    const tender = previous.some((p) => hasAny(p, ["seul", "seule", "triste", "peur", "angoisse", "perdu", "perdue"]));
    return {
      content: tender
        ? "Oui. On peut parler doucement. Là, je te propose juste une question simple : qu’est-ce qui te pèse le plus en ce moment ?"
        : pick([
            "Oui. On peut parler simplement. Ta journée ressemblait plutôt à quoi : calme, lourde, bizarre ou normale ?",
            "Pas besoin d’un sujet parfait. Tu veux une discussion légère ou quelque chose de plus profond ?",
            "D’accord. Je lance doucement : aujourd’hui, tu avais plutôt besoin de calme, d’énergie ou de te vider la tête ?"
          ], q + history.join("|")),
      intent: "v71-3-talk-starter",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (hasAny(q, ["je crois que je suis bi", "je pense que je suis bi", "je me demande si je suis bi", "peut etre bi", "peut-être bi"])) {
    return {
      content: "C’est ok de te poser cette question. Tu n’as pas besoin d’avoir une réponse parfaite tout de suite, ni de te coller une étiquette trop vite. On peut juste parler de ce que tu ressens et de ce qui te fait penser ça.",
      intent: "v71-3-identity-questioning",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (hasAny(q, ["je vais mal", "je suis triste", "je suis perdu", "je suis perdue", "j ai peur", "je suis angoisse", "je suis angoissée", "je stresse", "j ai honte", "je suis nul", "je suis nulle", "je me sens vide"])) {
    return {
      content: pick([
        "Je comprends que ce soit lourd. On peut y aller doucement : commence par me dire ce qui domine là maintenant — tristesse, peur, fatigue ou colère ?",
        "Ça a l’air vraiment difficile à porter. Pas besoin de tout expliquer d’un coup ; on peut juste prendre le morceau le plus urgent.",
        "Je te lis. Quand ça déborde, le mieux c’est de réduire la pression : respire un instant, puis dis-moi ce qui te fait le plus mal maintenant."
      ], q + history.join("|")),
      intent: "v87-emotional-personal",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (hasAny(q, ["je me sens seul", "je me sens seule", "je suis seul", "je suis seule", "personne ne m aime", "j ai personne"])) {
    return {
      content: pick([
        "Je suis désolé que tu te sentes comme ça. La solitude peut vraiment peser, surtout quand on garde tout pour soi. Tu peux commencer petit : qu’est-ce qui te manque le plus là, une présence, de l’affection, ou quelqu’un à qui parler ?",
        "Je t’entends. Se sentir seul, ça peut faire très mal. On peut en parler doucement, sans que tu aies besoin de tout expliquer parfaitement.",
        "Ça doit être lourd à porter. Je ne vais pas te sortir une phrase toute faite : dis-moi juste ce qui te pèse le plus maintenant."
      ], q + history.join("|")),
      intent: "v71-3-loneliness",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (isShort(q) && exactAny(q, ["merci", "merci beaucoup", "thx"])) {
    return {
      content: pick(["Avec plaisir.", "Je t’en prie.", "Pas de souci.", "On avance bien."], q + history.join("|")),
      intent: "v71-3-thanks-clean",
      confidence: "high",
      shouldIntercept: true
    };
  }

  if (isShort(q) && exactAny(q, ["bof", "mouais", "jsp", "je sais pas", "pas ouf"])) {
    return {
      content: pick([
        "Je vois. On peut faire plus simple ou juste laisser poser.",
        "Ok, pas convaincu. Tu veux que je reprenne autrement ?",
        "Je comprends. On peut ralentir un peu."
      ], q + history.join("|")),
      intent: "v71-3-low-energy",
      confidence: "high",
      shouldIntercept: true
    };
  }

  return null;
}

export function naturalIntelligenceGuidance() {
  return `
V87 Natural Intelligence Layer :
- La sécurité est prioritaire sur tout, y compris le silence demandé par l'utilisateur.
- Une salutation ne casse pas un silence persistant ; seule une demande claire de reprise le fait.
- Messages courts = réponses courtes, sauf détresse explicite ou risque de danger.
- Si l'utilisateur veut du silence ou dit d'arrêter, respecter immédiatement sans relance.
- Si l'utilisateur exprime solitude, doute, identité, orientation, honte ou vulnérabilité : répondre d'abord avec accueil humain, sans jugement, sans diagnostic.
- Évite de répéter "je suis là", "je reste disponible" et "comment puis-je t'aider" ; varie les formulations.
- Pose au maximum une question de relance, seulement si elle aide vraiment.
- Ne fais pas semblant d'être humain : sois un assistant présent, clair, calme et fiable.
- Réduis les phrases de remplissage. Donne un résultat utile ou une présence simple.
- V87 : évite les relances automatiques après chaque micro-message ; réponds puis laisse respirer.
- V87 : quand une formulation vient d'être utilisée dans les derniers messages, choisis une autre tournure.
- V87 : pour les messages émotionnels/personnels non critiques, accueille l'émotion avant l'action et propose une seule petite étape.
- V87 : remplace les phrases automatiques par une présence sobre, concrète et non répétitive.
`;
}

export function postProcessNaturalResponse(content: string, latestUser: string, messages: NaturalChatMessage[] = []) {
  let out = String(content || "").trim();
  const q = norm(latestUser);

  if (!out) return out;

  const bannedOpeners = [
    /^bien sûr[,.]?\s*je suis là pour t'aider[,.]?\s*/i,
    /^je suis là pour t'aider[,.]?\s*/i,
    /^comment puis-je t'aider\s*\??\s*/i,
    /^n'hésitez pas à me solliciter[,.]?\s*/i,
    /^je reste disponible[,.]?\s*/i,
  ];
  for (const pattern of bannedOpeners) out = out.replace(pattern, "");

  if (askedAnyStop(q) && out.length > 80) {
    return "D’accord, j’arrête.";
  }

  const recentAssistant = messages
    .filter((m) => m.role === "assistant")
    .slice(-4)
    .map((m) => norm(m.content))
    .join(" | ");

  if (recentAssistant.includes("je reste disponible") && out.includes("Je reste disponible")) {
    out = out.replace(/Je reste disponible\.?/g, "On pourra reprendre quand tu voudras.");
  }

  if (recentAssistant.includes("je suis la") && out.startsWith("Je suis là.")) {
    out = out.replace(/^Je suis là\.\s*/i, "");
  }

  return out.trim() || content;
}
