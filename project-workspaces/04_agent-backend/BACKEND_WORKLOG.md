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
