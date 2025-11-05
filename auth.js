// Firebase Google authentication handling for account page
(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyAAhFuR-yu1muEMkvBmdQ1xYEpy2Y8tM0s",
        authDomain: "cleankart-web.firebaseapp.com",
        projectId: "cleankart-web",
        storageBucket: "cleankart-web.firebasestorage.app",
        messagingSenderId: "637657969731",
        appId: "1:637657969731:web:a1a0251add8f60f4bb50f6",
        measurementId: "G-4QGYWWZ1RF"
    };

    if (!window.firebase) {
        console.error('Firebase SDK not loaded.');
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    function qs(selector) {
        return document.querySelector(selector);
    }

    function setElementVisibility(element, show) {
        if (!element) return;
        element.hidden = !show;
    }

    function setStatus(message = '', variant = 'info') {
        const statusEl = qs('#accountStatus');
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.dataset.variant = variant;
    }

    function disableButton(button, disabled = true, label) {
        if (!button) return;
        button.disabled = disabled;
        if (label) {
            button.dataset.originalText = button.dataset.originalText || button.textContent;
            button.textContent = label;
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }

    function showDashboard(user) {
        const authSection = qs('#accountAuthSection');
        const dashboard = qs('#accountDashboard');
        const displayNameEl = qs('#userDisplayName');
        const emailEl = qs('#userEmailLabel');
        const lastLoginEl = qs('#userLastLogin');

        setElementVisibility(authSection, false);
        setElementVisibility(dashboard, true);

        const displayName = user?.displayName || user?.email?.split('@')[0] || 'Clean Kart Member';
        const email = user?.email || 'Not shared';
        const lastSignInTime = user?.metadata?.lastSignInTime;

        if (displayNameEl) {
            displayNameEl.textContent = `Signed in as: ${displayName}`;
        }
        if (emailEl) {
            emailEl.textContent = `Email: ${email}`;
        }
        if (lastLoginEl) {
            lastLoginEl.textContent = `Last login: ${lastSignInTime ? new Date(lastSignInTime).toLocaleString() : 'Just now'}`;
        }

        setStatus('');
    }

    function showAuthView() {
        const authSection = qs('#accountAuthSection');
        const dashboard = qs('#accountDashboard');
        const signInButton = qs('#googleSignInButton');

        setElementVisibility(authSection, true);
        setElementVisibility(dashboard, false);
        disableButton(signInButton, false);
        setStatus('');
    }

    function signInWithGoogle() {
        const signInButton = qs('#googleSignInButton');
        disableButton(signInButton, true, 'Connecting…');
        setStatus('Opening Google sign-in…');

        return auth.signInWithPopup(googleProvider)
            .then(result => {
                if (result.user) {
                    setStatus('Signed in successfully!', 'success');
                }
            })
            .catch(error => {
                console.error('Google sign-in error:', error);

                if (error.code === 'auth/popup-blocked') {
                    setStatus('Popup blocked. Redirecting to Google…', 'info');
                    return auth.signInWithRedirect(googleProvider);
                }

                if (error.code === 'auth/popup-closed-by-user') {
                    setStatus('Sign-in window was closed before completion.', 'error');
                    return null;
                }

                if (error.code === 'auth/cancelled-popup-request') {
                    setStatus('Another sign-in attempt is already running. Please wait a moment.', 'info');
                    return null;
                }

                setStatus(parseFirebaseError(error), 'error');
                return null;
            })
            .finally(() => {
                disableButton(signInButton, false);
            });
    }

    function parseFirebaseError(error) {
        if (!error || !error.code) {
            return 'Something went wrong. Please try again.';
        }

        switch (error.code) {
            case 'auth/network-request-failed':
                return 'Network error. Check your connection and try again.';
            case 'auth/popup-blocked':
                return 'Your browser blocked the popup. Allow popups for this site and try again.';
            case 'auth/popup-closed-by-user':
                return 'The sign-in window was closed before completing the process.';
            case 'auth/cancelled-popup-request':
                return 'Another sign-in attempt was already in progress.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized for Google sign-in. Add it under Firebase Authentication → Authorized domains.';
            case 'auth/account-exists-with-different-credential':
                return 'This email is already linked to a different sign-in method.';
            default:
                return `${error.message || 'Unable to complete request.'} (${error.code})`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const signInButton = qs('#googleSignInButton');
        const signOutButton = qs('#signOutButton');

        if (signInButton) {
            signInButton.addEventListener('click', () => {
                signInWithGoogle();
            });
        }

        if (signOutButton) {
            signOutButton.addEventListener('click', () => {
                setStatus('Signing out…');
                auth.signOut().catch(error => {
                    console.error('Error signing out:', error);
                    setStatus(parseFirebaseError(error), 'error');
                });
            });
        }

        auth.getRedirectResult()
            .then(result => {
                if (result.user) {
                    setStatus('Signed in successfully!', 'success');
                }
            })
            .catch(error => {
                console.error('Redirect sign-in error:', error);
                setStatus(parseFirebaseError(error), 'error');
            });

        auth.onAuthStateChanged(user => {
            if (user) {
                showDashboard(user);
            } else {
                showAuthView();
            }
        });
    });
})();
