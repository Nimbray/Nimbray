# Journal Agent IA

## Mission

Améliorer le cerveau de NimbrayAI : naturel, raisonnement, vérité, sécurité, mémoire, sources et coordination multi-agents.

## Règle

Toute nouvelle règle de cerveau doit être courte, utile, testable et compatible avec les règles existantes.

## V90 — Intelligent Project Brain

### Changements livrés

- Ajout d’un `Provider Router` dédié dans `lib/provider-router.ts`.
- Routage intelligent entre `demo`, `Groq`, `Ollama` et `OpenRouter`, avec ordre de fallback déterministe.
- Sélection renforcée d’Ollama pour les demandes projet/fichiers/locales, Groq pour les réponses cloud rapides, OpenRouter comme fallback optionnel, puis mode démo Vercel.
- Ajout d’un `Knowledge Router` dans `lib/knowledge-router.ts`.
- Routage knowledge entre fichiers utilisateur, mémoire projet locale, sources gratuites externes et mode hybride.
- `/api/chat` utilise maintenant `routeProvider()` et `routeKnowledge()` au lieu de choisir directement un provider dans la route.
- `/api/status` expose l’état du Provider Router et les flags V90.
- Ajout de `/api/health` pour vérifier rapidement chat/status/parse-doc/provider router côté Vercel.

### Principes V90

- Ne jamais casser la réponse si un provider est absent : fallback propre vers le provider suivant.
- Ne jamais exiger Groq ou Ollama pour que le site fonctionne : `demo` reste le dernier filet de sécurité.
- Prioriser les fichiers utilisateur quand la question parle explicitement du document ou de l’upload.
- Prioriser la mémoire projet locale quand la question concerne Nimbray, GitHub, Vercel, API, agents ou workspaces.
- Garder les sources invisibles sauf demande explicite de l’utilisateur.

### Tests effectués

- `npm run typecheck`
- `npm run build`
