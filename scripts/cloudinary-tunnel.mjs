import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const port = process.env.TUNNEL_PORT ?? '3000';
const localUrl = process.env.TUNNEL_URL ?? `http://localhost:${port}`;

const child = spawn('cloudflared', ['tunnel', '--url', localUrl], {
  stdio: ['inherit', 'pipe', 'pipe'],
});

const extractPublicUrl = (line) => {
  const matches = line.match(/https?:\/\/[^\s]+/g);
  if (!matches) return null;
  return (
    matches.find(
      (candidate) =>
        candidate.startsWith('https://') &&
        !candidate.includes('localhost') &&
        !candidate.includes('127.0.0.1')
    ) ?? null
  );
};

const normalizeUrl = (url) => url.replace(/[),.]+$/, '').replace(/\/$/, '');

let announced = false;

const handleLine = (line) => {
  console.log(line);
  if (announced) return;
  const url = extractPublicUrl(line);
  if (!url) return;
  announced = true;
  const publicUrl = normalizeUrl(url);
  console.log('');
  console.log('Tunnel ready.');
  console.log(
    `CLOUDINARY_NOTIFICATION_URL=${publicUrl}/api/cloudinary/webhook`
  );
  console.log('');
};

const wireLogs = (stream) => {
  if (!stream) return;
  const rl = createInterface({ input: stream });
  rl.on('line', handleLine);
};

wireLogs(child.stdout);
wireLogs(child.stderr);

child.on('error', (error) => {
  if (error && error.code === 'ENOENT') {
    console.error('cloudflared not found on PATH. Install it, then retry.');
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
