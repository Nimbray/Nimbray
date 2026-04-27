# Validation V87 officielle

## Version
V87 — Beta Readiness Premium Brain

## PR intégrées
- Produit V87 : beta readiness
- Backend V87 : observabilité API et erreurs stables
- Frontend V87 : premium chat UX
- IA V87 : natural product brain

## Checks requis
- [ ] npm run source:check
- [ ] npm run agent:merge-check
- [ ] npm run build
- [ ] GitHub Actions
- [ ] Vercel deploy

## Tests manuels
- [ ] Message simple
- [ ] Message long
- [ ] Image + texte
- [ ] Image seule
- [ ] Fichier + texte
- [ ] Fichier seul
- [ ] Suppression pièce jointe avant envoi
- [ ] Mobile
- [ ] Réponse émotionnelle/personnelle
- [ ] Réponse projet multi-agents

## Risques connus
- Vérifier que Backend et IA n'ont pas écrasé leurs changements communs dans app/api/chat/route.ts
- Vérifier que AGENT_CHANGELOG.json reste valide
- Vérifier Vercel après merge

## Statut
En préparation pour release officielle V87.
