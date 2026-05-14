# Movie Brain - Neural Network Film Visualization

Movie Brain is a 3D interactive cinematic recommendation system that visualizes viewing history as a neural network. It represents watched content as interconnected nodes in 3D space, generating a dynamic structure that evolves through user interaction.

The system incorporates AI-powered taste profiling, real-time multi-view rendering engines, and cloud synchronization for an advanced analytical approach to media consumption.

## Core Features

### Multi-View 3D Visualization System
The application supports four distinct layout modes for data exploration:
- **Brain View**: Watched content is mapped as a neural network. Nodes are connected by synaptic links based on shared genres and algorithmic similarities.
- **Galaxy View**: A physics-based solar system model where genres serve as planetary centers, and individual titles orbit with dynamic gravitational animations.
- **Timeline View**: A chronological distribution of viewing history. Includes an interactive playback scrubber to visualize data progression over time.
- **Constellation View**: Utilizes a Nearest-Neighbor thematic clustering algorithm to uncover hidden structural relationships in the user's taste profile.

### AI Taste Profiling & Analysis
- **Deep Analysis**: Leverages the Google Gemini API to analyze viewing habits, generating a comprehensive "Taste Profile" including Archetype classification, Personality descriptions, Hidden Patterns, Seasonal Insights, and Blind Spots with custom recommendations.
- **Interactive Chat Interface**: A localized AI agent with complete context of the user's viewing history, available for 1-on-1 dialogue regarding specific recommendations or analytics.
- **Exportable Metrics**: Renders the generated profile into a formatted, high-resolution image card via an HTML Canvas engine for direct download and distribution.

### Cloud Synchronization & Collaboration
- **Firebase Integration**: Real-time cloud synchronization of the user's dataset via Firebase.
- **Shareable Instances**: Generates unique URLs and QR codes for granting read-only access to a specific database instance.
- **Cross-Referencing**: Allows users to overlay an external database onto their local instance to visually compute and display cinematic overlaps.

### Discovery & Search
- **Live Search Integration**: Direct queries to the TMDB API for rapid content indexing.
- **Interactive Nodes**: Full metadata retrieval upon node interaction, including poster art, release years, and narrative overviews.

## Setup Instructions

### Step 1: API Configuration
The application requires three API keys to function fully. For security, these are managed via server-side environment variables:

1. **TMDB_API_KEY**: Obtain from [TheMovieDB](https://www.themoviedb.org/).
2. **GEMINI_API_KEY**: Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. **Firebase Credentials**: Add your Firebase configuration to `public/firebase-config.js`.

### Step 2: Local Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_key_here
   GEMINI_API_KEY=your_gemini_key_here
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access the application at `http://localhost:3000`.

### Step 3: Deployment (Render)
1. Push the code to GitHub.
2. In the Render Dashboard, create a new **Blueprint** and connect your repository.
3. In the service settings, go to **Environment** and add:
   - `TMDB_API_KEY`
   - `GEMINI_API_KEY`
4. Render will automatically deploy the Node.js web service.

## Architecture

```text
movie-brain/
├── server.js                # Node.js/Express backend (API Proxy)
├── package.json             # Project dependencies and scripts
├── render.yaml              # Render deployment configuration
├── public/                  # Frontend static assets
│   ├── index.html           # Main application DOM structure
│   ├── styles.css           # UI styling and layout rules
│   ├── app.js               # Core 3D engine and API integration
│   ├── views.js             # Multi-view orchestration
│   ├── galaxy-view.js       # Orbital mechanics layout
│   ├── timeline-view.js     # Chronological distribution layout
│   ├── constellation-view.js# Clustering logic
│   ├── taste.js             # AI integration and profile rendering
│   ├── share.js             # Firebase synchronization
│   ├── compare.js           # Cross-referencing logic
│   └── firebase-config.js   # Firebase configuration
└── README.md                # Project documentation
```

## Technical Specifications

- **Backend**: Node.js, Express
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics Engine**: Three.js (r128)
- **AI Inference**: Google Gemini SDK
- **Data Provider**: TMDB API
- **Database**: Firebase Realtime Database

## Privacy & Security
API keys are handled exclusively on the server-side and are never exposed to the client. User viewing history is stored in the designated Firebase instance and the browser's LocalStorage.
