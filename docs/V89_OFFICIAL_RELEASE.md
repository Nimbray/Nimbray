# Nimbray V89 — Knowledge Router & UI Encoding Fix

## Objectif
V89 prépare Nimbray pour une bêta publique plus propre : interface sans texte cassé, Groq stabilisé, et base de connaissances prête à être exploitée.

## Axes principaux

### Frontend
- Correction des textes mal encodés visibles dans l'interface.
- Vérification des labels : Mémoire, Régénérer, Entrée, Écris ton message.
- Préservation du design premium.

### Backend
- Vérification production du provider Groq.
- Stabilisation des erreurs provider.
- Contrôle des variables Vercel : AI_PROVIDER, GROQ_API_KEY, GROQ_MODEL, GROQ_MAX_TOKENS.

### IA
- Préparation d'un Knowledge Router léger.
- Objectif : sélectionner quelques connaissances pertinentes depuis knowledge/ sans tout injecter.
- Réduire les réponses inventées et mieux utiliser les sources internes.

### Produit
- Checklist bêta publique.
- Critères Go / No-Go.
- Priorisation des derniers bugs visibles.

## Validation
- npm run source:check
- npm run agent:merge-check
- npm run build
- GitHub Actions
- Vercel Deploy
- Tests manuels chat + upload + Groq

## Source officielle
Après merge de l'intégration V89, main deviendra la source officielle V89.
