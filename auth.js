// Firebase phone authentication handling for account page
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
    let currentConfirmationResult = null;
    let recaptchaVerifier = null;
    let resendTimeout = null;

    function qs(selector) {
        return document.querySelector(selector);
    }

    function setElementVisibility(element, show) {
        if (!element) return;
        element.hidden = !show;
    }

    function setStatus(message, variant = 'info') {
        const statusEl = qs('#accountStatus');
        if (!statusEl) return;
        statusEl.textContent = message || '';
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

    function formatPhoneNumber(number) {
        return number ? `+91${number}` : null;
    }

    function resetOtpForm() {
        const otpForm = qs('#otpForm');
        if (otpForm) {
            otpForm.reset();
            setElementVisibility(otpForm, false);
        }
        currentConfirmationResult = null;
        if (resendTimeout) {
            clearTimeout(resendTimeout);
            resendTimeout = null;
        }
        const resendBtn = qs('#resendOtpButton');
        if (resendBtn) {
            resendBtn.disabled = false;
        }
    }

    function initRecaptcha() {
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
        }

        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible',
        });

        return recaptchaVerifier;
    }

    function sendOtp(phoneNumber) {
        const sendButton = qs('#sendOtpButton');
        disableButton(sendButton, true, 'Sending…');
        setStatus('Sending OTP…');

        const verifier = initRecaptcha();
        return auth.signInWithPhoneNumber(phoneNumber, verifier)
            .then(result => {
                currentConfirmationResult = result;
                setStatus('OTP sent! Enter the 6-digit code.');
                setElementVisibility(qs('#otpForm'), true);
                qs('#otpCode').focus({ preventScroll: true });
                const resendBtn = qs('#resendOtpButton');
                if (resendBtn) {
                    resendBtn.disabled = true;
                    resendTimeout = setTimeout(() => {
                        resendBtn.disabled = false;
                    }, 30000);
                }
            })
            .catch(error => {
                console.error('Error sending OTP:', error);
                setStatus(parseFirebaseError(error), 'error');
                resetOtpForm();
                if (recaptchaVerifier) {
                    recaptchaVerifier.render().then(widgetId => {
                        grecaptcha.reset(widgetId);
                    });
                }
            })
            .finally(() => {
                disableButton(sendButton, false);
            });
    }

    function verifyOtp(otpCode) {
        const verifyButton = qs('#verifyOtpButton');
        disableButton(verifyButton, true, 'Verifying…');
        setStatus('Verifying code…');

        if (!currentConfirmationResult) {
            setStatus('OTP session expired. Please request a new code.', 'error');
            resetOtpForm();
            disableButton(verifyButton, false);
            return Promise.reject(new Error('confirmationResult missing'));
        }

        return currentConfirmationResult.confirm(otpCode)
            .then(result => {
                setStatus('Signed in successfully!', 'success');
                showDashboard(result.user);
            })
            .catch(error => {
                console.error('Error verifying OTP:', error);
                setStatus(parseFirebaseError(error), 'error');
            })
            .finally(() => {
                disableButton(verifyButton, false);
            });
    }

    function parseFirebaseError(error) {
        if (!error || !error.code) {
            return 'Something went wrong. Please try again.';
        }

        switch (error.code) {
            case 'auth/invalid-phone-number':
                return 'Invalid phone number. Please check and try again.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait a moment before retrying.';
            case 'auth/code-expired':
                return 'OTP expired. Request a new one.';
            case 'auth/invalid-verification-code':
                return 'Incorrect OTP. Please check the code and try again.';
            case 'auth/missing-verification-code':
                return 'Enter the OTP sent to your phone.';
            case 'auth/quota-exceeded':
                return 'SMS quota exceeded. Try again later.';
            default:
                return 'Unable to complete request. Please try again later.';
        }
    }

    function showDashboard(user) {
        const authSection = qs('#accountAuthSection');
        const dashboard = qs('#accountDashboard');
        const phoneLabel = qs('#userPhoneLabel');
        const lastLogin = qs('#userLastLogin');

        if (authSection) setElementVisibility(authSection, false);
        if (dashboard) setElementVisibility(dashboard, true);
        if (phoneLabel) {
            const phoneNumber = user?.phoneNumber || 'Unknown';
            phoneLabel.textContent = `Phone: ${phoneNumber}`;
        }
        if (lastLogin) {
            const lastSignInTime = user?.metadata?.lastSignInTime;
            lastLogin.textContent = `Last login: ${lastSignInTime ? new Date(lastSignInTime).toLocaleString() : 'Just now'}`;
        }
    }

    function showAuthForms() {
        setElementVisibility(qs('#accountAuthSection'), true);
        setElementVisibility(qs('#accountDashboard'), false);
        const phoneForm = qs('#phoneLoginForm');
        if (phoneForm) {
            phoneForm.reset();
        }
        resetOtpForm();
        setStatus('');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const phoneForm = qs('#phoneLoginForm');
        const otpForm = qs('#otpForm');
        const resendBtn = qs('#resendOtpButton');
        const signOutBtn = qs('#signOutButton');

        if (phoneForm) {
            phoneForm.addEventListener('submit', event => {
                event.preventDefault();
                const phoneInput = qs('#phoneNumber');
                if (!phoneInput) return;

                const rawNumber = phoneInput.value.replace(/\D/g, '');
                if (!/^\d{10}$/.test(rawNumber)) {
                    setStatus('Enter a valid 10-digit mobile number.', 'error');
                    phoneInput.focus();
                    return;
                }

                sendOtp(formatPhoneNumber(rawNumber));
            });
        }

        if (otpForm) {
            otpForm.addEventListener('submit', event => {
                event.preventDefault();
                const otpInput = qs('#otpCode');
                if (!otpInput) return;

                const otpCode = otpInput.value.trim();
                if (!/^\d{4,6}$/.test(otpCode)) {
                    setStatus('Enter the 6-digit OTP sent to your phone.', 'error');
                    otpInput.focus();
                    return;
                }

                verifyOtp(otpCode);
            });
        }

        if (resendBtn) {
            resendBtn.addEventListener('click', () => {
                const phoneInput = qs('#phoneNumber');
                if (!phoneInput) return;
                const rawNumber = phoneInput.value.replace(/\D/g, '');
                if (!/^\d{10}$/.test(rawNumber)) {
                    setStatus('Enter a valid mobile number before resending OTP.', 'error');
                    return;
                }
                sendOtp(formatPhoneNumber(rawNumber));
            });
        }

        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                auth.signOut().catch(err => {
                    console.error('Error signing out:', err);
                });
            });
        }

        auth.onAuthStateChanged(user => {
            if (user) {
                showDashboard(user);
            } else {
                showAuthForms();
            }
        });
    });
})();
