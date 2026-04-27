# Nimbray V87 — Official Release

## Objectif
V87 prépare Nimbray pour une première bêta utilisable avec une meilleure qualité produit, une UX plus premium, une API plus robuste et une personnalité IA plus naturelle.

## Changements principaux

### Produit
- Beta readiness V87
- Priorisation P0/P1/P2
- Critères d'acceptation chat, upload, IA, mobile et déploiement
- Roadmap V87 à V90
- Décision Go / No-Go bêta

### Backend
- Observabilité API /api/chat
- requestId par requête
- logs sans données sensibles
- structure stable apiError
- erreurs upload renforcées
- scénarios API documentés

### Frontend
- Expérience chat plus premium
- Bulles et surfaces améliorées
- Previews pièces jointes plus élégantes
- Drag-and-drop composer
- Loading assistant amélioré
- Mobile/responsive renforcé

### IA
- Personnalité Nimbray plus naturelle
- Réduction des répétitions
- Meilleure gestion des messages émotionnels/personnels
- Réponses projet plus utiles
- Orchestration agents internes améliorée

## Validation
- npm run source:check
- npm run agent:merge-check
- npm run build
- GitHub Actions
- Déploiement Vercel
- Tests manuels chat + upload

## Source officielle
Après merge de cette branche, main devient la source officielle V87.
