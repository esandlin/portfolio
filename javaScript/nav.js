// =====================
// NAV MENU TOGGLE
// =====================
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });
}

// =====================
// THEME TOGGLE
// =====================
document.documentElement.setAttribute('data-theme', 'light');

const toggle = document.getElementById('theme-toggle');
if (toggle) {
    toggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// =====================
// AUTH / MODAL LOGIC
// (only runs if those elements exist on the page)
// =====================
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const openLogin = document.getElementById('open-login');
const openSignup = document.getElementById('open-signup');
const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');

// Open Modals
if (openLogin && loginModal) {
    openLogin.onclick = () => loginModal.style.display = 'flex';
}
if (openSignup && signupModal) {
    openSignup.onclick = () => signupModal.style.display = 'flex';
}

// Close Modals
if (closeLogin && loginModal) {
    closeLogin.onclick = () => loginModal.style.display = 'none';
}
if (closeSignup && signupModal) {
    closeSignup.onclick = () => signupModal.style.display = 'none';
}

// Fake Login & Signup Logic
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Call the passcode checker to validate and redirect
        checkPasscode();
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (signupModal) signupModal.style.display = 'none';
        if (openLogin) openLogin.style.display = 'none';
        if (openSignup) openSignup.style.display = 'none';
    });
}

// Optional: Close modal if user clicks outside
if (loginModal || signupModal) {
    window.onclick = function (event) {
        if (loginModal && event.target === loginModal) loginModal.style.display = 'none';
        if (signupModal && event.target === signupModal) signupModal.style.display = 'none';
    };
}

// Fake Login (localStorage-based)
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        hideAuthUI();
    });
}

// Fake Signup (localStorage-based)
if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        hideAuthUI();
    });
}

// On page load, check login state
document.addEventListener('DOMContentLoaded', () => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
        hideAuthUI();
    }
});

// Shared function
function hideAuthUI() {
    if (loginModal) loginModal.style.display = 'none';
    if (signupModal) signupModal.style.display = 'none';
    if (openLogin) openLogin.style.display = 'none';
    if (openSignup) openSignup.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        location.reload(); // Reloads the page to reset UI
    });
}

// =====================
// PASSCODE CHECKER (GLOBAL)
// =====================
function checkPasscode() {
    const correctPasscode = "ericsandlin";

    // Check for input element on index.html (modal)
    const modalInput = document.getElementById("passcode-input");

    // Check for input element on JSGamesLogIn.html
    const pageInput = document.getElementById("passcode");

    // Use whichever input exists
    const inputValue = (modalInput && modalInput.value) || (pageInput && pageInput.value) || "";

    if (inputValue === correctPasscode) {
        // Redirect based on origin
        if (modalInput) {
            // From modal on index.html
            window.location.href = "navPages/GDTA.html";
        } else {
            // From standalone login page
            window.location.href = "JSGames.html";
        }
    } else {
        alert("Incorrect passcode. Please try again.");
    }
}

// =====================
// RESUME DROPDOWN LOGIC
// =====================
document.addEventListener('DOMContentLoaded', function () {
    const options = document.querySelectorAll('.resume-option');
    const previewImg = document.getElementById('resume-preview');
    const htmlLink = document.getElementById('resume-html-link');
    const pdfLink = document.getElementById('resume-pdf-link');
    const titleEl = document.getElementById('resume-title');
    const dropLabel = document.getElementById('dropbtn-label');

    if (!options.length || !previewImg || !htmlLink || !pdfLink || !titleEl || !dropLabel) {
        // This page doesn't have the resume UI; nothing to do.
        return;
    }

    options.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();

            const img = this.dataset.img;
            const html = this.dataset.html;
            const pdf = this.dataset.pdf;
            const title = this.dataset.title;
            const alt = this.dataset.alt;

            if (img) previewImg.src = img;
            if (alt) previewImg.alt = alt;
            if (html) htmlLink.href = html;
            if (pdf) pdfLink.href = pdf;
            if (title) {
                titleEl.textContent = title;
                dropLabel.textContent = title;
            }

            // Highlight active option
            options.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set initial button label to the default active option
    const active = document.querySelector('.resume-option.active');
    if (active && active.dataset.title) {
        dropLabel.textContent = active.dataset.title;
    }
});
