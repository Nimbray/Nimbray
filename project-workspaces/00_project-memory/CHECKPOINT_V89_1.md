# Checkpoint V89.1 — Vercel Hardening & Deployment Stability

Date: 2026-04-27
Branch cible: `agent/v89-1-vercel-hardening`
Base: V89 Knowledge Router Stability

## Objectif

Stabiliser le déploiement Vercel avant intégration dans `main` et réduire les risques des prochaines versions.

## Changements réalisés

### Déploiement Vercel
- Ajout de `.nvmrc` avec Node 20.
- Ajout de `.npmrc` pour désactiver audit/fund pendant l'installation.
- Passage de `vercel.json` à `npm ci --no-audit --no-fund` pour des installs reproductibles.
- Ajout de limites Vercel cohérentes pour `/api/chat`, `/api/parse-doc`, `/api/status`, `/api/health`.
- Ajout de headers sécurité simples : `X-Content-Type-Options` et `Referrer-Policy`.
- Ajout de `.vercelignore` pour éviter d'envoyer des artefacts inutiles.

### API et stabilité
- Ajout de `lib/api-utils.ts` : erreurs API typées, limites de taille, parsing JSON sûr, fetch JSON avec timeout.
- `/api/chat` : limite de requête, sanitation des messages, timeout fournisseur IA, erreurs 400/413/415/504 plus stables.
- `/api/parse-doc` : validation `multipart/form-data`, limite de taille avant lecture, erreurs stables.
- `/api/status` : timeout court pour Ollama afin d'éviter de ralentir Vercel.
- `/api/health` : endpoint léger pour vérifier que le déploiement répond.

### Performance
- Cache mémoire warm pour les fichiers Markdown de `knowledge/` afin d'éviter une relecture complète à chaque requête serveur chaude.
- Limite du nombre de fichiers internes lus via `INTERNAL_KNOWLEDGE_MAX_FILES`.

## Variables utiles

- `AI_PROVIDER=demo|groq|openrouter|ollama`
- `GROQ_API_KEY` si provider Groq
- `GROQ_MODEL=llama-3.1-8b-instant` recommandé pour bêta légère
- `CHAT_MAX_REQUEST_BYTES=8388608`
- `PROVIDER_TIMEOUT_MS=24000`
- `MAX_UPLOAD_FILE_MB=12`
- `STATUS_OLLAMA_TIMEOUT_MS=1200`
- `INTERNAL_KNOWLEDGE_MAX_FILES=260`
- `INTERNAL_KNOWLEDGE_CACHE_TTL_MS=600000`

## Tests à faire après application sur branche

```powershell
npm ci
npm run typecheck
npm run build
```

Puis tester sur Vercel :

- `GET /api/health` doit répondre `{ ok: true }`.
- `GET /api/status` doit répondre rapidement, même sans Ollama.
- `POST /api/chat` JSON simple doit répondre.
- `POST /api/chat` JSON invalide doit retourner 400.
- `POST /api/chat` content-type non supporté doit retourner 415.
- `POST /api/parse-doc` sans fichier doit retourner 400.
- `POST /api/parse-doc` fichier vide doit retourner 400.
- `POST /api/parse-doc` fichier trop lourd doit retourner 413.

## Notes

Je n'ai pas pu exécuter `npm ci` dans l'environnement local du chat : la commande a expiré avant installation réseau. Les changements ont été vérifiés statiquement dans les fichiers source.
