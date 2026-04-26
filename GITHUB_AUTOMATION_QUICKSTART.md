# NimbrayAI V84 — GitHub Agent Automation Quickstart

Objectif : rendre le projet très simple à gérer avec plusieurs agents qui travaillent vite sans se marcher dessus.

## 1. Créer le dépôt GitHub

Crée un nouveau repo GitHub vide, puis lance :

```bash
git init
git add .
git commit -m "chore: initialize NimbrayAI V84 GitHub agent automation"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/NimbrayAI.git
git push -u origin main
```

Remplace `TON-COMPTE` par ton compte GitHub.

## 2. Personnaliser CODEOWNERS

Ouvre :

```txt
.github/CODEOWNERS
```

Remplace tous les `@TON-COMPTE` par ton compte GitHub, ou par tes équipes GitHub.

## 3. Protéger `main`

Dans GitHub :

```txt
Settings → Branches → Add branch protection rule → Branch name pattern: main
```

Active :

- Require a pull request before merging
- Require approvals
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Block force pushes
- Block deletions

## 4. Démarrer un agent

Frontend :

```bash
npm run agent:start -- --agent frontend --feature chat-ui
```

Backend :

```bash
npm run agent:start -- --agent backend --feature upload-api
```

IA :

```bash
npm run agent:start -- --agent ia --feature brain-upgrade
```

Produit :

```bash
npm run agent:start -- --agent produit --feature roadmap
```

Le script affiche la branche à créer et les commandes exactes.

## 5. Créer un handoff agent

```bash
npm run agent:handoff -- --agent backend --version 84 --title "upload-api"
```

## 6. Ajouter une entrée au changelog agent

```bash
npm run agent:changelog -- --agent backend --branch agent/backend/v84-upload-api --summary "Fix upload image" --files app/api/chat/route.ts,lib/upload.ts
```

## 7. Vérifier avant PR

```bash
npm run source:check
npm run agent:merge-check
npm run build
```

## 8. Ouvrir une Pull Request

Chaque agent ouvre une PR vers `main`. GitHub Actions vérifie automatiquement :

- source officielle cohérente ;
- présence des fichiers GitHub ;
- présence des dossiers agents ;
- branche agent correcte ;
- handoff présent ;
- build.

## 9. Rôle Agent Intégrateur

L’intégrateur fusionne les PR validées, résout les conflits et promeut la nouvelle version officielle.

```bash
git checkout main
git pull origin main
git checkout -b integration/v85-official
npm run source:promote -- --version 85.0.0 --zip github-main --codename "V85 Official Merge" --notes "Fusion des agents validés"
npm run agent:merge-check
npm run build
```

Puis PR `integration/v85-official` vers `main`.
