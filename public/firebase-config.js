/**
 * firebase-config.js
 * ─────────────────────────────────────────────────────
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project → Build → Realtime Database → Test mode
 * 3. Project Settings → Web app → copy config below
 * ─────────────────────────────────────────────────────
 */

const firebaseConfig = {
    databaseURL: "https://movie-brain-23245-default-rtdb.firebaseio.com",
    projectId: "movie-brain-23245"
};

// ── Init ──────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

// Quick connectivity check (fires once on load)
window.db.ref('.info/connected').on('value', snap => {
    window._firebaseReady = snap.val() === true;
});
