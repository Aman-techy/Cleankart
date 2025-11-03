// ===== GLOBAL VARIABLES =====
let currentTestimonial = 0;
let testimonialInterval;

// Multi-step form variables
let currentStep = 1;
const totalSteps = 4;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTestimonials();
    initializeForms();
    initializeScrollEffects();
    setMinPickupDate();
    initMultiStepForm();
    initFaqAccordion();
});

// ===== NAVIGATION FUNCTIONALITY =====
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    // Create mobile overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 998;
    `;
    document.body.appendChild(overlay);

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle overlay
            if (isActive) {
                overlay.style.visibility = 'visible';
                overlay.style.opacity = '1';
                body.style.overflow = 'hidden'; // Prevent scroll
            } else {
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
        body.style.overflow = '';
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                body.style.overflow = '';
            }
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.style.visibility = 'hidden';
            overlay.style.opacity = '0';
            body.style.overflow = '';
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Update active navigation link based on current page
    updateActiveNavLink();
}

// ===== FAQ ACCORDION =====
function initFaqAccordion() {
    const faqContainer = document.querySelector('#contact-faq');
    if (!faqContainer) return;

    const items = faqContainer.querySelectorAll('.faq-item');

    items.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!questionButton || !answer) return;

        questionButton.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close other items in accordion
            items.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherBtn) {
                        otherBtn.setAttribute('aria-expanded', 'false');
                    }
                    if (otherAnswer) {
                        otherAnswer.hidden = true;
                    }
                }
            });

            if (isOpen) {
                item.classList.remove('open');
                questionButton.setAttribute('aria-expanded', 'false');
                answer.hidden = true;
            } else {
                item.classList.add('open');
                questionButton.setAttribute('aria-expanded', 'true');
                answer.hidden = false;
            }
        });
    });
}

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// ===== TESTIMONIALS SLIDER =====
function initializeTestimonials() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (testimonialSlides.length === 0) return;

    // Auto-play testimonials
    function startTestimonialSlider() {
        testimonialInterval = setInterval(() => {
            nextTestimonial();
        }, 5000);
    }

    function stopTestimonialSlider() {
        clearInterval(testimonialInterval);
    }

    function showTestimonial(index) {
        testimonialSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonialSlides.length;
        showTestimonial(currentTestimonial);
    }

    function prevTestimonial() {
        currentTestimonial = (currentTestimonial - 1 + testimonialSlides.length) % testimonialSlides.length;
        showTestimonial(currentTestimonial);
    }

    // Event listeners for navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopTestimonialSlider();
            nextTestimonial();
            startTestimonialSlider();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopTestimonialSlider();
            prevTestimonial();
            startTestimonialSlider();
        });
    }

    // Pause on hover
    const testimonialSection = document.querySelector('.testimonials-slider');
    if (testimonialSection) {
        testimonialSection.addEventListener('mouseenter', stopTestimonialSlider);
        testimonialSection.addEventListener('mouseleave', startTestimonialSlider);
    }

    // Start the slider
    startTestimonialSlider();
}

// ===== FORM HANDLING =====
function initializeForms() {
    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
        addRealTimeValidation('bookingForm');
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        addRealTimeValidation('contactForm');
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());
    
    if (validateBookingForm(formObject)) {
        showLoadingState(e.target.querySelector('.submit-btn'));
        
        // Simulate API call
        setTimeout(() => {
            hideLoadingState(e.target.querySelector('.submit-btn'));
            showSuccessMessage('Booking Confirmed!', 
                `Thank you ${formObject.fullName}! Your pickup has been scheduled for ${formatDate(formObject.pickupDate)} between ${formatTimeSlot(formObject.pickupTime)}. We'll send you a confirmation SMS shortly.`);
            e.target.reset();
        }, 2000);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());

    if (!validateContactForm(formObject)) {
        return;
    }

    const submitButton = e.target.querySelector('.submit-btn');
    showLoadingState(submitButton);

    const subjectLabels = {
        general: 'General Inquiry',
        booking: 'Booking Support',
        complaint: 'Complaint',
        pricing: 'Pricing Question',
        feedback: 'Feedback',
        other: 'Other'
    };

    const subjectLabel = subjectLabels[formObject.contactSubject] || formObject.contactSubject;
    formData.set('contactSubject', subjectLabel);
    formData.set('Subject', subjectLabel);
    formData.set('_subject', `Clean Kart Website Contact • ${subjectLabel}`);
    formData.set('Source', 'Website Contact Form');
    formData.set('Page', window.location.href);
    formData.set('Browser', navigator.userAgent);
    formData.set('Phone', formObject.contactPhone || 'Not provided');

    const encodedForm = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        encodedForm.append(key, value);
    }

    try {
        const response = await fetch('https://formsubmit.co/ajax/cleankarthelp@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: encodedForm.toString()
        });

        if (!response.ok) {
            throw new Error(`Contact form submission failed with status ${response.status}`);
        }

        await response.json();

        showSuccessMessage(
            'Message Sent!',
            `Thank you ${formObject.contactName}! We've received your message and will respond within 24 hours.`,
            { buttonText: 'Great!' }
        );
        e.target.reset();
    } catch (error) {
        console.error('Contact form submission error:', error);
        showSuccessMessage(
            'Unable to send message',
            'Please try again in a moment or reach us directly at info@mycleankart.in or +91 8287382070.',
            { variant: 'error', buttonText: 'Close' }
        );
    } finally {
        hideLoadingState(submitButton);
    }
}

// ===== FORM VALIDATION =====
function validateBookingForm(formData) {
    let isValid = true;
    
    // Name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
        showError('nameError', 'Please enter a valid name (at least 2 characters)');
        isValid = false;
    } else {
        clearError('nameError');
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        showError('phoneError', 'Please enter a valid 10-digit phone number');
        isValid = false;
    } else {
        clearError('phoneError');
    }
    
    // Address validation
    if (!formData.address || formData.address.trim().length < 10) {
        showError('addressError', 'Please enter a complete address (at least 10 characters)');
        isValid = false;
    } else {
        clearError('addressError');
    }
    
    // Date validation
    const today = new Date();
    const selectedDate = new Date(formData.pickupDate);
    if (!formData.pickupDate || selectedDate < today) {
        showError('dateError', 'Please select a valid pickup date (today or later)');
        isValid = false;
    } else {
        clearError('dateError');
    }
    
    // Time validation
    if (!formData.pickupTime) {
        showError('timeError', 'Please select a pickup time slot');
        isValid = false;
    } else {
        clearError('timeError');
    }
    
    // Garment type validation
    if (!formData.garmentType) {
        showError('garmentError', 'Please select a garment type');
        isValid = false;
    } else {
        clearError('garmentError');
    }
    
    // Terms validation
    if (!formData.terms) {
        showError('termsError', 'Please accept the terms and conditions');
        isValid = false;
    } else {
        clearError('termsError');
    }
    
    return isValid;
}

function validateContactForm(formData) {
    let isValid = true;
    
    // Name validation
    if (!formData.contactName || formData.contactName.trim().length < 2) {
        showError('contactNameError', 'Please enter a valid name');
        isValid = false;
    } else {
        clearError('contactNameError');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail || !emailRegex.test(formData.contactEmail)) {
        showError('contactEmailError', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('contactEmailError');
    }
    
    // Subject validation
    if (!formData.contactSubject) {
        showError('contactSubjectError', 'Please select a subject');
        isValid = false;
    } else {
        clearError('contactSubjectError');
    }
    
    // Message validation
    if (!formData.contactMessage || formData.contactMessage.trim().length < 10) {
        showError('contactMessageError', 'Please enter a message (at least 10 characters)');
        isValid = false;
    } else {
        clearError('contactMessageError');
    }
    
    return isValid;
}

function addRealTimeValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this, formId);
        });
        
        input.addEventListener('input', function() {
            // Clear error state when user starts typing
            const errorElement = document.getElementById(this.name + 'Error') || 
                                document.getElementById(this.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                this.parentElement.classList.remove('error');
            }
        });
    });
}

function validateField(field, formId) {
    const fieldName = field.name || field.id;
    const value = field.value.trim();
    
    // Clear previous error
    clearError(fieldName + 'Error');
    
    // Field-specific validation
    switch (fieldName) {
        case 'fullName':
        case 'contactName':
            if (value.length < 2) {
                showError(fieldName + 'Error', 'Name must be at least 2 characters');
                return false;
            }
            break;
            
        case 'phone':
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                showError('phoneError', 'Please enter a valid 10-digit phone number');
                return false;
            }
            break;
            
        case 'contactEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError('contactEmailError', 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'address':
            if (value.length < 10) {
                showError('addressError', 'Please enter a complete address');
                return false;
            }
            break;
            
        case 'contactMessage':
            if (value.length < 10) {
                showError('contactMessageError', 'Message must be at least 10 characters');
                return false;
            }
            break;
    }
    
    // Mark field as valid
    field.parentElement.classList.add('success');
    return true;
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    const fieldElement = errorElement ? errorElement.closest('.form-group').querySelector('input, select, textarea') : null;
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.parentElement.classList.add('error');
        errorElement.parentElement.classList.remove('success');
    }
}

function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    const fieldElement = errorElement ? errorElement.closest('.form-group').querySelector('input, select, textarea') : null;
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.parentElement.classList.remove('error');
    }
}

// ===== UTILITY FUNCTIONS =====
function setMinPickupDate() {
    const dateInput = document.getElementById('pickupDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTimeSlot(timeSlot) {
    const timeSlots = {
        '9-11': '9:00 AM - 11:00 AM',
        '11-1': '11:00 AM - 1:00 PM',
        '1-3': '1:00 PM - 3:00 PM',
        '3-5': '3:00 PM - 5:00 PM',
        '5-7': '5:00 PM - 7:00 PM',
        '7-9': '7:00 PM - 9:00 PM'
    };
    return timeSlots[timeSlot] || timeSlot;
}

function showLoadingState(button) {
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
}

function hideLoadingState(button) {
    button.disabled = false;
    button.classList.remove('loading');
    
    // Restore original content based on button context
    if (button.closest('#bookingForm')) {
        button.innerHTML = '<i class="fas fa-calendar-check"></i> Book Pickup';
    } else if (button.closest('#contactForm')) {
        button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

function showSuccessMessage(title, message, options = {}) {
    const variant = options.variant || 'success';
    const buttonText = options.buttonText || (variant === 'success' ? 'OK, Got It!' : 'Close');
    const variantConfig = variant === 'error'
        ? {
            iconColor: '#dc3545',
            iconClass: 'fas fa-circle-xmark',
            titleColor: '#dc3545',
            buttonGradient: 'linear-gradient(135deg, #dc3545, #ff6b6b)'
        }
        : {
            iconColor: '#28a745',
            iconClass: 'fas fa-check-circle',
            titleColor: '#1E90FF',
            buttonGradient: 'linear-gradient(135deg, #1E90FF, #28a745)'
        };

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 15px;
        max-width: 500px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="color: ${variantConfig.iconColor}; font-size: 4rem; margin-bottom: 1rem;">
            <i class="${variantConfig.iconClass}"></i>
        </div>
        <h3 style="color: ${variantConfig.titleColor}; margin-bottom: 1rem; font-size: 1.5rem;">${title}</h3>
        <p style="color: #666; line-height: 1.6; margin-bottom: 2rem;">${message}</p>
        <button class="close-modal-btn" style="
            background: ${variantConfig.buttonGradient};
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        ">${buttonText}</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add click handlers
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => document.body.removeChild(overlay), 300);
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(overlay), 300);
        }
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(overlay), 300);
        }
    }, 5000);
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .service-card, .pricing-card, .contact-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ===== PHONE NUMBER FORMATTING =====
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    const phoneNumber = input.value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX
    if (phoneNumber.length === 10) {
        input.value = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
        input.value = phoneNumber;
    }
}

// Add phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== ACCESSIBILITY ENHANCEMENTS =====
document.addEventListener('keydown', (e) => {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.success-modal-overlay');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(modal), 300);
        }
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // You could send this to a logging service in production
});

// ===== ANALYTICS TRACKING (Placeholder) =====
function trackEvent(category, action, label) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', { category, action, label });
    
    // Example: Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
}

// Track form submissions
document.addEventListener('submit', (e) => {
    const formId = e.target.id;
    if (formId === 'bookingForm') {
        trackEvent('Form', 'Submit', 'Booking Form');
    } else if (formId === 'contactForm') {
        trackEvent('Form', 'Submit', 'Contact Form');
    }
});

// Track CTA button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cta-button')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('CTA', 'Click', buttonText);
    }
});

console.log('Clean Kart website scripts loaded successfully!');

// ===== MULTI-STEP BOOKING FORM =====
// Initialize multi-step form
function initMultiStepForm() {
    const bookingFormElement = document.getElementById('bookingForm');
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    const progressFill = document.querySelector('.progress-fill');

    if (!bookingFormElement || !nextButton || !prevButton || !progressFill) {
        return;
    }

    updateStepUI();
    updateProgressBar();
    setMinDate();
    
    // Navigation event listeners
    nextButton.addEventListener('click', nextStep);
    prevButton.addEventListener('click', prevStep);
    
    // Form validation on input
    addInputValidation();
    
    // Show floating tips
    showFloatingTips();
}

// Navigate to next step
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepUI();
            updateProgressBar();
            updateSummary();
            showFloatingTips();
        }
    }
}

// Navigate to previous step
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
        updateProgressBar();
    }
}

// Update step UI
function updateStepUI() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.querySelector('.step-number i').className = 'fas fa-check';
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            // Reset icon based on step
            const icons = ['fas fa-user', 'fas fa-tshirt', 'fas fa-calendar-alt', 'fas fa-check'];
            step.querySelector('.step-number i').className = icons[index];
        } else {
            const icons = ['fas fa-user', 'fas fa-tshirt', 'fas fa-calendar-alt', 'fas fa-check'];
            step.querySelector('.step-number i').className = icons[index];
        }
    });
    
    // Update form sections
    document.querySelectorAll('.form-section').forEach((section, index) => {
        const stepNumber = index + 1;
        section.classList.remove('active', 'sliding-out');
        
        if (stepNumber === currentStep) {
            setTimeout(() => {
                section.classList.add('active');
            }, 300);
        } else if (section.classList.contains('active')) {
            section.classList.add('sliding-out');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    } else if (currentStep === totalSteps) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

// Update progress bar
function updateProgressBar() {
    const progressPercentage = (currentStep / totalSteps) * 100;
    document.querySelector('.progress-fill').style.width = progressPercentage + '%';
}

// Validate current step
function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-section[data-step="${currentStep}"]`);
    const requiredFields = currentSection.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, `${field.labels[0].textContent.replace('*', '').trim()} is required`);
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Additional validation for specific fields
    if (currentStep === 1) {
        const phone = document.getElementById('phone');
        if (phone.value && !/^[0-9]{10}$/.test(phone.value)) {
            showFieldError(phone, 'Please enter a valid 10-digit phone number');
            isValid = false;
        }
    }
    
    if (currentStep === 3) {
        const pickupDate = document.getElementById('pickupDate');
        if (pickupDate.value) {
            const selectedDate = new Date(pickupDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError(pickupDate, 'Please select a future date');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const errorId = field.id + 'Error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    field.style.borderColor = '#dc3545';
}

// Clear field error
function clearFieldError(field) {
    const errorId = field.id + 'Error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    field.style.borderColor = '#e9ecef';
}

// Add input validation
function addInputValidation() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                showFieldError(field, `${field.labels[0].textContent.replace('*', '').trim()} is required`);
            } else {
                clearFieldError(field);
            }
        });
        
        field.addEventListener('input', () => {
            clearFieldError(field);
        });
    });
}

// Update summary
function updateSummary() {
    if (currentStep === 4) {
        document.getElementById('summaryName').textContent = document.getElementById('fullName').value || '-';
        document.getElementById('summaryPhone').textContent = document.getElementById('phone').value || '-';
        document.getElementById('summaryAddress').textContent = document.getElementById('address').value || '-';
        
        const serviceType = document.getElementById('serviceType');
        document.getElementById('summaryService').textContent = serviceType.options[serviceType.selectedIndex]?.text || '-';
        
        const itemCount = document.getElementById('itemCount');
        document.getElementById('summaryItems').textContent = itemCount.options[itemCount.selectedIndex]?.text || '-';
        
        document.getElementById('summaryPickupDate').textContent = formatDate(document.getElementById('pickupDate').value) || '-';
        
        const pickupTime = document.getElementById('pickupTime');
        document.getElementById('summaryPickupTime').textContent = pickupTime.options[pickupTime.selectedIndex]?.text || '-';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Set minimum date for pickup
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const pickupDate = document.getElementById('pickupDate');
    const deliveryDate = document.getElementById('deliveryDate');
    
    pickupDate.min = tomorrow.toISOString().split('T')[0];
    deliveryDate.min = tomorrow.toISOString().split('T')[0];
}

// Show floating tips
function showFloatingTips() {
    const tips = {
        1: "💡 Make sure your contact number is active for pickup coordination",
        2: "🔍 Choose the service that best matches your garment type",
        3: "📅 We recommend booking at least 24 hours in advance",
        4: "✅ Please review all details before confirming your booking"
    };
    
    // Remove existing tip
    const existingTip = document.querySelector('.floating-tip');
    if (existingTip) {
        existingTip.remove();
    }
    
    // Create new tip
    const tip = document.createElement('div');
    tip.className = 'floating-tip';
    tip.textContent = tips[currentStep];
    document.body.appendChild(tip);
    
    // Position tip
    const formContainer = document.querySelector('.booking-form-container');
    const rect = formContainer.getBoundingClientRect();
    tip.style.left = (rect.right + 20) + 'px';
    tip.style.top = (rect.top + 100) + 'px';
    
    // Show tip
    setTimeout(() => {
        tip.classList.add('show');
    }, 500);
    
    // Hide tip after 4 seconds
    setTimeout(() => {
        if (tip) {
            tip.classList.remove('show');
            setTimeout(() => tip.remove(), 400);
        }
    }, 4000);
}

// Enhanced form submission
function handleEnhancedBookingSubmission(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate processing
    setTimeout(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        // Show success modal
        showEnhancedSuccessModal();
    }, 2000);
}

// Show enhanced success modal
function showEnhancedSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;"></i>
            </div>
            <h2 style="color: #28a745; margin-bottom: 1rem;">Booking Confirmed!</h2>
            <p style="margin-bottom: 1.5rem; color: #6c757d;">
                Thank you! Your pickup has been scheduled successfully. 
                You'll receive a confirmation call within 30 minutes.
            </p>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <p style="margin: 0; font-weight: 600;">Booking Reference: #CK${Date.now().toString().slice(-6)}</p>
            </div>
            <button class="close-modal-btn" onclick="this.closest('.modal').remove();">
                <i class="fas fa-home"></i> Back to Home
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto redirect after 10 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 10000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMultiStepForm();
    
    // Update form submission handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleEnhancedBookingSubmission);
    }
});
