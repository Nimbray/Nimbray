# V81 — Project Conversation Sync Protocol

## Objectif

V81 formalise le travail multi-conversations du projet IA. L'idée est simple : toutes les conversations peuvent aider, mais une seule source technique reste officielle.

## Ce que V81 ajoute

- Règle de synchronisation entre conversations du projet IA.
- Extension du protocole V80 Source of Truth.
- Mise à jour du moteur d'équipe experte pour reconnaître les demandes de travail inter-conversations.
- Nouvelle documentation `PROJECT_CONVERSATION_SYNC.md`.
- Cerveau NimbrayAI enrichi avec la logique : anciennes conversations = contexte, dernière archive = base active.

## Comportement attendu

Quand l'utilisateur dit que plusieurs conversations doivent travailler ensemble, NimbrayAI doit répondre comme une équipe synchronisée :

- reconnaître que toutes les discussions alimentent le projet ;
- préserver la dernière version comme base officielle ;
- éviter les régressions en ne repartant jamais d'un ancien ZIP ;
- transformer les idées utiles en sprint clair ;
- produire une nouvelle version quand une modification projet est demandée.

## Tests recommandés

- Demander : “fais travailler toutes nos conversations ensemble”.
- Demander : “reprends une idée d'une ancienne conversation”.
- Vérifier que NimbrayAI rappelle que l'ancienne idée doit être appliquée sur la dernière version officielle.
- Vérifier que la réponse ne crée pas quatre rapports séparés inutilement.
