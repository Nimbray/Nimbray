# Validation V89 — Knowledge Router & UI Encoding Fix

## Objectif
V89 prépare Nimbray pour une bêta plus propre avec :
- correction des textes mal encodés dans l'interface ;
- stabilisation Groq en production ;
- préparation du Knowledge Router ;
- validation bêta publique.

## Tests à faire

### Interface
- [ ] Aucun texte mal encodé visible : Mémoire, Régénérer, Entrée, Écris ton message
- [ ] Chat lisible sur desktop
- [ ] Chat lisible sur mobile
- [ ] Upload image/fichier toujours fonctionnel
- [ ] Speed Insights ne casse pas le build

### IA / Groq
- [ ] AI_PROVIDER=groq actif
- [ ] GROQ_API_KEY active côté Vercel
- [ ] GROQ_MODEL valide
- [ ] Nimbray ne répond plus en mode démo si Groq est actif
- [ ] Réponse naturelle et utile

### Knowledge
- [ ] knowledge/ présent dans le repo
- [ ] docs/legacy-knowledge/ présent
- [ ] Pas de .env.local commité
- [ ] Pas de .next, .vercel, node_modules dans Git
- [ ] Préparer un routeur de connaissances léger

## Bugs restants
- Corriger les chaînes UI mal encodées si encore présentes.
- Vérifier que Groq est bien utilisé sur Vercel.
- Brancher réellement knowledge/ dans les réponses.

## Décision
- [ ] V89 validée
- [ ] Corrections nécessaires
