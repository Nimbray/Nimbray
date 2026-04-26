export type SafetyLevel = "normal" | "support" | "self_harm" | "imminent_self_harm" | "violence" | "imminent_violence" | "illegal_harm";

export type SafetyResult = {
  level: SafetyLevel;
  shouldIntercept: boolean;
  category: string;
  guidance: string;
  response?: string;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const selfHarmTerms = [
  /\bje veux mourir\b/,
  /\bje vais mourir\b/,
  /\bje vais crever\b/,
  /\bje veux crever\b/,
  /\bje vais me tuer\b/,
  /\bje veux me tuer\b/,
  /\bme suicider\b/,
  /\bsuicide\b/,
  /\bje vais me faire du mal\b/,
  /\bje veux me faire du mal\b/,
  /\bje n en peux plus\b/,
  /\bj ai envie de disparaitre\b/,
  /\bplus envie de vivre\b/,
  /\bmettre fin a mes jours\b/,
  /\bje vais mourrir\b/,
  /\bje veux mourrir\b/,
  /\bje veux plus etre la\b/,
  /\bje ne veux plus etre la\b/,
  /\bj veux mourir\b/,
  /\bje vais me foutre en l air\b/,
  /\bje veux me foutre en l air\b/,
  /\bj ai envie d en finir\b/,
  /\bje vais disparaitre\b/,
  /\bje veux disparaitre\b/,
  /\bjvais mourir\b/,
  /\bjveux mourir\b/,
  /\bjvais me tuer\b/,
  /\bjveux me tuer\b/,
];

const imminentSelfHarmTerms = [
  /\bla maintenant\b/,
  /\btout de suite\b/,
  /\bce soir\b/,
  /\bj ai deja\b/,
  /\bje suis en train\b/,
  /\badieu\b/,
  /\bdernier message\b/,
  /\bj ai pris\b/,
  /\bj ai une corde\b/,
  /\bj ai un couteau\b/,
  /\bj ai des medicaments\b/,
  /\bje vais passer a l acte\b/,
];

const emotionalDistressTerms = [
  /\bje suis au bout\b/,
  /\bje suis perdu\b/,
  /\bje suis perdue\b/,
  /\bje craque\b/,
  /\bje galere\b/,
  /\bje suis triste\b/,
  /\bje me sens seul\b/,
  /\bje me sens seule\b/,
  /\bpersonne ne m aime\b/,
  /\bj ai peur\b/,
  /\banxiete\b/,
  /\bangoisse\b/,
  /\bdeprime\b/,
  /\bdepression\b/,
];

const violenceTerms = [
  /\bje veux tuer\b/,
  /\bje vais tuer\b/,
  /\bje veux frapper\b/,
  /\bje vais frapper\b/,
  /\bje veux faire du mal\b/,
  /\bje vais faire du mal\b/,
  /\bmeurtre\b/,
  /\bassassiner\b/,
  /\bplan pour tuer\b/,
  /\btuer quelqu un\b/,
  /\bcomment cacher un corps\b/,
  /\bcacher un cadavre\b/,
  /\bpoignarder\b/,
  /\bjvais tuer\b/,
  /\bjveux tuer\b/,
  /\bjvais le tuer\b/,
  /\bjvais la tuer\b/,
  /\bjvais les tuer\b/,
];

const imminentViolenceTerms = [
  /\bla maintenant\b/,
  /\btout de suite\b/,
  /\bj ai une arme\b/,
  /\bj ai un couteau\b/,
  /\bje suis devant chez\b/,
  /\bil est devant moi\b/,
  /\belle est devant moi\b/,
  /\bje vais passer a l acte\b/,
];

const illegalHarmTerms = [
  /\bcomment fabriquer une bombe\b/,
  /\bexplosif\b/,
  /\bpoison mortel\b/,
  /\bcomment empoisonner\b/,
  /\bcomment kidnapper\b/,
  /\bcomment torturer\b/,
];

function anyMatch(q: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(q));
}

function shortFarewellCrisis(q: string) {
  return /^(adieu|dernier message|bye definitif|je pars pour toujours)$/.test(q);
}

export function safetyGuidanceForPrompt() {
  return `
Sécurité humaine prioritaire :
- La sécurité passe avant le silence, le mode choisi, l'humour, la mémoire et les moteurs locaux.
- Si l'utilisateur exprime une détresse, réponds avec chaleur, calme et soutien.
- Si l'utilisateur parle de suicide, automutilation ou danger immédiat, valide la douleur sans valider l'acte, encourage à ne pas rester seul, propose d'appeler une personne de confiance et les secours locaux.
- Si l'utilisateur envoie un message d'adieu court ou ambigu après une tension, une détresse ou une demande de silence, traite-le comme un signal de crise possible.
- En France, mentionne le 3114 pour la prévention du suicide ; en danger immédiat, mentionne 112, 15, 17, 18 ou 114 par SMS selon le cas.
- Si l'utilisateur veut blesser quelqu'un, refuse toute aide violente et aide à désamorcer : s'éloigner, poser l'objet dangereux, appeler une personne de confiance ou les urgences.
- Ne donne jamais de méthode pour se faire du mal, tuer, cacher un crime ou contourner la loi.
- L'humour est interdit dans les situations de détresse, violence, abus ou danger.
`;
}

export function assessSafety(text: string): SafetyResult {
  const q = normalize(text || "");

  if (shortFarewellCrisis(q)) {
    return {
      level: "imminent_self_harm",
      shouldIntercept: true,
      category: "self_harm_crisis_farewell",
      guidance: "Message d'adieu court : traiter comme un risque possible.",
      response: `Ton message m’inquiète. Si “adieu” veut dire que tu risques de te faire du mal ou de disparaître, appelle tout de suite le 112 ou le 15. En France, tu peux aussi appeler le 3114, gratuit et disponible 24h/24. Si parler est difficile, le 114 fonctionne par SMS/tchat.

Ne reste pas seul maintenant : envoie juste “j’ai besoin d’aide maintenant” à quelqu’un de confiance, ou va près d’une autre personne. Réponds-moi par un seul mot si tu peux : es-tu en sécurité ?`
    };
  }

  if (anyMatch(q, illegalHarmTerms)) {
    return {
      level: "illegal_harm",
      shouldIntercept: true,
      category: "danger_illegal",
      guidance: "Refuser toute aide dangereuse et rediriger vers une alternative sûre.",
      response: `Je ne peux pas aider à préparer quelque chose de dangereux, violent ou illégal.

Ce que je peux faire, en revanche, c'est t'aider à prendre du recul, à sécuriser la situation, ou à formuler une demande d'aide claire. Si quelqu'un risque d'être blessé, il faut contacter les secours ou une personne de confiance immédiatement.`
    };
  }

  if (anyMatch(q, violenceTerms)) {
    const imminent = anyMatch(q, imminentViolenceTerms);
    return {
      level: imminent ? "imminent_violence" : "violence",
      shouldIntercept: true,
      category: "violence_toward_others",
      guidance: "Refuser l'aide violente, désamorcer et orienter vers sécurité immédiate.",
      response: imminent
        ? `Je ne peux pas t'aider à blesser quelqu'un. Là, la priorité est que personne ne soit blessé.

Éloigne-toi physiquement de la personne si tu peux, pose tout objet dangereux, et appelle tout de suite quelqu'un de confiance. Si tu penses perdre le contrôle ou si quelqu'un est en danger, appelle les urgences : 17 ou 112 en France.

Reste avec moi une seconde : est-ce que tu peux t'éloigner de la situation maintenant, juste de quelques mètres ?`
        : `Je ne peux pas t'aider à faire du mal à quelqu'un ou à préparer un acte violent.

Mais je peux t'aider à redescendre la pression. Éloigne-toi de la situation si possible, respire lentement, évite de répondre à chaud, et contacte quelqu'un de confiance. Si tu penses que tu vas passer à l'acte, appelle le 17 ou le 112 maintenant.

Réponds juste à ça : est-ce que tu peux t'éloigner de la personne ou poser l'objet dangereux maintenant ?`
    };
  }

  if (anyMatch(q, selfHarmTerms)) {
    const imminent = anyMatch(q, imminentSelfHarmTerms);
    return {
      level: imminent ? "imminent_self_harm" : "self_harm",
      shouldIntercept: true,
      category: "self_harm_crisis",
      guidance: "Réponse empathique, soutien immédiat, ressources de crise, questions simples de sécurité.",
      response: imminent
        ? `Je suis vraiment désolé que tu ressentes ça. Ce que tu vis a l'air très lourd, mais tu ne dois pas rester seul avec ça maintenant.

Si tu es en danger immédiat ou si tu as déjà commencé à te faire du mal, appelle tout de suite le 112 ou le 15. Si tu es en France, tu peux aussi appeler le 3114, le numéro national de prévention du suicide, gratuit et disponible 24h/24. Si téléphoner est difficile, le 114 est accessible par SMS/tchat.

Là, fais juste une chose : éloigne-toi de ce qui pourrait te faire du mal et envoie à quelqu'un de confiance : « J'ai besoin d'aide maintenant, reste avec moi. »

Je reste avec toi ici. Est-ce que tu peux me répondre par un seul mot : “sécurisé” si tu t'es éloigné de ce qui peut te blesser ?`
        : `Je suis vraiment désolé que tu ressentes ça. Ta douleur est réelle, et tu n'as pas à la porter seul. Je ne vais pas te juger.

Là, le plus important est de rester en sécurité pendant les prochaines minutes. Si tu peux, éloigne-toi de ce qui pourrait te faire du mal et rapproche-toi d’un endroit où tu n’es pas seul.

Envoie maintenant un message très simple à une personne de confiance : « Je ne vais pas bien, j’ai besoin que tu restes avec moi. »

Si tu es en France, tu peux appeler le 3114, gratuit, 24h/24 et 7j/7. Si tu te sens en danger immédiat, appelle le 112 ou le 15. Le 114 est aussi disponible par SMS/tchat pour les urgences.

Reste avec moi un instant : est-ce que tu es seul en ce moment ?`
    };
  }

  if (anyMatch(q, emotionalDistressTerms)) {
    return {
      level: "support",
      shouldIntercept: false,
      category: "emotional_support",
      guidance: "Répondre avec compassion, calme, encouragement et petite étape concrète. Pas d'humour lourd. Ne pas médicaliser.",
    };
  }

  return { level: "normal", shouldIntercept: false, category: "normal", guidance: "Conversation normale." };
}

export type SafetyContextMessage = { role: "user" | "assistant" | "system"; content: string };

function contextWindow(messages: SafetyContextMessage[], count = 10) {
  return messages
    .slice(-count)
    .map((m) => normalize(m.content || ""))
    .join(" | ");
}

function hasContextualRisk(context: string) {
  return anyMatch(context, [...selfHarmTerms, ...imminentSelfHarmTerms, ...violenceTerms, ...imminentViolenceTerms, ...illegalHarmTerms])
    || /\b(ne reponds plus|silence|tais toi|arrete|je reste silencieux|je vais tuer|faire du mal|mourir|me tuer|suicide|adieu|arme|couteau)\b/.test(context);
}

function isAmbiguousFarewell(q: string) {
  return /^(adieu|dernier message|bye definitif|je pars pour toujours|c est fini|cest fini|je disparais)$/.test(q);
}

export function assessSafetyWithContext(text: string, messages: SafetyContextMessage[] = []): SafetyResult {
  const direct = assessSafety(text);
  const q = normalize(text || "");
  const context = contextWindow(messages);

  if (direct.shouldIntercept) return direct;

  if (isAmbiguousFarewell(q) && hasContextualRisk(context)) {
    return {
      level: "imminent_self_harm",
      shouldIntercept: true,
      category: "contextual_safety_farewell_after_risk",
      guidance: "Message d'adieu ambigu après contexte à risque : répondre malgré le silence.",
      response: `Je ne veux pas ignorer ça. Vu ce que tu viens de dire avant, “adieu” m’inquiète.

Si tu risques de te faire du mal ou de faire du mal à quelqu’un, éloigne-toi tout de suite de tout objet dangereux et appelle le 112 maintenant. Si c’est pour toi et que tu es en France, tu peux aussi appeler le 3114. Si parler est difficile, le 114 fonctionne par SMS/tchat.

Réponds juste par un mot si tu peux : est-ce que tu es en sécurité là ?`
    };
  }

  return direct;
}
