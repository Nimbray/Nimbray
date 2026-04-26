# V77 — Frontend + IA Agent Fix

## Corrections incluses

- Correction de l’upload image dans le chat : les images ne passent plus par le parseur documentaire réservé aux formats texte/PDF/DOCX.
- Ajout d’une prévisualisation des images avant envoi.
- Affichage des images dans les bulles utilisateur après envoi.
- Bouton Envoyer actif même avec une image sans texte.
- Réinitialisation de l’input file après sélection, pour pouvoir renvoyer le même fichier.
- Limite image locale à 5 Mo pour éviter d’alourdir le localStorage et le déploiement Vercel.
- Message IA honnête : NimbrayAI confirme recevoir/afficher l’image, mais n’invente pas d’analyse visuelle tant qu’un modèle vision n’est pas branché.
- Suppression d’un bouton “Supprimer” doublonné dans la mémoire.
- Ajout du fichier `AGENTS.md` avec les rôles Agent Frontend et Agent IA.

## Fichiers modifiés

- `app/page.tsx`
- `app/globals.css`
- `app/api/chat/route.ts`
- `AGENTS.md`
- `docs/V77_FRONTEND_IA_AGENT_FIX.md`

## Prochaine étape conseillée

Brancher une vraie route vision, par exemple `/api/vision`, qui accepte image + texte et appelle un modèle compatible vision. Le frontend est maintenant prêt à porter l’image dans l’expérience utilisateur.
