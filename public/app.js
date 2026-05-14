// Configuration
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// State
let watchedContent = [];
let scene, camera, renderer, controls;
let nodes = [];
let connections = [];
let raycaster, mouse;
let selectedNode = null;
let ripples = []; // { mesh, connection, progress, speed }

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("🧠 Movie Brain V3 Loaded!");
    initThreeJS();
    initEventListeners();
    loadFromLocalStorage();
    animate();
});

// Three.js Initialization
function initThreeJS() {
    const canvas = document.getElementById('brain-canvas');
    const container = document.getElementById('canvas-container');

    // Scene
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0x000000, 60, 220);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true   // required for canvas.toDataURL() snapshot
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 120);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xaaaaaa, 0.4, 120);
    pointLight2.position.set(50, 50, 0);
    scene.add(pointLight2);

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the entire scene slowly
    if (nodes.length > 0) {
        scene.rotation.y += 0.001;
    }

    // Interpolate positions and pulse nodes
    nodes.forEach((node, index) => {
        // Orbit dynamics for Galaxy View
        if (window.currentView === 'galaxy' && node.galaxyOrbit) {
            node.galaxyOrbit.angle += node.galaxyOrbit.speed;
            node.targetPosition.set(
                node.galaxyOrbit.cx + Math.cos(node.galaxyOrbit.angle) * node.galaxyOrbit.radius,
                node.galaxyOrbit.cy,
                node.galaxyOrbit.cz + Math.sin(node.galaxyOrbit.angle) * node.galaxyOrbit.radius
            );
        }

        // Move towards target position if set
        if (node.targetPosition) {
            node.mesh.position.lerp(node.targetPosition, 0.05);
        }

        // Pulse scale
        let baseScale = node.baseScale || 1;
        const scale = baseScale + Math.sin(Date.now() * 0.001 + index) * 0.1;
        node.mesh.scale.set(scale, scale, scale);
    });

    // Update neural connections to follow nodes
    if (connections && connections.length > 0) {
        connections.forEach(conn => {
            if (!conn.node1 || !conn.node2) return;
            const positions = conn.line.geometry.attributes.position.array;
            positions[0] = conn.node1.mesh.position.x;
            positions[1] = conn.node1.mesh.position.y;
            positions[2] = conn.node1.mesh.position.z;
            positions[3] = conn.node2.mesh.position.x;
            positions[4] = conn.node2.mesh.position.y;
            positions[5] = conn.node2.mesh.position.z;
            conn.line.geometry.attributes.position.needsUpdate = true;
        });
    }

    // Update constellation lines to follow nodes
    if (window.constellationLines && window.constellationLines.length > 0) {
        window.constellationLines.forEach(conn => {
            if (!conn.node1 || !conn.node2) return;
            const positions = conn.line.geometry.attributes.position.array;
            positions[0] = conn.node1.mesh.position.x;
            positions[1] = conn.node1.mesh.position.y;
            positions[2] = conn.node1.mesh.position.z;
            positions[3] = conn.node2.mesh.position.x;
            positions[4] = conn.node2.mesh.position.y;
            positions[5] = conn.node2.mesh.position.z;
            conn.line.geometry.attributes.position.needsUpdate = true;
        });
    }

    // Animate ripples along connections
    const dead = [];
    ripples.forEach(r => {
        r.progress += r.speed;
        if (r.progress < 0) { return; } // still in delay phase
        if (r.progress >= 1) {
            scene.remove(r.mesh);
            r.mesh.geometry.dispose();
            r.mesh.material.dispose();
            dead.push(r);
            return;
        }
        // Use raw local positions — ripple meshes live in scene space and rotate with it
        const attr = r.connection.line.geometry.attributes.position;
        const from = new THREE.Vector3(attr.getX(0), attr.getY(0), attr.getZ(0));
        const to   = new THREE.Vector3(attr.getX(1), attr.getY(1), attr.getZ(1));
        r.mesh.position.lerpVectors(from, to, r.progress);
        // Fade out as it reaches the destination
        r.mesh.material.opacity = 0.9 * (1 - r.progress * r.progress);
        const s = 1.2 - r.progress * 0.5;
        r.mesh.scale.set(s, s, s);
    });
    dead.forEach(r => ripples.splice(ripples.indexOf(r), 1));

    renderer.render(scene, camera);
}

// Event Listeners
function initEventListeners() {
    const searchInput  = document.getElementById('search-input');
    const canvas       = document.getElementById('brain-canvas');
    const closeInfo    = document.getElementById('close-info');
    const expandCard   = document.getElementById('expand-card');
    const getRecs      = document.getElementById('get-recommendations');
    const dlBrainBtn   = document.getElementById('download-brain-btn');

    searchInput.addEventListener('input', debounce(handleSearch, 500));
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    closeInfo.addEventListener('click', closeInfoOverlay);
    getRecs.addEventListener('click', fetchRecommendations);
    dlBrainBtn.addEventListener('click', downloadBrainImage);

    // Expand / collapse toggle
    expandCard.addEventListener('click', () => {
        const overlay = document.getElementById('info-overlay');
        const isExpanded = overlay.classList.toggle('card-expanded');
        expandCard.innerHTML = isExpanded
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 3v5H3M21 8h-5V3M3 16h5v5M16 21v-5h5"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
    });
}

// ── Download the 3D brain canvas as a PNG ─────────────────────────────────────
function downloadBrainImage() {
    const btn    = document.getElementById('download-brain-btn');
    const canvas = document.getElementById('brain-canvas');

    // Force a fresh render so the buffer is current
    renderer.render(scene, camera);

    const prevText = btn.innerHTML;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Saving…`;
    btn.disabled = true;

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `movie-brain-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        btn.innerHTML = prevText;
        btn.disabled  = false;
    }, 'image/png');
}

// Search functionality
async function handleSearch(e) {
    const query = e.target.value.trim();
    const resultsContainer = document.getElementById('search-results');

    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Filter only movies and TV shows
        const results = data.results.filter(item =>
            item.media_type === 'movie' || item.media_type === 'tv'
        ).slice(0, 10);

        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 10px;">Error searching. Please check your API key.</p>';
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');

    if (results.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 10px;">No results found</p>';
        return;
    }

    container.innerHTML = results.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const posterPath = item.poster_path
            ? `${TMDB_IMAGE_BASE}${item.poster_path}`
            : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="75"%3E%3Crect width="50" height="75" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';

        const isAdded = watchedContent.some(content => content.id === item.id);

        return `
            <div class="search-result-item ${isAdded ? 'added' : ''}" data-id="${item.id}" data-type="${item.media_type}">
                <img src="${posterPath}" class="search-result-poster" alt="${title}">
                <div class="search-result-info">
                    <div class="search-result-title">${title}</div>
                    <div class="search-result-meta">${year} • ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
                </div>
                <input type="checkbox" class="search-result-checkbox" ${isAdded ? 'checked' : ''} onclick="event.stopPropagation()">
            </div>
        `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', toggleWatchedContent);
    });
}

async function toggleWatchedContent(e) {
    const item = e.currentTarget;
    const id = parseInt(item.dataset.id);
    const type = item.dataset.type;
    const checkbox = item.querySelector('.search-result-checkbox');

    const existingIndex = watchedContent.findIndex(content => content.id === id);

    if (existingIndex !== -1) {
        // Remove from watched
        watchedContent.splice(existingIndex, 1);
        item.classList.remove('added');
        if (checkbox) checkbox.checked = false;
        removeNodeFromScene(id);
    } else {
        // Add to watched
        try {
            const details = await fetchContentDetails(id, type);
            watchedContent.push(details);
            item.classList.add('added');
            if (checkbox) checkbox.checked = true;
            addNodeToScene(details);
        } catch (error) {
            console.error('Error adding content:', error);
        }
    }

    saveToLocalStorage();
    updateStats();
    updateConnections();
}

async function fetchContentDetails(id, type) {
    const response = await fetch(`/api/details?id=${id}&type=${type}`);
    const data = await response.json();

    return {
        id: data.id,
        title: data.title || data.name,
        type: type,
        overview: data.overview,
        posterPath: data.poster_path,
        genres: data.genres.map(g => g.name),
        year: (data.release_date || data.first_air_date || '').split('-')[0],
        rating: data.vote_average,
        dateAdded: new Date().toISOString()   // ← timestamp
    };
}

// 3D Visualization
function addNodeToScene(content, opts = {}) {
    // Calculate position in 3D space based on current number of nodes
    const position = calculateNodePosition(content, nodes.length);

    const radius = 0.8 * (opts.scale || 1.0);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    
    // In compare mode, use the explicit color, otherwise fall back to genre
    const baseColor = opts.color || getColorForGenre(content.genres[0]);

    const material = new THREE.MeshPhongMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: opts.emissiveIntensity ?? 0.15,
        shininess: opts.shininess ?? 60
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.userData = { content };

    scene.add(mesh);

    nodes.push({ 
        mesh, 
        content, 
        targetPosition: new THREE.Vector3(position.x, position.y, position.z),
        baseScale: opts.scale || 1.0,
        userData: { originalScale: opts.scale || 1.0 }
    });
}

function removeNodeFromScene(id) {
    const nodeIndex = nodes.findIndex(node => node.content.id === id);
    if (nodeIndex !== -1) {
        const node = nodes[nodeIndex];
        scene.remove(node.mesh);
        nodes.splice(nodeIndex, 1);
    }

    // Remove connections
    connections = connections.filter(conn => {
        if (conn.content1.id === id || conn.content2.id === id) {
            scene.remove(conn.line);
            return false;
        }
        return true;
    });
}

// ── Compare Mode Scene Helpers ────────────────────────────────────────────────

window.rebuildSceneForCompare = function(onlyMe, onlyThem, both) {
    clearScene();

    // The slick monochromatic compare palette:
    // Only Me: Dim Gray (0x808080)
    // Only Them: Darker Charcoal (0x444444) 
    // Both: Bright White (0xffffff) + glowing + larger

    onlyMe.forEach(c => addNodeToScene(c, { color: '#808080', scale: 0.9 }));
    onlyThem.forEach(c => addNodeToScene(c, { color: '#444444', scale: 0.85, emissiveIntensity: 0.05 }));
    both.forEach(c => addNodeToScene(c, { color: '#ffffff', scale: 1.3, emissiveIntensity: 0.4, shininess: 100 }));

    updateConnections();
};

window.rebuildSceneFromStorage = function() {
    clearScene();
    if (typeof watchedContent !== 'undefined') {
        watchedContent.forEach(content => addNodeToScene(content));
    }
    updateConnections();
};

function clearScene() {
    nodes.forEach(node => scene.remove(node.mesh));
    nodes = [];
    connections.forEach(conn => scene.remove(conn.line));
    connections = [];
}

function calculateNodePosition(content, index = 0, overrideTotal = null) {
    const total = overrideTotal || Math.max(
        typeof watchedContent !== 'undefined' ? watchedContent.length : 0, 
        nodes.length, 
        1
    );

    // Use spherical coordinates for distribution
    // Clamp the value inside acos to [-1, 1] to prevent NaN just in case
    const acosVal = Math.max(-1, Math.min(1, -1 + (2 * index) / total));
    const phi = Math.acos(acosVal);
    const theta = Math.sqrt(total * Math.PI) * phi;

    const radius = 20 + Math.random() * 10;

    return {
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi)
    };
}

function updateConnections() {
    // Remove all existing connections
    connections.forEach(conn => scene.remove(conn.line));
    connections = [];

    // Create connections between nodes with shared genres
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];

            const sharedGenres = node1.content.genres.filter(g =>
                node2.content.genres.includes(g)
            ).length;

            if (sharedGenres > 0) {
                createConnection(node1, node2, sharedGenres);
            }
        }
    }
}

function createConnection(node1, node2, strength) {
    const points = [];
    points.push(node1.mesh.position);
    points.push(node2.mesh.position);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.08 + (strength * 0.08),
        transparent: true
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    connections.push({
        line,
        node1,
        node2,
        content1: node1.content,
        content2: node2.content
    });
}

function getColorForGenre(genre) {
    // Monochrome palette — distinct luminance steps so genres are still readable
    const colors = {
        'Action':           0xf5f5f7,  // near-white
        'Adventure':        0xe0e0e0,
        'Animation':        0xcacaca,
        'Comedy':           0xb8b8b8,
        'Crime':            0xa5a5a5,
        'Documentary':      0x929292,
        'Drama':            0x7e7e7e,
        'Family':           0xd4d4d4,
        'Fantasy':          0xbcbcbc,
        'Horror':           0x555555,
        'Mystery':          0x6a6a6a,
        'Romance':          0xc8c8c8,
        'Science Fiction':  0xebebeb,
        'Thriller':         0x3d3d3d,
        'War':              0x4f4f4f,
        'Western':          0x888888
    };

    return colors[genre] || 0x999999;
}

// Mouse interaction
function onCanvasMouseMove(event) {
    const canvas = document.getElementById('brain-canvas');
    const rect = canvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));

    canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function onCanvasClick(event) {
    const canvas = document.getElementById('brain-canvas');
    const rect = canvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));

    if (intersects.length > 0) {
        const content = intersects[0].object.userData.content;
        triggerRipple(intersects[0].object);
        showInfoOverlay(content);
    }
}

// Neural ripple: pulses travel outward along all connections from the clicked node
function triggerRipple(clickedMesh) {
    const clickedNodeData = clickedMesh.userData.content;

    connections.forEach(conn => {
        const isSource = conn.content1.id === clickedNodeData.id || conn.content2.id === clickedNodeData.id;
        if (!isSource) return;

        // Determine direction: always travel away from clicked node
        const positions = conn.line.geometry.attributes.position;
        const p0 = new THREE.Vector3(positions.getX(0), positions.getY(0), positions.getZ(0));
        const p1 = new THREE.Vector3(positions.getX(1), positions.getY(1), positions.getZ(1));

        // Find which end is the clicked node (closest to clicked mesh position)
        const clickedPos = clickedMesh.position;
        const distToP0 = clickedPos.distanceTo(p0);
        const distToP1 = clickedPos.distanceTo(p1);
        const forward = distToP0 < distToP1; // start from p0→p1 or p1→p0

        // Create a small glowing sphere as the ripple pulse
        const geo = new THREE.SphereGeometry(0.35, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Stagger multiple pulses per connection for a wave feel
        [0, 0.18, 0.36].forEach((offset, i) => {
            const pulseMesh = i === 0 ? mesh : new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 8, 8),
                mat.clone()
            );
            pulseMesh.material.opacity = 0.85 - i * 0.25;
            scene.add(pulseMesh);

            // Store a reversed connection for reverse direction
            const connForRipple = forward ? conn : {
                line: {
                    geometry: {
                        attributes: {
                            position: {
                                getX: (idx) => idx === 0 ? positions.getX(1) : positions.getX(0),
                                getY: (idx) => idx === 0 ? positions.getY(1) : positions.getY(0),
                                getZ: (idx) => idx === 0 ? positions.getZ(1) : positions.getZ(0)
                            }
                        }
                    }
                }
            };

            ripples.push({
                mesh: pulseMesh,
                connection: connForRipple,
                progress: -offset,  // negative start = delayed
                speed: 0.018 + i * 0.002
            });
        });
    });
}

function showInfoOverlay(content) {
    selectedNode = content;

    const overlay   = document.getElementById('info-overlay');
    const poster    = document.getElementById('info-poster');
    const title     = document.getElementById('info-title');
    const genre     = document.getElementById('info-genre');
    const year      = document.getElementById('info-year');
    const overview  = document.getElementById('info-overview');
    const recsContainer = document.getElementById('recommendations-container');

    poster.src = content.posterPath
        ? `${TMDB_IMAGE_BASE}${content.posterPath}`
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="96"%3E%3Crect width="64" height="96" fill="%23222"/%3E%3C/svg%3E';
    title.textContent    = content.title;
    genre.textContent    = content.genres.join(', ');
    year.textContent     = `${content.year}  \u00b7  ${content.rating.toFixed(1)} / 10`;
    overview.textContent = content.overview || 'No overview available.';

    recsContainer.classList.add('hidden');

    // Reset to compact mode on each new node
    overlay.classList.remove('card-expanded');

    // Spring pop-in
    overlay.classList.add('card-enter');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.remove('card-enter');
    }));
}

function closeInfoOverlay() {
    document.getElementById('info-overlay').classList.add('hidden');
    selectedNode = null;
}

// Recommendations
async function fetchRecommendations() {
    if (!selectedNode) return;

    const recsContainer = document.getElementById('recommendations-container');
    const recsList = document.getElementById('recommendations-list');

    recsList.innerHTML = '<p class="loading">Loading recommendations...</p>';
    recsContainer.classList.remove('hidden');

    try {
        const response = await fetch(`/api/recommendations?id=${selectedNode.id}&type=${selectedNode.type}`);
        const data = await response.json();

        const recommendations = data.results.slice(0, 3);

        if (recommendations.length === 0) {
            recsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No recommendations found.</p>';
            return;
        }

        recsList.innerHTML = recommendations.map(item => {
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || '').split('-')[0];
            const posterPath = item.poster_path
                ? `${TMDB_IMAGE_BASE}${item.poster_path}`
                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="90"%3E%3Crect width="60" height="90" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';

            const isAdded = watchedContent.some(content => content.id === item.id);

            return `
                <div class="recommendation-item ${isAdded ? 'added' : ''}" data-id="${item.id}" data-type="${selectedNode.type}">
                    <img src="${posterPath}" class="recommendation-poster" alt="${title}">
                    <div class="recommendation-info">
                        <div class="recommendation-title">${title}</div>
                        <div class="recommendation-meta">${year} • ${isAdded ? '✓ Added' : 'Click to add'}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        recsList.querySelectorAll('.recommendation-item').forEach(item => {
            item.addEventListener('click', addRecommendation);
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        recsList.innerHTML = '<p style="color: rgba(255,100,100,0.8);">Error loading recommendations.</p>';
    }
}

// Toggle a recommendation: add if not in brain, remove if already added
async function addRecommendation(e) {
    const item = e.currentTarget;
    const id   = parseInt(item.dataset.id);
    const type = item.dataset.type;
    const meta = item.querySelector('.recommendation-meta');

    const existingIndex = watchedContent.findIndex(c => c.id === id);

    if (existingIndex !== -1) {
        // Already in brain — remove it
        watchedContent.splice(existingIndex, 1);
        item.classList.remove('added');
        if (meta) meta.textContent = 'Click to add';
        removeNodeFromScene(id);
        saveToLocalStorage();
        updateStats();
        updateConnections();
        return;
    }

    // Not in brain — add it
    item.style.opacity = '0.5';
    try {
        const details = await fetchContentDetails(id, type);
        watchedContent.push(details);
        item.classList.add('added');
        if (meta) meta.textContent = `${details.year} \u00b7 Click to remove`;
        item.style.opacity = '';
        addNodeToScene(details);
        saveToLocalStorage();
        updateStats();
        updateConnections();
    } catch (error) {
        item.style.opacity = '';
        console.error('Error adding recommendation:', error);
    }
}

// Stats
function updateStats() {
    const movieCount = watchedContent.filter(c => c.type === 'movie').length;
    const showCount = watchedContent.filter(c => c.type === 'tv').length;

    document.getElementById('movie-count').textContent = movieCount;
    document.getElementById('show-count').textContent = showCount;
    document.getElementById('connection-count').textContent = connections.length;
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('movieBrainData', JSON.stringify(watchedContent));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('movieBrainData');
    if (saved) {
        watchedContent = JSON.parse(saved);

        // Backfill dateAdded for entries that pre-date this feature
        let needsSave = false;
        watchedContent.forEach(c => {
            if (!c.dateAdded) {
                c.dateAdded = new Date().toISOString();
                needsSave = true;
            }
        });
        if (needsSave) saveToLocalStorage();

        watchedContent.forEach(content => addNodeToScene(content));
        updateStats();
        updateConnections();
    }
}

// Utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
