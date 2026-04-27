# Handoff Frontend — V87 Premium Chat UX

- Agent : Frontend
- Branche cible : `agent/frontend/v87-premium-chat-ux`
- Base de travail : dernière livraison préparée V86, à réappliquer depuis `main` à jour dans le repo GitHub officiel.
- Date : 2026-04-27
- Statut : prêt pour Pull Request vers `main`

## Objectif

Donner au chat NimbrayAI un rendu plus premium sans casser le parcours upload image/fichier consolidé en V86.

## Fichiers modifiés

- `app/page.tsx`
- `app/globals.css`
- `AGENT_CHANGELOG.json`
- `project-workspaces/05_agent-frontend/FRONTEND_WORKLOG.md`
- `project-workspaces/05_agent-frontend/HANDOFF_FRONTEND_V87_premium-chat-ux.md`
- `project-workspaces/05_agent-frontend/PR_FRONTEND_V87_PREMIUM_CHAT_UX.md`

## Changements principaux

### Chat premium

- Ajout d'une finition visuelle plus haut de gamme sur le shell, la sidebar, la topbar et le fond du chat.
- Animation légère d'apparition des messages pour améliorer la fluidité perçue.
- Bulles utilisateur plus élégantes : gradients, ombre plus douce, meilleure séparation visuelle.
- État de réponse assistant remplacé par un indicateur animé plus qualitatif.

### Pièces jointes

- Formatage centralisé des tailles de fichiers en Ko/Mo.
- Libellés d'états centralisés : préparation, prêt à envoyer, envoi en cours, envoyé, erreur.
- Icônes d'états centralisées pour éviter la duplication JSX.
- Cartes image/document avant envoi plus premium : miniatures plus grandes, retrait plus accessible, hover plus clair.
- Cartes document envoyées et images envoyées plus propres dans les bulles utilisateur.

### Micro-UX

- Ajout du glisser-déposer sur le composer.
- Placeholder contextuel quand une pièce jointe est prête.
- CTA `Envoyer fichiers` quand l'utilisateur envoie uniquement des pièces jointes.
- `aria-busy` ajouté au bouton d'envoi pendant l'envoi.

## Points conservés

- Pas de changement backend.
- Pas de modification du contrat `/api/chat`.
- Pas de modification du contrat `/api/parse-doc`.
- Le fonctionnement V86 reste conservé : suppression avant envoi, document seul, image seule, mix texte + fichiers.

## Risques

- Le test navigateur réel doit être relancé dans le repo GitHub avec dépendances installées.
- Le drag-and-drop dépend du support navigateur standard `DataTransfer.files`.
- Les images restent un contexte frontend ; l'analyse vision serveur n'est pas ajoutée par cette PR.

## Tests effectués

- `node scripts/source-manager.js check` : OK.
- `node scripts/agent-merge-check.js` : OK.
- Relecture statique de `app/page.tsx` pour vérifier que l'upload V86 reste intact.
- `npm run build` : non exécutable ici car `next` n'est pas installé dans le ZIP.

## Tests à refaire dans GitHub

```bash
npm install
npm run build
npm run agent:pr-check
```

Checklist manuelle recommandée :

- Ajouter une image, vérifier preview, retirer, puis renvoyer.
- Ajouter un fichier, vérifier preview DOC, retirer, puis renvoyer.
- Envoyer image seule, fichier seul, texte + image, texte + fichier.
- Tester erreur API chat et vérifier état erreur dans le tray.
- Tester mobile : composer, preview, suppression, menu latéral et drawer.
