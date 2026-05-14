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
- **Firebase Integration**: Real-time cloud synchronization of the user's dataset.
- **Shareable Instances**: Generates unique URLs and QR codes for granting read-only access to a specific database instance.
- **Cross-Referencing**: Allows users to overlay an external database onto their local instance to visually compute and display cinematic overlaps.

### Discovery & Search
- **Live Search Integration**: Direct queries to the TMDB API for rapid content indexing.
- **Interactive Nodes**: Full metadata retrieval upon node interaction, including poster art, release years, and narrative overviews.

## Setup Instructions

### Step 1: API Configuration
The application requires three API keys to function fully:
1. **TMDB**: Obtain an API key from [TheMovieDB](https://www.themoviedb.org/). Insert the key into `app.js` (`TMDB_API_KEY`).
2. **Google Gemini**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Insert the key into `taste.js` (`GEMINI_API_KEY`).
3. **Firebase**: Create a project in [Firebase](https://console.firebase.google.com/). Add the configuration credentials to `firebase-config.js`.

### Step 2: Running the Application
1. Open a terminal instance.
2. Navigate to the project directory:
   ```bash
   cd path/to/movie-brain
   ```
3. Initialize a local web server (e.g., using Python):
   ```bash
   python3 -m http.server 8000
   ```
4. Access the application via a web browser at: `http://localhost:8000`

## Architecture

```text
movie-brain/
├── index.html               # Main application DOM structure
├── styles.css               # UI styling and layout rules
├── app.js                   # Core 3D engine and TMDB API integration
├── views.js                 # Multi-view orchestration and state management
├── galaxy-view.js           # Orbital mechanics mathematical layout
├── timeline-view.js         # Chronological distribution layout
├── constellation-view.js    # Nearest-neighbor clustering logic
├── taste.js                 # AI integration, Chat logic, & Canvas rendering
├── share.js                 # Firebase synchronization & URL generation
├── compare.js               # Cross-referencing logic for shared instances
├── firebase-config.js       # Database connection parameters
└── README.md                # Project documentation
```

## Technical Specifications

- **Frontend Architecture**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics Engine**: Three.js (r128)
- **AI Inference API**: Google Gemini
- **Data Provider API**: The Movie Database (TMDB)
- **Backend Storage**: Firebase Realtime Database & LocalStorage

## Privacy & Data Handling
All API keys are configured client-side, enabling a localized deployment model. User viewing history and metadata are securely stored within the designated Firebase instance and the browser's native LocalStorage environment.
