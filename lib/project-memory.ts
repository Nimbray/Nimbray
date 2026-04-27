export type ProjectMemory = {
  projectName: string;
  workingVersion: string;
  phase: string;
  sourceOfTruth: string[];
  decisions: string[];
  nextActions: string[];
  risks: string[];
};

export const V91_PROJECT_MEMORY: ProjectMemory = {
  projectName: "NimbrayAI",
  workingVersion: "V91",
  phase: "Vision, mémoire projet et polish naturel",
  sourceOfTruth: [
    "GitHub main reste la source officielle vivante.",
    "Les agents travaillent sur des branches séparées puis ouvrent une Pull Request vers main.",
    "La mémoire prioritaire à consulter avant les anciennes notes est : project-workspaces/00_project-memory/CHECKPOINT_V90.md, CURRENT_SOURCE.json, AGENT_CHANGELOG.json.",
    "Si la mémoire locale du repo est plus ancienne que la conversation projet, répondre honnêtement avec l’état de travail V91 sans prétendre que main est déjà promu."
  ],
  decisions: [
    "V90 a stabilisé le principe Collaborative Workspaces : espaces séparés par agent/conversation, changelog et source officielle unique.",
    "V91 démarre le polish : IA plus naturelle, UI minimaliste côté frontend, vision/upload côté backend, mémoire projet plus fiable côté IA.",
    "Les réponses projet doivent être synthétiques, concrètes et alignées sur l’état réel de travail, pas sur les archives historiques V74/V76/V84.",
    "L’upload image est conservé côté interface ; l’analyse vision serveur doit répondre clairement si aucun provider vision n’est disponible.",
    "Nimbray doit éviter les formules répétitives, le ton robotique et les longues listes inutiles quand une réponse courte suffit."
  ],
  nextActions: [
    "Finaliser les branches V91 IA, Backend et Frontend depuis main.",
    "Valider /api/chat, /api/status, /api/health et /api/parse-doc après intégration.",
    "Tester texte seul, message avec image, message avec document et fallback provider indisponible.",
    "Ouvrir les Pull Requests vers main avec handoff agent et tests documentés.",
    "Laisser l’intégrateur fusionner et promouvoir officiellement la version suivante."
  ],
  risks: [
    "Confondre le snapshot local V84 avec l’état réel de travail V91.",
    "Promettre une analyse visuelle si aucun provider vision n’est branché.",
    "Rendre les réponses projet trop longues ou trop mécaniques.",
    "Écraser les travaux des autres agents sans passer par PR et intégration."
  ]
};

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isProjectStateQuestion(text: string) {
  const q = normalize(text);
  return /\b(nimbray|nimbrayai|projet|repo|github|branche|version|v90|v91|main|pull request|pr|workspace|workspaces)\b/.test(q)
    && /\b(ou on en est|etat|resume|recap|point|version actuelle|source officielle|memoire|roadmap|prochaine etape|sur quoi on bosse|qu est ce qu on fait|decision|decisions)\b/.test(q);
}

export function v91ProjectStatusReply() {
  const m = V91_PROJECT_MEMORY;
  return `On est sur **${m.projectName} ${m.workingVersion} — ${m.phase}**.

L’état réel : **main GitHub reste la source officielle**, et V91 se prépare par branches agents séparées avant PR. La mémoire à prioriser est : CHECKPOINT_V90, CURRENT_SOURCE et AGENT_CHANGELOG, puis seulement les anciennes notes.

**Ce qui est acté**
- V90 a posé Collaborative Workspaces comme cadre de travail.
- V91 améliore surtout le naturel des réponses, la mémoire projet, l’upload/vision et le polish UI.
- Si une image est envoyée, Nimbray doit dire clairement s’il peut vraiment l’analyser ou seulement la recevoir.

**Prochaine action logique**
Finaliser les branches V91, tester les routes critiques, documenter les handoffs, puis ouvrir les PR vers main.`;
}

export function visionAttachmentReply(hasVisionProvider: boolean) {
  if (hasVisionProvider) {
    return `J’ai bien reçu l’image. Je vais l’analyser avec le provider vision disponible et répondre uniquement sur ce que je peux observer avec confiance. Si un détail est incertain, je le dirai clairement.`;
  }

  return `J’ai bien reçu l’image. Pour l’instant, l’upload est conservé côté interface, mais aucun provider vision serveur n’est configuré ici : je ne peux donc pas prétendre voir son contenu.

Tu peux me décrire ce que tu veux vérifier, ou activer un provider vision côté serveur pour que Nimbray puisse analyser l’image directement.`;
}

export function v91GuidanceBlock() {
  const m = V91_PROJECT_MEMORY;
  return `
V91 Vision Memory Polish :
- Version de travail à refléter dans les réponses projet : ${m.projectName} ${m.workingVersion} — ${m.phase}.
- Source officielle : ${m.sourceOfTruth.join(" ")}
- Décisions prioritaires : ${m.decisions.join(" ")}
- Prochaines actions : ${m.nextActions.join(" ")}
- Risques : ${m.risks.join(" ")}
- Style attendu : réponses plus courtes, naturelles, concrètes, moins robotiques ; une seule prochaine action utile quand c’est suffisant.
- Émotions/personnel : reconnaître l’émotion simplement, ne pas surjouer, proposer une petite étape réaliste.
- Images : ne jamais prétendre analyser visuellement une image sans provider vision réellement disponible ; expliquer le fallback avec honnêteté.
`;
}
