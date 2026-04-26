const fs = require('fs');
const path = require('path');

const root = process.cwd();
const agentMap = {
  frontend: { label: 'Frontend', folder: 'project-workspaces/05_agent-frontend', branch: 'agent/frontend' },
  front: { label: 'Frontend', folder: 'project-workspaces/05_agent-frontend', branch: 'agent/frontend' },
  backend: { label: 'Backend', folder: 'project-workspaces/04_agent-backend', branch: 'agent/backend' },
  ia: { label: 'IA', folder: 'project-workspaces/03_agent-ia', branch: 'agent/ai' },
  ai: { label: 'IA', folder: 'project-workspaces/03_agent-ia', branch: 'agent/ai' },
  produit: { label: 'Produit', folder: 'project-workspaces/02_agent-produit', branch: 'agent/product' },
  product: { label: 'Produit', folder: 'project-workspaces/02_agent-produit', branch: 'agent/product' },
  integrateur: { label: 'Intégrateur', folder: 'project-workspaces/06_validation', branch: 'integration' },
  integrator: { label: 'Intégrateur', folder: 'project-workspaces/06_validation', branch: 'integration' }
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item.startsWith('--')) {
      const key = item.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    }
  }
  return args;
}
function slugify(value) {
  return String(value || 'work').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'work';
}
function today() { return new Date().toISOString().slice(0, 10); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function writeJson(file, data) { fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n'); }
function resolveAgent(agentName) {
  const input = String(agentName || 'frontend').toLowerCase();
  const key = slugify(input).replace(/-/g, '');
  const agent = agentMap[key] || agentMap[input];
  if (!agent) throw new Error(`Agent inconnu: ${agentName}. Utilise frontend, backend, ia, produit ou integrateur.`);
  return { key: Object.keys(agentMap).find(k => agentMap[k] === agent) || key, ...agent };
}
function exists(file) { return fs.existsSync(path.join(root, file)); }
function listFiles(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(name => !name.startsWith('.'));
}
module.exports = { root, parseArgs, slugify, today, ensureDir, readJson, writeJson, resolveAgent, exists, listFiles };
