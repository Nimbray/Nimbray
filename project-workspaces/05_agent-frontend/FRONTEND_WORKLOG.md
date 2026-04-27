# Journal Agent Frontend

## Mission

Améliorer l'interface, l'expérience mobile, les pièces jointes, les états de chargement, l'accessibilité et la qualité perçue.

## Règle

Tout changement UI doit rester simple, propre et compréhensible pour l'utilisateur.

## 2026-04-27 — V85 chat attachments

- Branche cible : `agent/frontend/v84-v85-chat-attachments`.
- Ajout d'états frontend explicites pour les uploads : préparation, prêt, envoi, erreur.
- Amélioration de la preview image avant envoi : miniature, nom, poids, suppression.
- Ajout d'une barre de pièces jointes dans le composer avec compteur et feedback accessible.
- Amélioration mobile : zone de statuts compacte et scrollable, composer utilisable sur petit écran.
- Validation : `npm run agent:merge-check` OK.
- À relancer dans le repo GitHub après installation : `npm run build` et `npm run agent:pr-check`.
