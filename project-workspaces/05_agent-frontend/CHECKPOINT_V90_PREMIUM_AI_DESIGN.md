# V90 Frontend — Premium AI Design

## Objectif
Moderniser l’interface NimbrayAI avec un rendu plus épuré, premium et professionnel, sans modifier les contrats API ni la logique backend.

## Changements
- Design global plus clair et haut de gamme.
- Sidebar et topbar modernisées.
- État vide retravaillé avec suggestions rapides.
- Bulles utilisateur et assistant améliorées.
- Composer plus propre : champ, bouton envoi, bouton fichier.
- Previews images/fichiers plus lisibles.
- État loading animé.
- Responsive mobile renforcé.

## Compatibilité
Routes préservées :
- /api/chat
- /api/status
- /api/health
- /api/parse-doc

La logique d’envoi chat, upload image, parsing document et stockage local reste inchangée.

## Tests attendus
- npm install --no-audit --no-fund
- npm run typecheck
- npm run build
- Test chat simple
- Test upload fichier/image
- Test responsive mobile
