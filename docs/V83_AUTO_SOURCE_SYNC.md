# V83 — Auto Source Sync

Cette version automatise la règle centrale du projet IA : **la dernière version validée devient automatiquement la source officielle pour tous les agents et toutes les conversations**.

## Fichiers clés

- `CURRENT_SOURCE.json` : index lisible par les agents et les scripts pour connaître la source active.
- `scripts/source-manager.js` : outil de contrôle, création de workspace agent et promotion de version.
- `project-workspaces/01_global-news/LATEST.md` : résumé humain de la dernière source.
- `project-workspaces/08_agent-inbox/` : zone rapide pour chaque nouvelle conversation ou agent.

## Commandes

```bash
npm run source:status
npm run source:check
npm run source:agent -- --agent backend
npm run source:promote -- --version 84.0.0 --zip NimbrayAI_V84.zip --notes "résumé de validation"
```

## Règle opérationnelle

1. Chaque agent commence par lire `CURRENT_SOURCE.json` ou lancer `npm run source:status`.
2. Chaque agent travaille dans son workspace dédié.
3. Les changements validés sont intégrés à la racine du projet.
4. La version est promue avec `source:promote`.
5. Le ZIP livré devient la nouvelle source officielle unique.
