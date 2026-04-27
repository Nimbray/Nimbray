# V91 — Backend Vision Upload Router

## Mission
Ajouter une première base serveur pour l’analyse image dans `/api/chat`, sans casser le chat texte, `/api/parse-doc`, `/api/status`, `/api/health` ni la compatibilité Vercel.

## Changements réalisés

### `/api/chat`
- Ajout du runtime `nodejs` pour fiabiliser la lecture multipart et les buffers côté Vercel.
- Ajout d’un parseur de requête qui accepte :
  - JSON classique actuel ;
  - JSON enrichi avec `images` / `attachments` en data URL ;
  - `multipart/form-data` avec `payload`, `body` ou `messages` JSON + fichiers.
- Ajout d’un routage upload :
  - images supportées : PNG, JPEG, WebP, GIF ;
  - documents texte simples injectés comme contexte serveur contrôlé ;
  - documents non supportés renvoyés en warning honnête.
- Ajout d’un schéma d’erreur stable sans casser le frontend existant :
  - `error` reste une string lisible ;
  - `errorCode` ajoute un code machine ;
  - `ok: false` clarifie l’état.

### Vision provider
- Nouveau `lib/vision-router.ts`.
- Activation réelle seulement si :
  - `ENABLE_VISION_UPLOADS !== "false"` ;
  - `VISION_PROVIDER=groq` ou `VISION_PROVIDER=openrouter` ;
  - la clé provider existe ;
  - `VISION_MODEL` est renseigné.
- Si aucun provider vision n’est complet, Nimbray répond honnêtement : image reçue, analyse serveur non configurée, demande de description ou fallback texte.
- Le provider vision utilise une API chat-completions compatible OpenAI avec contenu `image_url` en data URL.

### Upload router
- Nouveau `lib/upload-router.ts`.
- Centralisation des limites :
  - `MAX_UPLOAD_IMAGE_MB` par défaut 8 ;
  - `MAX_UPLOAD_FILE_MB` par défaut 12 ;
  - `MAX_CHAT_IMAGES` par défaut 4 ;
  - `MAX_CHAT_DOCUMENTS` par défaut 4 ;
  - `MAX_CHAT_INLINE_DOCUMENT_CHARS` par défaut 24000.

### `/api/status` et `/api/health`
- `/api/status` expose maintenant :
  - `vision.enabled` ;
  - `vision.configured` ;
  - `vision.provider` ;
  - `vision.model` ;
  - `uploadLimits` ;
  - flags `serverVisionUploads`, `serverVisionConfigured`, `multipartChatUploads`.
- Création de `/api/health` avec état cohérent des routes critiques, providers et uploads.

### UI minimale nécessaire
- `app/page.tsx` envoie désormais les `dataUrl` des images au dernier message envoyé à `/api/chat`.
- Le texte interne n’annonce plus que l’analyse serveur est impossible ; il indique que le routage vision dépend de la configuration provider.

## Variables d’environnement

```env
ENABLE_VISION_UPLOADS=true
VISION_PROVIDER=groq # ou openrouter
VISION_MODEL=<modele_vision_provider>
VISION_MAX_TOKENS=700
MAX_UPLOAD_IMAGE_MB=8
MAX_CHAT_IMAGES=4
MAX_CHAT_DOCUMENTS=4
MAX_CHAT_INLINE_DOCUMENT_CHARS=24000
```

Sans `VISION_MODEL`, le fallback honnête reste actif. C’est volontaire pour éviter de prétendre analyser une image sans capacité réelle.

## Tests prévus / effectués

### Effectués dans ce workspace
- Inspection manuelle des routes existantes : `/api/chat`, `/api/status`, `/api/parse-doc`.
- Ajout de `/api/health`.
- Vérification manuelle des chemins de réponse :
  - texte seul ;
  - image avec data URL ;
  - image sans provider vision configuré ;
  - multipart avec fichiers ;
  - erreurs provider.

### Non effectués automatiquement ici
- `npm ci` / `npm run build` n’ont pas pu aboutir dans l’environnement local fourni : installation des dépendances bloquée par l’absence d’accès réseau exploitable dans le container.

### À lancer dans le repo officiel
```bash
git checkout main
git pull origin main
git checkout -b agent/backend/v91-vision-upload-router
npm ci
npm run build
curl http://localhost:3000/api/health
curl http://localhost:3000/api/status
```

Test JSON texte :
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Bonjour"}]}'
```

Test fallback image data URL :
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Que vois-tu ?","images":[{"name":"test.png","type":"image/png","size":100,"dataUrl":"data:image/png;base64,iVBORw0KGgo="}]}]}'
```

Test multipart :
```bash
curl -X POST http://localhost:3000/api/chat \
  -F 'messages=[{"role":"user","content":"Résume ce fichier"}]' \
  -F 'file=@README.md;type=text/markdown'
```

## Préparation PR

Titre proposé :
`V91 Backend: add vision upload router and stable chat upload handling`

Résumé PR :
- ajoute un routeur serveur d’uploads pour `/api/chat` ;
- ajoute un provider router vision avec fallback honnête ;
- stabilise les erreurs chat ;
- expose l’état vision/upload dans `/api/status` et `/api/health` ;
- envoie les images UI au backend pour permettre l’analyse serveur configurée.
