#!/bin/bash
# Starts the Express/Vite dev server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_RUNTIME="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
export PATH="$SCRIPT_DIR/.venv/bin:$CODEX_RUNTIME/node/bin:$CODEX_RUNTIME/bin:$PATH"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting EDQ Dashboard (Gemini API Enabled)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Express + Vite dev server
echo "🌐 Starting Express + Vite dev server (port 3000)..."
echo ""
if command -v npm >/dev/null 2>&1; then
  npm run dev
else
  pnpm run dev
fi
