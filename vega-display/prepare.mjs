import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = dirname(fileURLToPath(import.meta.url));
const destination = resolve(process.argv[2] || join(source, 'generated'));
if (!['darwin', 'linux'].includes(process.platform)) {
  throw new Error('Run prepare.mjs on the Intel Mac with Vega SDK 0.24 installed (or supported Ubuntu).');
}
if (existsSync(destination)) throw new Error(`Destination already exists: ${destination}. Choose a new directory to preserve existing work.`);
function run(command, args, cwd = source) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}); fix the reported error before continuing.`);
}
run('vega', ['project', 'generate', '--template', 'vegaWebview', '--name', 'RecognitionBoards', '--packageId', 'org.ijustcreate.recognitionboards', '--outputDir', destination]);
// Preserve SDK-owned entrypoints, manifests, services, and build configuration.
const appPath = join(destination, 'src', 'App.tsx');
if (!existsSync(appPath)) throw new Error('SDK template layout changed: expected src/App.tsx. Generated project is preserved for inspection.');
copyFileSync(appPath, join(destination, 'src', 'App.template.tsx.txt'));
copyFileSync(join(source, 'App.tsx'), appPath);
writeFileSync(join(destination, 'src', 'bridge.generated.ts'), `export const bridge = ${JSON.stringify(readFileSync(join(source, 'bridge.js'), 'utf8'))};\n`);
run('vega', ['project', 'update-manifest', '--os-min', '1.2', '--os-version', '1.2'], destination);
run('vega', ['project', 'install', '--fix'], destination);
run('npm', ['install'], destination);
run('vega', ['project', 'doctor'], destination);
console.log(`\nPrepared ${destination}\nNext: cd into that directory and build a Release package for Fire TV (armv7). See README.md.`);
