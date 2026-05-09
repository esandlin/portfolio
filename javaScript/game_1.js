/* jshint browser: true, esversion: 6 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("dropZone");
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    const partsMenuTree = document.getElementById("partsMenuTree");

    const connectModeBtn = document.getElementById("connectModeBtn");
    const clearLinesBtn = document.getElementById("clearLinesBtn");

    let nextInstanceId = 1;
    let connectMode = false;
    let firstConnectionItem = null;
    const connections = [];
    
    const itemWidth = 150;
    const itemHeight = 50;

    let activeItem = null;
    let previewItem = null;
    let isNewItem = false;
    let offsetX = 0;
    let offsetY = 0;
    let originalLeft = 0;
    let originalTop = 0;

    /*
       ============================================================
       PARTS CATALOG

       Any item with "children" becomes a dropdown category.
       Any item without "children" becomes a draggable part.

       You can nest children as deep as you want.
       ============================================================
    */

    const partsCatalog = [
        {
            label: "Sensors",
            categoryClass: "sensor-part",
            children: [
                {
                    label: "Limit Switches",
                    children: [
                        {
                            label: "Normally Open",
                            shortLabel: "Limit Switch NO"
                        },
                        {
                            label: "Normally Closed",
                            shortLabel: "Limit Switch NC"
                        }
                    ]
                },
                {
                    label: "Proximity Sensors",
                    children: [
                        {
                            label: "Capacitive",
                            shortLabel: "Capacitive Prox"
                        },
                        {
                            label: "Inductive",
                            shortLabel: "Inductive Prox"
                        }
                    ]
                },
                {
                    label: "Level Sensors",
                    children: [
                        {
                            label: "Float Switch",
                            shortLabel: "Float Level"
                        },
                        {
                            label: "Ultrasonic Level Sensor",
                            shortLabel: "Ultrasonic Level"
                        },
                        {
                            label: "Radar Level Sensor",
                            shortLabel: "Radar Level"
                        }
                    ]
                },
                {
                    label: "Temperature Sensors",
                    children: [
                        {
                            label: "Thermocouple",
                            shortLabel: "Thermocouple"
                        },
                        {
                            label: "RTD",
                            shortLabel: "RTD"
                        },
                        {
                            label: "Thermistor",
                            shortLabel: "Thermistor"
                        },
                        {
                            label: "Infrared Temperature Sensor",
                            shortLabel: "IR Temp Sensor"
                        }
                    ]
                },
                {
                    label: "Flow Sensors",
                    children: [
                        {
                            label: "Turbine Flow Sensor",
                            shortLabel: "Turbine Flow"
                        },
                        {
                            label: "Magnetic Flow Meter",
                            shortLabel: "Mag Flow"
                        },
                        {
                            label: "Ultrasonic Flow Meter",
                            shortLabel: "Ultrasonic Flow"
                        },
                        {
                            label: "Differential Pressure Flow",
                            shortLabel: "DP Flow"
                        }
                    ]
                },
                {
                    label: "Pressure Sensors",
                    children: [
                        {
                            label: "Gauge Pressure",
                            shortLabel: "Gauge Pressure"
                        },
                        {
                            label: "Absolute Pressure",
                            shortLabel: "Absolute Pressure"
                        },
                        {
                            label: "Differential Pressure",
                            shortLabel: "DP Sensor"
                        },
                        {
                            label: "Vacuum Pressure",
                            shortLabel: "Vacuum Sensor"
                        }
                    ]
                },
                {
                    label: "Load Cells",
                    children: [
                        {
                            label: "Compression Load Cell",
                            shortLabel: "Compression LC"
                        },
                        {
                            label: "Tension Load Cell",
                            shortLabel: "Tension LC"
                        },
                        {
                            label: "S-Beam Load Cell",
                            shortLabel: "S-Beam LC"
                        },
                        {
                            label: "Shear Beam Load Cell",
                            shortLabel: "Shear Beam LC"
                        }
                    ]
                }
            ]
        },
        {
            label: "Motors",
            categoryClass: "motor-part",
            children: [
                {
                    label: "AC Motors",
                    children: [
                        {
                            label: "Single Phase AC Motor",
                            shortLabel: "1PH AC Motor"
                        },
                        {
                            label: "Three Phase AC Motor",
                            shortLabel: "3PH AC Motor"
                        }
                    ]
                },
                {
                    label: "DC Motors",
                    children: [
                        {
                            label: "Brushed DC Motor",
                            shortLabel: "Brushed DC"
                        },
                        {
                            label: "Brushless DC Motor",
                            shortLabel: "BLDC Motor"
                        }
                    ]
                },
                {
                    label: "Servo Motors",
                    children: [
                        {
                            label: "AC Servo",
                            shortLabel: "AC Servo"
                        },
                        {
                            label: "DC Servo",
                            shortLabel: "DC Servo"
                        }
                    ]
                },
                {
                    label: "Stepper Motors",
                    children: [
                        {
                            label: "Bipolar Stepper",
                            shortLabel: "Bipolar Stepper"
                        },
                        {
                            label: "Unipolar Stepper",
                            shortLabel: "Unipolar Stepper"
                        }
                    ]
                }
            ]
        },
        {
            label: "Controls",
            categoryClass: "control-part",
            children: [
                {
                    label: "PLC Devices",
                    children: [
                        {
                            label: "PLC Processor",
                            shortLabel: "PLC CPU"
                        },
                        {
                            label: "Digital Input Module",
                            shortLabel: "Digital Input"
                        },
                        {
                            label: "Digital Output Module",
                            shortLabel: "Digital Output"
                        },
                        {
                            label: "Analog Input Module",
                            shortLabel: "Analog Input"
                        },
                        {
                            label: "Analog Output Module",
                            shortLabel: "Analog Output"
                        }
                    ]
                },
                {
                    label: "Operator Controls",
                    children: [
                        {
                            label: "Push Button",
                            shortLabel: "Push Button"
                        },
                        {
                            label: "Selector Switch",
                            shortLabel: "Selector Switch"
                        },
                        {
                            label: "Pilot Light",
                            shortLabel: "Pilot Light"
                        },
                        {
                            label: "HMI Screen",
                            shortLabel: "HMI"
                        }
                    ]
                },
                {
                    label: "Motor Controls",
                    children: [
                        {
                            label: "Contactor",
                            shortLabel: "Contactor"
                        },
                        {
                            label: "Motor Starter",
                            shortLabel: "Motor Starter"
                        },
                        {
                            label: "VFD",
                            shortLabel: "VFD"
                        },
                        {
                            label: "Overload Relay",
                            shortLabel: "Overload"
                        }
                    ]
                }
            ]
        },
        {
            label: "Safety",
            categoryClass: "safety-part",
            children: [
                {
                    label: "Emergency Stops",
                    children: [
                        {
                            label: "E-Stop Normally Closed",
                            shortLabel: "E-Stop NC"
                        },
                        {
                            label: "Pull Cord E-Stop",
                            shortLabel: "Pull Cord"
                        }
                    ]
                },
                {
                    label: "Safety Sensors",
                    children: [
                        {
                            label: "Light Curtain",
                            shortLabel: "Light Curtain"
                        },
                        {
                            label: "Safety Interlock Switch",
                            shortLabel: "Interlock"
                        },
                        {
                            label: "Safety Mat",
                            shortLabel: "Safety Mat"
                        }
                    ]
                },
                {
                    label: "Safety Relays",
                    children: [
                        {
                            label: "Single Channel Safety Relay",
                            shortLabel: "1CH Safety Relay"
                        },
                        {
                            label: "Dual Channel Safety Relay",
                            shortLabel: "2CH Safety Relay"
                        }
                    ]
                }
            ]
        },
        {
            label: "Pneumatics",
            categoryClass: "pneumatic-part",
            children: [
                {
                    label: "Valves",
                    children: [
                        {
                            label: "3/2 Solenoid Valve",
                            shortLabel: "3/2 Valve"
                        },
                        {
                            label: "5/2 Solenoid Valve",
                            shortLabel: "5/2 Valve"
                        },
                        {
                            label: "5/3 Solenoid Valve",
                            shortLabel: "5/3 Valve"
                        }
                    ]
                },
                {
                    label: "Cylinders",
                    children: [
                        {
                            label: "Single Acting Cylinder",
                            shortLabel: "Single Cylinder"
                        },
                        {
                            label: "Double Acting Cylinder",
                            shortLabel: "Double Cylinder"
                        }
                    ]
                },
                {
                    label: "Air Prep",
                    children: [
                        {
                            label: "Filter",
                            shortLabel: "Air Filter"
                        },
                        {
                            label: "Regulator",
                            shortLabel: "Regulator"
                        },
                        {
                            label: "Lubricator",
                            shortLabel: "Lubricator"
                        }
                    ]
                }
            ]
        },
        {
            label: "Hydraulics",
            categoryClass: "hydraulic-part",
            children: [
                {
                    label: "Hydraulic Valves",
                    children: [
                        {
                            label: "Directional Control Valve",
                            shortLabel: "Directional Valve"
                        },
                        {
                            label: "Pressure Relief Valve",
                            shortLabel: "Relief Valve"
                        },
                        {
                            label: "Flow Control Valve",
                            shortLabel: "Flow Valve"
                        }
                    ]
                },
                {
                    label: "Hydraulic Actuators",
                    children: [
                        {
                            label: "Hydraulic Cylinder",
                            shortLabel: "Hyd Cylinder"
                        },
                        {
                            label: "Hydraulic Motor",
                            shortLabel: "Hyd Motor"
                        }
                    ]
                },
                {
                    label: "Hydraulic Power",
                    children: [
                        {
                            label: "Hydraulic Pump",
                            shortLabel: "Hyd Pump"
                        },
                        {
                            label: "Reservoir",
                            shortLabel: "Reservoir"
                        },
                        {
                            label: "Accumulator",
                            shortLabel: "Accumulator"
                        }
                    ]
                }
            ]
        },
        {
            label: "Electrical",
            categoryClass: "electrical-part",
            children: [
                {
                    label: "Protection",
                    children: [
                        {
                            label: "Fuse",
                            shortLabel: "Fuse"
                        },
                        {
                            label: "Circuit Breaker",
                            shortLabel: "Breaker"
                        },
                        {
                            label: "Surge Protector",
                            shortLabel: "Surge Protect"
                        }
                    ]
                },
                {
                    label: "Power Supplies",
                    children: [
                        {
                            label: "24VDC Power Supply",
                            shortLabel: "24VDC Supply"
                        },
                        {
                            label: "120VAC Transformer",
                            shortLabel: "Transformer"
                        }
                    ]
                },
                {
                    label: "Terminals",
                    children: [
                        {
                            label: "Terminal Block",
                            shortLabel: "Terminal Block"
                        },
                        {
                            label: "Ground Terminal",
                            shortLabel: "Ground Terminal"
                        },
                        {
                            label: "Fuse Terminal",
                            shortLabel: "Fuse Terminal"
                        }
                    ]
                }
            ]
        }
    ];

    buildPartsMenu(partsCatalog, partsMenuTree, []);

    renderCanvas();

    /*
       ============================================================
       MENU BUILDER
       ============================================================
    */

    function buildPartsMenu(items, parentElement, path, inheritedCategoryClass) {
        items.forEach(item => {
            const currentPath = path.concat(item.label);
            const categoryClass = item.categoryClass || inheritedCategoryClass || "part-generic";

            if (item.children && item.children.length > 0) {
                const details = document.createElement("details");
                details.classList.add("parts-category");

                const summary = document.createElement("summary");
                summary.textContent = item.label;

                const childrenWrapper = document.createElement("div");
                childrenWrapper.classList.add("parts-children");

                details.appendChild(summary);
                details.appendChild(childrenWrapper);
                parentElement.appendChild(details);

                buildPartsMenu(item.children, childrenWrapper, currentPath, categoryClass);
            } else {
                const button = document.createElement("button");

                button.classList.add("drag-item");
                button.classList.add(categoryClass);

                button.type = "button";
                button.textContent = item.label;

                button.dataset.label = item.shortLabel || item.label;
                button.dataset.fullPath = currentPath.join(" > ");
                button.dataset.categoryClass = categoryClass;
                button.dataset.partId = makePartId(currentPath);

                parentElement.appendChild(button);
            }
        });
    }

    function makePartId(pathArray) {
        return pathArray
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    /*
       ============================================================
       CANVAS BACKGROUND
       ============================================================
    */

    function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#777";
    ctx.font = "20px Arial";
    ctx.fillText("Drop items here", 20, 35);

    drawConnections();

    if (connectMode) {
        ctx.fillStyle = "#007bff";
        ctx.font = "16px Arial";
        ctx.fillText("Connect Mode: tap two parts to draw a line", 20, 60);
    }
}
    
    function drawConnections() {
    connections.forEach(connection => {
        const fromItem = dropZone.querySelector(`[data-instance-id="${connection.fromId}"]`);
        const toItem = dropZone.querySelector(`[data-instance-id="${connection.toId}"]`);

        if (!fromItem || !toItem) return;

        const fromCenter = getItemCenter(fromItem);
        const toCenter = getItemCenter(toItem);

        ctx.beginPath();
        ctx.moveTo(fromCenter.x, fromCenter.y);
        ctx.lineTo(toCenter.x, toCenter.y);

        ctx.strokeStyle = getConnectionColor();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Small circles at connection points
        ctx.beginPath();
        ctx.arc(fromCenter.x, fromCenter.y, 5, 0, Math.PI * 2);
        ctx.arc(toCenter.x, toCenter.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = getConnectionColor();
        ctx.fill();
    });
}

function getItemCenter(item) {
    const left = parseFloat(item.style.left) || 0;
    const top = parseFloat(item.style.top) || 0;

    return {
        x: left + item.offsetWidth / 2,
        y: top + item.offsetHeight / 2
    };
}

function getConnectionColor() {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    if (currentTheme === "dark") {
        return "#FFD700";
    }

    return "#222";
}

    /*
       ============================================================
       DRAG AND DROP
       ============================================================
    */

    function createPlacedItem(partButton) {
        const item = document.createElement("div");

        item.classList.add("placed-item");
        item.classList.add(partButton.dataset.categoryClass || "part-generic");

        item.dataset.partId = partButton.dataset.partId;
        item.dataset.fullPath = partButton.dataset.fullPath;
        item.dataset.categoryClass = partButton.dataset.categoryClass;
        item.dataset.instanceId = `part-${nextInstanceId}`;
        nextInstanceId += 1;
        item.textContent = partButton.dataset.label;

        item.title = partButton.dataset.fullPath;

        item.style.left = "0px";
        item.style.top = "0px";

        item.addEventListener("pointerdown", startMovingPlacedItem);

        return item;
    }

    function createPreviewItem(sourceItem, clientX, clientY) {
        previewItem = document.createElement("div");

        previewItem.classList.add("drag-preview");
        previewItem.classList.add(sourceItem.dataset.categoryClass || "part-generic");

        previewItem.textContent = sourceItem.dataset.label || sourceItem.textContent.trim();

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
    
    function handleConnectionSelection(item) {
    if (!firstConnectionItem) {
        firstConnectionItem = item;
        firstConnectionItem.classList.add("connection-selected");
        return;
    }

    if (firstConnectionItem === item) {
        clearConnectionSelection();
        return;
    }

    const fromId = firstConnectionItem.dataset.instanceId;
    const toId = item.dataset.instanceId;

    const connectionAlreadyExists = connections.some(connection => {
        const sameDirection =
            connection.fromId === fromId &&
            connection.toId === toId;

        const oppositeDirection =
            connection.fromId === toId &&
            connection.toId === fromId;

        return sameDirection || oppositeDirection;
    });

    if (!connectionAlreadyExists) {
        connections.push({
            fromId: fromId,
            toId: toId
        });
    }

    clearConnectionSelection();
    renderCanvas();
}

function clearConnectionSelection() {
    if (firstConnectionItem) {
        firstConnectionItem.classList.remove("connection-selected");
        firstConnectionItem = null;
    }
}

    // Event delegation: this works even though the menu buttons are created by JavaScript.
    partsMenuTree.addEventListener("pointerdown", event => {
        const partButton = event.target.closest(".drag-item");

        if (!partButton) return;

        event.preventDefault();

        isNewItem = true;

        activeItem = createPlacedItem(partButton);

        offsetX = itemWidth / 2;
        offsetY = itemHeight / 2;

        createPreviewItem(partButton, event.clientX, event.clientY);

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", handlePointerCancel);
    });

    connectModeBtn.addEventListener("click", () => {
    connectMode = !connectMode;

    if (connectMode) {
        connectModeBtn.textContent = "Connect Mode: ON";
        connectModeBtn.classList.add("active");
    } else {
        connectModeBtn.textContent = "Connect Mode: OFF";
        connectModeBtn.classList.remove("active");
        clearConnectionSelection();
    }

    renderCanvas();
});

clearLinesBtn.addEventListener("click", () => {
    connections.length = 0;
    clearConnectionSelection();
    renderCanvas();
});
    
    // Start moving an item that is already inside the drop zone.
    function startMovingPlacedItem(event) {
        if (connectMode) {
    event.preventDefault();
    handleConnectionSelection(event.currentTarget);
    return;
}
        event.preventDefault();

        isNewItem = false;

        activeItem = event.currentTarget;

        const itemRect = activeItem.getBoundingClientRect();

        offsetX = event.clientX - itemRect.left;
        offsetY = event.clientY - itemRect.top;

        originalLeft = parseFloat(activeItem.style.left) || 0;
        originalTop = parseFloat(activeItem.style.top) || 0;

        activeItem.style.opacity = "0.4";

        createPreviewItem(activeItem, event.clientX, event.clientY);

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
        renderCanvas();
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