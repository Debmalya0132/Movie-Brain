/**
 * constellation-view.js — Phase 3: Constellation View
 * Discovers themes and clusters nodes into tight "star constellations" with lines.
 */

function applyConstellationView() {
    window.constellationLines = [];

    // 1. Thematic Clustering
    const clusters = {
        'Adrenaline': [],    // Action, Sci-Fi, Adventure
        'Lighthearted': [],  // Comedy, Romance, Family, Animation
        'Intense': [],       // Drama, Thriller, Horror, Mystery
        'Eclectic': []       // Documentary, Music, History, etc.
    };

    nodes.forEach(node => {
        const g = node.content.genres.join(' ').toLowerCase();
        if (g.includes('action') || g.includes('sci-fi') || g.includes('adventure')) {
            clusters['Adrenaline'].push(node);
        } else if (g.includes('comedy') || g.includes('romance') || g.includes('family') || g.includes('animation')) {
            clusters['Lighthearted'].push(node);
        } else if (g.includes('drama') || g.includes('thriller') || g.includes('horror') || g.includes('mystery')) {
            clusters['Intense'].push(node);
        } else {
            clusters['Eclectic'].push(node);
        }
    });

    // 2. Position clusters in distinct quadrants (Tetrahedron shape)
    const clusterCenters = [
        { x: 0, y: 25, z: 0 },
        { x: 25, y: -10, z: -25 },
        { x: -25, y: -10, z: -25 },
        { x: 0, y: -10, z: 30 }
    ];

    Object.keys(clusters).forEach((cName, i) => {
        const group = clusters[cName];
        if (group.length === 0) return;

        const center = clusterCenters[i];

        // 3. Position nodes within the cluster & draw enhanced constellation lines
        const placedNodes = [];

        group.forEach((node) => {
            const radius = 12; // Spread within cluster
            const r = Math.random() * radius;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            node.targetPosition.set(
                center.x + r * Math.sin(phi) * Math.cos(theta),
                center.y + r * Math.sin(phi) * Math.sin(theta),
                center.z + r * Math.cos(phi)
            );

            // Connect to the NEAREST already-placed node in this cluster
            if (placedNodes.length > 0) {
                let nearest = placedNodes[0];
                let minDist = node.targetPosition.distanceTo(nearest.targetPosition);

                for (let k = 1; k < placedNodes.length; k++) {
                    const dist = node.targetPosition.distanceTo(placedNodes[k].targetPosition);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = placedNodes[k];
                    }
                }

                const points = [node.targetPosition, nearest.targetPosition];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                const mat = new THREE.LineBasicMaterial({ 
                    color: 0xffffff, 
                    opacity: 0.35, 
                    transparent: true 
                });
                const line = new THREE.Line(geo, mat);
                scene.add(line);
                window.constellationLines.push({ line, node1: node, node2: nearest });
            }
            
            placedNodes.push(node);
        });
    });
}
