/**
 * timeline-view.js — Phase 3: Timeline View
 * Organizes nodes horizontally by Release Year, and vertically by Rating.
 */

function applyTimelineView() {
    if (nodes.length === 0) return;

    const timelineWidth = 90; // Spread across 90 units
    const startX = -timelineWidth / 2;
    const totalNodes = nodes.length;

    nodes.forEach((node, index) => {
        const rating = parseFloat(node.content.rating) || 5;

        // X-Axis = Time added to brain (represented by insertion index)
        const normalizedX = totalNodes > 1 ? index / (totalNodes - 1) : 0.5;
        const x = startX + (normalizedX * timelineWidth);

        // Y-Axis = Rating (mapping 0-10 to roughly -15 to +15)
        const y = (rating - 5) * 3 + (Math.random() - 0.5) * 2; // slight jitter

        // Z-Axis = Flat with slight depth variance
        const z = (Math.random() - 0.5) * 6;

        node.targetPosition.set(x, y, z);
    });

    // 2. Setup Scrubber UI
    setupTimelineScrubber(0, totalNodes - 1);
}

let scrubInterval = null;

function setupTimelineScrubber(minIdx, maxIdx) {
    const ui = document.getElementById('timeline-ui');
    const slider = document.getElementById('timeline-slider');
    const display = document.getElementById('timeline-year-display');
    const playBtn = document.getElementById('timeline-play-btn');

    slider.min = minIdx;
    slider.max = maxIdx;
    slider.value = maxIdx;

    ui.classList.remove('hidden');
    requestAnimationFrame(() => ui.classList.add('active'));

    const updateScrub = () => {
        const currentIdx = parseInt(slider.value);
        
        // Update display text
        if (nodes[currentIdx]) {
            const added = nodes[currentIdx].content.dateAdded;
            if (added) {
                const d = new Date(added);
                display.textContent = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } else {
                display.textContent = 'Movie #' + (currentIdx + 1);
            }
        }

        nodes.forEach((node, idx) => {
            // Scale to 0 if the movie was added AFTER the scrubber index
            if (idx > currentIdx) {
                node.baseScale = 0.001; // nearly invisible
            } else {
                node.baseScale = node.userData.originalScale || 1.0;
            }
        });
    };

    slider.addEventListener('input', updateScrub);
    updateScrub(); // initial set

    // Playback loop
    playBtn.onclick = () => {
        if (scrubInterval) {
            clearInterval(scrubInterval);
            scrubInterval = null;
            playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        } else {
            if (slider.value == maxIdx) slider.value = minIdx;
            playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            scrubInterval = setInterval(() => {
                let v = parseInt(slider.value) + 1;
                if (v > maxIdx) {
                    clearInterval(scrubInterval);
                    scrubInterval = null;
                    playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                } else {
                    slider.value = v;
                    updateScrub();
                }
            }, 300); // Faster playback for index-based (300ms per movie)
        }
    };
}
