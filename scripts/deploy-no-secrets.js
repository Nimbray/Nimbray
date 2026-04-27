const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  ".vercel",
  "out"
]);

const ignoredFiles = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
]);

const secretPatterns = [
  { name: "Groq API key", regex: /gsk_[A-Za-z0-9_-]{20,}/g },
  { name: "OpenAI API key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "Generic private key", regex: /-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----/g }
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (!ignoredFiles.has(entry.name)) {
      files.push(relPath);
    }
  }

  return files;
}

let failed = false;

for (const relPath of walk(ROOT)) {
  const fullPath = path.join(ROOT, relPath);

  let content = "";
  try {
    content = fs.readFileSync(fullPath, "utf8");
  } catch {
    continue;
  }

  for (const pattern of secretPatterns) {
    const matches = content.match(pattern.regex);
    if (matches) {
      failed = true;
      console.error("[secret-scan] " + pattern.name + " found in " + relPath);
    }
  }
}

if (failed) {
  console.error("Secret scan failed. Remove secrets before deploy.");
  process.exit(1);
}

console.log("Secret scan OK.");
