/**
 * galaxy-view.js — Phase 3: Galaxy View
 * Clusters nodes around their primary genre (like solar systems)
 */

window.galaxyElements = [];

function applyGalaxyView() {
    window.galaxyElements = [];
    
    // 1. Group nodes by primary genre
    const genres = {};
    nodes.forEach(node => {
        const genre = node.content.genres[0] || 'Unknown';
        if (!genres[genre]) genres[genre] = [];
        genres[genre].push(node);
    });

    const genreNames = Object.keys(genres);
    const numGenres = genreNames.length;
    
    // 2. Distribute genre "solar systems" in a massive galactic ring
    genreNames.forEach((genre, i) => {
        const angle = (i / numGenres) * Math.PI * 2;
        const galaxyRadius = 45; // Huge ring
        
        const centerX = Math.cos(angle) * galaxyRadius;
        const centerZ = Math.sin(angle) * galaxyRadius;
        const centerY = (Math.random() - 0.5) * 15; // Vertical variance
        
        // Optional: Create a faint glowing "sun" for the genre
        const sunGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({ 
            color: getColorForGenre(genre), 
            transparent: true, 
            opacity: 0.15 
        });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.position.set(centerX, centerY, centerZ);
        scene.add(sunMesh);
        window.galaxyElements.push(sunMesh);
        
        // 3. Orbit the nodes around their genre sun
        const nodesInGenre = genres[genre];
        nodesInGenre.forEach((node, j) => {
            // Spiral distribution
            const nodeAngle = (j / nodesInGenre.length) * Math.PI * 2 * 3; 
            const nodeDist = 3 + (j / nodesInGenre.length) * 12; 
            
            node.galaxyOrbit = {
                cx: centerX,
                cy: centerY + (Math.random() - 0.5) * 6,
                cz: centerZ,
                radius: nodeDist,
                angle: nodeAngle,
                speed: 0.001 + Math.random() * 0.002
            };
            
            node.targetPosition.set(
                node.galaxyOrbit.cx + Math.cos(node.galaxyOrbit.angle) * node.galaxyOrbit.radius,
                node.galaxyOrbit.cy,
                node.galaxyOrbit.cz + Math.sin(node.galaxyOrbit.angle) * node.galaxyOrbit.radius
            );
        });
    });
}
