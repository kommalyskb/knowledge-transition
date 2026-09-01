import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const forbiddenNames = new Set(['docs', 'papers', 'source', 'evidence', 'private', 'attachments', 'node_modules']);
const allowedTopLevel = new Set(['.github', '.gitignore', '.nojekyll', '404.html', 'README.md', 'index.html', 'og.png', 'package.json', 'robots.txt', 'script.js', 'scripts', 'styles.css']);
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.md', '.txt', '.yml', '.yaml']);
const errors = [];

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.name === 'dist' || entry.name === '.git') continue;
  if (!allowedTopLevel.has(entry.name)) errors.push(`Unexpected top-level entry: ${entry.name}`);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'dist' || entry.name === '.git') return [];
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (forbiddenNames.has(entry.name)) errors.push(`Forbidden directory in public repository: ${relative}`);
      return walk(absolute);
    }
    const size = fs.statSync(absolute).size;
    if (size > 5 * 1024 * 1024) errors.push(`Public asset exceeds 5 MB: ${relative}`);
    if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(absolute, 'utf8');
      if (/file:\/\//i.test(content) || /\/Users\//.test(content)) errors.push(`Local filesystem reference found: ${relative}`);
      if (/docs\/papers|document-directory|private document directory/i.test(content) && relative !== 'README.md' && !relative.includes('verify-public-boundary')) errors.push(`Private-document reference found: ${relative}`);
    }
    return [absolute];
  });
}

walk(root);
for (const required of ['index.html', 'styles.css', 'script.js', '404.html', 'robots.txt', '.nojekyll']) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`Missing required public file: ${required}`);
}

if (errors.length) {
  console.error(`Public-boundary verification failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('Public-boundary verification passed: no private document tree or local filesystem references detected.');
