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
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB search failed' });
    }
});

app.get('/api/details', async (req, res) => {
    try {
        const { id, type } = req.query;
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB details failed' });
    }
});

app.get('/api/recommendations', async (req, res) => {
    try {
        const { id, type } = req.query;
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB recommendations failed' });
    }
});

// ── Gemini AI Endpoints ──────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/ai/profile', async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        res.json({ text: responseText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: 'Failed to generate AI profile' });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        res.json({ text: responseText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: 'Failed to generate AI chat response' });
    }
});

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
