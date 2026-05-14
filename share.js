/**
 * share.js — Phase 2: Shared Brains
 * Handles: export brain → Firebase, shareable link, read-only viewer
 */

// ── State ─────────────────────────────────────────────────────────────────────
let shareModal  = null;
let isViewMode  = false;   // true when viewing someone else's brain

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    shareModal = document.getElementById('share-modal');
    initShareBtn();
    initShareModal();
    checkViewerMode();   // detect ?brain=KEY in URL
});

// ── Share button in header ────────────────────────────────────────────────────
function initShareBtn() {
    document.getElementById('share-brain-btn')
        .addEventListener('click', openShareModal);
}

// ── Modal open / close ────────────────────────────────────────────────────────
function openShareModal() {
    shareModal.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        shareModal.classList.add('modal-open');
    }));
    // Reset to default state
    setShareModalState('idle');
}

function closeShareModal() {
    shareModal.classList.remove('modal-open');
    setTimeout(() => shareModal.classList.add('hidden'), 250);
}

function initShareModal() {
    // Close button
    document.getElementById('share-modal-close')
        .addEventListener('click', closeShareModal);
    // Click outside backdrop
    shareModal.addEventListener('click', e => {
        if (e.target === shareModal) closeShareModal();
    });
    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !shareModal.classList.contains('hidden')) closeShareModal();
    });
    // Generate link button
    document.getElementById('generate-link-btn')
        .addEventListener('click', generateShareLink);
    // Copy link button (wired after link is shown)
    document.getElementById('copy-link-btn')
        .addEventListener('click', copyShareLink);
}

// ── Generate & upload brain to Firebase ───────────────────────────────────────
async function generateShareLink() {
    const content = (typeof watchedContent !== 'undefined') ? watchedContent : [];

    if (content.length === 0) {
        showShareError('Add some movies or shows to your brain first.');
        return;
    }

    // Check Firebase is configured
    if (!window.db || typeof window.db.ref !== 'function') {
        showShareError('Firebase not configured yet. Paste your credentials in firebase-config.js.');
        return;
    }

    setShareModalState('loading');

    try {
        // Slim down the payload — only what we need for viewing / comparing
        const payload = {
            createdAt: Date.now(),
            movies: content.map(c => ({
                id:         c.id,
                title:      c.title,
                type:       c.type,
                year:       c.year,
                genres:     c.genres,
                rating:     c.rating,
                posterPath: c.posterPath,
                overview:   c.overview,
                dateAdded:  c.dateAdded || null
            }))
        };

        const ref  = await db.ref('brains').push(payload);
        const key  = ref.key;
        const url  = buildShareUrl(key);

        setShareModalState('done', { url, key });

    } catch (err) {
        console.error('Firebase write error:', err);
        showShareError('Could not save. Check your Firebase database rules (must be in test mode).');
    }
}

function buildShareUrl(key) {
    const base = window.location.href.split('?')[0];
    return `${base}?brain=${key}`;
}

// ── Copy link ─────────────────────────────────────────────────────────────────
function copyShareLink() {
    const input = document.getElementById('share-link-input');
    const btn   = document.getElementById('copy-link-btn');

    // execCommand fallback (works on http://localhost)
    input.select();
    input.setSelectionRange(0, 99999);
    const ok = document.execCommand('copy');

    if (ok) {
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2200);
    }
}

// ── Modal state machine ───────────────────────────────────────────────────────
function setShareModalState(state, data = {}) {
    const idle    = document.getElementById('share-idle');
    const loading = document.getElementById('share-loading');
    const done    = document.getElementById('share-done');
    const errEl   = document.getElementById('share-error');

    [idle, loading, done, errEl].forEach(el => el?.classList.add('hidden'));

    if (state === 'idle')    idle.classList.remove('hidden');
    if (state === 'loading') loading.classList.remove('hidden');
    if (state === 'done') {
        done.classList.remove('hidden');
        const input = document.getElementById('share-link-input');
        input.value = data.url;
        // QR code via free API
        const qrImg = document.getElementById('share-qr');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0a0a0a&color=ffffff&data=${encodeURIComponent(data.url)}`;
    }
    if (state === 'error') errEl.classList.remove('hidden');
}

function showShareError(msg) {
    const errEl = document.getElementById('share-error');
    errEl.querySelector('.share-error-msg').textContent = msg;
    setShareModalState('error');
}

// ── Read-only viewer mode (detect ?brain=KEY) ─────────────────────────────────
async function checkViewerMode() {
    const params = new URLSearchParams(window.location.search);
    const key    = params.get('brain');
    if (!key) return;

    // Wait briefly for Firebase to init
    await new Promise(r => setTimeout(r, 800));

    if (!window.db) {
        console.warn('Firebase not configured — cannot load shared brain.');
        return;
    }

    try {
        const snap    = await db.ref(`brains/${key}`).once('value');
        const payload = snap.val();

        if (!payload) {
            showViewerBanner('This brain link has expired or does not exist.', true);
            return;
        }

        // Load movies into the scene as view-only nodes
        isViewMode = true;
        showViewerBanner(`Viewing a shared brain — ${payload.movies.length} titles`, false);

        // Replace watchedContent with the friend's data and rebuild scene
        if (typeof watchedContent !== 'undefined') {
            watchedContent = payload.movies;
            // Rebuild the 3D scene
            if (typeof loadFromLocalStorage === 'function') {
                payload.movies.forEach(c => {
                    if (typeof addNodeToScene === 'function') addNodeToScene(c);
                });
                if (typeof updateStats      === 'function') updateStats();
                if (typeof updateConnections === 'function') updateConnections();
            }
        }

    } catch (err) {
        console.error('Error loading shared brain:', err);
    }
}

function showViewerBanner(msg, isError) {
    const banner = document.getElementById('viewer-banner');
    if (!banner) return;
    banner.querySelector('.viewer-msg').textContent = msg;
    banner.classList.toggle('viewer-banner-error', isError);
    banner.classList.remove('hidden');
}
