# Deep Research Assistant Backend

Backend server for the Deep Research Assistant Chrome Extension, powered by **Google Gemini AI**.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- Google Gemini API key (free tier available)

### Setup

1. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3001`

## 🎯 Features

- ✅ **Google Gemini Integration** - Uses latest Gemini 1.5 Flash model
- ✅ **Session Management** - Maintains conversation history per user
- ✅ **Fallback Mode** - Works without API key using smart responses
- ✅ **Error Handling** - Graceful degradation on API errors
- ✅ **CORS Enabled** - Ready for Chrome extension integration
- ✅ **Health Checks** - Monitor API connectivity

## 📡 API Endpoints

### GET /health
Health check endpoint to verify server and Gemini API status.

**Response:**
```json
{
  "ok": true,
  "mode": "gemini",
  "model": "gemini-1.5-flash",
  "geminiAvailable": true
}
```

### POST /chat
Send messages to the AI assistant.

**Request Body:**
```json
{
  "prompt": "Your question here",
  "sessionId": "optional-session-id",
  "temperature": 0.7,
  "maxTokens": 2048
}
```

**Response:**
```json
{
  "sessionId": "uuid-v4-session-id",
  "reply": "AI response here",
  "source": "gemini",
  "model": "gemini-1.5-flash"
}
```

**Alternative Request (with full message history):**
```json
{
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "Tell me about AI"}
  ],
  "sessionId": "optional-session-id"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes* | - | Your Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Gemini model to use |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |

*Required for AI features. Server works in fallback mode without it.

### Available Models

- `gemini-1.5-flash` (recommended) - Fast, efficient, great for chat
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro` - Previous generation

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:3001/health
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! Tell me about artificial intelligence."}'
```

### Test with Session
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is machine learning?",
    "sessionId": "test-session-123"
  }'
```

## 🌐 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repository
4. Set environment variables:
   - `GEMINI_API_KEY`: Your API key
   - `NODE_ENV`: production
5. Deploy!

### Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Set API key: `railway variables set GEMINI_API_KEY=your_key`
5. Deploy: `railway up`

## 💡 Gemini API Limits

**Free Tier:**
- 15 requests per minute
- 1500 requests per day
- 1 million tokens per minute

**Paid Tier:**
- Higher rate limits
- More tokens per minute
- Better SLA

Check current pricing: https://ai.google.dev/pricing

## 🔒 Security

- Never commit `.env` file with your API key
- Use environment variables in production
- Rotate API keys regularly
- Monitor usage in Google AI Studio

## 🐛 Troubleshooting

### "No Gemini API key configured"
- Make sure `.env` file exists in the backend directory
- Verify `GEMINI_API_KEY` is set correctly
- Restart the server after changing `.env`

### "Gemini API error"
- Check your API key is valid
- Verify you haven't exceeded rate limits
- Check Google AI Studio for service status

### "Extension cannot connect"
- Make sure backend server is running
- Check the URL in extension settings matches `http://localhost:3001`
- Verify CORS is enabled (it is by default)

## 📝 Development

### Start with Auto-Reload
```bash
npm install -g nodemon
npm run start:dev
```

### View Logs
The server logs all requests and errors to console.

## 🆚 Why Gemini over Ollama?

| Feature | Gemini | Ollama |
|---------|--------|--------|
| Setup | API key only | Install + download models |
| Deployment | Any platform | GPU recommended |
| Performance | Cloud-powered | Local hardware |
| Cost | Free tier generous | Free but uses resources |
| Models | Latest Google models | Open source models |
| Updates | Automatic | Manual |

## 📚 Resources

- [Google Gemini Documentation](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api/rest)
- [Get API Key](https://makersuite.google.com/app/apikey)
- [Pricing](https://ai.google.dev/pricing)

## 📄 License

MIT License - See LICENSE file for details
