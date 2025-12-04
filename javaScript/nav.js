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
// THEME TOGGLE (ICON ONLY)
// =====================
const lightLogo = document.getElementById('light-logo');
const darkLogo = document.getElementById('dark-logo');
const lightLabel = document.getElementById('light-label');
const darkLabel = document.getElementById('dark-label');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const isDark = theme === 'dark';
    if (lightLabel) lightLabel.style.display = isDark ? 'none' : 'inline';
    if (darkLabel) darkLabel.style.display = isDark ? 'inline' : 'none';
    if (lightLogo) lightLogo.style.display = isDark ? 'none' : 'inline-block';
    if (darkLogo) darkLogo.style.display = isDark ? 'inline-block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});

if (lightLogo) {
    lightLogo.addEventListener('click', e => {
        e.stopPropagation();
        setTheme('dark');
    });
}

if (darkLogo) {
    darkLogo.addEventListener('click', e => {
        e.stopPropagation();
        setTheme('light');
    });
}

// =====================
// AUTH / MODAL LOGIC
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

if (openLogin && loginModal) openLogin.onclick = () => loginModal.style.display = 'flex';
if (openSignup && signupModal) openSignup.onclick = () => signupModal.style.display = 'flex';
if (closeLogin && loginModal) closeLogin.onclick = () => loginModal.style.display = 'none';
if (closeSignup && signupModal) closeSignup.onclick = () => signupModal.style.display = 'none';

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        checkPasscode();
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        hideAuthUI();
    });
}

window.onclick = function (event) {
    if (loginModal && event.target === loginModal) loginModal.style.display = 'none';
    if (signupModal && event.target === signupModal) signupModal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        hideAuthUI();
    }
});

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
        location.reload();
    });
}

// =====================
// PASSCODE CHECKER
// =====================
function checkPasscode() {
    const correctPasscode = "ericsandlin";
    const modalInput = document.getElementById("passcode-input");
    const pageInput = document.getElementById("passcode");
    const inputValue = (modalInput && modalInput.value) || (pageInput && pageInput.value) || "";

    if (inputValue === correctPasscode) {
        if (modalInput) {
            window.location.href = "navPages/GDTA.html";
        } else {
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

    if (!options.length || !previewImg || !htmlLink || !pdfLink || !titleEl || !dropLabel) return;

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

            options.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set initial label to active resume title
    const active = document.querySelector('.resume-option.active');
    if (active && active.dataset.title) {
        dropLabel.textContent = active.dataset.title;
    }
});

    function toggleDropdown() {
        const menu = document.getElementById("resumeDropdownMenu");
        menu.style.display = (menu.style.display === "block") ? "none" : "block";
    }

    // Optional: Close dropdown when clicking outside
    window.addEventListener('click', function(e) {
        const btn = document.querySelector('.dropbtn');
        const menu = document.getElementById("resumeDropdownMenu");
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = "none";
        }
    });

// =====================
// Slideshow 
// =====================
function openModal() {
  document.getElementById("certModal").style.display = "block";
}

function closeModal() {
  document.getElementById("certModal").style.display = "none";
}

let slideIndex = 1;

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slides[slideIndex - 1].style.display = "block";  
}

// =====================
// Magnifier Glass
// =====================
function magnify(imgID, zoom) {
    var img, glass, w, h, bw;
    img = document.getElementById(imgID);

    /* Create magnifier glass: */
    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");

    /* Insert magnifier glass: */
    img.parentElement.insertBefore(glass, img);

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;

    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);

    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e) {
        var pos, x, y;
        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        x = pos.x;
        y = pos.y;
        /* Prevent the magnifier glass from being positioned outside the image: */
        if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
        if (x < w / zoom) { x = w / zoom; }
        if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
        if (y < h / zoom) { y = h / zoom; }
        /* Set the position of the magnifier glass: */
        glass.style.left = (x - w) + "px";
        glass.style.top = (y - h) + "px";
        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }

    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}

/* Execute the magnify function: */
magnify("resume-preview", 4);
/* Specify the id of the image, and the strength of the magnifier glass: */

