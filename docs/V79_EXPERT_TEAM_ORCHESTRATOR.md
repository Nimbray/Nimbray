# V79 — Expert Team Orchestrator

Objectif : faire travailler NimbrayAI comme une équipe projet coordonnée, avec quatre angles complémentaires : Produit, IA, Backend et Frontend.

## Ajouts

- Nouveau moteur `lib/expert-team.ts`.
- Interception locale des demandes projet ambitieuses dans `/api/chat`.
- Ajout des règles V79 dans le cerveau système.
- Ajout du guidage V79 dans le prompt provider.
- Passage du contexte projet envoyé par l’interface en V79.
- Mise à jour du panneau Cerveau avec la carte “Expert Team Orchestrator V79”.
- Mise à jour du package en `79.0.0`.

## Comportement attendu

Quand l’utilisateur parle de faire avancer NimbrayAI avec plusieurs experts, la réponse doit produire :

1. une décision commune ;
2. un sprint clair ;
3. des actions par rôle ;
4. les risques ;
5. les tests obligatoires ;
6. la prochaine version logique.

## Rôles

### Agent Produit
Priorise la valeur utilisateur, le MVP, la simplicité et la roadmap.

### Agent IA
Améliore le cerveau, le ton, la vérité, la mémoire, la sécurité et les réponses naturelles.

### Agent Backend
Stabilise les API, providers, uploads, erreurs, stockage, limites Vercel et scalabilité.

### Agent Frontend
Améliore l’interface, le mobile, l’accessibilité, les pièces jointes et la qualité perçue.

## Checklist test

- “On est plusieurs experts, avance sur tous les aspects.”
- “Où on en est sur NimbrayAI ?”
- “Corrige ce bug d’upload image.”
- “Améliore le cerveau de notre IA.”
- “Fais une roadmap produit.”
- Messages courts : “bonjour”, “merci”, “arrête”, “parle”.
- Upload image et document.
- `npm run build` après installation des dépendances.
