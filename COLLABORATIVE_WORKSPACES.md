# NimbrayAI V82 — Collaborative Workspaces Protocol

V82 organise le projet IA pour que plusieurs conversations et plusieurs agents puissent travailler fort en parallèle sans se chevaucher.

## Principe

- Le dernier ZIP livré reste la source officielle.
- Chaque conversation ou agent travaille dans un dossier séparé.
- Les idées, ajouts, corrections et risques sont écrits dans un journal avant d'être intégrés.
- Seuls les changements validés sont appliqués à la source principale.
- Chaque nouvelle livraison remplace la précédente comme base officielle.

## Dossiers clés

- `project-workspaces/00_official-source` : état officiel, version active, règles de remplacement.
- `project-workspaces/01_global-news` : dernières nouvelles du projet, changelog global, décisions validées.
- `project-workspaces/02_agent-produit` : priorités produit, roadmap, critères d'acceptation.
- `project-workspaces/03_agent-ia` : cerveau, prompts, naturel, vérité, sécurité, sources.
- `project-workspaces/04_agent-backend` : API, providers, upload, erreurs, stockage, Vercel.
- `project-workspaces/05_agent-frontend` : UI, mobile, accessibilité, pièces jointes, design.
- `project-workspaces/06_validation` : checklists, tests, risques, validation avant intégration.
- `project-workspaces/07_archives` : notes anciennes, décisions remplacées, traces de sécurité.

## Cycle de travail

1. Une conversation propose une idée ou un correctif.
2. L'agent concerné note le changement dans son workspace.
3. Les autres agents lisent le journal global avant de continuer.
4. La validation compare les changements avec la source officielle.
5. Les fichiers validés sont intégrés à la racine du projet.
6. Une nouvelle version est livrée en ZIP léger.
7. Cette version devient la nouvelle source officielle.

## Règle anti-chevauchement

Aucune conversation ne doit modifier mentalement une ancienne version. Si une conversation apporte une bonne idée, elle doit être reformulée comme patch sur la dernière version officielle.

## Handoff obligatoire

Chaque agent doit écrire :

- objectif ;
- fichiers touchés ;
- changements faits ;
- risques ;
- tests à faire ;
- statut : idée, en cours, validé, intégré, remplacé.

## V83 — Auto Source Sync

La règle de dernière source devient automatisée : `CURRENT_SOURCE.json` indique la version active, `npm run source:status` permet à chaque agent de vérifier la base officielle, et `npm run source:promote` met à jour l’index, le journal global et la source officielle après validation. Tous les agents doivent démarrer depuis cette source avant de travailler.

## V84 — Travail GitHub parallèle

Chaque agent garde son espace de notes, mais le code évolue via GitHub :

- Produit : `agent/product/...` et `project-workspaces/02_agent-produit/`
- IA : `agent/ai/...` et `project-workspaces/03_agent-ia/`
- Backend : `agent/backend/...` et `project-workspaces/04_agent-backend/`
- Frontend : `agent/frontend/...` et `project-workspaces/05_agent-frontend/`
- Intégrateur : `integration/...`, `project-workspaces/06_validation/` et `project-workspaces/09_merge-queue/`
