# Pull Request — Frontend V87 Premium Chat UX

## Branche

`agent/frontend/v87-premium-chat-ux` → `main`

## Résumé

Cette PR améliore la qualité perçue du chat NimbrayAI sans changer les contrats backend ni casser le parcours upload V86.

## Changements

- Design global du chat plus premium : fond, sidebar, topbar, messages.
- Bulles utilisateur plus lisibles et plus élégantes.
- Loading assistant remplacé par un indicateur animé.
- Previews image/fichier plus soignées avant envoi.
- États upload plus clairs : préparation, prêt, envoi, envoyé, erreur.
- Micro-UX : glisser-déposer sur le composer, placeholder contextuel, CTA `Envoyer fichiers`.
- Responsive mobile renforcé via CSS sans modifier l'architecture.

## Fichiers modifiés

- `app/page.tsx`
- `app/globals.css`
- `AGENT_CHANGELOG.json`
- `project-workspaces/05_agent-frontend/FRONTEND_WORKLOG.md`
- `project-workspaces/05_agent-frontend/HANDOFF_FRONTEND_V87_premium-chat-ux.md`
- `project-workspaces/05_agent-frontend/PR_FRONTEND_V87_PREMIUM_CHAT_UX.md`

## Validation effectuée

- [x] Lecture des documents projet obligatoires.
- [x] `node scripts/source-manager.js check`
- [x] `node scripts/agent-merge-check.js`
- [x] Audit statique du parcours upload V86 après modifications.

## Validation à refaire dans le repo GitHub

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run agent:pr-check`
- [ ] Test navigateur desktop.
- [ ] Test navigateur mobile responsive.

## Risques

- Le build n'a pas pu être lancé dans le ZIP local sans `node_modules`.
- Le drag-and-drop doit être vérifié dans le navigateur réel.
- L'analyse vision serveur n'est pas couverte par cette PR.
