# 🧠 Movie Brain - Your Personal Film Network

A unique 3D interactive movie and TV show recommendation system that visualizes your watched content as a living neural network. **Movie Brain** represents your viewing history as interconnected nodes in 3D space, creating a beautiful brain-like structure that evolves as you add more content. 

With the new AI-powered Taste Profile generator and Multi-View engines, it's never been easier to analyze your cinematic taste, share your brain with friends, and visualize your cinematic journey.

## ✨ Features

### 🌌 The Multi-View 3D Visualization System
Explore your taste in 4 distinct layout modes:
- **Brain View 🧠**: Your movies and shows appear as a neural network. Nodes are connected by glowing synaptic links based on shared genres.
- **Galaxy View 🌌**: A breathtaking solar system where genres act as planetary centers, and your movies orbit around them with dynamic gravitational animations.
- **Timeline View ⏰**: A chronological visualization of your viewing history, from the first movie you ever added to the most recent. Includes a rapid-fire playback scrubber to watch your taste evolve.
- **Constellation View ✨**: Uncovers the hidden constellations in your taste using a Nearest-Neighbor thematic clustering algorithm. 

### 🤖 AI Taste Profiling & Chat
- **Deep Analysis**: Uses the Google Gemini AI to analyze your viewing habits, generating a highly personalized "Taste Profile" including an Archetype, Personality description, Hidden Patterns, Seasonal Insights, and Blind Spots with custom recommendations.
- **Interactive Chat**: Have a 1-on-1 conversation with an AI cinephile about your specific movie list to ask for tailored recommendations or insights.
- **Downloadable Profile Cards**: Renders your taste profile into a gorgeous, shareable "Spotify Wrapped"-style image card that you can download directly to your device.

### 🌐 Cloud Sync & Social Sharing
- **Firebase Integration**: Your brain is instantly synced to the cloud.
- **Shareable Links**: Generate a unique link or QR Code to share your brain with friends.
- **Brain Comparison**: Overlay a friend's shared brain onto your own to find the cinematic overlaps between your tastes.

### 🔍 Discovery
- **Real-time Search**: Search and add content from TMDB's massive database.
- **Interactive Exploration**: Click on any node to see details, poster art, and an overview.

## 🚀 Setup Instructions

### Step 1: API Keys
You will need API keys for TMDB, Google Gemini, and a Firebase project.
1. **TMDB**: Get a free API key from [TheMovieDB](https://www.themoviedb.org/). Paste it into `app.js` (`TMDB_API_KEY`).
2. **Gemini AI**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Paste it into `taste.js` (`GEMINI_API_KEY`).
3. **Firebase**: Create a project in [Firebase](https://console.firebase.google.com/). Add your config credentials to `firebase-config.js`.

### Step 2: Run the Application
1. Open Terminal/Command Prompt
2. Navigate to the `movie-brain` folder:
   ```bash
   cd path/to/movie-brain
   ```
3. Run a local python server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

## 📖 How to Use

1. **Build Your Brain**: Use the search bar in the top-left to find movies or TV shows and add them.
2. **Change Views**: Click the tabs at the top (Brain, Galaxy, Timeline, Constellation) to morph the 3D scene into different structures.
3. **Scrub Timeline**: In Timeline view, use the scrubber at the bottom to watch your brain grow sequentially.
4. **AI Taste Profile**: Click the "AI Taste Profile" button in the top right to generate a deep-dive analysis of your habits, chat with the AI, and download your profile card.
5. **Share**: Click "Share Brain" to generate a link to send to your friends.

## 💾 File Structure

```text
movie-brain/
├── index.html               # Main application layout
├── styles.css               # Glassmorphic UI styling
├── app.js                   # Core 3D engine, TMDB fetching
├── views.js                 # Multi-view orchestrator
├── galaxy-view.js           # Orbital mechanics layout
├── timeline-view.js         # Chronological distribution layout
├── constellation-view.js    # Nearest-neighbor clustering algorithm
├── taste.js                 # AI integration (Gemini), Chat, & Canvas downloads
├── share.js                 # Firebase saving & share link generation
├── compare.js               # Cross-referencing shared brains
├── firebase-config.js       # Database credentials
└── README.md                # Documentation
```

## 🎯 Technical Details

- **Frontend**: Vanilla HTML/CSS/JS
- **3D Graphics**: Three.js (r128)
- **AI Inference**: Google Gemini API
- **Data Source**: TMDB API
- **Backend/Storage**: Firebase Realtime Database & LocalStorage

## 🔐 Privacy
Your API keys are stored in the client files, making this a strictly local/personal application deployment. Your viewing history is stored in your own Firebase instance and browser LocalStorage.

## 🎉 Enjoy the Journey!
Keep adding movies and watch your personalized galaxy grow!
