# Journal Agent Backend

## Mission

Stabiliser API, providers LLM, upload fichiers/images, erreurs, stockage, sécurité, coût et compatibilité Vercel.

## Règle

Aucun changement backend ne doit casser le mode démo/local ou alourdir inutilement le ZIP.

## V89 — Stabilisation Vercel API

- `/api/chat` ne dépend plus uniquement de `req.json()`.
- Ajout d’un parseur stable pour JSON et multipart/form-data.
- Erreurs client stabilisées : JSON invalide = 400, content-type non supporté = 415.
- Ajout `runtime = "nodejs"` et `dynamic = "force-dynamic"` pour clarifier le comportement serverless.
- `/api/parse-doc` rejette explicitement les fichiers vides.

## V89.1 — Vercel hardening backend

- Ajout d'un helper API commun pour erreurs typées, taille de requête et timeout fetch.
- Durcissement de `/api/chat` : JSON/multipart plus sûrs, sanitation messages, erreurs 400/413/415/504.
- Durcissement de `/api/parse-doc` : validation content-type, limites avant lecture, erreurs homogènes.
- Ajout de `/api/health` pour smoke test Vercel.
- `/api/status` ne doit plus bloquer longtemps si Ollama n'est pas disponible.
