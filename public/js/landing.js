document.addEventListener('DOMContentLoaded', () => {
    // ── Elements ──
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const heroSignupBtn = document.getElementById('hero-signup-btn');
    
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth');
    
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const authError = document.getElementById('auth-error');
    
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchLink = document.getElementById('auth-switch-link');
    
    let isSignupMode = false;

    // ── Check if already logged in ──
    checkUserSession();

    // ── Modal Handlers ──
    function openModal(signup = false) {
        isSignupMode = signup;
        updateModalUI();
        authModal.classList.remove('hidden');
        // small delay for transition
        requestAnimationFrame(() => requestAnimationFrame(() => {
            authModal.classList.add('open');
        }));
    }

    function closeModal() {
        authModal.classList.remove('open');
        setTimeout(() => authModal.classList.add('hidden'), 300);
        authForm.reset();
        authError.classList.add('hidden');
    }

    function updateModalUI() {
        if (isSignupMode) {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join Movie Brain to save your neural network.';
            authSubmit.textContent = 'Sign Up';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchLink.textContent = 'Log In';
        } else {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Enter your details to access your brain.';
            authSubmit.textContent = 'Log In';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchLink.textContent = 'Sign Up';
        }
        authError.classList.add('hidden');
    }

    // ── Event Listeners ──
    loginBtn.addEventListener('click', () => openModal(false));
    signupBtn.addEventListener('click', () => openModal(true));
    heroSignupBtn.addEventListener('click', () => openModal(true));
    closeAuthBtn.addEventListener('click', closeModal);
    
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignupMode = !isSignupMode;
        updateModalUI();
    });

    // ── Supabase Auth Submission ──
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        authSubmit.disabled = true;
        authSubmit.textContent = 'Please wait...';
        authError.classList.add('hidden');
        
        try {
            if (isSignupMode) {
                // Sign Up
                const { data, error } = await window.supabaseClient.auth.signUp({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Usually Supabase requires email confirmation depending on settings.
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    showError('This email is already registered. Try logging in.');
                } else if (data.session) {
                    // Auto login
                    window.location.href = 'dashboard.html';
                } else {
                    // Confirmation email sent
                    authTitle.textContent = 'Check your email';
                    authSubtitle.textContent = 'We sent a confirmation link to ' + email;
                    authForm.style.display = 'none';
                    authSwitchText.parentElement.style.display = 'none';
                }
            } else {
                // Log In
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                if (data.session) {
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (err) {
            showError(err.message);
        } finally {
            if (authForm.style.display !== 'none') {
                authSubmit.disabled = false;
                authSubmit.textContent = isSignupMode ? 'Sign Up' : 'Log In';
            }
        }
    });

    function showError(msg) {
        authError.textContent = msg;
        authError.classList.remove('hidden');
    }

    // ── Session Check ──
    async function checkUserSession() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
            // Already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
});
