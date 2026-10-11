// Runs `next start` for the Playwright suite and restarts it if the process is
// terminated from outside (for example by the operating system under memory
// pressure). Every exit is logged with its code or signal so a real crash is
// still visible in the test output.
import { spawn } from 'node:child_process';

const port = process.env.E2E_PORT ?? '3947';
const maxRestarts = Number(process.env.E2E_SERVER_MAX_RESTARTS ?? 3);
let restarts = 0;
let stopping = false;
let child;

const start = () => {
  child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', port], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`[e2e-server] next start exited (code=${code ?? 'none'}, signal=${signal ?? 'none'})`);
    if (restarts >= maxRestarts) {
      console.error('[e2e-server] restart limit reached');
      process.exit(1);
    }
    restarts += 1;
    console.error(`[e2e-server] restarting (${restarts}/${maxRestarts})`);
    setTimeout(start, 500);
  });
};

const shutdown = (signal = 'SIGTERM') => {
  stopping = true;
  child?.kill(signal);
  process.exit(0);
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(signal));
}

// If the test runner disappears without signalling, do not leave a server behind.
setInterval(() => {
  if (process.ppid === 1) shutdown();
}, 1_000).unref();

start();
