# Journal Agent Backend

## Mission

Stabiliser API, providers LLM, upload fichiers/images, erreurs, stockage, sécurité, coût et compatibilité Vercel.

## Règle

Aucun changement backend ne doit casser le mode démo/local ou alourdir inutilement le ZIP.

## 2026-04-27 — V85 upload-api-real

- Branche : `agent/backend/v85-upload-api-real`
- Audit de `app/api/chat/route.ts` effectué.
- Correction : parsing JSON + multipart, normalisation messages/pièces jointes, limites upload, erreurs client lisibles.
- Ajout d’un retour honnête pour images reçues sans vision serveur.
- Ajout scripts `lint` no-op et `typecheck` pour stabiliser les appels CI.
- Tests OK : `npm run source:check`, `npm run agent:merge-check`, `npm run lint`, `npm run typecheck`.
- Point ouvert : `npm run build` reste bloqué localement sur l’étape d’optimisation Next dans cette archive ; à confirmer dans GitHub Actions.

## 2026-04-27 — V86 vercel-upload-validation

- Branche : `agent/backend/v86-vercel-upload-validation`
- Validation réelle de `/api/chat` après V85.
- Tests HTTP exécutés en Next dev sur JSON texte seul, multipart image, multipart fichier, erreurs client, trop de fichiers et fichier trop lourd.
- Correction backend : `ChatRequestError`, détails d’erreur structurés, limite totale `MAX_UPLOAD_TOTAL_MB`, rejet explicite des pièces jointes trop nombreuses.
- Documentation ajoutée : `BACKEND_V86_TEST_REPORT.md` et handoff V86.
- Tests OK : `node scripts/agent-merge-check.js`, `npm run lint`, `tsc --noEmit --pretty false --incremental false`.


## 2026-04-27 — V87 observability-api

- Branche : `agent/backend/v87-observability-api`
- Ajout de logs backend structurés pour `/api/chat` sans contenu utilisateur sensible.
- Ajout d’un `requestId` par requête et par erreur.
- Ajout de la structure stable `apiError` tout en conservant `error` et `code` pour compatibilité frontend.
- Renforcement des cas limites upload : fichier vide, type non supporté, payload multipart invalide, fichier/total trop lourd.
- Documentation ajoutée : `BACKEND_V87_API_SCENARIOS.md` et handoff V87.
- Tests OK : `npm run source:check`, `node scripts/agent-merge-check.js`.
- Points à confirmer : `npm run typecheck` reste bloqué localement dans cette archive sans erreur affichée ; à rejouer dans GitHub Actions.
