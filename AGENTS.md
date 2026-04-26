# AGENTS.md — NimbrayAI

## Agent Frontend

### Mission
Améliorer l’interface de NimbrayAI : chat, upload, mobile, fluidité, états d’erreur, expérience humaine et compatibilité Vercel.

### Responsabilités
- Corriger les bugs visibles dans l’interface.
- Gérer proprement les uploads de documents et d’images.
- Garder une interface légère, responsive et claire.
- Éviter les doublons, les boutons inutiles et les états bloquants.

### Zone de travail
- `app/page.tsx`
- `app/globals.css`
- composants frontend liés au chat, aux sources et à l’upload.

## Agent IA

### Mission
Améliorer le cerveau conversationnel de NimbrayAI : réponses naturelles, honnêteté, sécurité, contexte projet et limitation des réponses robotiques.

### Responsabilités
- Corriger les comportements de réponse trop répétitifs.
- Ajouter des garde-fous honnêtes quand une capacité n’existe pas encore.
- Maintenir les moteurs locaux avant l’appel modèle externe.
- Préparer les futures capacités vision, outils et agents spécialisés.

### Zone de travail
- `app/api/chat/route.ts`
- `lib/*intelligence*.ts`
- `lib/*brain*.ts`
- `knowledge/`
- `docs/*TEST_CHECKLIST.md`

## Agent Backend

### Mission
Stabiliser l’architecture serveur de NimbrayAI : routes API, providers IA, stockage, sécurité, logs, uploads, erreurs et déploiement Vercel.

### Responsabilités
- Garder les endpoints simples, robustes et compatibles serverless.
- Séparer parsing documentaire, chat, vision future, feedback, sync et status.
- Prévenir les erreurs visibles côté utilisateur.
- Optimiser taille ZIP, coûts, latence et variables d’environnement.
- Préparer Supabase, Groq, Ollama et futures actions sans rendre le projet lourd.

### Zone de travail
- `app/api/**/route.ts`
- `lib/model-router.ts`
- `lib/supabase-rest.ts`
- `lib/platform.ts`
- `vercel.json`
- `.env*.example`

## Agent Produit

### Mission
Transformer NimbrayAI en produit clair, utile et priorisé : MVP, roadmap, expérience utilisateur, différenciation et critères de qualité.

### Responsabilités
- Prioriser les bugs bloquants avant les idées secondaires.
- Découper les évolutions en sprints livrables.
- Définir les critères d’acceptation pour chaque fonctionnalité.
- Garder une vision premium : simple, rapide, humaine, fiable.
- Arbitrer entre ambition IA et faisabilité technique.

### Zone de travail
- `README.md`
- `docs/`
- `knowledge/product/`
- `knowledge/project/`
- pages produit : `app/landing`, `app/platform`, `app/projects`

## V79 — Expert Team Orchestrator

Quand le projet NimbrayAI est discuté, les agents travaillent en équipe coordonnée :

- **Agent Produit** : valeur utilisateur, priorité, MVP, roadmap, critères d’acceptation.
- **Agent IA** : cerveau, prompts, vérité, naturel, mémoire, sources, sécurité.
- **Agent Backend** : API, providers, uploads, erreurs, stockage, Vercel, Supabase, scalabilité.
- **Agent Frontend** : interface, mobile, accessibilité, feedback visuel, pièces jointes, design premium.

Règle importante : ne pas produire quatre rapports séparés par défaut. Produire une décision commune, puis détailler les tâches par rôle seulement quand cela aide vraiment à livrer.

## V80 — Source of Truth Protocol

Règle commune à tous les agents : la dernière version livrée devient la seule source officielle du projet.

- Ne jamais repartir d’un ancien ZIP si une version plus récente existe.
- Ne pas mélanger des fichiers V77/V78/V79/V80 sans comparaison volontaire.
- Chaque nouvelle version doit remplacer la précédente comme base de travail.
- Les anciennes versions restent des archives de sécurité, pas des sources actives.
- Avant livraison : incrémenter `package.json`, documenter dans `docs/`, garder le ZIP léger.


## V81 — Project Conversation Sync Protocol

Toutes les conversations du projet IA doivent suivre la même méthode :

- Considérer la dernière livraison comme source active.
- Utiliser les anciennes conversations comme contexte produit ou technique.
- Réappliquer les idées utiles sur la dernière version, sans fusion aveugle.
- Garder les rôles Produit, IA, Backend et Frontend synchronisés.
- Documenter chaque évolution majeure avant de livrer une nouvelle archive.

## V82 — Collaborative Workspaces Protocol

Tous les agents et toutes les conversations du projet IA doivent utiliser les workspaces avant intégration :

- `project-workspaces/02_agent-produit` pour les décisions produit ;
- `project-workspaces/03_agent-ia` pour le cerveau et les règles IA ;
- `project-workspaces/04_agent-backend` pour API, providers, upload et stockage ;
- `project-workspaces/05_agent-frontend` pour UI, mobile et expérience ;
- `project-workspaces/01_global-news` pour tenir toutes les conversations au courant ;
- `project-workspaces/06_validation` pour tests, risques et validation.

Règle : un changement n'est officiel que lorsqu'il est intégré à la racine du projet et documenté dans la nouvelle version.

## V83 — Auto Source Sync

La règle de dernière source devient automatisée : `CURRENT_SOURCE.json` indique la version active, `npm run source:status` permet à chaque agent de vérifier la base officielle, et `npm run source:promote` met à jour l’index, le journal global et la source officielle après validation. Tous les agents doivent démarrer depuis cette source avant de travailler.

## V84 — GitHub Agent Automation

- `main` est la source officielle vivante.
- Chaque agent crée une branche `agent/<role>/<version-feature>` depuis `main` à jour.
- Chaque agent doit ajouter un handoff dans son espace `project-workspaces`.
- Chaque agent doit ouvrir une Pull Request vers `main`.
- Les checks GitHub Actions doivent passer avant fusion.
- L’Agent Intégrateur est le seul à promouvoir une nouvelle version officielle dans `CURRENT_SOURCE.json`.
