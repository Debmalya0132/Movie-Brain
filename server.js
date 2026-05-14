require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ── TMDB Endpoints ─────────────────────────────────────────────────────────────
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is not defined in environment variables');
        
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('TMDB API Error (Search):', data);
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Search Proxy Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/details', async (req, res) => {
    try {
        const { id, type } = req.query;
        if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is not defined');

        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
        const data = await response.json();

        if (!response.ok) {
            console.error('TMDB API Error (Details):', data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Details Proxy Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/recommendations', async (req, res) => {
    try {
        const { id, type } = req.query;
        if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is not defined');

        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        if (!response.ok) {
            console.error('TMDB API Error (Recs):', data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Recs Proxy Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ── Gemini AI Endpoints ──────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/ai/profile', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not defined in environment variables');

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        res.json({ text: responseText });
    } catch (error) {
        console.error("Gemini Proxy Error (Profile):", error);
        res.status(500).json({ error: error.message || 'Failed to generate AI profile' });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not defined');

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        res.json({ text: responseText });
    } catch (error) {
        console.error("Gemini Proxy Error (Chat):", error);
        res.status(500).json({ error: error.message || 'Failed to generate AI chat response' });
    }
});

app.get('/api/ai/debug', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not defined');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // The listModels method is the standard way to check availability
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
