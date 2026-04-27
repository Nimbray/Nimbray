# V91 — Vision Memory Polish

## Objectif

Aligner l’agent IA Nimbray sur l’état réel de travail V91 : mémoire projet prioritaire, réponses plus synthétiques et naturelles, meilleure gestion des émotions, et réponses cohérentes quand une image est envoyée.

## Changements IA

- Ajout de `lib/project-memory.ts` comme couche courte de mémoire projet V91.
- Ajout d’une réponse projet dédiée pour les questions d’état Nimbray/V90/V91.
- Mise à jour du prompt cœur avec les règles V91 : naturel, synthèse, mémoire prioritaire et honnêteté vision.
- Mise à jour de `project-intelligence` pour éviter de retomber sur V72 quand aucune version récente n’est détectée.
- Ajout d’un fallback image V91 qui distingue clairement : image reçue, provider vision disponible ou non disponible.

## Mémoire prioritaire

À privilégier avant les anciennes notes historiques :

1. `project-workspaces/00_project-memory/CHECKPOINT_V90.md`
2. `CURRENT_SOURCE.json`
3. `AGENT_CHANGELOG.json`

Dans le snapshot local fourni, certains fichiers V90 ne sont pas présents. La réponse IA doit donc rester honnête : V91 est l’état de travail en branche, tandis que `main` reste la source officielle à promouvoir par intégration.

## Réponses image

Quand une image est envoyée :

- si un provider vision est configuré, Nimbray annonce qu’il va analyser avec prudence ;
- sinon, Nimbray confirme réception mais ne prétend pas voir le contenu ;
- l’utilisateur peut décrire l’image ou l’équipe peut configurer un provider vision serveur.

## Risques

- Confondre l’archive locale V84 avec l’état de travail V91.
- Promettre une analyse visuelle sans provider vision réel.
- Produire des réponses projet trop longues ou mécaniques.

## Tests recommandés

- Message : “Résume l’état actuel du projet Nimbray.”
- Message : “Où on en est sur V91 ?”
- Message court émotionnel : “je suis perdu” / “ça va pas”.
- Message avec marqueur image jointe.
- `npm run build`.
