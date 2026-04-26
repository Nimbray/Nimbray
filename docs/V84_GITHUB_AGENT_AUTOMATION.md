# V84 — GitHub Agent Automation

Cette version transforme NimbrayAI en projet prêt pour un workflow GitHub multi-agents.

## Ce qui est automatisé

- Branches agent standardisées.
- Pull Request template.
- GitHub Actions CI.
- GitHub Actions de contrôle des PR agents.
- CODEOWNERS prêt à personnaliser.
- Changelog global des agents.
- Scripts npm pour démarrer, documenter et vérifier le travail agent.
- Dossier de merge queue pour l’intégrateur.

## Commandes principales

```bash
npm run github:setup
npm run agent:start -- --agent frontend --feature chat-ui
npm run agent:handoff -- --agent frontend --version 84 --title "chat-ui"
npm run agent:changelog -- --agent frontend --branch agent/frontend/v84-chat-ui --summary "Improve chat UI"
npm run agent:merge-check
```

## Règle officielle

`main` est la seule source officielle vivante. Les agents ne modifient jamais `main` directement. Ils travaillent sur des branches `agent/<role>/<feature>`, ouvrent une PR, puis l’intégrateur fusionne.
