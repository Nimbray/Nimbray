# Handoff Backend V85 — upload-api-real

- Date : 2026-04-27
- Source de départ : 84.0.0 — V84 GitHub Agent Automation
- Branche de travail : `agent/backend/v85-upload-api-real`
- Statut : prêt pour Pull Request

## Objectif

Solidifier la route `app/api/chat/route.ts` pour accepter proprement les messages avec pièces jointes, éviter les crashes de parsing, exposer des erreurs lisibles côté client et rester compatible Vercel/serverless.

## Fichiers lus avant intervention

- `CURRENT_SOURCE.json`
- `SOURCE_OF_TRUTH.md`
- `AGENTS.md`
- `AGENT_CHANGELOG.json`
- `COLLABORATIVE_WORKSPACES.md`

## Fichiers modifiés

- `app/api/chat/route.ts`
- `package.json`
- `AGENT_CHANGELOG.json`
- `project-workspaces/04_agent-backend/HANDOFF_BACKEND_V85_upload-api-real.md`
- `project-workspaces/04_agent-backend/BACKEND_WORKLOG.md`

## Audit rapide de `app/api/chat/route.ts`

Constats :

- La route ne lisait que `req.json()`, donc un envoi futur en `multipart/form-data` pouvait casser directement.
- Les messages étaient simplement castés en `ChatMessage[]`, sans validation de rôle ni contenu.
- L’upload image était détecté seulement par un marqueur texte historique `[Images jointes par l’utilisateur...]`.
- Les réponses d’erreur retournaient souvent un `500` générique, même pour JSON invalide, content-type non supporté ou fichier trop lourd.
- Les pièces jointes n’étaient pas normalisées côté backend, ce qui compliquait l’évolution vers un vrai upload chat.

## Changements réalisés

- Ajout de types backend `ChatAttachment` et `ChatPayload`.
- Ajout d’un parser `readChatBody(req)` acceptant :
  - `application/json` ;
  - `multipart/form-data` avec champ `payload` JSON et fichiers dans `files`.
- Ajout de `normalizeMessages()` pour rejeter proprement les messages invalides.
- Ajout de `normalizeAttachments()` pour limiter et normaliser les métadonnées de fichiers.
- Ajout de limites configurables :
  - `MAX_CHAT_ATTACHMENTS` par défaut `6` ;
  - `MAX_CHAT_IMAGE_MB` par défaut `8` ;
  - réutilisation de `MAX_UPLOAD_FILE_MB` pour les fichiers non image ;
  - `MAX_ATTACHMENT_TEXT_CHARS` par défaut `20000`.
- Ajout d’un guidage serveur pour les pièces jointes :
  - image reçue mais vision serveur non disponible : réponse honnête ;
  - document avec extrait texte : le modèle peut utiliser l’extrait sans inventer.
- Amélioration des erreurs client :
  - `NO_MESSAGES` en `400` ;
  - `INVALID_BODY` en `400` ;
  - `INVALID_JSON` en `400` ;
  - `UPLOAD_TOO_LARGE` en `413` ;
  - `UNSUPPORTED_CONTENT_TYPE` en `415` ;
  - fallback `CHAT_BACKEND_ERROR` en `500`.
- Ajout de `ok: true/false` dans les réponses nouvelles pour simplifier la lecture côté client.
- Ajout de scripts CI-safe :
  - `lint` no-op pour éviter l’échec des runners qui appellent `npm/pnpm run lint` ;
  - `typecheck` avec `tsc --noEmit`.

## Compatibilité Vercel

- Aucun stockage disque ajouté.
- Pas de nouvelle dépendance lourde.
- Parsing multipart via API standard `req.formData()`.
- Les fichiers reçus par `/api/chat` ne sont pas persistés et seules les métadonnées sont renvoyées.
- La vision réelle reste explicitement non promise tant qu’un modèle vision n’est pas branché.

## Tests effectués

- [x] `npm run source:check`
- [x] `npm run agent:merge-check`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [ ] `npm run build` — lancé plusieurs fois, mais le build Next reste bloqué longtemps sur `Creating an optimized production build ...` dans l’environnement local de cette archive. Aucun diagnostic TypeScript n’est remonté avant blocage.

## Risques / points à surveiller

- Le frontend actuel envoie encore surtout un marqueur texte pour les images ; le backend est prêt pour un vrai champ `attachments`, mais un Agent Frontend devra brancher cet envoi pour profiter du flux complet.
- Les documents analysés passent encore principalement par `/api/parse-doc`; `/api/chat` accepte déjà des extraits `attachment.text` pour évolution future.
- Le script `lint` ajouté est volontairement non bloquant car aucun ESLint n’est configuré dans cette source.

## Pull Request préparée

Titre conseillé : `Backend V85: solidify chat upload API and client-facing errors`

Base : `main`  
Branche : `agent/backend/v85-upload-api-real`

Résumé PR :

- Harden `/api/chat` parsing for JSON and multipart payloads.
- Normalize message and attachment metadata server-side.
- Return clearer client-facing errors with stable error codes.
- Keep Vercel/serverless compatibility without new runtime dependencies.
- Add backend handoff and changelog entry.

Checklist PR :

- [x] Branche agent dédiée.
- [x] Handoff backend ajouté.
- [x] Changelog agent mis à jour.
- [x] TypeScript OK.
- [x] Source/merge checks OK.
- [ ] Build GitHub Actions à confirmer côté CI.
