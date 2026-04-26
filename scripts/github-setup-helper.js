#!/usr/bin/env node
console.log(`
NimbrayAI V84 — Mise en place GitHub clé en main

1) Crée un repo GitHub vide, par exemple: NimbrayAI
2) Dans ce dossier projet:
   git init
   git add .
   git commit -m "chore: initialize NimbrayAI V84 GitHub agent automation"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/NimbrayAI.git
   git push -u origin main

3) Remplace @TON-COMPTE dans .github/CODEOWNERS par ton compte GitHub.

4) Dans GitHub:
   Settings → Branches → Add branch protection rule
   Branch name pattern: main
   Active:
   - Require a pull request before merging
   - Require approvals
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Block force pushes
   - Block deletions

5) Pour lancer un agent:
   npm run agent:start -- --agent frontend --feature chat-ui
   npm run agent:start -- --agent backend --feature upload-api
   npm run agent:start -- --agent ia --feature brain-upgrade
   npm run agent:start -- --agent produit --feature roadmap

6) Avant chaque PR:
   npm run source:check
   npm run agent:merge-check
   npm run build
`);
