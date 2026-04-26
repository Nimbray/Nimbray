# Source officielle NimbrayAI

Version source actuelle : **V80 — Source of Truth Protocol**

Règle absolue : la dernière version livrée devient la seule base de travail. Les anciennes versions restent des archives.


## Extension V81 — Conversations synchronisées

Toutes les conversations du projet IA peuvent contribuer à NimbrayAI, mais elles doivent rester synchronisées autour d'une règle unique : la dernière version livrée est la base active. Une idée provenant d'une ancienne discussion doit être reprise, triée et réappliquée sur la dernière archive officielle.

## Extension V82 — Workspaces collaboratifs

La source officielle reste unique, mais le travail préparatoire est séparé par conversation et par agent dans `project-workspaces/`.

Chaque workspace peut contenir des notes, idées, journaux et handoffs. Ces fichiers ne remplacent jamais le code actif tant qu'ils ne sont pas validés et réintégrés dans la racine du projet.

La règle de remplacement reste inchangée : la dernière version livrée devient la source officielle suivante.

## V83 — Auto Source Sync

La règle de dernière source devient automatisée : `CURRENT_SOURCE.json` indique la version active, `npm run source:status` permet à chaque agent de vérifier la base officielle, et `npm run source:promote` met à jour l’index, le journal global et la source officielle après validation. Tous les agents doivent démarrer depuis cette source avant de travailler.

## V84 — Source GitHub vivante

La source officielle n’est plus seulement un ZIP : en mode GitHub, la branche `main` devient la source vivante officielle. Les ZIP restent utiles comme snapshots, mais les agents doivent travailler via branches et Pull Requests.

Règle : aucune modification directe sur `main`. Toute contribution passe par une branche agent, un handoff, `AGENT_CHANGELOG.json`, les checks CI et une Pull Request.
