# NimbrayAI V81 — Project Conversation Sync Protocol

Cette règle organise toutes les conversations du projet IA comme une seule équipe coordonnée.

## Principe

Chaque conversation peut avoir un angle différent, mais toutes doivent respecter la même source officielle : la dernière version livrée du projet.

- La dernière archive validée remplace les versions précédentes.
- Les conversations parallèles doivent se comporter comme des agents synchronisés.
- Les décisions importantes doivent être ramenées dans la version suivante du ZIP.
- Les anciennes discussions servent de contexte, pas de nouvelle base technique.

## Rôles synchronisés

- Agent Produit : priorise la valeur, la roadmap et les critères d'acceptation.
- Agent IA : améliore le cerveau, le naturel, la vérité, la mémoire et la sécurité.
- Agent Backend : solidifie API, providers, uploads, erreurs, stockage et compatibilité Vercel.
- Agent Frontend : améliore UX, UI, mobile, accessibilité, feedback et qualité perçue.

## Règle de travail

Quand une conversation propose une amélioration utile :

1. vérifier qu'elle part de la dernière version officielle ;
2. classer l'idée par rôle expert ;
3. intégrer uniquement ce qui renforce vraiment le produit ;
4. documenter dans `docs/` ;
5. incrémenter la version ;
6. produire une nouvelle archive légère.

## Anti-régression

Ne jamais mélanger manuellement plusieurs ZIP sans comparaison volontaire. Une amélioration venant d'une ancienne conversation doit être réappliquée sur la dernière source officielle, jamais fusionnée aveuglément.

## Extension V82 — Séparation des conversations

Pour éviter que les conversations se chevauchent, chaque conversation ou agent doit déposer ses idées dans le workspace adapté avant intégration.

Les dernières nouvelles validées sont à lire dans `project-workspaces/01_global-news/LATEST.md` et `project-workspaces/01_global-news/CHANGELOG.md`.

Les changements importants doivent passer par `project-workspaces/06_validation/TEST_CHECKLIST.md` avant livraison.
