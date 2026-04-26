# NimbrayAI V80 — Source of Truth Protocol

Cette version ajoute une règle de travail : chaque nouvelle livraison devient la source unique du projet.

## Règle principale

- La dernière version livrée remplace toutes les sources précédentes.
- Toute évolution repart uniquement de la version la plus récente.
- Les anciennes versions servent seulement d’archives ou de comparaison.
- Chaque livraison documente changements, conservation et tests.

## Checklist

- package.json incrémenté.
- README.md et AGENTS.md mis à jour.
- ZIP léger sans node_modules, .next, .vercel ni secrets.
