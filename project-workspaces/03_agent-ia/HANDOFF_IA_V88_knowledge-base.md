# Handoff IA V88 — Knowledge Base

## Objectif
Intégrer les connaissances historiques de NimbrayAI_Online dans la source GitHub actuelle, sans écraser le code V87.

## Source utilisée
- NimbrayAI_Online.zip

## Fichiers intégrés
- knowledge/
- docs/legacy-knowledge/

## Fichiers exclus volontairement
- .env.local
- .git/
- .next/
- .vercel/
- node_modules/
- fichiers de build/cache

## Changements
- Ajout d'une base de connaissances étendue.
- Ajout de docs historiques utiles pour le futur moteur RAG.
- Préparation pour une future indexation intelligente.

## Risques
- Certaines connaissances peuvent être redondantes.
- Certains contenus peuvent être anciens.
- Il faudra ensuite créer un index ou un routeur de connaissances.

## Tests à faire
- npm run source:check
- npm run agent:merge-check
- npm run build
- vérifier que le ZIP complet n'a pas été copié
