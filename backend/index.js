const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2:7b';

// In-memory session histories (per user)
const sessionHistories = new Map(); // Map<sessionId, [{role, content}]>

app.use(cors({ origin: '*', methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '1mb' }));

// Render sits behind a proxy; enable correct client IP and protocol handling
app.set('trust proxy', 1);

app.get('/', (req, res) => {
	res.json({ status: 'ok', name: 'DeepResearchAssistant backend', uptime: process.uptime() });
});

app.get('/health', async (req, res) => {
	try {
		const r = await axios.get(`${OLLAMA_HOST}/api/tags`);
		res.json({ ok: true, ollama: r.data });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

app.post('/chat', async (req, res) => {
	try {
		let { prompt, sessionId, messages, temperature = 0.7, maxTokens = 256 } = req.body || {};
		if (!prompt && !messages) return res.status(400).json({ error: 'prompt or messages required' });
		if (!sessionId) sessionId = uuidv4();

		const history = sessionHistories.get(sessionId) || [];
		const userTurn = prompt ? [{ role: 'user', content: prompt }] : [];
		const fullMessages = [...history.slice(-8), ...(messages || userTurn)];

		const body = {
			model: OLLAMA_MODEL,
			messages: fullMessages,
			stream: false,
			options: { temperature, num_predict: maxTokens }
		};

		const r = await axios.post(`${OLLAMA_HOST}/api/chat`, body, {
			headers: { 'Content-Type': 'application/json' }
		});

		const reply = r.data?.message?.content || r.data?.response || '';
		const newHistory = [...fullMessages, { role: 'assistant', content: reply }];
		sessionHistories.set(sessionId, newHistory);

		res.json({ sessionId, reply });
	} catch (e) {
		res.status(500).json({ error: e.message || 'chat failed' });
	}
});

app.listen(Number(PORT), '0.0.0.0', () => {
	const host = process.env.RENDER ? '0.0.0.0' : '127.0.0.1';
	console.log(`Backend listening on http://${host}:${PORT}`);
});