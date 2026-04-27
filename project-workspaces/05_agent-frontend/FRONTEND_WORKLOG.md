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

## 2026-04-27 — V86 upload E2E UI

- Branche cible : `agent/frontend/v86-upload-e2e-ui`.
- Audit du parcours upload réel depuis le composer : image, fichier, suppression avant envoi, envoi, erreur et mobile.
- Correction majeure : les documents parsés restent désormais en pièces jointes prêtes avant envoi au lieu d'être injectés immédiatement dans les sources.
- Ajout d'une preview fichier avant envoi : carte DOC, nom, poids, retrait accessible.
- Envoi possible avec document seul, image seule, ou mix image + document + texte.
- Les documents envoyés sont ajoutés aux sources locales après succès et injectés dans `userKnowledge` pour la requête courante.
- Ajout d'un état `sent` et d'un état `error` réel après échec d'envoi chat.
- Amélioration mobile : cartes de documents plus lisibles, boutons de retrait plus grands, focus visible.
- Validation : `node scripts/source-manager.js check` OK, `node scripts/agent-merge-check.js` OK.
- Build à relancer dans GitHub après installation des dépendances : `next` absent dans ce ZIP.

## 2026-04-27 — V87 premium chat UX

- Branche cible : `agent/frontend/v87-premium-chat-ux`.
- Amélioration du rendu global du chat : fond plus premium, topbar plus douce, sidebar plus soignée et animation légère des nouveaux messages.
- Bulles utilisateur renforcées : surface plus nette, ombre plus propre, meilleure hiérarchie visuelle et largeur mobile conservée.
- Messages assistant améliorés : état de réponse avec indicateur animé et copie plus discrète.
- Previews pièces jointes rendues plus élégantes : cartes image/document plus lisibles, taille formatée en Ko/Mo, suppression plus confortable.
- États upload clarifiés : libellés uniformes préparation/prêt/envoi/envoyé/erreur et icônes centralisées.
- Micro-UX ajoutée : drag-and-drop sur le composer, placeholder contextuel quand des fichiers sont prêts, CTA `Envoyer fichiers` si aucun texte n'est saisi.
- Responsive vérifié côté code CSS : composer sticky conservé, cartes plus compactes, drawer mobile inchangé.
- Validation locale : `node scripts/source-manager.js check` OK, `node scripts/agent-merge-check.js` OK.
- Build à relancer dans GitHub après installation des dépendances : `next` absent dans l'environnement ZIP.
