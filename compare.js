/**
 * compare.js — Phase 2: Compare Brains
 * Loads a friend's brain, calculates compatibility, and merges nodes in 3D
 */

let compareModal = null;
let theirContent = [];
let compareMode  = false;

document.addEventListener('DOMContentLoaded', () => {
    compareModal = document.getElementById('compare-modal');
    initCompareBtn();
    initCompareModal();
});

function initCompareBtn() {
    const btn = document.getElementById('compare-brain-btn');
    if (btn) btn.addEventListener('click', openCompareModal);
}

function openCompareModal() {
    compareModal.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        compareModal.classList.add('modal-open');
    }));
    setCompareModalState('idle');
}

function closeCompareModal() {
    compareModal.classList.remove('modal-open');
    setTimeout(() => compareModal.classList.add('hidden'), 250);
}

function initCompareModal() {
    document.getElementById('compare-modal-close').addEventListener('click', closeCompareModal);
    compareModal.addEventListener('click', e => {
        if (e.target === compareModal) closeCompareModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !compareModal.classList.contains('hidden')) closeCompareModal();
    });
    document.getElementById('load-compare-btn').addEventListener('click', loadFriendBrain);
}

function setCompareModalState(state, errorMsg = '') {
    const idle    = document.getElementById('compare-idle');
    const loading = document.getElementById('compare-loading');
    const errEl   = document.getElementById('compare-error');

    [idle, loading, errEl].forEach(el => el?.classList.add('hidden'));

    if (state === 'idle')    idle.classList.remove('hidden');
    if (state === 'loading') loading.classList.remove('hidden');
    if (state === 'error') {
        errEl.classList.remove('hidden');
        errEl.querySelector('.compare-error-msg').textContent = errorMsg;
    }
}

async function loadFriendBrain() {
    const input = document.getElementById('compare-link-input').value.trim();
    if (!input) return;

    // Extract key from URL or just use raw key
    let key = input;
    if (input.includes('?brain=')) {
        key = input.split('?brain=')[1].split('&')[0];
    }

    if (!window.db) {
        setCompareModalState('error', 'Firebase not configured. Please add config first.');
        return;
    }

    setCompareModalState('loading');

    try {
        const snap = await db.ref(`brains/${key}`).once('value');
        const payload = snap.val();

        if (!payload || !payload.movies) {
            setCompareModalState('error', 'Brain not found or link has expired.');
            return;
        }

        theirContent = payload.movies;
        closeCompareModal();
        enterCompareMode();

    } catch (err) {
        console.error(err);
        setCompareModalState('error', 'Failed to load brain. Please check the link.');
    }
}

function enterCompareMode() {
    compareMode = true;
    const myContent = (typeof watchedContent !== 'undefined') ? watchedContent : [];

    // Calculate overlap
    const myIds = new Set(myContent.map(m => m.id));
    const theirIds = new Set(theirContent.map(m => m.id));

    const both = [];
    const onlyMe = [];
    const onlyThem = [];

    myContent.forEach(m => {
        if (theirIds.has(m.id)) both.push(m);
        else onlyMe.push(m);
    });

    theirContent.forEach(m => {
        if (!myIds.has(m.id)) onlyThem.push(m);
    });

    // Compute Compatibility
    const overlapScore = both.length / Math.max(1, Math.min(myContent.length, theirContent.length));
    
    // Shared Genres
    const myGenres = {}; myContent.forEach(m => m.genres.forEach(g => myGenres[g] = (myGenres[g]||0)+1));
    const theirGenres = {}; theirContent.forEach(m => m.genres.forEach(g => theirGenres[g] = (theirGenres[g]||0)+1));
    
    let sharedGenreCount = 0;
    let totalGenreWeight = 0;
    for (const g in myGenres) {
        if (theirGenres[g]) {
            sharedGenreCount += Math.min(myGenres[g], theirGenres[g]);
        }
        totalGenreWeight += myGenres[g];
    }
    const genreScore = sharedGenreCount / Math.max(1, totalGenreWeight);

    const compatibilityPct = Math.round((overlapScore * 0.6 + genreScore * 0.4) * 100);

    // Recommendations Exchange
    // Theirs I might like (highly rated, matches my genres)
    const topTheirs = onlyThem.sort((a, b) => b.rating - a.rating).slice(0, 3);
    const topMine = onlyMe.sort((a, b) => b.rating - a.rating).slice(0, 3);

    // Render Dashboard
    renderCompareDashboard({
        bothCount: both.length,
        onlyMeCount: onlyMe.length,
        onlyThemCount: onlyThem.length,
        compatibilityPct,
        topTheirs,
        topMine
    });

    // Update 3D Scene
    if (typeof rebuildSceneForCompare === 'function') {
        rebuildSceneForCompare(onlyMe, onlyThem, both);
    }
}

function renderCompareDashboard(stats) {
    const dashboard = document.getElementById('compare-dashboard');
    if (!dashboard) return;

    document.getElementById('compat-score').textContent = stats.compatibilityPct + '%';
    document.getElementById('compat-bar-fill').style.width = stats.compatibilityPct + '%';
    
    document.getElementById('legend-both').textContent = stats.bothCount;
    document.getElementById('legend-me').textContent = stats.onlyMeCount;
    document.getElementById('legend-them').textContent = stats.onlyThemCount;

    const theirsList = document.getElementById('recs-for-me');
    theirsList.innerHTML = stats.topTheirs.map(m => `<div class="rec-tiny-item">${m.title}</div>`).join('');
    
    const mineList = document.getElementById('recs-for-them');
    mineList.innerHTML = stats.topMine.map(m => `<div class="rec-tiny-item">${m.title}</div>`).join('');

    dashboard.classList.remove('hidden');
    requestAnimationFrame(() => dashboard.classList.add('open'));
}

function exitCompareMode() {
    compareMode = false;
    theirContent = [];
    const dashboard = document.getElementById('compare-dashboard');
    if (dashboard) {
        dashboard.classList.remove('open');
        setTimeout(() => dashboard.classList.add('hidden'), 300);
    }

    // Rebuild standard scene
    if (typeof rebuildSceneFromStorage === 'function') {
        rebuildSceneFromStorage();
    }
}
