const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Initialize Google Generative AI
let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
	genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

// In-memory session histories (per user)
const sessionHistories = new Map(); // Map<sessionId, [{role, parts: [{text}]}]>

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
	res.json({ status: 'ok', name: 'DeepResearchAssistant backend (Google Gemini)', uptime: process.uptime() });
});

app.get('/health', async (req, res) => {
	if (!GEMINI_API_KEY) {
		return res.json({
			ok: true,
			mode: 'fallback',
			geminiAvailable: false,
			message: 'No Gemini API key configured. Using fallback responses. Add GEMINI_API_KEY to .env file.',
			note: 'Extension will still work with pre-configured responses.'
		});
	}

	try {
		// Try a simple test with Gemini
		const testModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
		const result = await testModel.generateContent('Say "OK" if you can hear me.');
		const response = await result.response;
		const text = response.text();
		
		res.json({
			ok: true,
			mode: 'gemini',
			model: GEMINI_MODEL,
			geminiAvailable: true,
			testResponse: text.substring(0, 50)
		});
	} catch (e) {
		res.json({
			ok: true,
			mode: 'fallback',
			geminiAvailable: false,
			error: e.message,
			message: 'Gemini API error. Using fallback responses. Check your API key.',
			note: 'Extension will still work with pre-configured responses.'
		});
	}
});

// Fallback AI responses for when Gemini is not available
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

// Convert messages from OpenAI format to Gemini format
function convertToGeminiHistory(messages) {
	return messages.map(msg => {
		const role = msg.role === 'assistant' ? 'model' : 'user';
		return {
			role: role,
			parts: [{ text: msg.content }]
		};
	});
}

// Convert Gemini format back to standard format
function convertFromGeminiHistory(geminiHistory) {
	return geminiHistory.map(msg => ({
		role: msg.role === 'model' ? 'assistant' : 'user',
		content: msg.parts[0].text
	}));
}

app.post('/chat', async (req, res) => {
	try {
		let { prompt, sessionId, messages, temperature = 0.7, maxTokens = 2048 } = req.body || {};

		// Validate input
		if (!prompt && !messages) {
			return res.status(400).json({
				error: 'Missing required parameter',
				message: 'Please provide either "prompt" or "messages" in the request body.',
				example: { prompt: 'Your question here', sessionId: 'optional-session-id' }
			});
		}

		if (!sessionId) sessionId = uuidv4();

		// Try Gemini first, fallback to mock responses
		if (!GEMINI_API_KEY || !model) {
			// Fallback to mock responses
			const reply = getFallbackResponse(prompt || messages[messages.length - 1].content);
			const newHistory = [{ role: 'user', content: prompt }, { role: 'assistant', content: reply }];
			sessionHistories.set(sessionId, newHistory);

			return res.json({
				sessionId,
				reply,
				source: 'fallback',
				note: 'No Gemini API key configured. Add GEMINI_API_KEY to .env file for full AI capabilities.'
			});
		}

		try {
			// Get or create session history
			const history = sessionHistories.get(sessionId) || [];
			
			// Prepare messages
			let fullMessages;
			if (messages) {
				fullMessages = messages;
			} else {
				fullMessages = [...history, { role: 'user', content: prompt }];
			}

			// Keep last 10 messages to manage context window
			const recentMessages = fullMessages.slice(-10);

			// Convert to Gemini format
			const geminiHistory = convertToGeminiHistory(recentMessages.slice(0, -1));
			const userMessage = recentMessages[recentMessages.length - 1].content;

			// Start chat with history
			const chat = model.startChat({
				history: geminiHistory,
				generationConfig: {
					temperature: temperature,
					maxOutputTokens: maxTokens,
				},
			});

			// Send message
			const result = await chat.sendMessage(userMessage);
			const response = await result.response;
			const reply = response.text();

			if (!reply) {
				throw new Error('Empty response from Gemini');
			}

			// Update history
			const newHistory = [...recentMessages, { role: 'assistant', content: reply }];
			sessionHistories.set(sessionId, newHistory);

			res.json({ 
				sessionId, 
				reply, 
				source: 'gemini', 
				model: GEMINI_MODEL 
			});
		} catch (geminiError) {
			// Fallback to mock responses
			console.log('Gemini error:', geminiError.message, '- using fallback responses');
			const reply = getFallbackResponse(prompt || messages[messages.length - 1].content);
			const newHistory = [
				{ role: 'user', content: prompt || messages[messages.length - 1].content }, 
				{ role: 'assistant', content: reply }
			];
			sessionHistories.set(sessionId, newHistory);

			res.json({
				sessionId,
				reply,
				source: 'fallback',
				error: geminiError.message,
				note: 'Gemini API error. Using fallback responses. Check your API key and quota.'
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
	console.log(`🤖 AI Provider: Google Gemini`);
	console.log(`🎯 Model: ${GEMINI_MODEL}`);
	console.log(`${GEMINI_API_KEY ? '✅' : '❌'} API Key: ${GEMINI_API_KEY ? 'Configured' : 'Missing - using fallback responses'}`);
	console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`\nEndpoints:`);
	console.log(`  GET  /health  - Health check`);
	console.log(`  POST /chat    - Chat with AI\n`);
});