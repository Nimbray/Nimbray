# Stratégie de version NimbrayAI

NimbrayAI est un produit en production. Les changements doivent être regroupés en versions cohérentes plutôt qu'en micro-déploiements permanents.

## Cycle recommandé

1. Identifier les bugs et opportunités.
2. Regrouper par thème.
3. Modifier les moteurs concernés.
4. Ajouter de nouvelles connaissances au cerveau interne.
5. Ajouter une documentation de version.
6. Tester les scénarios critiques.
7. Déployer en production seulement quand la version apporte un vrai saut.

## Roadmap actuelle

- V71.3 — sécurité contextuelle et enrichissement des connaissances.
- V72 — mémoire et intelligence projet.
- V73 — quality engine et contrôle des réponses.
- V74 — modes et agents experts.
- V75 — plateforme stable.

## Règle de zip propre

Ne jamais inclure node_modules, .next, .vercel, .env.local, dist, build ou caches. Ces éléments sont régénérés par npm, Next.js ou Vercel.
