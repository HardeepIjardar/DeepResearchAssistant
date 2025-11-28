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

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.sendStatus(200);
});

// Render sits behind a proxy; enable correct client IP and protocol handling
app.set('trust proxy', 1);

app.get('/', (req, res) => {
	res.json({ status: 'ok', name: 'DeepResearchAssistant backend', uptime: process.uptime() });
});

app.get('/health', async (req, res) => {
	try {
		// Try to connect to Ollama first
		const r = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 3000 });
		res.json({
			ok: true,
			mode: 'ollama',
			model: OLLAMA_MODEL,
			ollamaAvailable: true,
			availableModels: r.data?.models?.map(m => m.name) || []
		});
	} catch (e) {
		// If Ollama is not available, return fallback mode
		res.json({
			ok: true,
			mode: 'fallback',
			ollamaAvailable: false,
			message: 'Ollama not available, using fallback responses. Install Ollama and pull a model to enable AI features.',
			note: 'Extension will still work with pre-configured responses.'
		});
	}
});

// Fallback AI responses for when Ollama is not available
const fallbackResponses = {
	greeting: [
		"Hello! I'm your AI research assistant. How can I help you today?",
		"Hi there! I'm here to help with your research needs. What would you like to know?",
		"Greetings! I'm ready to assist you with any questions or research topics."
	],
	research: [
		"Based on your query, here are some key insights: This is a fascinating topic that involves multiple aspects. Let me break it down for you with some detailed analysis and recommendations.",
		"I'd be happy to help you research this topic. Here's what I found: This subject has several important components worth exploring further.",
		"Great question! Let me provide you with a comprehensive overview of this topic, including its main concepts and practical applications."
	],
	general: [
		"That's an interesting question! Let me provide you with some insights on this topic.",
		"I understand you're looking for information about this. Here's what I can tell you:",
		"Thanks for asking! This is a great topic to explore. Let me share some thoughts with you."
	]
};

function getFallbackResponse(prompt) {
	const lowerPrompt = prompt.toLowerCase();

	if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
		return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
	}

	if (lowerPrompt.includes('research') || lowerPrompt.includes('study') || lowerPrompt.includes('analyze')) {
		return fallbackResponses.research[Math.floor(Math.random() * fallbackResponses.research.length)];
	}

	return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)] +
		` Regarding "${prompt}", this is a complex topic that deserves careful consideration. ` +
		`I recommend exploring multiple sources and perspectives to get a comprehensive understanding. ` +
		`Would you like me to elaborate on any specific aspect of this topic?`;
}

app.post('/chat', async (req, res) => {
	try {
		let { prompt, sessionId, messages, temperature = 0.7, maxTokens = 256 } = req.body || {};

		// Validate input
		if (!prompt && !messages) {
			return res.status(400).json({
				error: 'Missing required parameter',
				message: 'Please provide either "prompt" or "messages" in the request body.',
				example: { prompt: 'Your question here', sessionId: 'optional-session-id' }
			});
		}

		if (!sessionId) sessionId = uuidv4();

		// Try Ollama first, fallback to mock responses
		try {
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
				headers: { 'Content-Type': 'application/json' },
				timeout: 30000 // 30 second timeout for AI response
			});

			const reply = r.data?.message?.content || r.data?.response || '';

			if (!reply) {
				throw new Error('Empty response from Ollama');
			}

			const newHistory = [...fullMessages, { role: 'assistant', content: reply }];
			sessionHistories.set(sessionId, newHistory);

			res.json({ sessionId, reply, source: 'ollama', model: OLLAMA_MODEL });
		} catch (ollamaError) {
			// Fallback to mock responses
			console.log('Ollama error:', ollamaError.message, '- using fallback responses');
			const reply = getFallbackResponse(prompt);
			const newHistory = [{ role: 'user', content: prompt }, { role: 'assistant', content: reply }];
			sessionHistories.set(sessionId, newHistory);

			res.json({
				sessionId,
				reply,
				source: 'fallback',
				note: 'AI backend unavailable. Install Ollama for full AI capabilities.'
			});
		}
	} catch (e) {
		console.error('Chat endpoint error:', e);
		res.status(500).json({
			error: 'Internal server error',
			message: e.message || 'Chat request failed. Please try again.',
			details: process.env.NODE_ENV === 'development' ? e.stack : undefined
		});
	}
});

app.listen(Number(PORT), '0.0.0.0', () => {
	const host = process.env.RENDER ? '0.0.0.0' : '127.0.0.1';
	console.log(`\n🚀 Deep Research Assistant Backend Server`);
	console.log(`📡 Listening on http://${host}:${PORT}`);
	console.log(`🤖 AI Model: ${OLLAMA_MODEL}`);
	console.log(`🔗 Ollama Host: ${OLLAMA_HOST}`);
	console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`\nEndpoints:`);
	console.log(`  GET  /health  - Health check`);
	console.log(`  POST /chat    - Chat with AI\n`);
});