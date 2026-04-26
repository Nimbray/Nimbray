# V82 — Collaborative Workspaces Protocol

V82 ajoute une organisation de travail parallèle pour le projet IA.

## Objectif

Permettre à toutes les conversations du projet de contribuer comme une équipe d'experts, sans écraser le travail des autres et sans repartir d'anciennes bases.

## Nouveautés

- Dossier `project-workspaces/` à la racine.
- Un espace séparé par agent : Produit, IA, Backend, Frontend.
- Un journal global des dernières versions et décisions.
- Un espace validation pour les tests et risques.
- Un protocole de handoff pour chaque conversation.
- Mise à jour du cerveau interne en V82.
- Mise à jour de l'orchestrateur expert en V82.

## Décision produit

La source officielle reste unique, mais le travail préparatoire peut être distribué. Cela permet d'avancer plus vite sans perdre la stabilité du projet.

## Validation

Avant livraison :

- vérifier que la version du package est incrémentée ;
- documenter la version dans `docs/` ;
- mettre à jour `SOURCE_OF_TRUTH.md` si nécessaire ;
- mettre à jour les journaux du workspace ;
- garder le ZIP léger ;
- tester `npm install` puis `npm run build` côté environnement complet.
