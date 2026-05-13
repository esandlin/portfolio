/* jshint browser: true, esversion: 6, devel: true */
"use strict";

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

    const conveyorPartsMenuTree = document.getElementById("conveyorPartsMenuTree");

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
        !conveyorPartsMenuTree ||
        !deleteZoneItemBtn
    ) {
        console.error("ConveyorLocationsCAD setup error: one or more required HTML elements are missing.");
        console.error(
            "Required IDs: zoneBoard, zoneNameInput, saveZoneBtn, loadZoneBtn, clearZoneBtn, snapZoneBtn, selectedZoneItemLabel, selectedItemNameInput, selectedItemNotesInput, selectedItemRotationInput, rotateLeftBtn, rotateRightBtn, applyZoneItemBtn, deleteZoneItemBtn."
        );
        return;
    }

    const zoneType = getZoneTypeFromUrl();
    const zoneDisplayName = getZoneDisplayName(zoneType);

    const CONFIG = {
        itemWidth: 220,
        itemHeight: 70,
        partWidth: 90,
        partHeight: 55,
        minConveyorWidth: 100,
        minConveyorHeight: 45,
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

    let isResizing = false;
    let resizeItem = null;
    let resizeStartClientX = 0;
    let resizeStartClientY = 0;
    let resizeStartWidth = 0;
    let resizeStartHeight = 0;

    let dragStartLeft = 0;
    let dragStartTop = 0;
    let attachedPartsSnapshot = [];

    document.querySelector(".conveyor-menu").addEventListener("pointerdown", (event) => {
        const button = event.target.closest(".conveyor-menu-item");

        if (!button) return;

        startDraggingNewItem(button, event);
    });

    buildConveyorPartsMenu(window.IndustrialPartsCatalog || [], conveyorPartsMenuTree, []);

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
    Builds the shared industrial parts menu inside Conveyor Locations CAD.

    This uses the same IndustrialPartsCatalog that the CAD Parts Repair
    page uses, so you do not have to create parts twice.
*/
    function buildConveyorPartsMenu(items, parentElement, path, inheritedCategoryClass) {
        items.forEach((item) => {
            const currentPath = path.concat(item.label);
            const categoryClass = item.categoryClass || inheritedCategoryClass || "part-generic";

            if (item.children && item.children.length > 0) {
                const details = document.createElement("details");
                const summary = document.createElement("summary");
                const childrenWrapper = document.createElement("div");

                details.classList.add("parts-category");
                childrenWrapper.classList.add("parts-children");

                summary.textContent = item.label;

                details.appendChild(summary);
                details.appendChild(childrenWrapper);
                parentElement.appendChild(details);

                buildConveyorPartsMenu(item.children, childrenWrapper, currentPath, categoryClass);
                return;
            }

            createConveyorPartButton(item, parentElement, currentPath, categoryClass);
        });
    }

    /*
    Creates one draggable part button for the Conveyor Locations CAD page.
*/
    function createConveyorPartButton(item, parentElement, currentPath, categoryClass) {
        const button = document.createElement("button");
        const label = item.shortLabel || item.label || "Part";

        button.type = "button";
        button.classList.add("conveyor-menu-item");
        button.classList.add("shared-part-menu-item");
        button.classList.add(categoryClass);

        button.dataset.kind = "part";
        button.dataset.type = makePartId(currentPath);
        button.dataset.label = label;
        button.dataset.fullPath = currentPath.join(" > ");
        button.dataset.image = item.image || "";
        button.dataset.categoryClass = categoryClass;

        button.innerHTML = item.image
            ? `
            <span class="conveyor-part-menu-content">
                <img class="conveyor-part-menu-thumb" src="${item.image}" alt="${label}">
                <span>${label}</span>
            </span>
        `
            : label;

        parentElement.appendChild(button);
    }

    /*
    Converts a category path into a safe ID.
*/
    function makePartId(pathArray) {
        return pathArray
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

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
    /*
    Starts dragging a new conveyor or shared industrial part from the menu.
*/
    function startDraggingNewItem(button, event) {
        event.preventDefault();

        isNewItem = true;

        activeItem = createZoneItemFromButton(button);

        const size = getItemSize(activeItem);

        offsetX = size.width / 2;
        offsetY = size.height / 2;

        dragStartLeft = 0;
        dragStartTop = 0;
        attachedPartsSnapshot = [];

        createPreviewItem(activeItem, event.clientX, event.clientY);
        addDragListeners();
    }

    /*
    Creates a board item from the menu button that was dragged.

    Conveyor buttons become conveyor items.
    Shared catalog buttons become mounted part items.
*/
    function createZoneItemFromButton(button) {
        return createZoneItem({
            type: button.dataset.type || "item",
            label: button.dataset.label || button.textContent.trim() || "Item",
            kind: button.dataset.kind || "conveyor",
            image: button.dataset.image || "",
            fullPath: button.dataset.fullPath || "",
            categoryClass: button.dataset.categoryClass || ""
        });
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

        dragStartLeft = parseFloat(activeItem.style.left) || 0;
        dragStartTop = parseFloat(activeItem.style.top) || 0;
        attachedPartsSnapshot = getAttachedPartsSnapshot(activeItem);

        createPreviewItem(activeItem, event.clientX, event.clientY);
        activeItem.style.opacity = "0.35";

        addDragListeners();
    }

    /*
        Creates an actual board item.
    */
    /*
    Creates an actual board item.

    data.kind controls behavior:
    - "conveyor" = large, resizable conveyor block
    - "part" = smaller mounted part from the shared parts catalog
*/
    function createZoneItem(data) {
        const item = document.createElement("div");

        item.classList.add("zone-item");

        if (data.categoryClass) {
            item.classList.add(data.categoryClass);
        }

        item.dataset.id = `zone-item-${nextItemId}`;
        item.dataset.type = data.type || "item";
        item.dataset.kind = data.kind || "conveyor";
        item.dataset.label = data.label || "Item";
        item.dataset.notes = "";
        item.dataset.parentConveyorId = "";
        item.dataset.rotation = "0";
        item.dataset.image = data.image || "";
        item.dataset.fullPath = data.fullPath || "";
        item.dataset.categoryClass = data.categoryClass || "";

        const size = getItemSize(item);

        item.style.width = `${size.width}px`;
        item.style.height = `${size.height}px`;
        item.style.left = "0px";
        item.style.top = "0px";

        renderZoneItemContent(item);
        applyItemTransform(item);

        item.addEventListener("pointerdown", startMovingZoneItem);

        nextItemId += 1;

        return item;
    }

    /*
    Builds the visible content inside a conveyor or mounted part.

    Conveyors:
    - Use a large conveyor image if one exists.
    - Keep the label visible on top.
    - Keep the resize handle.

    Parts:
    - Use a smaller part image.
    - Stay above conveyors.
*/
function renderZoneItemContent(item) {
    item.textContent = "";

    const isPart = isPartType(item);
    const imagePath = item.dataset.image || "";

    if (imagePath) {
        const image = document.createElement("img");

        image.classList.add("zone-item-image");

        if (isPart) {
            image.classList.add("zone-part-image");
        } else {
            image.classList.add("zone-conveyor-image");
        }

        image.src = imagePath;
        image.alt = item.dataset.label || "Zone item";

        item.appendChild(image);
    }

    const label = document.createElement("span");

    label.classList.add("zone-item-label");
    label.textContent = item.dataset.label || "Item";

    item.appendChild(label);

    if (!isPart) {
        const resizeHandle = document.createElement("button");

        resizeHandle.type = "button";
        resizeHandle.classList.add("zone-resize-handle");
        resizeHandle.setAttribute("aria-label", "Resize conveyor");

        resizeHandle.addEventListener("pointerdown", startResizingConveyor);

        item.appendChild(resizeHandle);
    }
}

    /*
    Conveyor items are larger.
    Shared catalog parts are smaller.

    This accepts either:
    - A zone item element
    - A legacy type string
*/
    function getItemSize(itemOrType) {
        if (itemOrType && typeof itemOrType !== "string") {
            if (itemOrType.dataset.kind === "part") {
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
        Backward compatibility for old hard-coded parts.
    */
        const legacyPartTypes = ["photoeye", "motor", "e-stop"];

        if (legacyPartTypes.includes(itemOrType)) {
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
    Places the active item on the board.

    If the item is a conveyor and it already has parts attached,
    those attached parts move with the conveyor.
*/
    function dropItemOnBoard(event) {
        const boardPosition = getBoardPosition(event);
        const size = getItemSize(activeItem);

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

        /*
        If this is an existing conveyor being moved,
        move its attached parts by the same amount.
    */
        if (!isNewItem && !isPartType(activeItem)) {
            const deltaX = x - dragStartLeft;
            const deltaY = y - dragStartTop;

            moveAttachedPartsWithConveyor(deltaX, deltaY);
        }

        /*
        If this is a smaller part, check whether it is now
        attached to a conveyor or detached from one.
    */
        attachPartToConveyorIfNeeded(activeItem);
    }

    /*
    If a smaller part is dropped on top of a conveyor,
    store the conveyor ID.

    If the part is moved away from all conveyors,
    remove the parent conveyor ID.
*/
    function attachPartToConveyorIfNeeded(item) {
        if (!isPartType(item)) return;

        const conveyor = findConveyorUnderItem(item);

        item.dataset.parentConveyorId = conveyor ? conveyor.dataset.id : "";

        item.classList.toggle("attached-to-conveyor", Boolean(conveyor));
    }

    /*
    Checks whether a zone item is a mounted part instead of a conveyor.
*/
    function isPartType(itemOrType) {
        if (itemOrType && typeof itemOrType !== "string") {
            return itemOrType.dataset.kind === "part";
        }

        return ["photoeye", "motor", "e-stop"].includes(itemOrType);
    }

    /*
        Finds a conveyor underneath a dropped part.
    */
    function findConveyorUnderItem(partItem) {
        const partRect = partItem.getBoundingClientRect();
        const conveyors = Array.from(zoneBoard.querySelectorAll(".zone-item")).filter(
            (item) => !isPartType(item) && item !== partItem
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

        renderZoneItemContent(selectedItem);
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
                kind: item.dataset.kind || "conveyor",
                label: item.dataset.label,
                notes: item.dataset.notes,
                parentConveyorId: item.dataset.parentConveyorId,
                image: item.dataset.image || "",
                fullPath: item.dataset.fullPath || "",
                categoryClass: item.dataset.categoryClass || "",
                left: parseFloat(item.style.left) || 0,
                top: parseFloat(item.style.top) || 0,
                width: parseFloat(item.style.width) || getItemSize(item).width,
                height: parseFloat(item.style.height) || getItemSize(item).height,
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
            const item = createZoneItem({
                type: savedItem.type,
                kind: savedItem.kind || "conveyor",
                label: savedItem.label,
                image: savedItem.image || "",
                fullPath: savedItem.fullPath || "",
                categoryClass: savedItem.categoryClass || ""
            });

            item.dataset.id = savedItem.id;
            item.dataset.notes = savedItem.notes || "";
            item.dataset.parentConveyorId = savedItem.parentConveyorId || "";
            item.classList.toggle("attached-to-conveyor", Boolean(item.dataset.parentConveyorId));
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
    Gets all parts currently attached to a conveyor before it moves.

    This snapshot allows the attached parts to move by the exact same
    distance as the conveyor.
*/
    function getAttachedPartsSnapshot(conveyorItem) {
        if (!conveyorItem || isPartType(conveyorItem)) {
            return [];
        }

        return Array.from(zoneBoard.querySelectorAll(".zone-item"))
            .filter((item) => item.dataset.parentConveyorId === conveyorItem.dataset.id)
            .map((item) => {
                return {
                    element: item,
                    left: parseFloat(item.style.left) || 0,
                    top: parseFloat(item.style.top) || 0
                };
            });
    }

    /*
    Starts resizing a conveyor.

    The resize handle only appears on conveyor items,
    not on smaller parts like photoeyes, motors, or E-stops.
*/
    function startResizingConveyor(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = event.currentTarget.closest(".zone-item");

        if (!item || isPartType(item)) return;

        isResizing = true;
        resizeItem = item;

        selectZoneItem(item);

        resizeStartClientX = event.clientX;
        resizeStartClientY = event.clientY;

        resizeStartWidth = parseFloat(item.style.width) || getItemSize(item.dataset.type).width;
        resizeStartHeight = parseFloat(item.style.height) || getItemSize(item.dataset.type).height;

        document.addEventListener("pointermove", handleResizeMove);
        document.addEventListener("pointerup", stopResizingConveyor);
        document.addEventListener("pointercancel", stopResizingConveyor);
    }

    /*
    Resizes the conveyor while the user drags the resize handle.
*/
    function handleResizeMove(event) {
        if (!isResizing || !resizeItem) return;

        const itemLeft = parseFloat(resizeItem.style.left) || 0;
        const itemTop = parseFloat(resizeItem.style.top) || 0;

        let newWidth = resizeStartWidth + (event.clientX - resizeStartClientX);
        let newHeight = resizeStartHeight + (event.clientY - resizeStartClientY);

        if (snapMode) {
            newWidth = snapToGrid(newWidth);
            newHeight = snapToGrid(newHeight);
        }

        newWidth = clamp(newWidth, CONFIG.minConveyorWidth, zoneBoard.clientWidth - itemLeft);

        newHeight = clamp(newHeight, CONFIG.minConveyorHeight, zoneBoard.clientHeight - itemTop);

        resizeItem.style.width = `${newWidth}px`;
        resizeItem.style.height = `${newHeight}px`;
    }

    /*
    Stops conveyor resizing and cleans up the temporary listeners.
*/
    function stopResizingConveyor() {
        isResizing = false;
        resizeItem = null;

        document.removeEventListener("pointermove", handleResizeMove);
        document.removeEventListener("pointerup", stopResizingConveyor);
        document.removeEventListener("pointercancel", stopResizingConveyor);
    }

    /*
    Moves all attached parts by the same amount as the conveyor.
*/
    function moveAttachedPartsWithConveyor(deltaX, deltaY) {
        attachedPartsSnapshot.forEach((snapshot) => {
            const item = snapshot.element;
            const size = getItemSize(item);

            const nextLeft = clamp(snapshot.left + deltaX, 0, zoneBoard.clientWidth - size.width);
            const nextTop = clamp(snapshot.top + deltaY, 0, zoneBoard.clientHeight - size.height);

            item.style.left = `${nextLeft}px`;
            item.style.top = `${nextTop}px`;
        });
    }

    /*
        Keeps a value between a min and max.
    */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
});
