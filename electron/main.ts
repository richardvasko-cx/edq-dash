import { app, BrowserWindow, dialog, shell } from 'electron';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const isDev = process.env.EDQ_ELECTRON_DEV === '1';
const projectRoot = path.resolve(__dirname, '..');
let backend: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

function redact(value: string) {
  return value.replace(/(?:AIza|AQ\.)[A-Za-z0-9._-]{20,}/g, '[redacted]');
}

function writeDiagnostic(line: string) {
  try {
    const file = path.join(app.getPath('userData'), 'logs', 'desktop.log');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${new Date().toISOString()} ${redact(line)}\n`, 'utf8');
  } catch {
    // Diagnostics must never prevent the preview from starting.
  }
}

function readPreviewKey() {
  try {
    const file = path.join(__dirname, 'preview-key.generated.json');
    const { first, second } = JSON.parse(fs.readFileSync(file, 'utf8')) as { first: string; second: string };
    return Buffer.from(first, 'base64').toString('utf8') + [...Buffer.from(second, 'base64').toString('utf8')].reverse().join('');
  } catch {
    return '';
  }
}

function resourceRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked') : projectRoot;
}

function serverEntry() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'server.cjs')
    : path.join(projectRoot, 'server.ts');
}

async function waitForBackend(readyFile: string) {
  const deadline = Date.now() + 18_000;
  while (Date.now() < deadline) {
    if (fs.existsSync(readyFile)) {
      try {
        const { host, port } = JSON.parse(fs.readFileSync(readyFile, 'utf8')) as { host: string; port: number };
        const origin = `http://${host}:${port}`;
        const response = await fetch(`${origin}/api/health`);
        if (response.ok) return origin;
      } catch {
        // The backend can still be finishing its first bind.
      }
    }
    await new Promise(resolve => setTimeout(resolve, 160));
  }
  throw new Error('The EDQ backend did not become ready. See the desktop log in Application Support.');
}

async function startBackend() {
  const runtimeDir = path.join(app.getPath('userData'), 'runtime');
  const readyFile = path.join(runtimeDir, 'backend.json');
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.rmSync(readyFile, { force: true });

  const previewKey = process.env.GEMINI_API_KEY || readPreviewKey();
  if (!previewKey) throw new Error('The packaged preview key is unavailable. Rebuild the DMG with a temporary preview key.');

  const entry = serverEntry();
  const args = isDev ? [path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs'), entry] : [entry];
  backend = spawn(process.execPath, args, {
    cwd: resourceRoot(),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: '0',
      EDQ_HOST: '127.0.0.1',
      EDQ_ELECTRON_PACKAGED: app.isPackaged ? 'true' : 'false',
      EDQ_RESOURCE_PATH: resourceRoot(),
      EDQ_USER_DATA_PATH: app.getPath('userData'),
      EDQ_GEMINI_MODEL_FILE: path.join(app.getPath('userData'), 'settings', 'gemini_model'),
      EDQ_READY_FILE: readyFile,
      GEMINI_API_KEY: previewKey,
      EDQ_ENABLE_TUNNEL: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  backend.stdout?.on('data', chunk => writeDiagnostic(String(chunk)));
  backend.stderr?.on('data', chunk => writeDiagnostic(String(chunk)));
  backend.on('exit', (code, signal) => writeDiagnostic(`backend exited code=${code ?? 'null'} signal=${signal ?? 'none'}`));
  return waitForBackend(readyFile);
}

function createWindow(origin: string) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    title: 'EDQ Dashboard Preview',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: isDev,
    },
  });
  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:|^mailto:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(origin)) {
      event.preventDefault();
      if (/^https?:|^mailto:/.test(url)) void shell.openExternal(url);
    }
  });
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i')) event.preventDefault();
    });
  }
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  void mainWindow.loadURL(origin);
}

function stopBackend() {
  if (backend && !backend.killed) backend.kill();
  backend = null;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(async () => {
    try {
      createWindow(await startBackend());
    } catch (error) {
      writeDiagnostic(error instanceof Error ? error.message : String(error));
      dialog.showErrorBox('EDQ Dashboard Preview could not start', error instanceof Error ? error.message : 'Unknown startup failure.');
      app.quit();
    }
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', stopBackend);
}
