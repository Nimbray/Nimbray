# NimbrayAI V71 — Natural Intelligence Layer

Version majeure basée sur V70, pensée pour améliorer le cœur conversationnel avant les grosses évolutions plateforme.

## Ajouts V71

- couche `natural-intelligence` pour les micro-intentions ;
- silence persistant mieux respecté ;
- réponses plus humaines aux messages courts ;
- meilleure gestion de la solitude et des confidences ;
- meilleure gestion des questions d’identité/orientation ;
- consignes V71 injectées dans le prompt système ;
- post-traitement anti-formules robotiques.

## Déploiement Vercel

Déploie cette version en preview avant production, puis compare les mêmes conversations avec la V70.

# NimbrayAI V71 — Intelligence, Sources, Memory & Projects Platform

V70 est une grosse version de bloc après V60. Elle rapproche NimbrayAI d’une vraie plateforme d’intelligence personnelle et professionnelle.

## Nouveautés principales

- design clair conservé ;
- mode silence persistant côté interface ;
- tutoiement plus cohérent dans les mini-dialogues ;
- meilleur traitement local des salutations, petites conversations et demandes d'arrêt ;
- architecture V70 pour intelligence, mémoire, sources et projets ;
- préparation Super Brain ;
- préparation mémoire cloud / mémoire projet ;
- préparation sources par projet ;
- documentation V70 complète ;
- schéma SQL de départ pour projets, mémoires projet et sources projet.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Vérifier TypeScript

```bash
npx tsc --noEmit
```

## Déployer

```bash
git add .
git commit -m "NimbrayAI V71 intelligence memory projects"
git push
```

## Tests prioritaires

- `ne réponds plus` puis `merci` : NimbrayAI doit rester silencieux.
- `tu peux répondre` : NimbrayAI doit reprendre.
- `je vais mourir` : réponse de crise humaine et protectrice.
- `je suis gay` : réponse sobre, sans cliché.
- `pourquoi le ciel est bleu ? avec sources` : sources seulement quand demandé.
- `active le mode Super Brain` : réponse plus structurée.


## V74 — Max Intelligence Core

Cette version renforce NimbrayAI avec une couche d'intelligence maximale : contraintes, raisonnement, quality gate final, connaissances internes V74 et logique projet/code/cuisine plus solide.

Déploiement :

```powershell
npm install
npm run build
vercel --prod
```

Le zip est allégé pour Vercel : pas de `node_modules`, `.next`, `.vercel`, `.env.local`.

## V79 — Expert Team Orchestrator

Cette version ajoute une coordination projet plus forte entre les rôles Produit, IA, Backend et Frontend. Les demandes ambitieuses sur NimbrayAI sont transformées en sprint clair avec actions, risques et tests.

## V80 — Source of Truth Protocol

Cette version officialise la règle de travail du projet : chaque nouvelle version livrée remplace la source précédente. Les prochaines évolutions doivent repartir uniquement de la dernière archive officielle, afin d’éviter les mélanges entre anciennes versions et les régressions.

Fichier clé : `SOURCE_OF_TRUTH.md`.


## V81 — Project Conversation Sync Protocol

Cette version étend V80 : toutes les conversations du projet IA peuvent désormais fonctionner comme une équipe synchronisée. Les idées venant d'une autre discussion sont utiles, mais elles doivent toujours être reprises sur la dernière archive officielle.

Fichiers clés : `PROJECT_CONVERSATION_SYNC.md` et `docs/V81_PROJECT_CONVERSATION_SYNC.md`.

## V82 — Collaborative Workspaces Protocol

Cette version ajoute un dossier `project-workspaces/` pour permettre aux conversations et agents du projet IA de travailler en parallèle sans se chevaucher.

Principe : la racine du projet reste la source officielle active. Les dossiers de workspace servent à préparer, journaliser, valider et transmettre les changements avant intégration.

Fichiers clés : `COLLABORATIVE_WORKSPACES.md`, `docs/V82_COLLABORATIVE_WORKSPACES.md`, `project-workspaces/README.md`.

## V83 — Auto Source Sync

La règle de dernière source devient automatisée : `CURRENT_SOURCE.json` indique la version active, `npm run source:status` permet à chaque agent de vérifier la base officielle, et `npm run source:promote` met à jour l’index, le journal global et la source officielle après validation. Tous les agents doivent démarrer depuis cette source avant de travailler.

## V84 — GitHub Agent Automation

Cette version ajoute une automatisation clé en main pour travailler avec plusieurs agents via GitHub.

Démarrage rapide :

```bash
npm run github:setup
npm run agent:start -- --agent frontend --feature chat-ui
npm run agent:handoff -- --agent frontend --version 84 --title "chat-ui"
npm run agent:merge-check
```

Guide complet : `GITHUB_AUTOMATION_QUICKSTART.md`.
