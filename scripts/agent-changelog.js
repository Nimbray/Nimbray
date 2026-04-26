#!/usr/bin/env node
const { parseArgs, today, readJson, writeJson, resolveAgent } = require('./agent-utils');
const args = parseArgs(process.argv.slice(2));
const agent = resolveAgent(args.agent || 'frontend');
const data = readJson('AGENT_CHANGELOG.json');
const current = readJson('CURRENT_SOURCE.json');
const entry = {
  version: args.version || current.activeVersion,
  agent: agent.key,
  branch: args.branch || `${agent.branch}/a-completer`,
  status: args.status || 'proposed',
  date: today(),
  summary: args.summary || 'Contribution agent à compléter.',
  files: args.files ? String(args.files).split(',').map(x => x.trim()).filter(Boolean) : [],
  risks: args.risks ? String(args.risks).split(',').map(x => x.trim()).filter(Boolean) : [],
  tests: args.tests ? String(args.tests).split(',').map(x => x.trim()).filter(Boolean) : ['npm run source:check', 'npm run agent:merge-check']
};
data.entries = data.entries || [];
data.entries.push(entry);
writeJson('AGENT_CHANGELOG.json', data);
console.log(`AGENT_CHANGELOG.json mis à jour pour ${agent.label}.`);
