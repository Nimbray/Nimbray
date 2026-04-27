# CHECKPOINT V90 — Intelligent Project Brain

## Objectif

V90 transforme NimbrayAI en cerveau projet plus intelligent avec deux couches propres :

1. **Provider Router** : choisit et sécurise le moteur IA.
2. **Knowledge Router** : choisit et sécurise les sources de contexte.

## Provider Router

Fichier : `lib/provider-router.ts`

Le router sait gérer :

- `demo` : fallback Vercel garanti, sans clé API ;
- `groq` : provider cloud rapide ;
- `ollama` : provider local utile pour projet, fichiers et autonomie ;
- `openrouter` : fallback cloud optionnel si configuré.

Ordre logique :

- provider demandé ou configuré ;
- Ollama pour les demandes projet/fichiers/locales ;
- Groq pour les réponses cloud rapides ;
- OpenRouter si clé disponible ;
- Demo en dernier fallback.

Chaque réponse peut exposer :

- `provider` ;
- `model` ;
- `fallbackUsed` ;
- `fallbackChain` ;
- `unavailableProviders`.

## Knowledge Router

Fichier : `lib/knowledge-router.ts`

Le router sait orienter le contexte vers :

- `user-files` : fichiers utilisateur et documents uploadés ;
- `local-memory` : connaissance locale / mémoire projet ;
- `hybrid` : fichiers + mémoire + sources gratuites ;
- `external` : sources gratuites externes ;
- `none` : pas de contexte ajouté quand la demande est simple.

## Routes protégées

V90 garde les routes critiques :

- `/api/chat` : utilise Provider Router + Knowledge Router ;
- `/api/status` : expose l’état V90 ;
- `/api/health` : ajouté pour monitoring simple ;
- `/api/parse-doc` : inchangé, compatible upload ;
- `/api/cloud/status` : non modifié ;
- `/api/platform/status` : non modifié.

## Compatibilité Vercel

- Pas de dépendance lourde ajoutée.
- Pas de service local obligatoire.
- Pas de streaming imposé.
- Pas de stockage serveur obligatoire.
- Fallback demo conservé pour éviter les erreurs bloquantes en production.

## Risques restants

- Ollama n’est disponible sur Vercel que si un endpoint externe est configuré, pas via `127.0.0.1`.
- Les sources web gratuites dépendent des APIs publiques et peuvent échouer ponctuellement.
- La vision serveur n’est pas encore active : les images uploadées sont reçues côté conversation mais non analysées visuellement.

## Validation V90

Tests effectués :

- `npm run typecheck`
- `npm run build`

Résultat attendu : build Next.js OK, routes API compatibles serverless.
