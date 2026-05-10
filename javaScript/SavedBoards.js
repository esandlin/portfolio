/* jshint browser: true, esversion: 6 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const savedBoardsList = document.getElementById("savedBoardsList");
    const emptySavedBoardsMessage = document.getElementById("emptySavedBoardsMessage");

    const legacyStorageKey = "industrialAutomationControlBoard";

    renderSavedBoards();

    /*
        Loads saved board data from localStorage and renders the list.
        Right now this supports your current single-board save system.
    */
    function renderSavedBoards() {
        if (!savedBoardsList) return;

        const savedBoards = getSavedBoards();

        savedBoardsList.innerHTML = "";

        if (!savedBoards.length) {
            if (emptySavedBoardsMessage) {
                emptySavedBoardsMessage.classList.add("visible");
            }

            return;
        }

        if (emptySavedBoardsMessage) {
            emptySavedBoardsMessage.classList.remove("visible");
        }

        savedBoards.forEach(board => {
            savedBoardsList.appendChild(createSavedBoardCard(board));
        });
    }

    /*
        Gets saved boards.

        For now, this converts your existing single localStorage save into
        a list item. Later, we can upgrade this to multiple saved boards.
    */
    function getSavedBoards() {
        const rawSaveData = localStorage.getItem(legacyStorageKey);

        if (!rawSaveData) {
            return [];
        }

        try {
            const saveData = JSON.parse(rawSaveData);

            return [
                {
                    id: "latest",
                    boardName: saveData.boardName || "CAD Parts Repair Board",
                    templateName: saveData.templateName || "CAD Parts Repair",
                    savedAt: saveData.savedAt || "",
                    partsCount: Array.isArray(saveData.parts) ? saveData.parts.length : 0,
                    wiresCount: Array.isArray(saveData.connections) ? saveData.connections.length : 0
                }
            ];
        } catch (error) {
            console.error("Could not read saved board data:", error);
            return [];
        }
    }

    /*
        Creates one clickable saved-board card.
    */
    function createSavedBoardCard(board) {
        const link = document.createElement("a");

        link.classList.add("saved-board-card");
        link.href = `game_1.html?load=${encodeURIComponent(board.id)}`;

        link.innerHTML = `
            <div class="saved-board-main">
                <h2>${escapeHtml(board.boardName)}</h2>
                <p><strong>Equipment Template:</strong> ${escapeHtml(board.templateName)}</p>
                <p><strong>Saved:</strong> ${formatDateTime(board.savedAt)}</p>
            </div>

            <div class="saved-board-meta">
                <span>${board.partsCount} Parts</span>
                <span>${board.wiresCount} Wires</span>
                <span>Open →</span>
            </div>
        `;

        return link;
    }

    /*
        Formats the saved timestamp for display.
    */
    function formatDateTime(isoDateString) {
        if (!isoDateString) {
            return "Unknown date";
        }

        const date = new Date(isoDateString);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleString();
    }

    /*
        Prevents saved text from being treated as HTML.
    */
    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});