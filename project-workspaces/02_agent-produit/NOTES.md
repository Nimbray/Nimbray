# Notes de travail Produit — V85

- Date : 2026-04-27
- Source lue : V84 — GitHub Agent Automation
- Agent : Produit
- Branche recommandée : `agent/product/v85-roadmap-v85-v90`

## Fichiers de référence lus

- `CURRENT_SOURCE.json`
- `SOURCE_OF_TRUTH.md`
- `AGENTS.md`
- `AGENT_CHANGELOG.json`
- `COLLABORATIVE_WORKSPACES.md`

## Décision principale

La V85 doit être une version de stabilisation produit, centrée sur le parcours réel utilisateur : chat, upload, preview, erreurs, mobile et personnalité Nimbray. Les ambitions plus larges du cerveau IA, des sources projet et de l’orchestration multi-agents sont cadrées de V86 à V90 pour éviter de casser le CI ou de promettre des capacités non finalisées.

## Priorités produit V85

1. Upload image/fichier utilisable de bout en bout.
2. États visibles avant, pendant et après envoi.
3. Réponses moins répétitives et plus naturelles.
4. Contexte projet IA plus fort dans le comportement conversationnel.
5. Compatibilité Vercel et checks GitHub conservés.

## Arbitrages

- Pas de stockage cloud complet en V85 : le sujet bascule en V86 avec la notion de sources projet.
- Pas de “cerveau total Internet” annoncé comme acquis : il doit devenir une trajectoire produit basée sur sources, recherche, documents, mémoire et outils.
- Pas de refonte massive UI en V85 : priorité aux points visibles et bloquants du chat.

## Coordination attendue avec les autres agents

- Frontend : preview, états, mobile, expérience de sélection/envoi.
- Backend : route chat, parsing upload, erreurs API, compatibilité Vercel.
- IA : naturel des réponses, anti-répétition, honnêteté sur capacités, contexte projet.
- Validation : checklist upload, mobile, CI, tests conversationnels.

## Résultat produit préparé

- `ROADMAP.md` réécrit en roadmap V85 à V90.
- Handoff Produit V85 créé et complété.
- `AGENT_CHANGELOG.json` doit mentionner la contribution produit proposée.

---

## Notes Produit — V87 Beta Readiness

- Date : 2026-04-27
- Branche : `agent/product/v87-beta-readiness`
- Mission : définir les conditions d’une première bêta utilisable.

### Synthèse

La V87 doit ouvrir NimbrayAI à un petit groupe de testeurs uniquement si les parcours P0 sont fiables : chat, upload, IA honnête, mobile, déploiement et feedback. Les fonctionnalités plus ambitieuses restent planifiées V88-V90 pour éviter une bêta instable.

### Décision de périmètre

- Bêta privée contrôlée : oui.
- Ouverture publique large : non.
- Mémoire cloud/RAG avancé/actions autonomes : hors P0 V87.
- Documentation Produit : ajoutée dans `BETA_READINESS_V87.md`.
