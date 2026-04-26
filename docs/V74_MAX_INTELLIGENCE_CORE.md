# NimbrayAI V74 — Max Intelligence Core

## Objectif

V74 pousse NimbrayAI vers un profil plus fort sur tous les aspects possibles sans attendre plusieurs petites versions.

Cette version ajoute :

- `lib/max-intelligence-core.ts`
- détection plus riche des domaines ;
- raisonnement par contraintes ;
- réponses pratiques plus adultes ;
- quality gate final ;
- connaissances internes V74 ;
- meilleure logique code/projet/cuisine/business/décision ;
- zip allégé pour Vercel.

## Pipeline renforcé

```text
message utilisateur
→ safety router
→ contextual safety
→ project intelligence
→ max intelligence core
→ natural intelligence
→ local engines
→ LLM provider
→ final quality gate
```

## Principe

Une réponse forte doit respecter l'intention réelle et les contraintes. NimbrayAI ne doit pas répondre à côté, même sur une demande simple.

Exemple :

- Demande : recette avec des frites.
- Mauvais : recette au jambon sans frites.
- Bon : loaded fries, frites gratinées, poutine, ou plat où les frites restent centrales.

## Zip léger

Le zip exclut les fichiers générés :

- `node_modules/`
- `.next/`
- `.vercel/`
- `.env.local`
- `.env`
- `dist/`
- `build/`
- `.cache/`
- `.turbo/`
