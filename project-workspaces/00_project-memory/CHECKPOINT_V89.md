# Nimbray — Checkpoint Conversation V89

## État global
- Repo officiel : Nimbray/Nimbray
- Source officielle : main
- Déploiement : Vercel
- IA provider : Groq
- Objectif actuel : stabiliser V89, puis créer Knowledge Router actif

## Ce qui est déjà en place
- Workflow multi-agents GitHub
- Branches agents par rôle : Produit, Backend, Frontend, IA
- PR obligatoires vers main
- GitHub Actions fonctionnels
- Vercel connecté
- Groq configuré via variables d’environnement
- Knowledge base ajoutée depuis NimbrayAI_Online.zip
- Speed Insights ajouté
- Scan anti-secrets ajouté
- Deploy preflight ajouté

## Vercel — réglages importants
- Production Branch : main
- Preview deployments ignorées via Ignored Build Step
- Concurrent builds désactivés : un build à la fois
- Node.js conseillé : 20.x
- Build Command :
  npm run deploy:check && npm run build
- Install Command :
  npm ci --registry=https://registry.npmjs.org/ --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=180000 --fetch-timeout=300000

## Sécurité
- Ne jamais committer .env.local
- Ne jamais mettre une vraie clé Groq dans .env.example
- GROQ_API_KEY uniquement dans Vercel Environment Variables et .env.local local
- Une clé Groq a déjà été détectée dans un ancien commit local : elle doit être révoquée/remplacée

## Variables Vercel nécessaires
- AI_PROVIDER=groq
- GROQ_API_KEY=<clé réelle dans Vercel uniquement>
- GROQ_MODEL=llama-3.3-70b-versatile
- GROQ_MAX_TOKENS=650

## Scripts ajoutés
- npm run deploy:secrets
- npm run deploy:check
- scripts/deploy-no-secrets.js
- scripts/deploy-preflight.js

## Bugs déjà vus
- Encodage cassé dans l’UI : MÃ©moire, RÃ©gÃ©nÃ©rer, EntrÃ©e, etc.
- Typage UploadState dans app/page.tsx : state sent/error/ready doit être typé UploadState
- Vercel install timeout : npm/yarn registry, corrigé par config npm + retries + un seul build
- route.ts a eu un conflit Backend/IA déjà corrigé via route_fixed.ts

## Prochaine étape V89
1. Vérifier que le déploiement main Vercel passe en Ready
2. Corriger les derniers textes mal encodés UI
3. Créer un Knowledge Router léger pour utiliser knowledge/
4. Tester Groq en production
5. Créer PR V89 officielle si nécessaire

## Commandes de reprise
git checkout main
git pull origin main
npm run deploy:check
npm run build
git status

## Message à donner à ChatGPT dans la nouvelle conversation
Tu es dans le projet IA / Nimbray. Lis project-workspaces/00_project-memory/CHECKPOINT_V89.md et reprends exactement à partir de là. Priorité : stabiliser Vercel main, corriger encodage UI, puis créer Knowledge Router V89.
