# Checklist validation V82+

## Fonctionnel

- Chat simple : bonjour, merci, continue, arrête, parle.
- Projet : améliore notre IA, corrige ce bug, où on en est.
- Upload image : sélection, aperçu, envoi, réponse honnête.
- Upload document : TXT/MD/PDF/DOCX selon dépendances.
- Mémoire/contexte : résumé de conversation correctement transmis.

## Technique

- `npm install`
- `npm run build`
- ZIP léger sans `node_modules`, `.next`, `.vercel`, `.env.local`.

## Produit

- Changement documenté.
- Version incrémentée.
- Journal global mis à jour.
- Handoff agent rempli si changement important.

## V89.1 — Vercel deployment checklist

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `GET /api/health`
- [ ] `GET /api/status` sans Ollama local
- [ ] `POST /api/chat` JSON valide
- [ ] `POST /api/chat` JSON invalide
- [ ] `POST /api/chat` content-type non supporté
- [ ] `POST /api/parse-doc` fichier texte valide
- [ ] `POST /api/parse-doc` fichier vide
- [ ] Déploiement preview Vercel terminé sans timeout install/build
