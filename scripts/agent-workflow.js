#!/usr/bin/env node
const { execSync } = require('child_process');
const { parseArgs, slugify, ensureDir, readJson, resolveAgent, exists, listFiles } = require('./agent-utils');

function run(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch { return ''; }
}
function gitBranch() { return run('git rev-parse --abbrev-ref HEAD') || 'unknown'; }
function start(args) {
  const agent = resolveAgent(args.agent || args.name || 'frontend');
  const feature = slugify(args.feature || args.title || 'work');
  const version = args.version || readJson('CURRENT_SOURCE.json').activeVersion.split('.')[0];
  const branch = `${agent.branch}/v${version}-${feature}`;
  ensureDir(agent.folder);
  console.log(`Agent: ${agent.label}`);
  console.log(`Dossier: ${agent.folder}`);
  console.log(`Branche conseillée: ${branch}`);
  console.log('');
  console.log('Commandes à lancer:');
  console.log('git checkout main');
  console.log('git pull origin main');
  console.log(`git checkout -b ${branch}`);
  console.log(`npm run agent:handoff -- --agent ${args.agent || 'frontend'} --version ${version} --title "${feature}"`);
  console.log('npm run source:check');
  console.log('npm run agent:merge-check');
}
function prCheck(args) {
  const branch = args.branch || process.env.HEAD_REF || gitBranch();
  const allowed = /^(agent\/(frontend|backend|ai|product)\/.+|integration\/.+)$/;
  if (!allowed.test(branch)) {
    console.error(`Branche invalide: ${branch}`);
    console.error('Format attendu: agent/frontend/..., agent/backend/..., agent/ai/..., agent/product/... ou integration/...');
    process.exit(1);
  }
  const map = [
    ['agent/frontend/', 'project-workspaces/05_agent-frontend'],
    ['agent/backend/', 'project-workspaces/04_agent-backend'],
    ['agent/ai/', 'project-workspaces/03_agent-ia'],
    ['agent/product/', 'project-workspaces/02_agent-produit'],
    ['integration/', 'project-workspaces/06_validation']
  ];
  const match = map.find(([prefix]) => branch.startsWith(prefix));
  const folder = match && match[1];
  const files = folder ? listFiles(folder).filter(name => /HANDOFF|WORKLOG|NOTES|VALIDATION|MERGE|\.md$/i.test(name)) : [];
  if (!files.length) {
    console.error(`Aucun fichier de handoff trouvé dans ${folder}.`);
    process.exit(1);
  }
  if (!exists('AGENT_CHANGELOG.json')) {
    console.error('AGENT_CHANGELOG.json introuvable.');
    process.exit(1);
  }
  console.log(`OK PR agent: ${branch}`);
  console.log(`Handoff détecté dans ${folder}: ${files.join(', ')}`);
}
const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
if (cmd === 'start') start(args);
else if (cmd === 'pr-check') prCheck(args);
else {
  console.log('Commandes: start, pr-check');
  process.exit(cmd ? 1 : 0);
}
