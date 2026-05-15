/**
 * landing-visual.js
 * Renders a complex, rotating 3D neural network for the hero section.
 */

(function() {
    let scene, camera, renderer, particles, lines;
    const container = document.getElementById('landing-canvas-container');
    const canvas = document.getElementById('landing-brain-canvas');

    if (!container || !canvas) return;

    function init() {
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 100;

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Create a "Brain" of points
        const nodeCount = 120;
        const positions = new Float32Array(nodeCount * 3);
        const nodeGeometry = new THREE.BufferGeometry();

        for (let i = 0; i < nodeCount; i++) {
            // Spherical distribution for a "brain-like" core
            const r = 40 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7; // Flatten slightly
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const nodeMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        particles = new THREE.Points(nodeGeometry, nodeMaterial);
        scene.add(particles);

        // Create connections
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        const maxConnections = 3;
        const maxDistance = 35;

        for (let i = 0; i < nodeCount; i++) {
            let connections = 0;
            const v1 = new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]);

            for (let j = i + 1; j < nodeCount; j++) {
                if (connections >= maxConnections) break;

                const v2 = new THREE.Vector3(positions[j*3], positions[j*3+1], positions[j*3+2]);
                const dist = v1.distanceTo(v2);

                if (dist < maxDistance) {
                    linePositions.push(v1.x, v1.y, v1.z);
                    linePositions.push(v2.x, v2.y, v2.z);
                    connections++;
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // Add subtle lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.0002;
        
        // Gentle rotation
        particles.rotation.y = time;
        particles.rotation.x = time * 0.5;
        lines.rotation.y = time;
        lines.rotation.x = time * 0.5;

        // Subtle breathing effect
        const s = 1 + Math.sin(time * 5) * 0.05;
        particles.scale.set(s, s, s);
        lines.scale.set(s, s, s);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener('resize', onWindowResize);
    
    // Start after a small delay to ensure container size is correct
    setTimeout(init, 100);
})();
