/*
    ============================================================
    REQUIRED ELEMENT CHECK
    ------------------------------------------------------------
    Stops the script early if the CAD page is missing an expected
    HTML element. This makes troubleshooting much easier.
    ============================================================
*/
if (
    !zoneBoard ||
    !zoneNameInput ||
    !saveZoneBtn ||
    !loadZoneBtn ||
    !clearZoneBtn ||
    !snapZoneBtn ||
    !selectedZoneItemLabel ||
    !selectedItemNameInput ||
    !selectedItemNotesInput ||
    !selectedItemRotationInput ||
    !rotateLeftBtn ||
    !rotateRightBtn ||
    !applyZoneItemBtn ||
    !deleteZoneItemBtn
) {
    console.error("ConveyorLocationsCAD setup error: one or more required HTML elements are missing.");
    console.error(
        "Required IDs: zoneBoard, zoneNameInput, saveZoneBtn, loadZoneBtn, clearZoneBtn, snapZoneBtn, selectedZoneItemLabel, selectedItemNameInput, selectedItemNotesInput, selectedItemRotationInput, rotateLeftBtn, rotateRightBtn, applyZoneItemBtn, deleteZoneItemBtn."
    );
    return;
}

/* jshint browser: true, esversion: 6, devel: true */
("use strict");

document.addEventListener("DOMContentLoaded", () => {
    const zoneBoard = document.getElementById("zoneBoard");
    const zoneNameInput = document.getElementById("zoneNameInput");

    const saveZoneBtn = document.getElementById("saveZoneBtn");
    const loadZoneBtn = document.getElementById("loadZoneBtn");
    const clearZoneBtn = document.getElementById("clearZoneBtn");

    const selectedZoneItemLabel = document.getElementById("selectedZoneItemLabel");
    const selectedItemNameInput = document.getElementById("selectedItemNameInput");
    const selectedItemNotesInput = document.getElementById("selectedItemNotesInput");
    const applyZoneItemBtn = document.getElementById("applyZoneItemBtn");
    const deleteZoneItemBtn = document.getElementById("deleteZoneItemBtn");

    const menuItems = document.querySelectorAll(".conveyor-menu-item");

    const snapZoneBtn = document.getElementById("snapZoneBtn");
    const selectedItemRotationInput = document.getElementById("selectedItemRotationInput");
    const rotateLeftBtn = document.getElementById("rotateLeftBtn");
    const rotateRightBtn = document.getElementById("rotateRightBtn");

    const zoneType = getZoneTypeFromUrl();
    const zoneDisplayName = getZoneDisplayName(zoneType);

    const CONFIG = {
        itemWidth: 220,
        itemHeight: 70,
        partWidth: 90,
        partHeight: 55,
        gridSize: 25,
        baseStorageKey: "conveyorZoneLayout"
    };

    let nextItemId = 1;
    let activeItem = null;
    let previewItem = null;
    let isNewItem = false;
    let selectedItem = null;
    let snapMode = true;
    let offsetX = 0;
    let offsetY = 0;

    menuItems.forEach((button) => {
        button.addEventListener("pointerdown", (event) => {
            startDraggingNewItem(button, event);
        });
    });

    saveZoneBtn.addEventListener("click", saveZoneLayout);
    loadZoneBtn.addEventListener("click", loadZoneLayout);
    clearZoneBtn.addEventListener("click", clearZoneLayout);
    snapZoneBtn.addEventListener("click", toggleSnapMode);
    rotateLeftBtn.addEventListener("click", () => rotateSelectedItem(-90));
    rotateRightBtn.addEventListener("click", () => rotateSelectedItem(90));
    applyZoneItemBtn.addEventListener("click", applySelectedItemProperties);
    deleteZoneItemBtn.addEventListener("click", deleteSelectedItem);
    initializeZoneFromMenuChoice();

    /*
    Creates a storage key for the selected zone type.

    This prevents Inbound, Outbound, and Sorter from overwriting
    each other's saved layouts.
*/
    function getStorageKey() {
        return `${CONFIG.baseStorageKey}_${zoneType}`;
    }

    /*
    Reads the selected conveyor zone from the URL.

    Examples:
    ConveyorLocationsCAD.html?zone=inbound
    ConveyorLocationsCAD.html?zone=outbound
    ConveyorLocationsCAD.html?zone=sorter
*/
    function getZoneTypeFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("zone") || "custom";
    }

    /*
    Converts the URL zone value into a clean display name.
*/
    function getZoneDisplayName(type) {
        const zoneNames = {
            inbound: "Inbound Conveyor",
            outbound: "Outbound Conveyor",
            sorter: "Sorter Line",
            custom: "Custom Conveyor Zone"
        };

        return zoneNames[type] || "Custom Conveyor Zone";
    }

    /*
    Sets the default zone name when the CAD page opens from
    ConveyorLocation.html.
*/
    function initializeZoneFromMenuChoice() {
        if (!zoneNameInput.value.trim()) {
            zoneNameInput.value = zoneDisplayName;
        }

        document.title = `${zoneDisplayName} Layout`;
    }

    /*
        Starts dragging a new conveyor or part from the menu.
    */
    function startDraggingNewItem(button, event) {
        event.preventDefault();

        isNewItem = true;
        activeItem = createZoneItem(button.dataset.type, button.dataset.label);

        const size = getItemSize(activeItem.dataset.type);

        offsetX = size.width / 2;
        offsetY = size.height / 2;

        createPreviewItem(activeItem, event.clientX, event.clientY);
        addDragListeners();
    }

    /*
        Starts moving an item already on the board.
    */
    function startMovingZoneItem(event) {
        event.preventDefault();

        isNewItem = false;
        activeItem = event.currentTarget;

        selectZoneItem(activeItem);

        const rect = activeItem.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        createPreviewItem(activeItem, event.clientX, event.clientY);
        activeItem.style.opacity = "0.35";

        addDragListeners();
    }

    /*
        Creates an actual board item.
    */
    function createZoneItem(type, label) {
        const item = document.createElement("div");
        const size = getItemSize(type);

        item.classList.add("zone-item");

        item.dataset.id = `zone-item-${nextItemId}`;
        item.dataset.type = type;
        item.dataset.label = label || "Item";
        item.dataset.notes = "";
        item.dataset.parentConveyorId = "";
        item.dataset.rotation = "0";

        item.style.width = `${size.width}px`;
        item.style.height = `${size.height}px`;
        item.style.left = "0px";
        item.style.top = "0px";

        item.textContent = item.dataset.label;
        applyItemTransform(item);
        item.addEventListener("pointerdown", startMovingZoneItem);

        nextItemId += 1;

        return item;
    }

    /*
        Conveyor items are larger. Parts are smaller.
    */
    function getItemSize(type) {
        const partTypes = ["photoeye", "motor", "e-stop"];

        if (partTypes.includes(type)) {
            return {
                width: CONFIG.partWidth,
                height: CONFIG.partHeight
            };
        }

        return {
            width: CONFIG.itemWidth,
            height: CONFIG.itemHeight
        };
    }

    /*
        Creates the floating preview that follows the pointer.
    */
    function createPreviewItem(sourceItem, clientX, clientY) {
        previewItem = sourceItem.cloneNode(true);

        previewItem.classList.remove("selected");
        previewItem.classList.add("zone-preview");
        previewItem.style.opacity = "0.75";

        document.body.appendChild(previewItem);

        movePreview(clientX, clientY);
    }

    /*
        Adds global listeners while dragging.
    */
    function addDragListeners() {
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", cancelDrag);
    }

    /*
        Removes global listeners after dragging.
    */
    function removeDragListeners() {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", cancelDrag);
    }

    /*
        Moves the preview with the pointer.
    */
    function handlePointerMove(event) {
        if (!activeItem) return;

        movePreview(event.clientX, event.clientY);
    }

    /*
        Drops the item if the pointer is over the board.
    */
    function handlePointerUp(event) {
        if (!activeItem) return;

        if (isPointerInsideBoard(event)) {
            dropItemOnBoard(event);
        } else if (!isNewItem) {
            activeItem.style.opacity = "1";
        }

        resetDrag();
    }

    /*
        Cancels dragging.
    */
    function cancelDrag() {
        if (activeItem && !isNewItem) {
            activeItem.style.opacity = "1";
        }

        resetDrag();
    }

    /*
            Places the item on the board.
        */
    function dropItemOnBoard(event) {
        const boardPosition = getBoardPosition(event);
        const size = getItemSize(activeItem.dataset.type);

        let x = clamp(boardPosition.x - offsetX, 0, zoneBoard.clientWidth - size.width);
        let y = clamp(boardPosition.y - offsetY, 0, zoneBoard.clientHeight - size.height);

        if (snapMode) {
            x = snapToGrid(x);
            y = snapToGrid(y);

            x = clamp(x, 0, zoneBoard.clientWidth - size.width);
            y = clamp(y, 0, zoneBoard.clientHeight - size.height);
        }
        activeItem.style.left = `${x}px`;
        activeItem.style.top = `${y}px`;
        activeItem.style.opacity = "1";

        if (isNewItem) {
            zoneBoard.appendChild(activeItem);
        }

        attachPartToConveyorIfNeeded(activeItem);
    }
    /*
        If a smaller part is dropped on top of a conveyor, store the conveyor ID.
    */
    function attachPartToConveyorIfNeeded(item) {
        if (!isPartType(item.dataset.type)) return;

        const conveyor = findConveyorUnderItem(item);

        item.dataset.parentConveyorId = conveyor ? conveyor.dataset.id : "";
    }

    /*
        Checks whether an item is a part instead of a conveyor.
    */
    function isPartType(type) {
        return ["photoeye", "motor", "e-stop"].includes(type);
    }

    /*
        Finds a conveyor underneath a dropped part.
    */
    function findConveyorUnderItem(partItem) {
        const partRect = partItem.getBoundingClientRect();
        const conveyors = Array.from(zoneBoard.querySelectorAll(".zone-item")).filter(
            (item) => !isPartType(item.dataset.type) && item !== partItem
        );

        return conveyors.find((conveyor) => {
            const conveyorRect = conveyor.getBoundingClientRect();

            return (
                partRect.left < conveyorRect.right &&
                partRect.right > conveyorRect.left &&
                partRect.top < conveyorRect.bottom &&
                partRect.bottom > conveyorRect.top
            );
        });
    }

    /*
        Selects a board item and shows its properties.
    */
    function selectZoneItem(item) {
        clearSelection();

        selectedItem = item;
        selectedItem.classList.add("selected");

        selectedZoneItemLabel.textContent = item.dataset.type;
        selectedItemNameInput.value = item.dataset.label || "";
        selectedItemNotesInput.value = item.dataset.notes || "";

        if (selectedItemRotationInput) {
            selectedItemRotationInput.value = item.dataset.rotation || "0";
        }
    }

    /*
        Clears current selection.
    */
    function clearSelection() {
        if (selectedItem) {
            selectedItem.classList.remove("selected");
        }

        selectedItem = null;
    }

    /*
        Applies property panel edits to selected item.
    */
    function applySelectedItemProperties() {
        if (!selectedItem) return;

        selectedItem.dataset.label = selectedItemNameInput.value.trim() || selectedItem.dataset.label;
        selectedItem.dataset.notes = selectedItemNotesInput.value.trim();

        if (selectedItemRotationInput) {
            selectedItem.dataset.rotation = selectedItemRotationInput.value || "0";
        }

        selectedItem.textContent = selectedItem.dataset.label;
        selectedZoneItemLabel.textContent = selectedItem.dataset.type;

        applyItemTransform(selectedItem);
    }

    function toggleSnapMode() {
        snapMode = !snapMode;

        snapZoneBtn.textContent = snapMode ? "Snap Grid: ON" : "Snap Grid: OFF";
        snapZoneBtn.classList.toggle("active", snapMode);
    }

    function rotateSelectedItem(amount) {
        if (!selectedItem) return;

        const currentRotation = Number(selectedItem.dataset.rotation || 0);
        const nextRotation = normalizeRotation(currentRotation + amount);

        selectedItem.dataset.rotation = String(nextRotation);

        if (selectedItemRotationInput) {
            selectedItemRotationInput.value = String(nextRotation);
        }

        applyItemTransform(selectedItem);
    }

    function applyItemTransform(item) {
        const rotation = Number(item.dataset.rotation || 0);

        item.style.transform = `rotate(${rotation}deg)`;
    }

    function normalizeRotation(rotation) {
        let normalized = rotation % 360;

        if (normalized < 0) {
            normalized += 360;
        }

        return normalized;
    }

    function snapToGrid(value) {
        return Math.round(value / CONFIG.gridSize) * CONFIG.gridSize;
    }

    /*
        Deletes selected item.
    */
    function deleteSelectedItem() {
        if (!selectedItem) return;

        selectedItem.remove();
        selectedItem = null;

        selectedZoneItemLabel.textContent = "Select a conveyor or part.";
        selectedItemNameInput.value = "";
        selectedItemNotesInput.value = "";
    }

    /*
        Converts pointer position to board coordinates.
    */
    function getBoardPosition(event) {
        const boardRect = zoneBoard.getBoundingClientRect();

        return {
            x: event.clientX - boardRect.left,
            y: event.clientY - boardRect.top
        };
    }

    /*
        Checks whether pointer is inside the board.
    */
    function isPointerInsideBoard(event) {
        const boardRect = zoneBoard.getBoundingClientRect();

        return (
            event.clientX >= boardRect.left &&
            event.clientX <= boardRect.right &&
            event.clientY >= boardRect.top &&
            event.clientY <= boardRect.bottom
        );
    }

    /*
        Moves preview element.
    */
    function movePreview(clientX, clientY) {
        if (!previewItem) return;

        previewItem.style.left = `${clientX - offsetX}px`;
        previewItem.style.top = `${clientY - offsetY}px`;
    }

    /*
        Resets drag state.
    */
    function resetDrag() {
        activeItem = null;
        isNewItem = false;

        if (previewItem) {
            previewItem.remove();
            previewItem = null;
        }

        removeDragListeners();
    }

    /*
        Saves current zone layout.
    */
    function saveZoneLayout() {
        const items = Array.from(zoneBoard.querySelectorAll(".zone-item")).map((item) => {
            return {
                id: item.dataset.id,
                type: item.dataset.type,
                label: item.dataset.label,
                notes: item.dataset.notes,
                parentConveyorId: item.dataset.parentConveyorId,
                left: parseFloat(item.style.left) || 0,
                top: parseFloat(item.style.top) || 0,
                width: parseFloat(item.style.width) || getItemSize(item.dataset.type).width,
                height: parseFloat(item.style.height) || getItemSize(item.dataset.type).height,
                rotation: Number(item.dataset.rotation || 0)
            };
        });

        const saveData = {
            zoneName: zoneNameInput.value.trim() || "Unnamed Zone",
            savedAt: new Date().toISOString(),
            nextItemId,
            items
        };

        localStorage.setItem(getStorageKey(), JSON.stringify(saveData));
        window.alert("Zone layout saved.");
    }

    /*
        Loads saved zone layout.
    */
    function loadZoneLayout() {
        const rawData = localStorage.getItem(getStorageKey());
        if (!rawData) {
            window.alert("No saved conveyor zone found.");
            return;
        }

        const saveData = JSON.parse(rawData);

        clearZoneLayout();

        zoneNameInput.value = saveData.zoneName || "";
        nextItemId = saveData.nextItemId || 1;

        saveData.items.forEach((savedItem) => {
            const item = createZoneItem(savedItem.type, savedItem.label);

            item.dataset.id = savedItem.id;
            item.dataset.notes = savedItem.notes || "";
            item.dataset.parentConveyorId = savedItem.parentConveyorId || "";
            item.dataset.rotation = String(savedItem.rotation || 0);

            item.style.left = `${savedItem.left}px`;
            item.style.top = `${savedItem.top}px`;
            item.style.width = `${savedItem.width}px`;
            item.style.height = `${savedItem.height}px`;

            applyItemTransform(item);

            zoneBoard.appendChild(item);
        });
    }

    /*
        Clears the whole layout.
    */
    function clearZoneLayout() {
        zoneBoard.querySelectorAll(".zone-item").forEach((item) => item.remove());

        clearSelection();
    }

    /*
        Keeps a value between a min and max.
    */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
});
