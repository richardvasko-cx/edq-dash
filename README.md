<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EDQ Dashboard

Email Deliverability Quality dashboard for Braze support with integrated Google Gemini API.

## Project Structure

```
/Users/richard.vasko/antigravity/edq-dashboard/
├── src/                       # React 19 + TypeScript source
│   ├── components/           # GeminiPromptPill, AiPanel, Layout, etc.
│   ├── contexts/             # React contexts
│   └── views/                # View components
├── braze_user_guide_md/      # Braze documentation (markdown)
├── conversations/            # Saved Gemini conversation history
├── assets/                   # Static assets
├── dist/                     # Build output
├── server.ts                 # Express server + Gemini API endpoints
├── start-all.sh             # Starts Express dev server
└── package.json             # NPM dependencies
```

### Gemini API Integration

The dashboard integrates with the Google Gemini API (model `gemini-2.5-flash`) via the official `@google/genai` SDK. Ensure you set your API key in the environment:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

## Run Locally

**Prerequisites:**
- Node.js

### Quick Start (Recommended)

Run the Express dev server:
```bash
./start-all.sh
```

Dashboard will be available at `http://localhost:3000`

### Manual Start

**Start Express + Vite dev server:**
```bash
npm install  # first time only
npm run dev
```
Dashboard on `http://localhost:3000`

## Architecture

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 + Motion/React + Recharts (Interactive charts)
- **Backend:** Express + Vite dev-middleware (port 3000)
- **AI Model:** Google Gemini 2.5 Flash via `@google/genai`
- **Endpoints:**
  - `/api/gemini/chat` — Conversational assistant
  - `/api/user-guide/ask-stream` — SSE streaming guide search
  - `/api/user-guide/ask` — Non-streaming guide search
  - `/api/workspace/section-stream` — Workspace section draft generator
  - `/api/conversations/*` — Chat history CRUD
