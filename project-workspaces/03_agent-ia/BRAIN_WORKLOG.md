# Journal Agent IA

## Mission

Améliorer le cerveau de NimbrayAI : naturel, raisonnement, vérité, sécurité, mémoire, sources et coordination multi-agents.

## Règle

Toute nouvelle règle de cerveau doit être courte, utile, testable et compatible avec les règles existantes.

## V89 — Knowledge Router

- Création de `lib/knowledge-router.ts`.
- Routes : `direct`, `local`, `user_knowledge`, `project`, `research`, `web_like`.
- Le routeur décide si le contexte RAG doit être chargé via `shouldBuildContext`.
- La guidance système mentionne la route, la confiance et la raison.
- Objectif : éviter de charger des sources inutilement tout en renforçant les réponses documentaires/projet.

## V89.1 — Knowledge performance

- Cache warm des fichiers Markdown internes pour réduire le coût de construction du contexte.
- Ajout de variables de contrôle pour limiter le nombre de fichiers de connaissance lus côté serveur.
- Maintien du Knowledge Router V89, avec meilleure compatibilité Vercel serverless.
