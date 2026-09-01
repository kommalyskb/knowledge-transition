import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const verify = spawnSync(process.execPath, [path.join(root, 'scripts', 'verify-public-boundary.mjs')], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status || 1);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const publishAllowlist = ['index.html', 'styles.css', 'locales.js', 'script.js', '404.html', 'robots.txt', '.nojekyll', 'og.png', 'fonts/noto-sans-lao-lao.woff2', 'fonts/noto-sans-lao-latin.woff2'];
for (const file of publishAllowlist) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    if (file === 'og.png') continue;
    throw new Error(`Missing publish file: ${file}`);
  }
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.copyFileSync(source, path.join(dist, file));
}
console.log(`Built public GitHub Pages artifact with ${fs.readdirSync(dist).length} allowlisted files.`);
