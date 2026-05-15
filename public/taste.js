/**
 * taste.js — AI-Powered Taste Profile
 * Uses Anthropic Claude API (claude-3-5-haiku) directly from the browser.
 * The user's API key is stored only in localStorage.
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const MIN_CONTENT     = 5;  // min items before analysis
const PROFILE_KEY     = 'movieBrainProfile';  // localStorage key for persisted profile

// ── State ─────────────────────────────────────────────────────────────────────
let chatHistory = [];   // [{role, content}]
let profileContext = ''; // built after generation, reused in chat
let currentProfileKey = PROFILE_KEY; // dynamic key based on user session

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDrawer();
    initGenerateBtn();
    initChat();
});

// ── Drawer open / close ───────────────────────────────────────────────────────
function initDrawer() {
    const openBtn   = document.getElementById('open-taste-profile');
    const closeBtn  = document.getElementById('close-taste');
    const drawer    = document.getElementById('taste-drawer');
    const backdrop  = document.getElementById('taste-backdrop');

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDrawer();
    });
}

async function openDrawer() {
    const drawer   = document.getElementById('taste-drawer');
    const backdrop = document.getElementById('taste-backdrop');

    drawer.classList.remove('hidden');
    backdrop.classList.remove('hidden');

    requestAnimationFrame(() => requestAnimationFrame(() => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
    }));

    currentProfileKey = await getProfileKey();
    refreshDrawerState();
    await restoreProfile(); // ← load last saved profile if available
}

function closeDrawer() {
    const drawer   = document.getElementById('taste-drawer');
    const backdrop = document.getElementById('taste-backdrop');

    drawer.classList.remove('open');
    backdrop.classList.remove('open');

    // Wait for transition then hide
    setTimeout(() => {
        drawer.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 300);
}

function refreshDrawerState() {
    const count       = getWatchedCount();
    const notEnough   = document.getElementById('not-enough-banner');
    const generateBtn = document.getElementById('generate-profile-btn');
    const staleBanner = document.getElementById('stale-profile-banner');
    const keyBanner   = document.getElementById('api-key-banner'); // hidden permanently

    if (keyBanner) keyBanner.classList.add('hidden');
    notEnough.classList.add('hidden');
    generateBtn.classList.add('hidden');
    if (staleBanner) staleBanner.classList.add('hidden');

    if (count < MIN_CONTENT) { notEnough.classList.remove('hidden'); return; }

    generateBtn.classList.remove('hidden');

    // Show stale nudge if 5+ movies added since last analysis
    try {
        const meta = JSON.parse(localStorage.getItem(currentProfileKey + '_meta') || '{}');
        if (meta.count && count >= meta.count + 5 && staleBanner) {
            staleBanner.querySelector('.stale-count').textContent = count - meta.count;
            staleBanner.classList.remove('hidden');
        }
    } catch (e) {}
}

// (API Key UI removed since we use backend endpoints now)

// ── Get watched content (from app.js global) ──────────────────────────────────
function getWatchedContent() {
    // watchedContent is a global defined in app.js
    return (typeof watchedContent !== 'undefined') ? watchedContent : [];
}

function getWatchedCount() {
    return getWatchedContent().length;
}

// ── Build a compact watched-list string for the prompt ────────────────────────
function buildWatchedSummary() {
    const list = getWatchedContent();
    return list.map(c => {
        const month = c.dateAdded
            ? new Date(c.dateAdded).toLocaleString('en-US', { month: 'long', year: 'numeric' })
            : 'Unknown';
        return `- ${c.title} (${c.year}, ${c.type === 'movie' ? 'Movie' : 'TV Show'}) | Genres: ${c.genres.join(', ')} | Rating: ${c.rating?.toFixed(1) ?? 'N/A'} | Added: ${month}`;
    }).join('\n');
}

// ── Restore last saved profile on drawer open ─────────────────────────────────
async function restoreProfile() {
    const saved = localStorage.getItem(currentProfileKey);
    if (!saved) return;

    // Only restore if sections are empty (fresh open, not after Re-analyze)
    const sections = document.getElementById('profile-sections');
    if (sections.children.length > 0) return;

    try {
        const parsed = JSON.parse(saved);
        renderProfile(parsed);
        profileContext = `The user's taste profile (restored):\n${JSON.stringify(parsed, null, 2)}`;
        chatHistory = [];
        initChatSection();
    } catch (e) {
        // silently skip corrupt data
    }
}

async function getProfileKey() {
    if (!window.supabaseClient) return PROFILE_KEY;
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
            return `${PROFILE_KEY}_${session.user.id}`;
        }
    } catch (e) {}
    return PROFILE_KEY;
}

// ── Generate profile ─────────────────────────────────────────────────────────
function initGenerateBtn() {
    document.getElementById('generate-profile-btn').addEventListener('click', generateProfile);
}

async function generateProfile() {
    const btn = document.getElementById('generate-profile-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Analyzing…`;

    const sections = document.getElementById('profile-sections');
    sections.innerHTML = '';

    try {
        const watched  = buildWatchedSummary();
        const count    = getWatchedCount();

        const systemPrompt = `You are a cinephile AI assistant analyzing a user's film and TV taste.
Be insightful, specific, and playful — like a knowledgeable friend, not a robot.
Always reference specific titles from their list to back up your claims.
Return ONLY valid JSON in this exact shape, no markdown fences:
{
  "archetype": "A short punchy 2-4 word label like 'The Dark Realist' or 'The World Traveler' or 'The Cerebral Escapist'",
  "personality": "2-3 sentence personality profile using their actual watched titles",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "seasonal_insight": "One insight about WHEN they watch (e.g. 'You added most of your thrillers in winter months') — use the 'Added:' dates in the list. If all dates are similar, note what that says about their habits instead.",
  "blind_spots": [
    {"genre": "genre name", "description": "why they'd like it", "recommendations": ["Title 1", "Title 2", "Title 3"]},
    {"genre": "genre name", "description": "why they'd like it", "recommendations": ["Title 1", "Title 2", "Title 3"]}
  ],
  "fun_stat": "One surprising/funny data point (e.g. '70% of your picks are set in cities')"
}`;

        const userPrompt = `Here is my watched list (${count} titles):\n${watched}\n\nGive me my taste profile.`;

        const raw = await callGemini(systemPrompt + '\n\n' + userPrompt, true);

        let parsed;
        try {
            // Extract just the JSON object from the response (ignores any conversational prefix)
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
            
            const cleaned = raw.substring(firstBrace, lastBrace + 1);
            parsed = JSON.parse(cleaned);
        } catch (e) {
            console.error('JSON Parse Error. Raw response:', raw);
            throw new Error('AI returned an unexpected format. Please try again.');
        }

        renderProfile(parsed);
        // Persist profile + movie count at time of analysis
        localStorage.setItem(currentProfileKey, JSON.stringify(parsed));
        localStorage.setItem(currentProfileKey + '_meta', JSON.stringify({ count, ts: Date.now() }));

        profileContext = `The user's watched list:\n${watched}\n\nTheir taste profile:\n${JSON.stringify(parsed, null, 2)}`;
        chatHistory = [];
        initChatSection();

    } catch (err) {
        sections.innerHTML = `<div class="profile-error">${err.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Re-analyze`;
    }
}

// ── Render profile cards ──────────────────────────────────────────────────────
function renderProfile(data) {
    const sections = document.getElementById('profile-sections');

    const archetypeHtml = data.archetype ? `
        <div class="archetype-hero" id="card-archetype">
            <div class="archetype-label">Your Archetype</div>
            <div class="archetype-name">${escHtml(data.archetype)}</div>
            <div class="archetype-actions">
                <button class="share-btn" id="share-profile-btn" title="Copy to clipboard">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Copy
                </button>
                <button class="share-btn download-btn" id="download-profile-btn" title="Download as image">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                </button>
            </div>
        </div>` : '';

    const seasonalHtml = data.seasonal_insight ? `
        <div class="profile-card profile-card-season" id="card-seasonal">
            <div class="profile-card-label">Viewing Habits</div>
            <p class="profile-card-body">${escHtml(data.seasonal_insight)}</p>
        </div>` : '';

    sections.innerHTML = `
        ${archetypeHtml}

        <!-- Personality -->
        <div class="profile-card" id="card-personality">
            <div class="profile-card-label">Your Personality</div>
            <p class="profile-card-body">${escHtml(data.personality)}</p>
        </div>

        ${seasonalHtml}

        <!-- Fun stat -->
        <div class="profile-card profile-card-accent" id="card-stat">
            <div class="profile-card-label">Fun Stat</div>
            <p class="profile-card-body">${escHtml(data.fun_stat)}</p>
        </div>

        <!-- Hidden Patterns -->
        <div class="profile-card" id="card-patterns">
            <div class="profile-card-label">Hidden Patterns</div>
            <ul class="pattern-list">
                ${data.patterns.map(p => `<li>${escHtml(p)}</li>`).join('')}
            </ul>
        </div>

        <!-- Blind Spots -->
        <div class="profile-card" id="card-blindspots">
            <div class="profile-card-label">Blind Spots</div>
            ${data.blind_spots.map(bs => `
                <div class="blind-spot-item">
                    <div class="blind-spot-genre">${escHtml(bs.genre)}</div>
                    <p class="blind-spot-desc">${escHtml(bs.description)}</p>
                    <div class="blind-spot-recs">
                        ${bs.recommendations.map(r => `<span class="rec-pill">${escHtml(r)}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Wire share + download buttons
    const shareBtn = document.getElementById('share-profile-btn');
    if (shareBtn) shareBtn.addEventListener('click', () => shareProfile(data));
    const dlBtn = document.getElementById('download-profile-btn');
    if (dlBtn) dlBtn.addEventListener('click', () => downloadProfileImage(data));

    // Animate cards in
    sections.querySelectorAll('.profile-card, .archetype-hero').forEach((card, i) => {
        card.style.animationDelay = `${i * 80}ms`;
        card.classList.add('card-enter');
    });
}

// ── Share profile as plain text (copy to clipboard) ───────────────────────────
function shareProfile(data) {
    const lines = [
        `My Movie Brain Archetype: ${data.archetype || 'Film Enthusiast'}`,
        ``,
        data.personality,
        ``,
        `Hidden Patterns:`,
        ...data.patterns.map(p => `  • ${p}`),
        ``,
        `Fun Stat: ${data.fun_stat}`,
        ``,
        data.seasonal_insight ? `Viewing Habits: ${data.seasonal_insight}\n` : ``,
        data.blind_spots && data.blind_spots.length > 0 ? `Blind Spots:\n${data.blind_spots.map(bs => `  • ${bs.genre}: ${bs.description}\n    Try: ${bs.recommendations.join(', ')}`).join('\n')}\n` : ``,
        `Generated by Movie Brain`
    ];
    const text = lines.join('\n');

    // Bulletproof copy — works on http://localhost without any permissions
    function doCopy() {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(el);
        return ok;
    }

    const btn = document.getElementById('share-profile-btn');

    // Try modern API first, fall back to execCommand
    const copied = (navigator.clipboard && window.isSecureContext)
        ? navigator.clipboard.writeText(text).then(() => true).catch(() => doCopy())
        : Promise.resolve(doCopy());

    copied.then(success => {
        if (!btn) return;
        if (success) {
            const prev = btn.innerHTML;
            btn.textContent = '\u2713 Copied!';
            btn.style.background = 'rgba(0,0,0,0.25)';
            setTimeout(() => {
                btn.innerHTML = prev;
                btn.style.background = '';
            }, 2200);
        } else {
            prompt('Copy your taste profile:', text);
        }
    });
}

// ── Download profile as a canvas image ─────────────────────────────
function downloadProfileImage(data) {
    const btn = document.getElementById('download-profile-btn');
    if (btn) { btn.textContent = 'Drawing…'; btn.disabled = true; }

    const W = 640;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Pass 1: Measure height
    const mCtx = document.createElement('canvas').getContext('2d');
    let y = 0;
    
    // Archetype
    mCtx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
    const archLines = wrapText(mCtx, data.archetype || 'Film Enthusiast', W - 88);
    y = 158 + (archLines.length * 62);
    
    // Personality
    mCtx.font = '400 15px -apple-system, BlinkMacSystemFont, sans-serif';
    const persLines = wrapText(mCtx, data.personality || '', W - 88);
    y += (persLines.length * 24) + 28;
    
    // Divider
    y += 26;
    
    // Patterns Label
    y += 20;
    
    // Patterns
    mCtx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    const patternLinesList = (data.patterns || []).slice(0, 3).map(p => wrapText(mCtx, p, W - 110));
    patternLinesList.forEach(pLines => {
        y += 28 + ((pLines.length - 1) * 20);
    });
    y += 32;
    
    // Fun Stat
    mCtx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    const statLines = wrapText(mCtx, data.fun_stat || '', W - 136);
    const statBoxHeight = 44 + (statLines.length * 20) + 20;
    y += statBoxHeight;
    
    // Seasonal
    let seasonalLines = [];
    if (data.seasonal_insight) {
        y += 32 + 20;
        mCtx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
        seasonalLines = wrapText(mCtx, data.seasonal_insight, W - 88);
        y += seasonalLines.length * 20;
    }

    // Blind Spots
    let bsList = [];
    if (data.blind_spots && data.blind_spots.length > 0) {
        y += 32 + 24;
        bsList = data.blind_spots.slice(0, 2).map(bs => {
            mCtx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
            return {
                ...bs,
                bsLines: wrapText(mCtx, bs.description, W - 88)
            };
        });
        bsList.forEach(bs => {
            y += 20 + (bs.bsLines.length * 20) + 28;
        });
    }

    y += 80; // Footer margin

    const H = Math.max(860, y); // Dynamic height

    // Pass 2: Draw
    const canvas = document.createElement('canvas');
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // ─ Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Subtle top-left glow
    const glow = ctx.createRadialGradient(80, 80, 0, 80, 80, 280);
    glow.addColorStop(0, 'rgba(255,255,255,0.06)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ─ Border
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    roundRect(ctx, 20, 20, W - 40, H - 40, 20);
    ctx.stroke();

    // ─ Branding
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.letterSpacing = '2px';
    ctx.fillText('MOVIE BRAIN', 44, 58);
    ctx.letterSpacing = '0px';

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(44, 68); ctx.lineTo(W - 44, 68); ctx.stroke();

    // ─ Archetype label
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('YOUR ARCHETYPE', 44, 106);

    // ─ Archetype name (big)
    ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    archLines.forEach((line, i) => {
        ctx.fillText(line, 44, 158 + i * 62);
    });

    let drawY = 158 + (archLines.length > 0 ? (archLines.length - 1) * 62 : 0) + 42;

    // ─ Personality
    ctx.font = '400 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    persLines.forEach(line => { ctx.fillText(line, 44, drawY += 24); });
    drawY += 28;

    // ─ Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(44, drawY); ctx.lineTo(W - 44, drawY); ctx.stroke();
    drawY += 26;

    // ─ Patterns label
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('HIDDEN PATTERNS', 44, drawY);
    drawY += 20;

    ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    patternLinesList.forEach(pLines => {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        drawY += 28;
        ctx.fillText('\u2014', 44, drawY);
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        pLines.forEach((line, i) => {
            if (i > 0) drawY += 20;
            ctx.fillText(line, 64, drawY);
        });
    });
    drawY += 32;

    // ─ Fun stat box
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, 44, drawY, W - 88, statBoxHeight, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    roundRect(ctx, 44, drawY, W - 88, statBoxHeight, 10);
    ctx.stroke();
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('FUN STAT', 62, drawY + 20);
    ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    statLines.forEach((line, i) => {
        ctx.fillText(line, 62, drawY + 44 + (i * 20));
    });
    drawY += statBoxHeight;

    if (data.seasonal_insight) {
        drawY += 32;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.moveTo(44, drawY); ctx.lineTo(W - 44, drawY); ctx.stroke();
        drawY += 26;

        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('VIEWING HABITS', 44, drawY);
        drawY += 20;

        ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.80)';
        seasonalLines.forEach((line, i) => {
            ctx.fillText(line, 44, drawY + (i * 20));
        });
        drawY += seasonalLines.length * 20;
    }

    if (bsList.length > 0) {
        drawY += 24;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.moveTo(44, drawY); ctx.lineTo(W - 44, drawY); ctx.stroke();
        drawY += 26;

        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('BLIND SPOTS', 44, drawY);
        drawY += 24;

        bsList.forEach(bs => {
            ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(bs.genre, 44, drawY);
            drawY += 20;

            ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            bs.bsLines.forEach((line, i) => {
                ctx.fillText(line, 44, drawY + (i * 20));
            });
            drawY += bs.bsLines.length * 20;
            
            ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = '#10b981';
            ctx.fillText("Recs: " + bs.recommendations.join(', '), 44, drawY + 12);
            drawY += 28;
        });
    }

    // ─ Footer
    ctx.font = '400 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    ctx.fillText(`moviebrain.app  \u00b7  ${date}`, 44, H - 38);

    // Trigger download
    setTimeout(() => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `movie-brain-${(data.archetype || 'profile').toLowerCase().replace(/\s+/g, '-')}.png`;
            a.click();
            URL.revokeObjectURL(url);
            if (btn) { btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download'; btn.disabled = false; }
        }, 'image/png');
    }, 50);
}

// Helper: draw rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Helper: wrap text to fit maxWidth, return array of lines
function wrapText(ctx, text, maxWidth, maxLines = 99) {
    const words = String(text).split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
            if (lines.length >= maxLines) break;
        } else {
            line = test;
        }
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
function initChat() {
    const sendBtn  = document.getElementById('chat-send');
    const input    = document.getElementById('chat-input');

    sendBtn.addEventListener('click', sendChat);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChat();
        }
    });
}

function initChatSection() {
    const chatSection = document.getElementById('chat-section');
    chatSection.classList.remove('hidden');

    // Seed with starter questions
    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '';

    const starters = [
        'Why do I gravitate toward these genres?',
        'What does my list say about my personality?',
        'What should I watch next based on my taste?',
        'What am I missing from my list?'
    ];

    const starterHtml = `
        <div class="chat-starters">
            ${starters.map(s => `<button class="starter-pill" data-q="${escHtml(s)}">${escHtml(s)}</button>`).join('')}
        </div>`;
    messages.insertAdjacentHTML('beforeend', starterHtml);

    messages.querySelectorAll('.starter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('chat-input').value = btn.dataset.q;
            sendChat();
            btn.closest('.chat-starters')?.remove();
        });
    });
}

async function sendChat() {
    const input    = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const userMsg  = input.value.trim();
    if (!userMsg) return;

    input.value = '';

    // Render user bubble
    appendChatBubble('user', userMsg);
    chatHistory.push({ role: 'user', content: userMsg });

    // Typing indicator
    const typingId = 'typing-' + Date.now();
    messages.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="chat-bubble assistant typing">
            <span></span><span></span><span></span>
        </div>`);
    messages.scrollTop = messages.scrollHeight;

    try {
        const systemPrompt = `You are a friendly cinephile AI. You have deep knowledge of the user's watched list and taste profile:

${profileContext}

Answer their questions in a warm, specific, insightful way. Reference actual titles they've watched. Keep responses concise — 2-4 sentences unless they ask for a list.`;

        // Build conversation history as plain text context
        const historyText = chatHistory.slice(0, -1)
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');
        const fullPrompt = systemPrompt + (historyText ? '\n\nConversation so far:\n' + historyText : '') + '\n\nUser: ' + userMsg;
        const reply = await callGemini(fullPrompt, false);

        document.getElementById(typingId)?.remove();
        appendChatBubble('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
        document.getElementById(typingId)?.remove();
        appendChatBubble('assistant', `Sorry, something went wrong: ${err.message}`);
    }

    messages.scrollTop = messages.scrollHeight;
}

function appendChatBubble(role, text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ── Backend API call ───────────────────────────────────────────────
async function callGemini(fullPrompt, isJson = false) {
    const endpoint = isJson ? '/api/ai/profile' : '/api/ai/chat';
    
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.text;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
