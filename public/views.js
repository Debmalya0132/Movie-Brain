/**
 * views.js — Phase 3: Multi-View System
 * Handles switching between different layout strategies (Brain, Galaxy, Timeline, Constellation)
 */

const VIEWS = {
    BRAIN: 'brain',
    GALAXY: 'galaxy',
    TIMELINE: 'timeline',
    CONSTELLATION: 'constellation'
};

window.currentView = VIEWS.BRAIN;

function initViewSwitcher() {
    console.log("🚀 initViewSwitcher running!");
    const buttons = document.querySelectorAll('.view-tab');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view === window.currentView) return;
            
            buttons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchView(view);
        });
    });
}

function switchView(viewName) {
    window.currentView = viewName;
    
    // 1. Clear view-specific geometry & UI
    clearViewSpecifics();

    // 2. Apply new layout targets
    if (viewName === VIEWS.BRAIN) {
        nodes.forEach((node, index) => {
            const pos = calculateNodePosition(node.content, index, nodes.length);
            node.targetPosition.set(pos.x, pos.y, pos.z);
        });
        updateConnections(); // Re-draw neural links
    } 
    else if (viewName === VIEWS.GALAXY) {
        if (typeof applyGalaxyView === 'function') applyGalaxyView();
    }
    else if (viewName === VIEWS.TIMELINE) {
        if (typeof applyTimelineView === 'function') applyTimelineView();
    }
    else if (viewName === VIEWS.CONSTELLATION) {
        if (typeof applyConstellationView === 'function') applyConstellationView();
    }
}

function clearViewSpecifics() {
    // Hide neural connections
    connections.forEach(conn => scene.remove(conn.line));
    connections = [];
    
    // Clear galaxy planets/orbits
    if (window.galaxyElements) {
        window.galaxyElements.forEach(el => scene.remove(el));
        window.galaxyElements = [];
    }
    
    // Clear constellation lines
    if (window.constellationLines) {
        window.constellationLines.forEach(c => scene.remove(c.line));
        window.constellationLines = [];
    }

    // Hide any view-specific DOM elements (e.g. timeline scrubber)
    document.querySelectorAll('.view-ui-panel').forEach(el => {
        el.classList.remove('active');
        setTimeout(() => {
            if (!el.classList.contains('active')) {
                el.classList.add('hidden');
            }
        }, 300);
    });

    // Stop timeline playback if active
    if (typeof scrubInterval !== 'undefined' && scrubInterval !== null) {
        clearInterval(scrubInterval);
        scrubInterval = null;
    }

    // Reset all node scales
    nodes.forEach(node => {
        node.baseScale = node.userData?.originalScale || 1.0;
    });
}

document.addEventListener('DOMContentLoaded', initViewSwitcher);
console.log("views.js parsed!");
