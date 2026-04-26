#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { parseArgs, slugify, today, ensureDir, readJson, resolveAgent } = require('./agent-utils');

const args = parseArgs(process.argv.slice(2));
const agent = resolveAgent(args.agent || args.name || 'frontend');
const current = readJson('CURRENT_SOURCE.json');
const version = args.version || current.activeVersion.split('.')[0];
const title = args.title || args.feature || 'travail-agent';
const safeLabel = agent.label.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const file = path.join(process.cwd(), agent.folder, `HANDOFF_${safeLabel}_V${version}_${slugify(title)}.md`);
ensureDir(path.dirname(file));
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, `# Handoff ${agent.label} V${version} — ${title}\n\n- Date : ${today()}\n- Source de départ : ${current.activeVersion} — ${current.activeCodename}\n- Branche conseillée : ${agent.branch}/v${version}-${slugify(title)}\n- Statut : brouillon\n\n## Objectif\n\nDécrire l'objectif précis de cette contribution.\n\n## Fichiers modifiés\n\n- À compléter\n\n## Changements réalisés\n\n- À compléter\n\n## Changements des autres agents pris en compte\n\n- À compléter\n\n## Risques\n\n- À compléter\n\n## Tests effectués\n\n- [ ] npm run source:check\n- [ ] npm run agent:merge-check\n- [ ] npm run lint --if-present\n- [ ] npm run build\n- [ ] Test manuel\n\n## Prêt pour intégration ?\n\n- [ ] Oui\n- [ ] Non\n`);
}
console.log(`Handoff prêt: ${path.relative(process.cwd(), file)}`);
