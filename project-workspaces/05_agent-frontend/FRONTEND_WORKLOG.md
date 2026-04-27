# Journal Agent Frontend

## Mission

Améliorer l'interface, l'expérience mobile, les pièces jointes, les états de chargement, l'accessibilité et la qualité perçue.

## Règle

Tout changement UI doit rester simple, propre et compréhensible pour l'utilisateur.

## V91 — Minimal Chat UI

Branche cible : `agent/frontend/v91-minimal-chat-ui`

### Objectif
Refonte visuelle du chat Nimbray avec une interface plus minimaliste, premium et lisible, inspirée par une logique de sobriété conversationnelle sans copie exacte d’un produit existant.

### Changements réalisés
- Refonte de la couche CSS principale du chat via le scope `.v91-shell`.
- Sidebar rendue plus sobre : fond neutre, threads plus discrets, états actifs moins bruyants.
- Topbar simplifiée avec mention V91 et hiérarchie visuelle plus légère.
- État vide retravaillé avec trois raccourcis conversationnels utiles : état projet, UX, échange personnel.
- Composer rendu plus compact, plus premium, avec bouton d’envoi sobre et comportement mobile conservé.
- Bulles utilisateur et messages assistant adoucis : contraste moins agressif, meilleure lisibilité, largeur contrôlée.
- État loading amélioré avec micro-animation de points.
- Previews images et pièces jointes conservées, avec cartes plus propres et suppression inchangée.
- Responsive mobile renforcé : grille d’actions d’accueil en une colonne, composer compact, previews en une colonne.
- Alignement des libellés projet visibles sur V91 au lieu d’anciennes références V46/V76/V82.

### Routes API préservées
- `/api/chat`
- `/api/status`
- `/api/health`
- `/api/parse-doc`

### Notes upload / vision
L’upload image côté UI reste inchangé fonctionnellement : sélection, compression client, preview, suppression avant envoi et passage du contexte image à `/api/chat`. L’analyse vision serveur n’est pas introduite par cette passe frontend et reste à traiter côté roadmap IA/backend.

### Validation attendue
- `npm install --no-audit --no-fund`
- `npm run typecheck`
- `npm run build`
- Test manuel chat texte
- Test manuel upload image : preview, suppression, envoi
- Vérification mobile responsive
