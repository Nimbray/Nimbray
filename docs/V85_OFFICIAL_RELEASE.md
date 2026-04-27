# Nimbray V85 — Official Release

## Objectif
V85 officialise le premier vrai cycle multi-agents GitHub de Nimbray.

## Changements principaux

### Produit
- Roadmap V85 à V90
- Priorités produit
- Critères d’acceptation
- Backlog P0/P1/P2

### Backend
- Route /api/chat renforcée
- Support JSON + multipart/form-data
- Validation des messages
- Normalisation des métadonnées de pièces jointes
- Erreurs client plus lisibles

### Frontend
- Preview image/fichier avant envoi
- États visibles : préparation, prêt, envoi, erreur
- Blocage d’envoi pendant préparation fichier
- Amélioration mobile du composer

### IA
- Réponses plus naturelles
- Réduction des répétitions
- Meilleure orchestration des agents internes
- Meilleur contexte projet IA

## Validation
Cette release doit être validée par :
- npm run source:check
- npm run agent:merge-check
- npm run build
- GitHub Actions
- test manuel chat + upload

## Source officielle
Après merge de cette branche, main devient la source officielle V85.
