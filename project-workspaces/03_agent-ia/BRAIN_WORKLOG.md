# Journal Agent IA

## Mission

Améliorer le cerveau de NimbrayAI : naturel, raisonnement, vérité, sécurité, mémoire, sources et coordination multi-agents.

## Règle

Toute nouvelle règle de cerveau doit être courte, utile, testable et compatible avec les règles existantes.

## 2026-04-27 — V90 Final Polish — Agent IA / Intégration

Branche : `integration/v90-final-polish`

### Changements
- Alignement du cerveau projet sur **V90 Final Polish**.
- Priorisation mémoire : `CHECKPOINT_V90.md`, `CURRENT_SOURCE.json`, `AGENT_CHANGELOG.json`.
- Remplacement des références de modèle/réponse qui présentaient V72/V74/V76 comme état courant.
- Réponse projet enrichie avec la préparation **V91 vision serveur**.
- Réponses de solitude rendues plus naturelles, sans formule répétitive ni questions en rafale.
- Conservation du comportement upload image actuel : réception/preview côté UI, transparence côté serveur.

### Tests prévus
- `npm install --no-audit --no-fund`
- `npm run typecheck`
- `npm run build`
- API : `Résume l’état actuel du projet Nimbray`
- API : `je me sens un peu seul`
- Upload image UI
