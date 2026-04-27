# CHECKPOINT V91 — Vision, Memory Polish and Minimal UI

## État
V91 intègre trois axes :
- Frontend minimal premium UI
- Backend vision/upload router
- IA memory polish

## Objectifs
- Interface plus sobre, lisible et proche des standards modernes d’assistant IA.
- Base serveur pour analyse image quand un provider vision est disponible.
- Fallback honnête si aucune vision serveur n’est configurée.
- Mémoire projet alignée sur V91.
- Réponses personnelles plus naturelles, plus courtes, moins répétitives.

## Routes critiques
- /api/chat
- /api/status
- /api/health
- /api/parse-doc

## Points de vigilance
- Ne pas réintroduire de registry interne npm.
- Ne pas réintroduire de vercel.json invalide.
- Ne pas prétendre analyser une image si aucun provider vision réel n’est disponible.
- Ne pas revenir aux anciennes versions V72/V74/V76 comme état courant.

## Tests attendus
- npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund
- npm run typecheck
- npm run build
- /api/health
- /api/status
- Chat texte simple
- Résume l’état actuel du projet Nimbray.
- je me sens un peu seul
- Upload image avec vision ou fallback honnête
