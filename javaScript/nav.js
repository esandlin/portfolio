const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    menuToggle.classList.toggle('active');
});

document.documentElement.setAttribute('data-theme', 'light');

const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
});

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const openLogin = document.getElementById('open-login');
const openSignup = document.getElementById('open-signup');
const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');

// Open Modals
openLogin.onclick = () => loginModal.style.display = 'flex';
openSignup.onclick = () => signupModal.style.display = 'flex';

// Close Modals
closeLogin.onclick = () => loginModal.style.display = 'none';
closeSignup.onclick = () => signupModal.style.display = 'none';

// Fake Login & Signup Logic
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Call the passcode checker to validate and redirect
    checkPasscode();
});


document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  signupModal.style.display = 'none';
  openLogin.style.display = 'none';
  openSignup.style.display = 'none';
});

// Optional: Close modal if user clicks outside
window.onclick = function(event) {
  if (event.target === loginModal) loginModal.style.display = 'none';
  if (event.target === signupModal) signupModal.style.display = 'none';
};

// Fake Login
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  localStorage.setItem('isLoggedIn', 'true');
  hideAuthUI();
});

// Fake Signup
document.getElementById('signup-form').addEventListener('submit', function (e) {
  e.preventDefault();
  localStorage.setItem('isLoggedIn', 'true');
  hideAuthUI();
});

// On page load, check login state
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    hideAuthUI();
  }
});

// Shared function
function hideAuthUI() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('signup-modal').style.display = 'none';
  document.getElementById('open-login').style.display = 'none';
  document.getElementById('open-signup').style.display = 'none';
  logoutBtn.style.display = 'inline-block';
}

const logoutBtn = document.getElementById('logout-btn');

function showLogoutUI() {
  logoutBtn.style.display = 'inline-block';
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn');
  location.reload(); // Reloads the page to reset UI
});

function checkPasscode() {
    const correctPasscode = "ericsandlin";

    // Check for input element on index.html (modal)
    const modalInput = document.getElementById("passcode-input");

    // Check for input element on JSGamesLogIn.html
    const pageInput = document.getElementById("passcode");

    // Use whichever input exists
    const inputValue = modalInput?.value || pageInput?.value || "";

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
