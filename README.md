# 🧠 Movie Brain - Your Personal Film Network

A unique 3D interactive movie and TV show recommendation system that visualizes your watched content as a living neural network. Unlike Netflix or Letterboxd, Movie Brain represents your viewing history as interconnected nodes in 3D space, creating a beautiful brain-like structure that evolves as you add more content.

## ✨ Features

- **3D Neural Network Visualization**: Your movies and shows appear as glowing nodes connected by synaptic lines based on shared genres, creating a unique brain-like structure
- **Interactive Exploration**: Click on any node to see details, get similar recommendations, and explore your taste patterns
- **Smart Recommendations**: Get top 3 similar movies/shows based on TMDB's recommendation engine
- **Real-time Search**: Search and add content from TMDB's massive database
- **Persistent Storage**: Your watched list is saved locally in your browser
- **Beautiful UI**: Glassmorphic design with smooth animations and gradients

## 🚀 Setup Instructions

### Step 1: Get a TMDB API Key (Free)

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create a free account (takes 1 minute)
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Fill out the form (you can use any website URL, even a personal one)
6. You'll receive your API key instantly (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Add Your API Key

1. Open the `app.js` file in any text editor
2. Find this line at the top (line 2):
   ```javascript
   const TMDB_API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const TMDB_API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
   ```
4. Save the file

### Step 3: Run the Application

You have several options:

#### Option A: Simple Double-Click (Easiest)
1. Just double-click `index.html` 
2. It should open in your default browser
3. Start adding movies!

#### Option B: Using Python (Recommended for best results)
1. Open Terminal/Command Prompt
2. Navigate to the movie-brain folder:
   ```bash
   cd path/to/movie-brain
   ```
3. Run this command:
   ```bash
   python -m http.server 8000
   ```
   Or if you have Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

#### Option C: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option D: Using Node.js
1. Install http-server globally:
   ```bash
   npm install -g http-server
   ```
2. Navigate to the movie-brain folder
3. Run:
   ```bash
   http-server
   ```
4. Open the URL shown in terminal (usually `http://localhost:8080`)

## 📖 How to Use

1. **Search for Content**: Use the search bar in the top-left to find movies or TV shows
2. **Add to Your Brain**: Click on search results to add them to your visualization
3. **Explore**: The 3D brain will slowly rotate. Click and drag to navigate
4. **Click Nodes**: Click any glowing sphere to see details about that movie/show
5. **Get Recommendations**: Click the "Get Similar Recommendations" button to find similar content
6. **Add Recommendations**: Click on recommended items to add them to your brain
7. **Watch It Grow**: As you add more content, connections form between similar items, creating clusters of related movies/shows

## 🎨 Understanding the Visualization

- **Nodes (Spheres)**: Each represents a movie or TV show
- **Colors**: Different colors represent different primary genres
- **Lines (Connections)**: Link movies/shows with shared genres
- **Thicker Lines**: Indicate stronger similarities (more shared genres)
- **Clusters**: Similar content naturally groups together
- **Pulsing Effect**: Nodes gently pulse to indicate they're interactive

## 🔧 Troubleshooting

### "No results found" when searching
- Make sure you've added your TMDB API key correctly in `app.js`
- Check that your API key is valid at themoviedb.org

### Page won't load properly
- Make sure you're running it through a local server (Options B, C, or D above)
- Check the browser console (F12) for errors

### 3D visualization is blank
- Try adding some movies/shows using the search
- Make sure WebGL is enabled in your browser
- Try a different browser (Chrome, Firefox, or Edge recommended)

### API key not working
- Wait a few minutes - new TMDB API keys sometimes take time to activate
- Make sure there are no extra spaces or quotes around your key
- Verify your API key at themoviedb.org/settings/api

## 🌟 Tips for Best Experience

- **Add at least 10-15 movies/shows** to see the brain structure form
- **Mix different genres** to create interesting connection patterns
- **Use the recommendations feature** to discover content similar to what you love
- **Your data is saved locally** - it persists between sessions
- **Different genres get different colors** - watch for natural clustering
- **Zoom and rotate** by clicking and dragging to explore from different angles

## 💾 File Structure

```
movie-brain/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── app.js          # Core application logic, 3D visualization, API calls
└── README.md       # This file
```

## 🎯 Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript (no build tools needed)
- **3D Graphics**: Three.js (r128)
- **Data Source**: TMDB (The Movie Database) API
- **Storage**: Browser localStorage
- **No Backend Required**: Everything runs in your browser

## 🐛 Known Limitations

- Requires internet connection for searching and recommendations
- Limited to TMDB's database (which is huge, but not everything is there)
- 3D visualization may be slow with 200+ items on older devices
- Recommendations are based on TMDB's algorithm, not your specific taste

## 🔐 Privacy

- All data is stored locally in your browser
- No data is sent to any server except TMDB for searching
- Your API key is only stored in the code file on your computer
- No tracking, no analytics, no data collection

## 🎉 Have Fun!

Start building your movie brain and discover how your taste in films and shows forms beautiful patterns in 3D space!

---

**Questions or Issues?**
- Check the console (F12 → Console) for error messages
- Make sure your TMDB API key is valid
- Try a different browser if things aren't working
- Clear your browser cache and try again

**Pro Tip**: The brain looks coolest when you have a diverse mix of genres. Try adding some action movies, some comedies, dramas, and sci-fi to see distinct clusters form!
