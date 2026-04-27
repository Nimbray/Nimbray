# PR — Agent IA V91 Vision Memory Polish

## Résumé

Cette PR aligne l’agent IA Nimbray sur V91 : mémoire projet prioritaire, réponses projet plus fiables, style plus naturel/synthétique, et fallback image honnête quand aucun provider vision serveur n’est disponible.

## Changements

- Ajoute `lib/project-memory.ts` avec la mémoire projet V91.
- Branche la mémoire V91 dans `/api/chat`.
- Ajoute une réponse directe pour l’état projet Nimbray V91.
- Remplace le fallback image V77 par un fallback V91 plus clair.
- Renforce `project-intelligence` pour ne plus revenir par défaut à V72.
- Ajoute les règles V91 dans le cœur de prompt.
- Documente le travail dans `project-workspaces/03_agent-ia/`.

## Fichiers modifiés

- `app/api/chat/route.ts`
- `lib/brain.ts`
- `lib/project-intelligence.ts`
- `lib/project-memory.ts`
- `AGENT_CHANGELOG.json`
- `project-workspaces/03_agent-ia/BRAIN_WORKLOG.md`
- `project-workspaces/03_agent-ia/V91_VISION_MEMORY_POLISH.md`
- `project-workspaces/03_agent-ia/HANDOFF_V91_VISION_MEMORY_POLISH.md`
- `project-workspaces/03_agent-ia/PR_V91_VISION_MEMORY_POLISH.md`

## Tests

À exécuter dans l’environnement repo complet :

```bash
npm run build
npm run agent:merge-check
```

Scénarios manuels :

- “Résume l’état actuel du projet Nimbray.”
- “Où on en est sur V91 ?”
- Message avec image jointe sans provider vision.
- Message émotionnel court : “je suis perdu”, “ça va pas”.

## Notes d’intégration

- Ne pas promouvoir `CURRENT_SOURCE.json` depuis cette PR IA.
- La vraie analyse vision dépend de la branche Backend V91.
- À intégrer après comparaison avec les branches Backend/Frontend V91.
