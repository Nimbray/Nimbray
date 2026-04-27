# Validation V85 officielle

## Version
V85 — Upload, UX, IA naturelle et roadmap produit

## PR intégrées
- Produit : roadmap V85 à V90
- Backend : solidification /api/chat et upload
- Frontend : preview pièces jointes et états d’envoi
- IA : orchestration naturelle et réduction des répétitions

## Validation
- source:check à lancer
- agent:merge-check à lancer
- build à lancer
- vérification GitHub Actions
- vérification manuelle upload image/fichier
- vérification chat mobile
- vérification réponses IA naturelles

## Risques connus
- Vérifier la cohérence finale de AGENT_CHANGELOG.json après merges multiples
- Vérifier que Frontend et Backend utilisent le même format de pièces jointes
- Vérifier le déploiement Vercel

## Statut
En préparation pour release officielle V85.
