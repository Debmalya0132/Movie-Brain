# Movie Brain - SaaS Cinematic Intelligence

Movie Brain is a full-stack, multi-user SaaS application that visualizes film and TV viewing history as a living 3D neural network. Built for cinephiles and data enthusiasts, it transforms static lists into an interactive exploration of taste, powered by real-time 3D rendering and generative AI.

## 🚀 Key Features

### 🔐 Multi-User Authentication & Privacy
- **Secure Auth**: Full user lifecycle management (Sign Up, Log In, Secure Sessions) via **Supabase Auth**.
- **Private Brains**: Row-Level Security (RLS) ensures that every user's data is strictly private and isolated.
- **Hybrid Storage**: Intelligent data handling that bridges Guest Mode (LocalStorage) and Authenticated Mode (Supabase Cloud).

### 🌌 Professional 3D Visualization
- **4 Dynamic Modes**: Switch between **Brain**, **Galaxy**, **Timeline**, and **Constellation** views.
- **Neural Network Logic**: Visualizes connections between titles based on genre proximity and thematic overlaps.
- **Interactive Landing**: A high-performance 3D hero visual that demonstrates the core technology before sign-up.

### 🤖 AI Taste Profiling (Gemini 1.5 Flash)
- **Archetype Discovery**: Automatically classifies your taste into complex cinematic archetypes.
- **Deep Insights**: Analyzes patterns, seasonal viewing habits, and "blind spots" in your history.
- **Interactive AI Chat**: Talk to an AI agent that has full context of your 3D brain to get personalized recommendations.

### 📈 Social & Analytical Tools
- **Compare Brains**: Overlay your neural network with a friend's to see exactly where your tastes align.
- **Shareable Profiles**: Export your AI-generated taste profile as a high-fidelity image card for social sharing.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS (ES6+), Three.js (3D Engine), CSS3 (Glassmorphism UI)
- **Backend**: Node.js, Express (API Proxy Layer)
- **Database/Auth**: Supabase (PostgreSQL with Row-Level Security)
- **AI**: Google Gemini 1.5 Flash API
- **Data**: TMDB API Integration

---

## ⚙️ Setup Instructions

### 1. Database Setup (Supabase)
1. Create a project at [Supabase](https://supabase.com).
2. Run the provided SQL (found in project documentation) in the SQL Editor to initialize the `watched_content` table and RLS policies.
3. Obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Local Development
1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-repo/movie-brain.git
   cd movie-brain
   npm install
   ```
2. **Configure Environment**: Create a `.env` file:
   ```env
   TMDB_API_KEY=your_key
   GEMINI_API_KEY=your_key
   ```
3. **Start Server**:
   ```bash
   npm start
   ```
4. **Visit**: `http://localhost:3000`

---

## 📂 Project Structure

```text
movie-brain/
├── server.js                # Node.js/Express backend
├── public/                  # Frontend assets
│   ├── index.html           # 3D Landing Page
│   ├── dashboard.html       # Main App Interface
│   ├── js/
│   │   ├── app.js           # Core 3D engine
│   │   ├── database.js      # Hybrid storage layer (Supabase + Local)
│   │   ├── landing-visual.js# Hero 3D animation
│   │   ├── taste.js         # AI profiling logic
│   │   └── supabase-client.js
│   └── css/
│       ├── styles.css       # App styles
│       └── landing.css      # Landing page styles
└── README.md
```

## 🔒 Privacy & Security
User data is protected via PostgreSQL Row-Level Security. API keys for TMDB and Gemini are handled exclusively server-side to prevent exposure. 
