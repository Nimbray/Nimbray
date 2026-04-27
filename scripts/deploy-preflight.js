const { execFileSync } = require("child_process");
const fs = require("fs");

function run(name, command, args) {
  console.log("\n==> " + name);
  execFileSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
}

function assertFile(file) {
  if (!fs.existsSync(file)) {
    console.error("Missing required file: " + file);
    process.exit(1);
  }
}

assertFile("package.json");
assertFile("CURRENT_SOURCE.json");
assertFile("SOURCE_OF_TRUTH.md");
assertFile("AGENTS.md");
assertFile("COLLABORATIVE_WORKSPACES.md");

run("Secret scan", "node", ["scripts/deploy-no-secrets.js"]);
run("Source check", "node", ["scripts/source-manager.js", "check"]);
run("Agent merge check", "node", ["scripts/agent-merge-check.js"]);

console.log("\nDeploy preflight OK.");
