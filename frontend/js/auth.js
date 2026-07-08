// ============================================================
// auth.js — Google Sign-In, Sign-Out & Auth State Management
// ============================================================

'use strict';

const Auth = (() => {

  const authScreen   = () => document.getElementById('auth-screen');
  const landingPage  = () => document.getElementById('landing-page');
  const appLayout    = () => document.getElementById('app-layout');
  const googleBtn    = () => document.getElementById('google-signin-btn');
  const authError    = () => document.getElementById('auth-error');

  // Sidebar user elements
  const avatarImg    = () => document.getElementById('user-avatar');
  const userNameEl   = () => document.getElementById('user-name');
  const userEmailEl  = () => document.getElementById('user-email');

  // Settings modal user elements
  const settingsAvatarEl = () => document.getElementById('settings-avatar');
  const settingsNameEl   = () => document.getElementById('settings-name');
  const settingsEmailEl  = () => document.getElementById('settings-email');

  let currentUser = null;

  function showAuthScreen() {
    const auth = authScreen();
    const landing = landingPage();
    const app = appLayout();
    if (auth)    { auth.classList.remove('hidden'); }
    if (landing) { landing.style.display = 'none'; }
    if (app)     { app.classList.add('hidden'); }
  }

  function showApp() {
    const auth = authScreen();
    const landing = landingPage();
    const app = appLayout();
    if (auth)    { auth.classList.add('hidden'); }
    if (landing) { landing.style.display = 'none'; }
    if (app)     { app.classList.remove('hidden'); }
  }

  function updateUserUI(user) {
    if (!user) return;

    const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=6366F1&color=fff&size=80`;
    const name = user.displayName || 'User';
    const email = user.email || '';

    // Sidebar
    const av = avatarImg();
    if (av) { av.src = photoURL; av.alt = name; }
    if (userNameEl()) userNameEl().textContent = name;
    if (userEmailEl()) userEmailEl().textContent = email;

    // Settings modal
    if (settingsAvatarEl()) settingsAvatarEl().src = photoURL;
    if (settingsNameEl()) settingsNameEl().textContent = name;
    if (settingsEmailEl()) settingsEmailEl().textContent = email;
  }

  function setLoading(loading) {
    const btn = googleBtn();
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `<span class="google-spinner"></span> Signing in...`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Sign in with Google`;
    }
  }

  function showError(msg) {
    const el = authError();
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function hideError() {
    const el = authError();
    if (el) el.classList.add('hidden');
  }

  async function handleGoogleSignIn() {
    if (!window.FirebaseAuth) { showError('Auth not ready. Please refresh.'); return; }
    setLoading(true);
    hideError();
    try {
      await window.FirebaseAuth.signInWithGoogle();
      // onAuthStateChanged will handle showing the app
    } catch (e) {
      console.error('Sign-in error:', e);
      if (e.code === 'auth/popup-closed-by-user') {
        showError('Sign-in cancelled. Please try again.');
      } else if (e.code === 'auth/popup-blocked') {
        showError('Popup was blocked. Please allow popups for this site.');
      } else {
        showError('Sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (!window.FirebaseAuth) return;
    try {
      await window.FirebaseAuth.signOut();
      currentUser = null;
      showAuthScreen();
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  }

  function init() {
    // Wait for Firebase to be ready
    const waitForFirebase = setInterval(() => {
      if (window.FirebaseAuth) {
        clearInterval(waitForFirebase);

        // Listen for auth state changes
        window.FirebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            currentUser = user;
            updateUserUI(user);
            showApp();
            // Initialize the chat app only after auth
            if (window.App && window.App.init) window.App.init();
          } else {
            currentUser = null;
            showAuthScreen();
          }
        });
      }
    }, 100);

    // Bind sign-in button
    const btn = googleBtn();
    if (btn) btn.addEventListener('click', handleGoogleSignIn);

    // Bind logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);
  }

  function getCurrentUser() { return currentUser; }

  return { init, getCurrentUser, handleSignOut };
})();

window.Auth = Auth;
