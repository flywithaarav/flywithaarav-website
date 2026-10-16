import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appDir, '..');
const output = path.join(appDir, 'www');
const excluded = new Set(['.git', 'node_modules', 'app', '.github', 'dist', 'coverage']);
await mkdir(output, { recursive: true });
for (const entry of await readdir(repoRoot, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name === 'README.md') continue;
  await cp(path.join(repoRoot, entry.name), path.join(output, entry.name), {
    recursive: true,
    force: true,
    filter: source => !source.split(path.sep).some(part => excluded.has(part))
  });
}
console.log('Website copied into app/www');
