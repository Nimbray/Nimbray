# NimbrayAI V72 — Memory & Project Intelligence

## Objectif

V72 transforme NimbrayAI en copilote projet : il ne répond pas seulement au dernier message, il sait aussi produire un point projet, résumer les décisions, identifier les risques et proposer la prochaine action.

## Ajouts principaux

- Nouveau moteur `lib/project-intelligence.ts`.
- Détection des demandes de type : « où on en est », « prochaine étape », « roadmap », « décisions prises », « version actuelle ».
- Snapshot projet côté API : projet actif, version, focus, décisions, prochaines actions, risques.
- Guidance V72 injectée dans le prompt système pour Groq/Ollama/OpenRouter.
- Envoi d'un `projectContext` depuis le front.
- Enrichissement du cerveau interne avec de nouvelles connaissances sur la mémoire, les projets, la stratégie de versioning et la priorité sécurité.

## Philosophie

Une IA puissante n'est pas seulement un modèle. C'est une architecture : sécurité, intention, mémoire, projet, qualité et génération.

V72 pose la base de continuité projet avant V73 Quality Engine.
