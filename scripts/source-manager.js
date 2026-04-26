#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const currentPath = path.join(root, 'CURRENT_SOURCE.json');
const latestPath = path.join(root, 'project-workspaces', '01_global-news', 'LATEST.md');
const changelogPath = path.join(root, 'project-workspaces', '01_global-news', 'CHANGELOG.md');
const officialReadmePath = path.join(root, 'project-workspaces', '00_official-source', 'README.md');
const inboxDir = path.join(root, 'project-workspaces', '08_agent-inbox');
function readCurrent() {
  if (!fs.existsSync(currentPath)) throw new Error('CURRENT_SOURCE.json introuvable. Cette archive ne peut pas être utilisée comme source officielle.');
  return JSON.parse(fs.readFileSync(currentPath, 'utf8'));
}
function writeCurrent(data) { fs.writeFileSync(currentPath, JSON.stringify(data, null, 2) + '\n'); }
function parseArgs(argv) { const args = {}; for (let i = 0; i < argv.length; i++) { const item = argv[i]; if (item.startsWith('--')) { const key = item.slice(2); const next = argv[i + 1]; if (!next || next.startsWith('--')) args[key] = true; else { args[key] = next; i++; } } } return args; }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function today() { return new Date().toISOString().slice(0, 10); }
function status() {
  const source = readCurrent();
  console.log(`Source officielle active : ${source.activeVersion} — ${source.activeCodename}`);
  console.log(`Archive active attendue : ${source.activeArchive}`);
  console.log(`Règle : ${source.sourcePolicy}`);
  console.log('Avant de coder : créer ou ouvrir son espace agent dans project-workspaces/.');
}
function promote(args) {
  const current = readCurrent();
  const version = args.version || current.activeVersion;
  const zip = args.zip || current.activeArchive;
  const notes = args.notes || 'Promotion de la dernière version validée.';
  const codename = args.codename || `V${String(version).split('.')[0]} Auto Source Sync`;
  const date = today();
  const next = { ...current, activeVersion: version, activeCodename: codename, activeArchive: zip, updatedAt: date, lastPromotionNotes: notes };
  writeCurrent(next);
  ensureDir(path.dirname(latestPath));
  fs.writeFileSync(latestPath, `# Dernière source officielle\n\n- Version active : ${version}\n- Nom : ${codename}\n- Archive : ${zip}\n- Date : ${date}\n- Notes : ${notes}\n\nRègle : tous les agents et toutes les conversations repartent de cette source avant de modifier le projet.\n`);
  fs.appendFileSync(changelogPath, `\n## ${date} — ${version} — ${codename}\n\n- Archive officielle : ${zip}\n- Notes : ${notes}\n- Effet : cette version remplace la précédente comme source de travail pour tous les agents.\n`);
  fs.writeFileSync(officialReadmePath, `# Source officielle active\n\nCette zone pointe vers la dernière source validée du projet.\n\n- Version : ${version}\n- Archive : ${zip}\n- Mise à jour : ${date}\n\nCommande de contrôle :\n\n\`\`\`bash\nnpm run source:status\n\`\`\`\n\nCommande de promotion après validation :\n\n\`\`\`bash\nnpm run source:promote -- --version <version> --zip <archive.zip> --notes "résumé"\n\`\`\`\n`);
  console.log(`Source officielle promue : ${version} (${zip})`);
}
function agent(args) {
  const name = (args.agent || args.name || 'agent').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  const source = readCurrent();
  const dir = path.join(inboxDir, name);
  ensureDir(dir);
  const handoff = path.join(dir, 'HANDOFF.md');
  if (!fs.existsSync(handoff)) fs.writeFileSync(handoff, `# Handoff ${name}\n\n- Source de départ : ${source.activeVersion} — ${source.activeArchive}\n- Date : ${today()}\n\n## Objectif\n\nDécrire le chantier de cet agent ou de cette conversation.\n\n## Fichiers modifiés\n\n- À compléter\n\n## Tests / vérifications\n\n- À compléter\n\n## Prêt pour intégration officielle ?\n\n- Non\n`);
  console.log(`Workspace agent prêt : ${path.relative(root, dir)}`);
}
function check() {
  const source = readCurrent();
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  console.log(`package.json : ${pkg.version}`);
  console.log(`CURRENT_SOURCE.json : ${source.activeVersion}`);
  if (pkg.version !== source.activeVersion) { console.error('Erreur : la version package.json ne correspond pas à la source officielle.'); process.exit(1); }
  console.log('OK : la source active est cohérente.');
}
const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
try { if (!cmd || cmd === 'status') status(); else if (cmd === 'promote') promote(args); else if (cmd === 'agent') agent(args); else if (cmd === 'check') check(); else throw new Error(`Commande inconnue : ${cmd}`); }
catch (error) { console.error(error.message); process.exit(1); }
