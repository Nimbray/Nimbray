export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(q: string, words: string[]) {
  return words.some((w) => q.includes(w));
}

export function detectGptSourceIntent(text: string) {
  const q = normalize(text);
  if (!q) return null;

  const gptWords = ["gpt", "gpts", "gpt store", "chatgpt", "custom gpt", "gpt personnalise", "gpt personnalise", "assistant personnalise", "agent", "agents"];
  const builderWords = ["instruction", "instructions", "connaissance", "knowledge", "capability", "capacite", "action", "api", "apps", "outil", "tools", "conversation starter", "amorce", "publier", "store", "marketplace"];
  const nimbrayWords = ["nimbray", "notre ia", "notre intelligence", "cerveau", "evoluer", "ameliore", "meilleure ia", "meilleur ia", "plateforme ia"];

  if (hasAny(q, gptWords) && hasAny(q, ["analyse", "source", "sources", "inspires", "inspire", "copie", "benchmark", "compare", "evoluer"])) return "gpt-research";
  if (hasAny(q, gptWords) && hasAny(q, builderWords)) return "gpt-builder";
  if (hasAny(q, nimbrayWords) && hasAny(q, ["maximum", "meilleur", "meilleure", "world class", "forte", "puissante", "cerveau"])) return "nimbray-world-class";
  return null;
}

export function gptSourceIntelligenceReply(text: string, messages: ChatMessage[] = []) {
  const intent = detectGptSourceIntent(text);
  if (!intent) return null;

  if (intent === "gpt-research") {
    return {
      intent,
      content: `Oui. Je peux utiliser la logique des GPTs comme source d'inspiration produit, mais sans copier de GPT privé ni inventer leur configuration interne.

Ce que j'intègre dans NimbrayAI :

1. **Instructions plus fortes**
   - personnalité claire ;
   - limites nettes ;
   - comportement par domaine ;
   - règles de sécurité prioritaires ;
   - ton stable.

2. **Knowledge Packs**
   - cerveau interne par domaines ;
   - fiches de connaissances courtes ;
   - règles anti-hallucination ;
   - exemples de bonnes et mauvaises réponses.

3. **Capacités modulaires**
   - mode Expert ;
   - mode Code ;
   - mode Projet ;
   - mode Créatif ;
   - mode Apprentissage ;
   - mode Court ;
   - mode Coach.

4. **Actions et connecteurs à préparer**
   - API externes plus tard ;
   - outils fichier/document ;
   - sources web vérifiables ;
   - mémoire et projets.

5. **Tests façon GPT Store**
   - conversation starters ;
   - cas limites ;
   - tests de sécurité ;
   - tests de qualité ;
   - tests mobile.

La règle importante : NimbrayAI ne doit pas juste imiter des GPTs. Il doit devenir une plateforme IA avec un cerveau propre, des moteurs spécialisés et un contrôle qualité avant réponse.`
    };
  }

  if (intent === "gpt-builder") {
    return {
      intent,
      content: `Pour créer une IA du niveau d'un excellent GPT personnalisé, il faut structurer NimbrayAI en blocs :

**1. Mission**
Définir clairement ce que l'IA fait mieux que les autres : comprendre, aider, construire, expliquer, coder, accompagner et piloter des projets.

**2. Instructions système**
Elles doivent être courtes mais puissantes : ton, limites, sécurité, qualité, sources, mémoire, style.

**3. Connaissances**
Les connaissances doivent être organisées par domaines : IA, code, cuisine, santé prudente, droit général, business, projet, design, sécurité, rédaction, apprentissage.

**4. Capacités**
Chaque capacité doit avoir un rôle : répondre, chercher, lire un fichier, résumer, créer un plan, auditer, corriger, enseigner.

**5. Évaluation**
On teste l'IA avec des scénarios réels, pas seulement avec des phrases faciles.

Le bon objectif pour NimbrayAI : une architecture inspirée des meilleurs GPTs, mais plus contrôlée, plus traçable, et adaptée à notre produit.`
    };
  }

  return {
    intent,
    content: `Oui. Pour pousser NimbrayAI vers un profil très haut niveau, il faut renforcer quatre choses en même temps :

1. **Cerveau interne** : connaissances, raisonnement, contraintes, qualité, sécurité.
2. **Cerveau externe** : sources, fichiers, web vérifiable, documents, API futures.
3. **Interface** : modes visibles, actions rapides, meilleur mobile, panneaux clairs.
4. **Évaluation** : tests de qualité, tests de sécurité, tests de hors-sujet, tests de vérité.

Dans V90, cette logique sert de **source d’inspiration interne** : matrice de capacités, règles d’instruction solides, fiches de connaissances et benchmark, sans être présentée comme la version actuelle du projet.`
  };
}

export function gptSourceGuidance() {
  return `
V90 GPT Source Principles :
- Inspire-toi des principes des GPTs personnalisés : mission claire, instructions stables, connaissances utiles, capacités modulaires, actions/API seulement si réelles, tests avant publication.
- Ne copie jamais une configuration privée de GPT et n'invente jamais le contenu d'un GPT non accessible.
- Si l'utilisateur demande d'utiliser GPT Store comme inspiration, transforme cela en architecture : instructions, knowledge packs, conversation starters, capabilities, actions, évaluation et publication.
- Pour toute demande de fichier, lien, MP4, PDF, ZIP ou ressource externe : ne prétends jamais l'avoir créée si aucun fichier n'a réellement été généré par l'application.
- Pour améliorer NimbrayAI, pense en matrice : domaine, intention, contraintes, niveau de détail, qualité, sécurité, source et mode.
- Une bonne réponse doit respecter la demande principale, les contraintes explicites et les contraintes implicites.
- Pour les sources web ou actualités, recommande une vérification à jour si aucun outil web fiable n'est branché côté produit.
`.trim();
}
