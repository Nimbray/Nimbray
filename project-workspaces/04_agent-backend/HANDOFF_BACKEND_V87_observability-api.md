# Handoff Backend — V87 Observability API

Branche : `agent/backend/v87-observability-api`  
Base : V86 backend upload validation  
Date : 2026-04-27

## Résumé

V87 ajoute une couche d’observabilité et de robustesse à `/api/chat` : logs serveur propres, `requestId`, structure d’erreur stable, validation renforcée des cas limites upload et documentation de test API.

## Fichiers modifiés

- `app/api/chat/route.ts`
- `AGENT_CHANGELOG.json`
- `project-workspaces/04_agent-backend/BACKEND_WORKLOG.md`
- `project-workspaces/04_agent-backend/BACKEND_V87_API_SCENARIOS.md`
- `project-workspaces/04_agent-backend/HANDOFF_BACKEND_V87_observability-api.md`

## Changements backend

### Observabilité

- Ajout d’un `requestId` par requête.
- Logs JSON structurés : `request_validated`, `request_completed`, `request_rejected`, `request_failed`.
- Logs sans prompt utilisateur, sans extrait de fichier, sans nom de fichier.
- Logs compatibles Vercel via `console.info`, `console.warn`, `console.error`.

### Erreurs API

- Conservation des champs historiques : `ok`, `error`, `code`, `details`.
- Ajout de `requestId` au niveau racine.
- Ajout de `apiError` comme structure stable recommandée.

### Uploads

Cas renforcés :

- fichier vide → `EMPTY_FILE`
- fichier trop lourd → `UPLOAD_TOO_LARGE`
- total trop lourd → `UPLOAD_TOTAL_TOO_LARGE`
- type de fichier non supporté → `UNSUPPORTED_FILE_TYPE`
- payload multipart invalide → `MULTIPART_PAYLOAD_INVALID`
- content-type global non supporté → `UNSUPPORTED_CONTENT_TYPE`
- trop de pièces jointes → `TOO_MANY_ATTACHMENTS`

## Compatibilité

- Pas de stockage disque.
- Pas de dépendance ajoutée.
- Handler App Router conservé.
- Le frontend V85/V86 peut continuer à lire `error` et `code` directement.
- Les futurs clients peuvent basculer vers `apiError`.

## Tests effectués

- Lecture et audit de `app/api/chat/route.ts`.
- Vérification statique des codes d’erreur V87 dans la route.
- `npm run source:check` : OK.
- `node scripts/agent-merge-check.js` : OK avec `timeout 20s`, sortie propre `merge_exit:0`.
- `npm run lint` : script no-op existant exécuté, sortie observée `No lint configured for this snapshot.`.
- `npm run typecheck` : lancé, mais la commande reste bloquée dans cette archive et a été interrompue par timeout local sans erreur TypeScript affichée. À confirmer dans GitHub Actions.

## Risques / points ouverts

- Les images restent reçues et validées, mais l’analyse vision réelle n’est pas promise sans modèle vision configuré.
- La liste MIME autorisée couvre les formats usuels ; si le frontend envoie des types très spécifiques, il faudra les ajouter explicitement.
- Les tests HTTP complets doivent être rejoués sur un environnement Next dev ou Vercel Preview avec la matrice `BACKEND_V87_API_SCENARIOS.md`.

## PR proposée

Titre : `Backend V87: add chat API observability and stable errors`

Branche source : `agent/backend/v87-observability-api`  
Branche cible : `main`
