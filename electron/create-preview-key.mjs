import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('electron', 'preview-key.local.env'), quiet: true });
const key = process.env.ELECTRON_PREVIEW_GEMINI_KEY || '';
if (!key) {
  throw new Error('ELECTRON_PREVIEW_GEMINI_KEY is required to build the preview app. Keep it in your ignored .env file.');
}

const midpoint = Math.ceil(key.length / 2);
const first = Buffer.from(key.slice(0, midpoint), 'utf8').toString('base64');
const second = Buffer.from([...key.slice(midpoint)].reverse().join(''), 'utf8').toString('base64');
const output = path.resolve('dist-electron', 'preview-key.generated.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ first, second }), { mode: 0o600 });
