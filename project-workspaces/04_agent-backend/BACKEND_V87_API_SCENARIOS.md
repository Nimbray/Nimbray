# Backend V87 — Scénarios de test API `/api/chat`

Branche : `agent/backend/v87-observability-api`  
Date : 2026-04-27  
Agent : Backend

## Objectif

Valider que `/api/chat` reste compatible Vercel serverless après V85/V86, tout en ajoutant :

- logs backend propres sans contenu utilisateur ni noms de fichiers ;
- structure d’erreur stable côté API ;
- rejet explicite des cas limites upload ;
- conservation des champs historiques `ok`, `error`, `code`, `details` pour ne pas casser le frontend existant.

## Structure d’erreur stable

Toutes les erreurs renvoient maintenant :

```json
{
  "ok": false,
  "error": "Message lisible côté client",
  "code": "CODE_STABLE",
  "details": {},
  "requestId": "chat_xxx",
  "apiError": {
    "code": "CODE_STABLE",
    "message": "Message lisible côté client",
    "details": {},
    "requestId": "chat_xxx"
  }
}
```

Notes :

- `error` et `code` restent au niveau racine pour compatibilité frontend V85/V86.
- `apiError` devient la structure stable recommandée pour les prochains clients.
- `requestId` permet de relier un retour client aux logs serveur.
- Les logs ne contiennent pas le texte des messages, pas d’extraits de fichiers, pas de nom de fichier.

## Logs backend attendus

Exemples de logs JSON, volontairement non sensibles :

```json
{"service":"nimbray-api-chat","event":"request_validated","requestId":"chat_xxx","contentType":"application/json","messages":1,"attachments":0,"attachmentBytes":0}
```

```json
{"service":"nimbray-api-chat","event":"request_rejected","requestId":"chat_xxx","status":413,"code":"UPLOAD_TOO_LARGE","elapsedMs":12}
```

```json
{"service":"nimbray-api-chat","event":"request_completed","requestId":"chat_xxx","provider":"demo","status":200,"elapsedMs":44}
```

## Scénarios à rejouer avant PR

### 1. JSON texte seul

Attendu : `200`, `ok: true`, `content`, `requestId`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"Bonjour"}]}'
```

### 2. JSON invalide

Attendu : `400`, `code: INVALID_JSON`, `apiError.code: INVALID_JSON`, `requestId`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":'
```

### 3. Aucun message

Attendu : `400`, `code: NO_MESSAGES`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[]}'
```

### 4. Multipart message + image

Attendu : `200`, image reçue dans `attachments`, réponse honnête sans promesse de vision si aucun modèle vision n’est branché.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={"messages":[{"role":"user","content":"Regarde cette image"}]};type=application/json' \
  -F 'files=@./test-image.png;type=image/png'
```

### 5. Multipart message + fichier

Attendu : `200`, fichier reçu dans `attachments`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={"messages":[{"role":"user","content":"Voici un fichier"}]};type=application/json' \
  -F 'files=@./test.txt;type=text/plain'
```

### 6. Fichier vide

Attendu : `400`, `code: EMPTY_FILE`.

```bash
touch empty.txt
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={"messages":[{"role":"user","content":"Fichier vide"}]};type=application/json' \
  -F 'files=@./empty.txt;type=text/plain'
```

### 7. Fichier trop lourd

Attendu : `413`, `code: UPLOAD_TOO_LARGE` ou `UPLOAD_TOTAL_TOO_LARGE` selon le seuil dépassé.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={"messages":[{"role":"user","content":"Fichier lourd"}]};type=application/json' \
  -F 'files=@./large.bin;type=application/octet-stream'
```

Variables configurables :

- `MAX_CHAT_ATTACHMENTS`, défaut `6`
- `MAX_CHAT_IMAGE_MB`, défaut `8`
- `MAX_UPLOAD_FILE_MB`, défaut `12`
- `MAX_UPLOAD_TOTAL_MB`, défaut `18`
- `MAX_ATTACHMENT_TEXT_CHARS`, défaut `20000`

### 8. Type non supporté

Attendu : `415`, `code: UNSUPPORTED_FILE_TYPE`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={"messages":[{"role":"user","content":"Type interdit"}]};type=application/json' \
  -F 'files=@./sample.exe;type=application/x-msdownload'
```

### 9. Multipart incomplet / payload invalide

Attendu : `400`, `code: MULTIPART_PAYLOAD_INVALID` si le champ `payload` est présent mais non JSON.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -F 'payload={bad-json' \
  -F 'files=@./test.txt;type=text/plain'
```

### 10. Content-Type non supporté

Attendu : `415`, `code: UNSUPPORTED_CONTENT_TYPE`.

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'content-type: text/plain' \
  --data 'bonjour'
```

## Compatibilité Vercel

- Route conservée en handler App Router `POST(req: Request)`.
- Pas de stockage disque serveur.
- Pas de lecture complète du contenu fichier côté route ; seules les métadonnées `File` sont utilisées.
- Pas de dépendance native ajoutée.
- Logs via `console.info`, `console.warn`, `console.error`, compatibles Vercel Functions.

## Résultat V87

V87 ajoute une couche d’observabilité et de stabilité API sans changer le contrat positif principal de V85/V86.
