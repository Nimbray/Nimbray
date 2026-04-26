#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readJson, exists } = require('./agent-utils');
const root = process.cwd();
function fail(message) { console.error(`ERREUR: ${message}`); process.exitCode = 1; }
function ok(message) { console.log(`OK: ${message}`); }
try {
  const current = readJson('CURRENT_SOURCE.json');
  const pkg = readJson('package.json');
  const changelog = readJson('AGENT_CHANGELOG.json');
  if (pkg.version !== current.activeVersion) fail(`package.json (${pkg.version}) ne correspond pas à CURRENT_SOURCE.json (${current.activeVersion}).`); else ok('versions cohérentes');
  if (!Array.isArray(changelog.entries) || changelog.entries.length === 0) fail('AGENT_CHANGELOG.json doit contenir au moins une entrée.'); else ok('changelog agent présent');
  ['SOURCE_OF_TRUTH.md','AGENTS.md','COLLABORATIVE_WORKSPACES.md','.github/PULL_REQUEST_TEMPLATE.md','.github/workflows/ci.yml','.github/workflows/agent-pr-check.yml'].forEach(file => {
    if (!exists(file)) fail(`${file} introuvable.`); else ok(`${file} présent`);
  });
  const workspaces = ['project-workspaces/02_agent-produit','project-workspaces/03_agent-ia','project-workspaces/04_agent-backend','project-workspaces/05_agent-frontend','project-workspaces/06_validation','project-workspaces/09_merge-queue'];
  workspaces.forEach(dir => {
    if (!fs.existsSync(path.join(root, dir))) fail(`${dir} introuvable.`); else ok(`${dir} présent`);
  });
  if (process.exitCode) process.exit(process.exitCode);
  console.log('Validation multi-agents OK.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
