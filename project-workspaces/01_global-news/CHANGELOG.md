# Journal global du projet IA

## V82 — Collaborative Workspaces Protocol

Statut : intégré.

Ajouts :

- création du dossier `project-workspaces/` ;
- séparation des espaces Produit, IA, Backend, Frontend ;
- journal global pour tenir toutes les conversations au courant ;
- protocole de validation avant intégration ;
- mise à jour du cerveau NimbrayAI en V82 ;
- mise à jour de l'orchestrateur expert en V82.

## 2026-04-26 — 83.0.0 — V83 Auto Source Sync

- Ajout de `CURRENT_SOURCE.json`.
- Ajout de `scripts/source-manager.js`.
- Ajout des commandes `source:status`, `source:check`, `source:agent`, `source:promote`.
- Ajout de `project-workspaces/08_agent-inbox/` pour les nouvelles conversations/agents.
- Effet : chaque agent peut vérifier et promouvoir automatiquement la dernière source officielle.

## 2026-04-26 — 84.0.0 — V84 GitHub Agent Automation

- Archive officielle : NimbrayAI_V84_GitHub_Agent_Automation.zip
- Ajout : workflows GitHub Actions, PR template, CODEOWNERS, scripts agent et AGENT_CHANGELOG.json.
- Effet : GitHub `main` devient la source officielle vivante pour tous les agents.
