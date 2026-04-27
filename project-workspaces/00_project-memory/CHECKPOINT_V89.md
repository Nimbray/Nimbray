# CHECKPOINT V89 — Stabilisation main + Knowledge Router

Date : 2026-04-27
Branche conseillée : `agent/ia/v89-knowledge-router-stability`
Base disponible dans cette session : snapshot ZIP V84/V82. Le checkpoint V89 indiqué par l’utilisateur n’était pas présent dans l’archive fournie ; il a donc été recréé ici comme nouveau point de reprise.

## Priorités V89

1. Stabiliser `/api/chat` pour Vercel main.
2. Corriger les artefacts d’encodage visibles dans l’UI.
3. Introduire un `Knowledge Router` clair pour décider quand charger le contexte/sources.

## Changements effectués

- Ajout de `lib/knowledge-router.ts`.
- Intégration du routeur dans `app/api/chat/route.ts`.
- `/api/chat` accepte maintenant `application/json` et `multipart/form-data` simple.
- Les corps JSON invalides renvoient une erreur 400 stable au lieu d’une 500 générique.
- Les formats de requête non supportés renvoient 415.
- Ajout du diagnostic `knowledgeRouter` dans `/api/status`.
- Ajout d’une réparation UI défensive pour les artefacts d’encodage fréquents (`Ã©`, `â€™`, `â€¦`, etc.).
- Ajout d’un rejet explicite des fichiers vides dans `/api/parse-doc`.

## À vérifier sur GitHub/Vercel

- `npm ci`
- `npm run build`
- Test `/api/chat` en JSON texte seul.
- Test `/api/chat` en multipart avec champ `message`.
- Test UI avec accents français : `é è à ç œ — …`.
- Test upload fichier vide sur `/api/parse-doc`.
- Test sources utilisateur + demande “avec sources”.

## Risques connus

- L’installation npm n’a pas pu être terminée dans cet environnement, donc le build réel doit être lancé côté repo/GitHub Actions.
- La source fournie est un ZIP V84/V82, pas une branche `main` GitHub à jour.
- Le routeur V89 est volontairement heuristique et local ; il ne remplace pas un vrai connecteur web ou une recherche live.
