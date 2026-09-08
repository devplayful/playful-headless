import { spawn } from 'node:child_process';

const grandchild = spawn(
  process.execPath,
  [
    '-e',
    "process.on('SIGTERM', () => {}); process.on('SIGINT', () => {}); setInterval(() => {}, 1_000);",
  ],
  { stdio: 'ignore' },
);

console.log(`GRANDCHILD_PID=${grandchild.pid}`);
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
setInterval(() => {}, 1_000);
