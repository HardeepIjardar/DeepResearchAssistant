const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Google Gemini AI
const genAI = process.env.GEMINI_API_KEY ?
	new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Ollama configuration (optional fallback for local development)
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
	const health = {
		ok: true,
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		ai: {}
	};

	// Check Gemini availability
	if (genAI) {
		health.ai.gemini = {
			available: true,
			model: 'gemini-1.5-flash-latest',
			priority: 1
		};
	}

	// Check Ollama availability (optional)
	try {
		const r = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 2000 });
		health.ai.ollama = {
			available: true,
			model: OLLAMA_MODEL,
			priority: 2,
			models: r.data?.models?.map(m => m.name) || []
		};
	} catch (e) {
		health.ai.ollama = {
			available: false,
			message: 'Ollama not running (optional)'
		};
	}

	// Determine active AI
	if (genAI) {
		health.ai.active = 'gemini';
	} else if (health.ai.ollama?.available) {
		health.ai.active = 'ollama';
	} else {
		health.ai.active = 'fallback';
		health.ai.warning = 'No AI backend configured. Set GEMINI_API_KEY for intelligent responses.';
	}

	res.json(health);
});

// Fallback AI responses for when no AI is available
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
		let { prompt, sessionId, messages, temperature = 0.7, maxTokens = 512 } = req.body || {};

		// Validate input
		if (!prompt && !messages) {
			return res.status(400).json({
				error: 'Missing required parameter',
				message: 'Please provide either "prompt" or "messages" in the request body.',
				example: { prompt: 'Your question here', sessionId: 'optional-session-id' }
			});
		}

		if (!sessionId) sessionId = uuidv4();

		// Get or create session history
		const history = sessionHistories.get(sessionId) || [];

		// AI CASCADE: Try Gemini first, then Ollama, then fallback

		// 1. TRY GEMINI (PRIMARY - Production ready)
		if (genAI) {
			try {
				console.log('🤖 Using Google Gemini API...');

				const model = genAI.getGenerativeModel({
					model: "gemini-1.5-flash-latest",
					generationConfig: {
						temperature: temperature,
						maxOutputTokens: maxTokens,
					}
				});

				// Build conversation history for Gemini
				let fullPrompt = prompt;
				if (history.length > 0) {
					// Include recent context (last 6 messages)
					const recentHistory = history.slice(-6);
					const contextPrompt = recentHistory
						.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
						.join('\n');
					fullPrompt = `${contextPrompt}\n\nUser: ${prompt}`;
				}

				const result = await model.generateContent(fullPrompt);
				const reply = result.response.text();

				if (!reply || reply.trim().length === 0) {
					throw new Error('Empty response from Gemini');
				}

				// Update session history
				const newHistory = [...history,
				{ role: 'user', content: prompt },
				{ role: 'assistant', content: reply }
				];
				sessionHistories.set(sessionId, newHistory.slice(-16)); // Keep last 16 messages

				console.log('✅ Gemini response generated');
				return res.json({
					sessionId,
					reply,
					source: 'gemini',
					model: 'gemini-1.5-flash-latest'
				});

			} catch (geminiError) {
				console.error('❌ Gemini error:', geminiError.message);
				// Continue to next AI provider
			}
		}

		// 2. TRY OLLAMA (FALLBACK - Local development)
		try {
			console.log('🦙 Trying Ollama...');

			const userTurn = [{ role: 'user', content: prompt }];
			const fullMessages = [...history.slice(-8), ...userTurn];

			const body = {
				model: OLLAMA_MODEL,
				messages: fullMessages,
				stream: false,
				options: { temperature, num_predict: maxTokens }
			};

			const r = await axios.post(`${OLLAMA_HOST}/api/chat`, body, {
				headers: { 'Content-Type': 'application/json' },
				timeout: 5000 // Quick timeout for Ollama
			});

			const reply = r.data?.message?.content || r.data?.response || '';

			if (!reply || reply.trim().length === 0) {
				throw new Error('Empty response from Ollama');
			}

			const newHistory = [...fullMessages, { role: 'assistant', content: reply }];
			sessionHistories.set(sessionId, newHistory.slice(-16));

			console.log('✅ Ollama response generated');
			return res.json({
				sessionId,
				reply,
				source: 'ollama',
				model: OLLAMA_MODEL
			});

		} catch (ollamaError) {
			console.log('❌ Ollama unavailable:', ollamaError.message);
			// Continue to fallback
		}

		// 3. FALLBACK (LAST RESORT)
		console.log('📝 Using fallback responses');
		const reply = getFallbackResponse(prompt);
		const newHistory = [
			{ role: 'user', content: prompt },
			{ role: 'assistant', content: reply }
		];
		sessionHistories.set(sessionId, newHistory);

		return res.json({
			sessionId,
			reply,
			source: 'fallback',
			note: 'No AI backend available. Set GEMINI_API_KEY environment variable for intelligent responses.'
		});

	} catch (e) {
		console.error('💥 Chat endpoint error:', e);
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
	console.log(`🤖 Primary AI: ${genAI ? 'Google Gemini ✅' : 'Not configured ❌'}`);
	console.log(`🦙 Ollama: ${OLLAMA_HOST}`);
	console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`\nEndpoints:`);
	console.log(`  GET  /health  - Health check`);
	console.log(`  POST /chat    - Chat with AI\n`);

	if (!genAI) {
		console.log(`⚠️  WARNING: GEMINI_API_KEY not set. Using fallback responses.`);
		console.log(`   Set GEMINI_API_KEY in .env for intelligent AI responses.\n`);
	}
});
