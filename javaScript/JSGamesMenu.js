/* jshint browser: true, esversion: 6 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splashScreen");
    const mainMenu = document.getElementById("mainMenu");
    const menuSearch = document.getElementById("menuSearch");
    const noResultsMessage = document.getElementById("noResultsMessage");

    setupSplashScreen();
    setupMenuSearch();

    /*
        Shows the main menu after the splash screen is dismissed.
    */
    function showMainMenu() {
        if (!mainMenu) return;

        mainMenu.classList.remove("menu-hidden");
    }

    /*
        Sets up the splash screen.
        The menu remains hidden until the splash screen is clicked/tapped.
    */
    function setupSplashScreen() {
        if (!splashScreen) {
            showMainMenu();
            return;
        }

        let splashDismissed = false;

        document.body.classList.add("splash-active");

        function dismissSplashScreen() {
            if (splashDismissed) return;

            splashDismissed = true;

            splashScreen.classList.add("splash-hidden");
            document.body.classList.remove("splash-active");

            window.setTimeout(() => {
                if (splashScreen && splashScreen.parentElement) {
                    splashScreen.remove();
                }

                showMainMenu();

                if (menuSearch) {
                    menuSearch.focus();
                }
            }, 700);
        }

        splashScreen.addEventListener("pointerdown", dismissSplashScreen);

        document.addEventListener("keydown", event => {
            const allowedKeys = ["Enter", " ", "Escape"];

            if (allowedKeys.includes(event.key)) {
                dismissSplashScreen();
            }
        });
    }

    /*
        Sets up the large search field for filtering menu cards.
    */
    function setupMenuSearch() {
        if (!menuSearch) return;

        menuSearch.addEventListener("input", () => {
            filterMenuCards(menuSearch.value);
        });
    }

    /*
        Filters menu cards by title, body text, list text, and data keywords.
    */
    function filterMenuCards(searchValue) {
        const query = searchValue.trim().toLowerCase();
        const cards = document.querySelectorAll(".menu-card");

        let visibleCount = 0;

        cards.forEach(card => {
            const searchableText = `${card.textContent} ${card.dataset.searchKeywords || ""}`.toLowerCase();
            const isVisible = !query || searchableText.includes(query);

            card.style.display = isVisible ? "block" : "none";

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (noResultsMessage) {
            noResultsMessage.classList.toggle("visible", visibleCount === 0);
        }
    }
});