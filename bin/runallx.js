#!/usr/bin/env node

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import process from 'process';
import readline from 'readline';

if (process.argv.length < 4) {
  console.error('Usage: runall <npm|yarn|pnpm> <script1> [script2 ...]');
  process.exit(1);
}

const pm = process.argv[2];
const scriptNames = process.argv.slice(3);

if (!['yarn', 'npm', 'pnpm'].includes(pm)) {
  console.error(`runall: unsupported package manager "${pm}"`);
  process.exit(1);
}

const pkgPath = path.resolve(process.cwd(), 'package.json');
let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
} catch {
  console.error('runall: cannot find package.json in current directory');
  process.exit(1);
}

const scripts = pkg.scripts || {};

for (const name of scriptNames) {
  if (!scripts[name]) {
    console.error(`runall: script "${name}" not found in package.json`);
    process.exit(1);
  }
}

console.log(`runall: using package manager "${pm}"`);
console.log(`runall: starting ${scriptNames.join(', ')}`);

const children = [];

function spawnScript(name) {
  const args = pm === 'npm' ? ['run', name] : [name];

  const child = spawn(pm, args, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  });

  readline.createInterface({ input: child.stdout }).on('line', line => {
    console.log(`[${name}] ${line}`);
  });

  readline.createInterface({ input: child.stderr }).on('line', line => {
    console.error(`[${name}] ${line}`);
  });

  child.on('exit', (code, signal) => {
    console.log(`[${name}] exited with code ${code} signal ${signal}`);
    setTimeout(() => {
      console.log(`[${name}] restarting...`);
      const newChild = spawnScript(name);
      const index = children.findIndex(c => c.name === name);
      if (index !== -1) children[index].child = newChild;
    }, 1500);
  });

  return child;
}

scriptNames.forEach(name => {
  const child = spawnScript(name);
  children.push({ name, child });
});

process.on('SIGINT', () => {
  console.log('\nrunall: stopping all processes...');
  children.forEach(c => c.child.kill('SIGINT'));
  process.exit(0);
});