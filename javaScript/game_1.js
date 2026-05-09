"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("dropZone");
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    const menuItems = document.querySelectorAll(".drag-item");

    const itemWidth = 110;
    const itemHeight = 50;

    let activeItem = null;
    let previewItem = null;
    let isNewItem = false;
    let offsetX = 0;
    let offsetY = 0;
    let originalLeft = 0;
    let originalTop = 0;

    drawCanvasBackground();

    function drawCanvasBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#777";
        ctx.font = "20px Arial";
        ctx.fillText("Drop items here", 20, 35);
    }

    function createPlacedItem(type, label) {
        const item = document.createElement("div");

        item.classList.add("placed-item");
        item.classList.add(type);

        item.dataset.type = type;
        item.textContent = label;

        item.style.left = "0px";
        item.style.top = "0px";

        item.addEventListener("pointerdown", startMovingPlacedItem);

        return item;
    }

    function createPreviewItem(type, label, clientX, clientY) {
        previewItem = document.createElement("div");

        previewItem.classList.add("drag-preview");
        previewItem.classList.add(type);

        previewItem.textContent = label;

        document.body.appendChild(previewItem);

        movePreview(clientX, clientY);
    }

    function movePreview(clientX, clientY) {
        if (!previewItem) return;

        previewItem.style.left = `${clientX - offsetX}px`;
        previewItem.style.top = `${clientY - offsetY}px`;
    }

    function removePreview() {
        if (previewItem) {
            previewItem.remove();
            previewItem = null;
        }
    }

    function getDropZonePosition(event) {
        const rect = dropZone.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function isPointerInsideDropZone(event) {
        const rect = dropZone.getBoundingClientRect();

        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        );
    }

    function clampToDropZone(x, y) {
        const clampedX = Math.max(0, Math.min(x, dropZone.clientWidth - itemWidth));
        const clampedY = Math.max(0, Math.min(y, dropZone.clientHeight - itemHeight));

        return {
            x: clampedX,
            y: clampedY
        };
    }

    // Start dragging from the Parts Menu
    menuItems.forEach(menuItem => {
        menuItem.addEventListener("pointerdown", event => {
            event.preventDefault();

            isNewItem = true;

            const type = menuItem.dataset.type;
            const label = menuItem.textContent.trim();

            activeItem = createPlacedItem(type, label);

            offsetX = itemWidth / 2;
            offsetY = itemHeight / 2;

            createPreviewItem(type, label, event.clientX, event.clientY);

            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
            document.addEventListener("pointercancel", handlePointerCancel);
        });
    });

    // Start moving an item that is already inside the drop zone
    function startMovingPlacedItem(event) {
        event.preventDefault();

        isNewItem = false;

        activeItem = event.currentTarget;

        const itemRect = activeItem.getBoundingClientRect();

        offsetX = event.clientX - itemRect.left;
        offsetY = event.clientY - itemRect.top;

        originalLeft = parseFloat(activeItem.style.left) || 0;
        originalTop = parseFloat(activeItem.style.top) || 0;

        activeItem.style.opacity = "0.4";

        createPreviewItem(
            activeItem.dataset.type,
            activeItem.textContent.trim(),
            event.clientX,
            event.clientY
        );

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", handlePointerCancel);
    }

    function handlePointerMove(event) {
        if (!activeItem) return;

        event.preventDefault();

        movePreview(event.clientX, event.clientY);
    }

    function handlePointerUp(event) {
        if (!activeItem) return;

        event.preventDefault();

        const droppedInside = isPointerInsideDropZone(event);

        if (droppedInside) {
            const position = getDropZonePosition(event);

            let newX = position.x - offsetX;
            let newY = position.y - offsetY;

            const clamped = clampToDropZone(newX, newY);

            activeItem.style.left = `${clamped.x}px`;
            activeItem.style.top = `${clamped.y}px`;

            if (isNewItem) {
                dropZone.appendChild(activeItem);
            }

            activeItem.style.opacity = "1";
        } else {
            if (isNewItem) {
                activeItem.remove();
            } else {
                activeItem.style.left = `${originalLeft}px`;
                activeItem.style.top = `${originalTop}px`;
                activeItem.style.opacity = "1";
            }
        }

        resetDrag();
    }

    function handlePointerCancel() {
        if (!activeItem) return;

        if (isNewItem) {
            activeItem.remove();
        } else {
            activeItem.style.left = `${originalLeft}px`;
            activeItem.style.top = `${originalTop}px`;
            activeItem.style.opacity = "1";
        }

        resetDrag();
    }

    function resetDrag() {
        activeItem = null;
        isNewItem = false;

        removePreview();

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerCancel);
    }
});