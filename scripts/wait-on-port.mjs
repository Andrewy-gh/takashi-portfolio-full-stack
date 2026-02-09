import net from "node:net";

const [portArg, hostArg] = process.argv.slice(2);

const port = Number(portArg);
const host = hostArg ?? "127.0.0.1";

const timeoutMs = Number(process.env.WAIT_ON_PORT_TIMEOUT_MS ?? 30_000);
const intervalMs = Number(process.env.WAIT_ON_PORT_INTERVAL_MS ?? 250);

if (!port || Number.isNaN(port)) {
  console.error("Usage: node scripts/wait-on-port.mjs <port> [host]");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const probe = () =>
  new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });

const deadline = Date.now() + timeoutMs;

// Wait until the backend is actually accepting TCP connections.
while (Date.now() < deadline) {
  // eslint-disable-next-line no-await-in-loop
  const ok = await probe();
  if (ok) process.exit(0);
  // eslint-disable-next-line no-await-in-loop
  await sleep(intervalMs);
}

console.error(`Timed out waiting for ${host}:${port}`);
process.exit(1);

