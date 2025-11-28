# DeepResearchAssistant Backend (Render-ready)

This Node/Express backend is prepared for deployment on Render so your Chrome extension can call it from any device.

## Environment

The server uses these environment variables:

- `PORT`: Provided by Render automatically. Do not set it manually.
- `OLLAMA_HOST`: Base URL to an accessible Ollama server (must be reachable from Render). Example: `https://your-domain:11434` or `http://127.0.0.1:11434` for local dev.
- `OLLAMA_MODEL`: Model identifier available on the Ollama host. Example: `llama2:7b`.

Create a `.env` locally with these keys for development. On Render, configure them under Environment → Environment Variables.

## Local development

```bash
cd backend
npm install
npm start
# Server runs on http://127.0.0.1:3001
```

Health checks:
- `GET /` → basic status
- `GET /health` → checks connectivity to `OLLAMA_HOST`

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, click “New” → “Web Service”.
3. Connect your repo and select the `backend` directory as the root (render will auto-detect).
4. Runtime: Node.
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables:
   - `OLLAMA_HOST` → public URL of your Ollama server
   - `OLLAMA_MODEL` → e.g., `llama2:7b`
8. Deploy.

Notes:
- The server binds to `0.0.0.0` and uses the `PORT` Render provides.
- CORS is open by default to support calls from the extension. Consider restricting origins later.

## Using with the Chrome extension

In the extension Options page, set the API Endpoint to your Render URL, for example:
`https://your-backend.onrender.com`

The extension will POST to `POST {API_ENDPOINT}/chat`.

## Endpoints

- `POST /chat`
  - body: `{ prompt, sessionId?, messages?, temperature?, maxTokens? }`
  - returns: `{ sessionId, reply }`

- `GET /health` and `GET /` for status checks.

## Troubleshooting

- 502/504 from Render: ensure `OLLAMA_HOST` is publicly reachable from the internet and not blocked by firewall.
- CORS errors in browser console: verify your Render URL is correct and reachable over HTTPS.
