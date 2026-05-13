/* jshint browser: true, esversion: 6, devel: true */
"use strict";

/*
    ============================================================
    Industrial Controls Drag-and-Drop Board
    ------------------------------------------------------------
    Features:
    - Nested parts menu built from JavaScript data
    - Mouse/touch/stylus drag-and-drop using Pointer Events
    - Dropped parts with connection terminals
    - Connect Mode for terminal-to-terminal wiring
    - Wire type selector and colored wire rendering
    - Canvas wire layer behind the dropped HTML parts
    ============================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    /*
        ============================================================
        DOM ELEMENTS
        ============================================================
    */
    const splashScreen = document.getElementById("splashScreen");
    const dropZone = document.getElementById("dropZone");
    const canvas = document.getElementById("canvas1");
    const partsMenuTree = document.getElementById("partsMenuTree");
    const connectModeBtn = document.getElementById("connectModeBtn");
    const clearLinesBtn = document.getElementById("clearLinesBtn");
    const deleteModeBtn = document.getElementById("deleteModeBtn");
    const snapModeBtn = document.getElementById("snapModeBtn");
    const saveBoardBtn = document.getElementById("saveBoardBtn");
    const loadBoardBtn = document.getElementById("loadBoardBtn");
    const clearBoardBtn = document.getElementById("clearBoardBtn");
    const wireTypeSelect = document.getElementById("wireTypeSelect");
    const wirePropertiesPanel = document.getElementById("wirePropertiesPanel");
    const selectedWireInfo = document.getElementById("selectedWireInfo");
    const wireEditLabelInput = document.getElementById("wireEditLabelInput");
    const applyWirePropertiesBtn = document.getElementById("applyWirePropertiesBtn");
    const deleteSelectedWireBtn = document.getElementById("deleteSelectedWireBtn");
    const clearWireSelectionBtn = document.getElementById("clearWireSelectionBtn");
    const partPropertiesPanel = document.getElementById("partPropertiesPanel");
    const selectedPartPath = document.getElementById("selectedPartPath");
    const partTagInput = document.getElementById("partTagInput");
    const partDescriptionInput = document.getElementById("partDescriptionInput");
    const partVoltageSelect = document.getElementById("partVoltageSelect");
    const partOutputTypeSelect = document.getElementById("partOutputTypeSelect");
    const partContactTypeSelect = document.getElementById("partContactTypeSelect");
    const applyPartPropertiesBtn = document.getElementById("applyPartPropertiesBtn");
    const clearPartSelectionBtn = document.getElementById("clearPartSelectionBtn");
    const boardScrollArea = document.getElementById("boardScrollArea");
    const boardWorld = document.getElementById("boardWorld");


    /*
        ============================================================
        REQUIRED ELEMENT CHECK
        ------------------------------------------------------------
        This prevents confusing errors if the HTML page is missing
        one of the required IDs.
        ============================================================
    */

    if (
        !dropZone ||
        !canvas ||
        !boardScrollArea ||
        !boardWorld ||
        !partsMenuTree ||
        !connectModeBtn ||
        !clearLinesBtn ||
        !deleteModeBtn ||
        !snapModeBtn ||
        !saveBoardBtn ||
        !loadBoardBtn ||
        !clearBoardBtn ||
        !wireTypeSelect ||
        !wirePropertiesPanel ||
        !selectedWireInfo ||
        !wireEditLabelInput ||
        !applyWirePropertiesBtn ||
        !deleteSelectedWireBtn ||
        !clearWireSelectionBtn ||
        !partPropertiesPanel ||
        !selectedPartPath ||
        !partTagInput ||
        !partDescriptionInput ||
        !partVoltageSelect ||
        !partOutputTypeSelect ||
        !partContactTypeSelect ||
        !applyPartPropertiesBtn ||
        !clearPartSelectionBtn
    ) {
        console.error("Game 1 setup error: one or more required HTML elements are missing.");
        console.error(
            "Required IDs: dropZone, canvas1, partsMenuTree, connectModeBtn, clearLinesBtn, deleteModeBtn, snapModeBtn, saveBoardBtn, loadBoardBtn, clearBoardBtn, wireTypeSelect, wirePropertiesPanel, selectedWireInfo, wireEditLabelInput, applyWirePropertiesBtn, deleteSelectedWireBtn, clearWireSelectionBtn, partPropertiesPanel, selectedPartPath, partTagInput, partDescriptionInput, partVoltageSelect, partOutputTypeSelect, partContactTypeSelect, applyPartPropertiesBtn, clearPartSelectionBtn."
        );
        return;
    }

    const ctx = canvas.getContext("2d");

    /*
        ============================================================
        CONFIGURATION
        ============================================================
    */

    const CONFIG = {
        defaultCanvasWidth: 800,
        defaultCanvasHeight: 500,
        itemWidth: 150,
        itemHeight: 90,
        gridSize: 25,
        previewOpacity: "0.75",
        movingOpacity: "0.4",
        storageKey: "industrialAutomationControlBoard",
        minZoom: 0.5,
        maxZoom: 2.5,
        zoomStep: 0.1
    };

    /*
        ============================================================
        APPLICATION STATE
        ------------------------------------------------------------
        These variables track the board's current interaction state.
        ============================================================
    */

    let nextInstanceId = 1;
    let connectMode = false;
    let deleteMode = false;
    let snapMode = true;
    let selectedTerminal = null;

    let activeItem = null;
    let previewItem = null;
    let isNewItem = false;
    let activePointerElement = null;

    let offsetX = 0;
    let offsetY = 0;
    let originalLeft = 0;
    let originalTop = 0;

    let selectedPart = null;

    let nextConnectionId = 1;
    let selectedConnectionId = null;

    let zoomScale = 1;
    let isPinching = false;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;

    const connections = [];

    /*
        ============================================================
        WIRE TYPE DEFINITIONS
        ------------------------------------------------------------
        Each wire type controls how a connection line is drawn.
        The values should match the <option value=""> values in HTML.
        ============================================================
    */

    const wireTypes = {
        power: {
            label: "24VDC Power",
            color: "#d32f2f",
            lineWidth: 4,
            dash: []
        },
        common: {
            label: "0VDC Common",
            color: "#111111",
            lineWidth: 4,
            dash: []
        },
        signal: {
            label: "Sensor Signal",
            color: "#1976d2",
            lineWidth: 4,
            dash: []
        },
        safety: {
            label: "Safety Circuit",
            color: "#fbc02d",
            lineWidth: 5,
            dash: []
        },
        network: {
            label: "Ethernet / Network",
            color: "#388e3c",
            lineWidth: 4,
            dash: [8, 4]
        },
        analog: {
            label: "Analog Signal",
            color: "#8e24aa",
            lineWidth: 4,
            dash: []
        },
        "ac-control": {
            label: "AC Control Power",
            color: "#f57c00",
            lineWidth: 4,
            dash: []
        },
        pneumatic: {
            label: "Pneumatic Line",
            color: "#777777",
            lineWidth: 4,
            dash: [10, 8]
        },
        hydraulic: {
            label: "Hydraulic Line",
            color: "#004d80",
            lineWidth: 6,
            dash: []
        }
    };

    /*
        ============================================================
        PARTS CATALOG
        ------------------------------------------------------------
        - Objects with children become dropdown categories.
        - Objects without children become draggable parts.
        - This structure can be nested as deep as needed.
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
                            shortLabel: "Limit Switch NO",
                            image: "../images/parts/Sensors/limit-switch-no.png"
                        },
                        {
                            label: "Normally Closed",
                            shortLabel: "Limit Switch NC",
                            image: "../images/parts/Sensors/limit-switch-nc.png"
                        }
                    ]
                },
                {
                    label: "Proximity Sensors",
                    children: [
                        {
                            label: "Capacitive",
                            shortLabel: "Capacitive Prox",
                            image: "../images/parts/Sensors/capacitive-prox.png"
                        },
                        {
                            label: "Inductive",
                            shortLabel: "Inductive Prox",
                            image: "../images/parts/Sensors/inductive-prox.png"
                        }
                    ]
                },
                {
                    label: "Level Sensors",
                    children: [
                        {
                            label: "Float Switch",
                            shortLabel: "Float Level",
                            image: "../images/parts/Sensors/float.png"
                        },
                        {
                            label: "Ultrasonic Level Sensor",
                            shortLabel: "Ultrasonic Level",
                            image: "../images/parts/Sensors/ultrasonic.png"
                        },
                        {
                            label: "Radar Level Sensor",
                            shortLabel: "Radar Level",
                            image: "../images/parts/Sensors/radar.png"
                        }
                    ]
                },
                {
                    label: "Temperature Sensors",
                    children: [
                        {
                            label: "Thermocouple",
                            shortLabel: "Thermocouple",
                            image: "../images/parts/Sensors/thermocouple.png"
                        },
                        {
                            label: "RTD",
                            shortLabel: "RTD",
                            image: "../images/parts/Sensors/rtd.png"
                        },
                        {
                            label: "Thermistor",
                            shortLabel: "Thermistor",
                            image: "../images/parts/Sensors/thermistor.png"
                        },
                        {
                            label: "Infrared Temperature Sensor",
                            shortLabel: "IR Temp Sensor",
                            image: "../images/parts/Sensors/infared.png"
                        }
                    ]
                },
                {
                    label: "Flow Sensors",
                    children: [
                        {
                            label: "Turbine Flow Sensor",
                            shortLabel: "Turbine Flow",
                            image: "../images/parts/Sensors/turbine.png"
                        },
                        {
                            label: "Magnetic Flow Meter",
                            shortLabel: "Mag Flow",
                            image: "../images/parts/Sensors/magnetic-flow.png"
                        },
                        {
                            label: "Ultrasonic Flow Meter",
                            shortLabel: "Ultrasonic Flow",
                            image: "../images/parts/Sensors/ultra-flow.png"
                        },
                        {
                            label: "Differential Pressure Flow",
                            shortLabel: "DP Flow",
                            image: "../images/parts/Sensors/diff-flow.png"
                        }
                    ]
                },
                {
                    label: "Pressure Sensors",
                    children: [
                        {
                            label: "Gauge Pressure",
                            shortLabel: "Gauge Pressure",
                            image: "../images/parts/Sensors/pressure.png"
                        },
                        {
                            label: "Absolute Pressure",
                            shortLabel: "Absolute Pressure",
                            image: "../images/parts/Sensors/press-abs.png"
                        },
                        {
                            label: "Differential Pressure",
                            shortLabel: "DP Sensor",
                            image: "../images/parts/Sensors/press-diff.png"
                        },
                        {
                            label: "Vacuum Pressure",
                            shortLabel: "Vacuum Sensor",
                            image: "../images/parts/Sensors/vacuum.png"
                        }
                    ]
                },
                {
                    label: "Load Cells",
                    children: [
                        {
                            label: "Compression Load Cell",
                            shortLabel: "Compression LC",
                            image: "../images/parts/Sensors/compression.png"
                        },
                        {
                            label: "Tension Load Cell",
                            shortLabel: "Tension LC",
                            image: "../images/parts/Sensors/tension.png"
                        },
                        {
                            label: "S-Beam Load Cell",
                            shortLabel: "S-Beam LC",
                            image: "../images/parts/Sensors/s-beam.png"
                        },
                        {
                            label: "Shear Beam Load Cell",
                            shortLabel: "Shear Beam LC",
                            image: "../images/parts/Sensors/shear.png"
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
                            shortLabel: "1PH AC Motor",
                            image: "../images/parts/Motors/1ph-ac-motor.png"
                        },
                        {
                            label: "Three Phase AC Motor",
                            shortLabel: "3PH AC Motor",
                            image: "../images/parts/Motors/3ph-ac-motor.png"
                        }
                    ]
                },
                {
                    label: "DC Motors",
                    children: [
                        {
                            label: "Brushed DC Motor",
                            shortLabel: "Brushed DC",
                            image: "../images/parts/Motors/brush-dc-motor.png"
                        },
                        {
                            label: "Brushless DC Motor",
                            shortLabel: "BLDC Motor",
                            image: "../images/parts/Motors/brushless-dc-motor.png"
                        }
                    ]
                },
                {
                    label: "Servo Motors",
                    children: [
                        {
                            label: "AC Servo",
                            shortLabel: "AC Servo",
                            image: "../images/parts/Motors/ac-servo.png"
                        },
                        {
                            label: "DC Servo",
                            shortLabel: "DC Servo",
                            image: "../images/parts/Motors/dc-servo.png"
                        }
                    ]
                },
                {
                    label: "Stepper Motors",
                    children: [
                        {
                            label: "Bipolar Stepper",
                            shortLabel: "Bipolar Stepper",
                            image: "../images/parts/Motors/bi-stepper.png"
                        },
                        {
                            label: "Unipolar Stepper",
                            shortLabel: "Unipolar Stepper",
                            image: "../images/parts/Motors/uni-stepper.png"
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
                            shortLabel: "PLC CPU",
                            image: "../images/parts/Controls/plc.png"
                        },
                        {
                            label: "Digital Input Module",
                            shortLabel: "Digital Input",
                            image: "../images/parts/Controls/digital-input.png"
                        },
                        {
                            label: "Digital Output Module",
                            shortLabel: "Digital Output",
                            image: "../images/parts/Controls/digital-output.png"
                        },
                        {
                            label: "Analog Input Module",
                            shortLabel: "Analog Input",
                            image: "../images/parts/Controls/analog-input.png"
                        },
                        {
                            label: "Analog Output Module",
                            shortLabel: "Analog Output",
                            image: "../images/parts/Controls/analog-output.png"
                        }
                    ]
                },
                {
                    label: "Operator Controls",
                    children: [
                        {
                            label: "Push Button",
                            shortLabel: "Push Button",
                            image: "../images/parts/Controls/push-button.png"
                        },
                        {
                            label: "Selector Switch",
                            shortLabel: "Selector Switch",
                            image: "../images/parts/Controls/selector.png"
                        },
                        {
                            label: "Pilot Light",
                            shortLabel: "Pilot Light",
                            image: "../images/parts/Controls/pilot-lamp.png"
                        },
                        {
                            label: "HMI Screen",
                            shortLabel: "HMI",
                            image: "../images/parts/Controls/hmi.png"
                        }
                    ]
                },
                {
                    label: "Motor Controls",
                    children: [
                        {
                            label: "Contactor",
                            shortLabel: "Contactor",
                            image: "../images/parts/Controls/contactor.png"
                        },
                        {
                            label: "Motor Starter",
                            shortLabel: "Motor Starter",
                            image: "../images/parts/Controls/motor-starter.png"
                        },
                        {
                            label: "VFD",
                            shortLabel: "VFD",
                            image: "../images/parts/Controls/vfd.png"
                        },
                        {
                            label: "Overload Relay",
                            shortLabel: "Overload",
                            image: "../images/parts/Controls/overload-relay.png"
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
                            shortLabel: "E-Stop NC",
                            image: "../images/parts/Safety/e-stop.png"
                        },
                        {
                            label: "Pull Cord E-Stop",
                            shortLabel: "Pull Cord",
                            image: "../images/parts/Safety/pull-cord.png"
                        }
                    ]
                },
                {
                    label: "Safety Sensors",
                    children: [
                        {
                            label: "Light Curtain",
                            shortLabel: "Light Curtain",
                            image: "../images/parts/Safety/light-estop.png"
                        },
                        {
                            label: "Safety Interlock Switch",
                            shortLabel: "Interlock",
                            image: "../images/parts/Safety/interlock.png"
                        },
                        {
                            label: "Safety Mat",
                            shortLabel: "Safety Mat",
                            image: "../images/parts/Safety/safety-mat.png"
                        }
                    ]
                },
                {
                    label: "Safety Relays",
                    children: [
                        {
                            label: "Single Channel Safety Relay",
                            shortLabel: "1CH Safety Relay",
                            image: "../images/parts/Safety/single-relay.png"
                        },
                        {
                            label: "Dual Channel Safety Relay",
                            shortLabel: "2CH Safety Relay",
                            image: "../images/parts/Safety/duel-relay.png"
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
                            label: "Two-way Solenoid Valve",
                            shortLabel: "Two-way valves",
                            image: "../images/parts/Pneumatics/two-way.png"
                        },
                        {
                            label: "Three-way Solenoid Valve",
                            shortLabel: "Three-way",
                            image: "../images/parts/Pneumatics/three-way.png"
                        },
                        {
                            label: "Four-way Solenoid Valve",
                            shortLabel: "Four-way valves",
                            image: "../images/parts/Pneumatics/four-way.png"
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
                        },
                        {
                            label: "FRL Combo",
                            shortLabel: "FRL"
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
                        },
                        {
                            label: "Check Valve",
                            shortLabel: "Check Valve"
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
                        },
                        {
                            label: "480VAC Transformer",
                            shortLabel: "480V XFMR"
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

    /*
        ============================================================
        INITIALIZATION
        ------------------------------------------------------------
        Sets the canvas size, builds the parts menu, and draws the
        empty board.
        ============================================================
    */

    canvas.width = CONFIG.defaultCanvasWidth;
    canvas.height = CONFIG.defaultCanvasHeight;
    applyBoardZoom();
    setupBoardZoomControls();

    //setupSplashScreen();
    partsMenuTree.innerHTML = "";
    buildPartsMenu(partsCatalog, partsMenuTree, []);
    updateModeButtons();
    clearPartSelection();
    clearWireSelection();
    renderCanvas();
    loadBoardFromUrlIfRequested();

    /*
        ============================================================
        MENU BUILDER FUNCTIONS
        ============================================================
    */

    /*
        Builds the nested parts menu from the partsCatalog array.

        If a catalog item has children, this creates a <details>
        dropdown category.

        If a catalog item does not have children, this creates a
        draggable button that can be moved into the drop zone.
    */
    function buildPartsMenu(items, parentElement, path, inheritedCategoryClass) {
        items.forEach((item) => {
            const currentPath = path.concat(item.label);
            const categoryClass = item.categoryClass || inheritedCategoryClass || "part-generic";

            if (hasChildren(item)) {
                createCategoryNode(item, parentElement, currentPath, categoryClass);
            } else {
                createPartButton(item, parentElement, currentPath, categoryClass);
            }
        });
    }

    /*
        Returns true when a parts catalog item has child items.
    */
    function hasChildren(item) {
        return Array.isArray(item.children) && item.children.length > 0;
    }

    /*
    Creates one expandable dropdown category in the Parts Menu.
    Categories are closed by default when the page loads.
*/
    function createCategoryNode(item, parentElement, currentPath, categoryClass) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        const childrenWrapper = document.createElement("div");

        details.classList.add("parts-category");
        childrenWrapper.classList.add("parts-children");

        summary.textContent = item.label;

        details.appendChild(summary);
        details.appendChild(childrenWrapper);
        parentElement.appendChild(details);

        buildPartsMenu(item.children, childrenWrapper, currentPath, categoryClass);
    }

    /*
    Creates one draggable part button in the Parts Menu.

    Supports:
    - Text-only parts
    - Image thumbnail parts
    - Safe fallback if no image exists
*/
    function createPartButton(item, parentElement, currentPath, categoryClass) {
        const button = document.createElement("button");
        const label = item.shortLabel || item.label || "Part";
        const imagePath = item.image || "";

        button.type = "button";

        button.classList.add("drag-item");
        button.classList.add(categoryClass);

        button.dataset.label = label;
        button.dataset.fullPath = currentPath.join(" > ");
        button.dataset.categoryClass = categoryClass;
        button.dataset.partId = item.partId || makePartId(currentPath);
        button.dataset.image = imagePath;

        if (imagePath) {
            button.innerHTML = `
            <span class="drag-item-content">
                <span class="drag-item-thumb-wrap">
                    <img
                        class="drag-item-thumb"
                        src="${imagePath}"
                        alt="${label}">
                </span>
                <span class="drag-item-text">${label}</span>
            </span>
        `;
        } else {
            button.textContent = item.label;
        }

        parentElement.appendChild(button);
    }

    /*
        Creates a safe lowercase ID from a part's full path.
        Example:
        ["Sensors", "Limit Switches", "Normally Open"]
        becomes:
        sensors-limit-switches-normally-open
    */
    function makePartId(pathArray) {
        return pathArray
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    /*
        ============================================================
        CANVAS RENDERING FUNCTIONS
        ============================================================
    */

    /*
    Draws a readable label near the middle of a wire.
*/
    function drawWireLabel(connection, fromPoint, toPoint, wireStyle, isSelected) {
        const label = connection.wireLabel || getDefaultWireLabel(connection.wireType);

        if (!label) return;

        const midX = (fromPoint.x + toPoint.x) / 2;
        const midY = (fromPoint.y + toPoint.y) / 2;

        ctx.save();

        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const paddingX = 7;
        const paddingY = 4;
        const textWidth = ctx.measureText(label).width;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = 20;

        ctx.fillStyle = getWireLabelBackgroundColor(isSelected);
        ctx.strokeStyle = isSelected ? "#ffd700" : wireStyle.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = getWireLabelTextColor();
        ctx.fillText(label, midX, midY + paddingY - 3);

        ctx.restore();
    }

    /*
    Returns wire label background color based on theme and selection.
*/
    function getWireLabelBackgroundColor(isSelected) {
        const currentTheme = document.documentElement.getAttribute("data-theme");

        if (isSelected) {
            return currentTheme === "dark" ? "#4a3d00" : "#fff8d6";
        }

        return currentTheme === "dark" ? "#1e1e1e" : "#ffffff";
    }

    /*
    Returns wire label text color based on theme.
*/
    function getWireLabelTextColor() {
        const currentTheme = document.documentElement.getAttribute("data-theme");

        if (currentTheme === "dark") {
            return "#ffd700";
        }

        return "#111111";
    }

    /*
        Redraws the entire canvas layer.

        The canvas is used as the background/wire layer. The dropped
        parts are HTML elements sitting above the canvas.
    */
    function renderCanvas() {
        clearCanvas();
        drawBoardBackground();
        drawGrid();
        drawConnections();
        drawConnectModeMessage();
    }

    /*
    Draws the visual snap grid on the canvas when Snap Mode is enabled.
*/
    function drawGrid() {
        if (!snapMode) return;

        const gridSize = CONFIG.gridSize;
        const currentTheme = document.documentElement.getAttribute("data-theme");

        ctx.save();

        ctx.strokeStyle = currentTheme === "dark" ? "rgba(255, 215, 0, 0.16)" : "rgba(0, 0, 0, 0.10)";

        ctx.lineWidth = 1;

        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /*
        Clears the canvas before redrawing the board.
    */
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /*
        Draws the gray board background and the basic instructional text.
    */
    function drawBoardBackground() {
        ctx.fillStyle = getCanvasBackgroundColor();
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = getCanvasTextColor();
        ctx.font = "20px Arial";
        ctx.fillText("Drop items here", 20, 35);
    }

    /*
        Draws a short instruction on the canvas when Connect Mode is on.
    */
    function drawConnectModeMessage() {
        ctx.font = "16px Arial";

        if (connectMode) {
            ctx.fillStyle = "#007bff";
            ctx.fillText("Connect Mode: tap two terminals to draw a line", 20, 60);
        }

        if (deleteMode) {
            ctx.fillStyle = "#dc3545";
            ctx.fillText("Delete Mode: tap a part to delete it, or tap a terminal to remove its wires", 20, 60);
        }
    }

    /*
        Returns the canvas background color based on the current site theme.
    */
    function getCanvasBackgroundColor() {
        const currentTheme = document.documentElement.getAttribute("data-theme");

        if (currentTheme === "dark") {
            return "#2c2c2c";
        }

        return "#f4f4f4";
    }

    /*
        Returns the canvas text color based on the current site theme.
    */
    function getCanvasTextColor() {
        const currentTheme = document.documentElement.getAttribute("data-theme");

        if (currentTheme === "dark") {
            return "#FFD700";
        }

        return "#777777";
    }

    /*
        Draws all stored wire connections onto the canvas.
    */
    function drawConnections() {
        connections.forEach((connection) => {
            const fromTerminal = getTerminalElement(connection.fromInstanceId, connection.fromTerminalId);
            const toTerminal = getTerminalElement(connection.toInstanceId, connection.toTerminalId);

            if (!fromTerminal || !toTerminal) return;

            drawSingleConnection(connection, fromTerminal, toTerminal);
        });
    }

    /*
    Draws one wire connection between two terminals.

    If the wire is selected:
    - It is drawn slightly thicker.
    - It gets a soft highlight effect.
*/
    function drawSingleConnection(connection, fromTerminal, toTerminal) {
        const fromPoint = getTerminalCanvasPoint(fromTerminal);
        const toPoint = getTerminalCanvasPoint(toTerminal);
        const wireStyle = wireTypes[connection.wireType] || wireTypes.signal;
        const isSelected = connection.connectionId === selectedConnectionId;

        ctx.save();

        if (isSelected) {
            ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y);
            ctx.lineTo(toPoint.x, toPoint.y);

            ctx.strokeStyle = "rgba(255, 215, 0, 0.85)";
            ctx.lineWidth = wireStyle.lineWidth + 8;
            ctx.lineCap = "round";
            ctx.setLineDash([]);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);

        ctx.strokeStyle = wireStyle.color;
        ctx.lineWidth = isSelected ? wireStyle.lineWidth + 2 : wireStyle.lineWidth;
        ctx.lineCap = "round";
        ctx.setLineDash(wireStyle.dash);
        ctx.stroke();

        ctx.setLineDash([]);

        drawConnectionEndpoint(fromPoint, wireStyle.color);
        drawConnectionEndpoint(toPoint, wireStyle.color);
        drawWireLabel(connection, fromPoint, toPoint, wireStyle, isSelected);

        ctx.restore();
    }

    /*
        Draws a small dot at each end of a wire connection.
    */
    function drawConnectionEndpoint(point, color) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    /*
        Finds a terminal element by the parent part's instance ID and
        the terminal's own terminal ID.
    */
    function getTerminalElement(instanceId, terminalId) {
        return dropZone.querySelector(`[data-instance-id="${instanceId}"] [data-terminal-id="${terminalId}"]`);
    }

    /*
    Converts a terminal's screen position into canvas coordinates while zoomed.
*/
    function getTerminalCanvasPoint(terminal) {
        const terminalRect = terminal.getBoundingClientRect();
        const boardRect = boardWorld.getBoundingClientRect();

        const centerX = terminalRect.left + terminalRect.width / 2;
        const centerY = terminalRect.top + terminalRect.height / 2;

        const scaleX = canvas.width / boardRect.width;
        const scaleY = canvas.height / boardRect.height;

        return {
            x: (centerX - boardRect.left) * scaleX,
            y: (centerY - boardRect.top) * scaleY
        };
    }

    /*
    Deletes a dropped part and removes every wire connected to that part.
*/
    function deletePlacedItem(item) {
        if (!item) return;

        const instanceId = item.dataset.instanceId;

        removeConnectionsForItem(instanceId);

        if (selectedPart === item) {
            clearPartSelection();
        }

        item.remove();

        clearConnectionSelection();
        renderCanvas();
    }

    /*
    Removes all wire connections connected to a specific dropped part.
*/
    function removeConnectionsForItem(instanceId) {
        for (let i = connections.length - 1; i >= 0; i--) {
            const connection = connections[i];

            const connectedToItem = connection.fromInstanceId === instanceId || connection.toInstanceId === instanceId;

            if (connectedToItem) {
                connections.splice(i, 1);
            }
        }
    }

    /*
    Removes all wire connections attached to one specific terminal.
    This lets Delete Mode remove wires from a terminal without deleting the part.
*/
    function removeConnectionsForTerminal(instanceId, terminalId) {
        for (let i = connections.length - 1; i >= 0; i--) {
            const connection = connections[i];

            const connectedToTerminal =
                (connection.fromInstanceId === instanceId && connection.fromTerminalId === terminalId) ||
                (connection.toInstanceId === instanceId && connection.toTerminalId === terminalId);

            if (connectedToTerminal) {
                connections.splice(i, 1);
            }
        }

        clearConnectionSelection();
        renderCanvas();
    }

    /*
    Turns Delete Mode on or off and makes sure Connect Mode is not active.
*/
    function setDeleteMode(isActive) {
        deleteMode = isActive;

        if (deleteMode) {
            connectMode = false;
            clearConnectionSelection();
            clearPartSelection();
            clearWireSelection();
        }

        updateModeButtons();
        renderCanvas();
    }

    /*
    Turns Connect Mode on or off and makes sure Delete Mode is not active
    at the same time.

    Turns Connect Mode on or off and makes sure Delete Mode is not active.
*/
    function setConnectMode(isActive) {
        connectMode = isActive;

        if (connectMode) {
            deleteMode = false;
            clearConnectionSelection();
            clearPartSelection();
            clearWireSelection();
        }

        updateModeButtons();
        renderCanvas();
    }

    /*
    Turns Snap Mode on or off.
*/
    function setSnapMode(isActive) {
        snapMode = isActive;

        updateModeButtons();
        renderCanvas();
    }

    /*
    Updates the Connect Mode and Delete Mode buttons so the screen
    always shows the current mode clearly.
*/
    function updateModeButtons() {
        if (connectMode) {
            connectModeBtn.textContent = "Connect Mode: ON";
            connectModeBtn.classList.add("active");
        } else {
            connectModeBtn.textContent = "Connect Mode: OFF";
            connectModeBtn.classList.remove("active");
        }

        if (deleteMode) {
            deleteModeBtn.textContent = "Delete Mode: ON";
            deleteModeBtn.classList.add("active");
            deleteModeBtn.classList.add("delete-active");
            dropZone.classList.add("delete-mode");
        } else {
            deleteModeBtn.textContent = "Delete Mode: OFF";
            deleteModeBtn.classList.remove("active");
            deleteModeBtn.classList.remove("delete-active");
            dropZone.classList.remove("delete-mode");
        }

        if (snapMode) {
            snapModeBtn.textContent = "Snap Grid: ON";
            snapModeBtn.classList.add("active");
            snapModeBtn.classList.add("snap-active");
            dropZone.classList.add("snap-mode");
        } else {
            snapModeBtn.textContent = "Snap Grid: OFF";
            snapModeBtn.classList.remove("active");
            snapModeBtn.classList.remove("snap-active");
            dropZone.classList.remove("snap-mode");
        }
    }

    /*
        ============================================================
        DROPPED PART CREATION FUNCTIONS
        ============================================================
    */

    /*
    Creates the HTML element that appears inside the gray drop zone
    after a part is dragged from the Parts Menu.

    Supports:
    - Image-based parts
    - Text fallback
    - Terminals
    - Part properties
*/
    function createPlacedItem(partButton) {
        const item = document.createElement("div");

        item.classList.add("placed-item");
        item.classList.add(partButton.dataset.categoryClass || "part-generic");

        item.dataset.partId = partButton.dataset.partId || "";
        item.dataset.fullPath = partButton.dataset.fullPath || "";
        item.dataset.categoryClass = partButton.dataset.categoryClass || "part-generic";
        item.dataset.label = partButton.dataset.label || partButton.textContent.trim();
        item.dataset.image = partButton.dataset.image || "";
        item.dataset.instanceId = `part-${nextInstanceId}`;

        item.dataset.tagName = "";
        item.dataset.description = "";
        item.dataset.voltage = "";
        item.dataset.outputType = "";
        item.dataset.contactType = "";

        nextInstanceId += 1;

        item.title = item.dataset.fullPath;
        item.style.left = "0px";
        item.style.top = "0px";

        buildPlacedItemBody(item);
        createConnectionTerminals(item);
        updatePlacedItemLabel(item);

        item.addEventListener("pointerdown", startMovingPlacedItem);

        return item;
    }

    /*
    Builds the visible body of a dropped part.

    If the part has an image, the image is shown.
    If no image exists, a simple visual placeholder is shown.

    The part name is shown only once in .placed-item-label.
*/
    function buildPlacedItemBody(item) {
        const imagePath = item.dataset.image || "";
        const label = item.dataset.label || "Part";

        item.innerHTML = `
        <div class="placed-item-visual">
            ${
                imagePath
                    ? `<img class="placed-item-image" src="${imagePath}" alt="${label}">`
                    : `<div class="placed-item-fallback" aria-hidden="true">⚙</div>`
            }
        </div>

        <div class="placed-item-label">${label}</div>
    `;
    }

    /*
        Adds the visible text label inside a dropped part.
    */
    function addPlacedItemLabel(item) {
        const label = document.createElement("span");

        label.classList.add("placed-item-label");
        label.textContent = item.dataset.label;

        item.appendChild(label);
    }

    /*
        Adds connection terminals to a dropped part.
        Terminal choices are based on the part's full category path.
    */
    function createConnectionTerminals(item) {
        const terminals = getTerminalsForPart(item.dataset.fullPath || item.dataset.label);

        terminals.forEach((terminalInfo) => {
            const terminal = createTerminalElement(terminalInfo);
            item.appendChild(terminal);
        });
    }

    /*
        Creates one clickable terminal dot for a dropped part.
    */
    function createTerminalElement(terminalInfo) {
        const terminal = document.createElement("div");

        terminal.classList.add("connection-terminal");

        terminal.dataset.terminalId = terminalInfo.id;
        terminal.dataset.terminalLabel = terminalInfo.label;

        terminal.title = terminalInfo.label;
        terminal.style.left = `${terminalInfo.x}%`;
        terminal.style.top = `${terminalInfo.y}%`;
        terminal.style.transform = "translate(-50%, -50%)";

        terminal.addEventListener("pointerdown", handleTerminalPointerDown);

        return terminal;
    }

    /*
        Returns the terminal layout for a part based on its category path.
        This is where you can make different industrial parts have
        different terminal names and positions.
    */
    function getTerminalsForPart(fullPath) {
        const path = fullPath.toLowerCase();

        if (path.includes("limit switch")) {
            return getSwitchTerminals();
        }

        if (path.includes("proximity")) {
            return getThreeWireSensorTerminals();
        }

        if (path.includes("temperature") || path.includes("rtd") || path.includes("thermocouple")) {
            return getTemperatureSensorTerminals();
        }

        if (path.includes("pressure") || path.includes("flow") || path.includes("level")) {
            return getThreeWireSensorTerminals();
        }

        if (path.includes("load cell")) {
            return getLoadCellTerminals();
        }

        if (path.includes("motor")) {
            return getThreePhaseMotorTerminals();
        }

        if (path.includes("contactor") || path.includes("starter") || path.includes("relay")) {
            return getContactorTerminals();
        }

        if (path.includes("push button") || path.includes("e-stop") || path.includes("emergency")) {
            return getSwitchTerminals();
        }

        if (path.includes("plc") || path.includes("input module") || path.includes("output module")) {
            return getPlcModuleTerminals();
        }

        if (path.includes("valve")) {
            return getSolenoidValveTerminals();
        }

        if (path.includes("cylinder")) {
            return getCylinderTerminals();
        }

        if (path.includes("power supply")) {
            return getPowerSupplyTerminals();
        }

        if (path.includes("terminal")) {
            return getTerminalBlockTerminals();
        }

        return getGenericTerminals();
    }

    /*
        Returns a common COM/NO/NC terminal layout.
    */
    function getSwitchTerminals() {
        return [
            {
                id: "com",
                label: "COM",
                x: 0,
                y: 50
            },
            {
                id: "no",
                label: "NO",
                x: 100,
                y: 35
            },
            {
                id: "nc",
                label: "NC",
                x: 100,
                y: 65
            }
        ];
    }

    /*
        Returns a common 3-wire DC sensor terminal layout.
    */
    function getThreeWireSensorTerminals() {
        return [
            {
                id: "positive",
                label: "+24V",
                x: 0,
                y: 25
            },
            {
                id: "common",
                label: "0V",
                x: 0,
                y: 75
            },
            {
                id: "signal",
                label: "Signal",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        Returns a basic temperature sensor terminal layout.
    */
    function getTemperatureSensorTerminals() {
        return [
            {
                id: "positive",
                label: "+",
                x: 0,
                y: 35
            },
            {
                id: "negative",
                label: "-",
                x: 0,
                y: 65
            },
            {
                id: "signal",
                label: "Signal",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        Returns a basic load cell terminal layout.
    */
    function getLoadCellTerminals() {
        return [
            {
                id: "excitation-positive",
                label: "EX+",
                x: 0,
                y: 25
            },
            {
                id: "excitation-negative",
                label: "EX-",
                x: 0,
                y: 75
            },
            {
                id: "signal-positive",
                label: "SIG+",
                x: 100,
                y: 35
            },
            {
                id: "signal-negative",
                label: "SIG-",
                x: 100,
                y: 65
            }
        ];
    }

    /*
        Returns a 3-phase motor terminal layout.
    */
    function getThreePhaseMotorTerminals() {
        return [
            {
                id: "l1",
                label: "L1",
                x: 0,
                y: 20
            },
            {
                id: "l2",
                label: "L2",
                x: 0,
                y: 50
            },
            {
                id: "l3",
                label: "L3",
                x: 0,
                y: 80
            },
            {
                id: "t1",
                label: "T1",
                x: 100,
                y: 20
            },
            {
                id: "t2",
                label: "T2",
                x: 100,
                y: 50
            },
            {
                id: "t3",
                label: "T3",
                x: 100,
                y: 80
            }
        ];
    }

    /*
        Returns a contactor/starter/relay terminal layout.
    */
    function getContactorTerminals() {
        return [
            {
                id: "a1",
                label: "A1",
                x: 35,
                y: 0
            },
            {
                id: "a2",
                label: "A2",
                x: 65,
                y: 0
            },
            {
                id: "l1",
                label: "L1",
                x: 0,
                y: 25
            },
            {
                id: "l2",
                label: "L2",
                x: 0,
                y: 50
            },
            {
                id: "l3",
                label: "L3",
                x: 0,
                y: 75
            },
            {
                id: "t1",
                label: "T1",
                x: 100,
                y: 25
            },
            {
                id: "t2",
                label: "T2",
                x: 100,
                y: 50
            },
            {
                id: "t3",
                label: "T3",
                x: 100,
                y: 75
            }
        ];
    }

    /*
        Returns a simple PLC module terminal layout.
    */
    function getPlcModuleTerminals() {
        return [
            {
                id: "positive",
                label: "+24V",
                x: 0,
                y: 25
            },
            {
                id: "common",
                label: "0V",
                x: 0,
                y: 75
            },
            {
                id: "channel-1",
                label: "CH1",
                x: 100,
                y: 30
            },
            {
                id: "channel-2",
                label: "CH2",
                x: 100,
                y: 70
            }
        ];
    }

    /*
        Returns a solenoid valve electrical terminal layout.
    */
    function getSolenoidValveTerminals() {
        return [
            {
                id: "positive",
                label: "+24V",
                x: 0,
                y: 35
            },
            {
                id: "common",
                label: "0V",
                x: 0,
                y: 65
            },
            {
                id: "output",
                label: "OUT",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        Returns a pneumatic or hydraulic cylinder port layout.
    */
    function getCylinderTerminals() {
        return [
            {
                id: "port-a",
                label: "Port A",
                x: 0,
                y: 50
            },
            {
                id: "port-b",
                label: "Port B",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        Returns a basic DC power supply terminal layout.
    */
    function getPowerSupplyTerminals() {
        return [
            {
                id: "line",
                label: "L",
                x: 0,
                y: 35
            },
            {
                id: "neutral",
                label: "N",
                x: 0,
                y: 65
            },
            {
                id: "positive",
                label: "+24V",
                x: 100,
                y: 35
            },
            {
                id: "common",
                label: "0V",
                x: 100,
                y: 65
            }
        ];
    }

    /*
        Returns a basic terminal block layout.
    */
    function getTerminalBlockTerminals() {
        return [
            {
                id: "left",
                label: "Left",
                x: 0,
                y: 50
            },
            {
                id: "right",
                label: "Right",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        Returns a basic input/output terminal layout for unknown parts.
    */
    function getGenericTerminals() {
        return [
            {
                id: "input",
                label: "Input",
                x: 0,
                y: 50
            },
            {
                id: "output",
                label: "Output",
                x: 100,
                y: 50
            }
        ];
    }

    /*
        ============================================================
        PREVIEW ELEMENT FUNCTIONS
        ============================================================
    */

    /*
    Creates the floating preview box that follows the pointer while
    a part is being dragged.
*/
    function createPreviewItem(sourceItem, clientX, clientY) {
        previewItem = document.createElement("div");

        previewItem.classList.add("drag-preview");
        previewItem.classList.add(sourceItem.dataset.categoryClass || "part-generic");

        previewItem.dataset.label = sourceItem.dataset.label || sourceItem.textContent.trim();
        previewItem.dataset.image = sourceItem.dataset.image || "";

        buildPlacedItemBody(previewItem);

        previewItem.style.opacity = CONFIG.previewOpacity;

        document.body.appendChild(previewItem);

        movePreview(clientX, clientY);
    }

    /*
        Moves the floating drag preview to the current pointer location.
    */
    function movePreview(clientX, clientY) {
        if (!previewItem) return;

        previewItem.style.left = `${clientX - offsetX}px`;
        previewItem.style.top = `${clientY - offsetY}px`;
    }

    /*
        Removes the floating drag preview from the page.
    */
    function removePreview() {
        if (!previewItem) return;

        previewItem.remove();
        previewItem = null;
    }

    /*
        ============================================================
        POSITION AND BOUNDS HELPERS
        ============================================================
    */

    /*
    Handles pointer down on the empty drop zone.

    Normal Mode:
    - Click near a wire to select it.
    - Click empty board space to clear both property panels.

    Delete Mode:
    - Click near a wire to delete it.
*/
    function handleDropZonePointerDown(event) {
        if (event.target.closest(".placed-item")) return;
        if (event.target.closest(".connection-terminal")) return;

        const connection = findConnectionNearPointer(event);

        if (!connection) {
            clearWireSelection();
            clearPartSelection();
            return;
        }

        if (deleteMode) {
            deleteWireConnectionById(connection.connectionId);
            return;
        }

        if (!connectMode) {
            selectWireConnection(connection.connectionId);
        }
    }

    /*
    Converts a pointer event into canvas coordinates while zoomed.
*/
    function getCanvasPointerFromEvent(event) {
        const boardRect = boardWorld.getBoundingClientRect();

        const scaleX = canvas.width / boardRect.width;
        const scaleY = canvas.height / boardRect.height;

        return {
            x: (event.clientX - boardRect.left) * scaleX,
            y: (event.clientY - boardRect.top) * scaleY
        };
    }

    /*
    Converts a pointer event into canvas coordinates.
*/
    function getCanvasPointerFromEvent(event) {
        const dropZoneRect = dropZone.getBoundingClientRect();

        const scaleX = canvas.width / dropZoneRect.width;
        const scaleY = canvas.height / dropZoneRect.height;

        return {
            x: (event.clientX - dropZoneRect.left) * scaleX,
            y: (event.clientY - dropZoneRect.top) * scaleY
        };
    }

    /*
    Calculates the shortest distance from a point to a line segment.
*/
    function getDistanceFromPointToSegment(point, segmentStart, segmentEnd) {
        const dx = segmentEnd.x - segmentStart.x;
        const dy = segmentEnd.y - segmentStart.y;

        if (dx === 0 && dy === 0) {
            return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
        }

        const t = Math.max(
            0,
            Math.min(1, ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / (dx * dx + dy * dy))
        );

        const closestPoint = {
            x: segmentStart.x + t * dx,
            y: segmentStart.y + t * dy
        };

        return Math.hypot(point.x - closestPoint.x, point.y - closestPoint.y);
    }


    /*
    Converts a pointer event into board-world coordinates.
    This keeps drag/drop accurate while zoomed.
*/
    function getDropZonePosition(event) {
        const boardRect = boardWorld.getBoundingClientRect();

        const scaleX = CONFIG.defaultCanvasWidth / boardRect.width;
        const scaleY = CONFIG.defaultCanvasHeight / boardRect.height;

        return {
            x: (event.clientX - boardRect.left) * scaleX,
            y: (event.clientY - boardRect.top) * scaleY
        };
    }

    /*
    Checks whether the pointer or the preview is inside the drop zone.
    This makes dropping easier with larger image-based parts.
*/
    function isPointerInsideDropZone(event) {
        const dropZoneRect = dropZone.getBoundingClientRect();
        const tolerance = 12;

        const pointerIsInside =
            event.clientX >= dropZoneRect.left - tolerance &&
            event.clientX <= dropZoneRect.right + tolerance &&
            event.clientY >= dropZoneRect.top - tolerance &&
            event.clientY <= dropZoneRect.bottom + tolerance;

        if (pointerIsInside) {
            return true;
        }

        return isPreviewOverDropZone();
    }

    /*
    Checks whether the floating preview overlaps the drop zone.
*/
    function isPreviewOverDropZone() {
        if (!previewItem) return false;

        const previewRect = previewItem.getBoundingClientRect();
        const dropZoneRect = dropZone.getBoundingClientRect();

        return (
            previewRect.right >= dropZoneRect.left &&
            previewRect.left <= dropZoneRect.right &&
            previewRect.bottom >= dropZoneRect.top &&
            previewRect.top <= dropZoneRect.bottom
        );
    }

    /*
    Keeps a dropped part inside the fixed 800x500 board coordinate space.
*/
    function clampToDropZone(x, y) {
        const maxX = CONFIG.defaultCanvasWidth - CONFIG.itemWidth;
        const maxY = CONFIG.defaultCanvasHeight - CONFIG.itemHeight;

        return {
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY))
        };
    }

    /*
    Snaps a single number to the nearest grid line.
*/
    function snapValueToGrid(value) {
        return Math.round(value / CONFIG.gridSize) * CONFIG.gridSize;
    }

    /*
    Snaps an x/y position to the nearest grid point.
*/
    function snapPositionToGrid(x, y) {
        if (!snapMode) {
            return {
                x: x,
                y: y
            };
        }

        return {
            x: snapValueToGrid(x),
            y: snapValueToGrid(y)
        };
    }

    /*
    Applies snap-to-grid first, then clamps the item inside the board.
*/
    function getFinalDropPosition(x, y) {
        const snapped = snapPositionToGrid(x, y);

        return clampToDropZone(snapped.x, snapped.y);
    }
    /*
        ============================================================
        CONNECTION SELECTION FUNCTIONS
        ============================================================
    */

    /*
    Selects a wire connection and opens only the Wire Properties Panel.
    The Part Properties Panel is hidden when a wire is selected.
*/
    function selectWireConnection(connectionId) {
        const connection = getConnectionById(connectionId);

        if (!connection) return;

        clearPartSelection();
        clearConnectionSelection();

        selectedConnectionId = connectionId;

        wirePropertiesPanel.classList.add("panel-visible");
        wirePropertiesPanel.setAttribute("aria-hidden", "false");

        selectedWireInfo.textContent = getWireSummary(connection);

        wireEditLabelInput.value = connection.wireLabel || "";

        renderCanvas();
    }

    /*
    Clears the selected wire and hides the Wire Properties Panel.
*/
    function clearWireSelection() {
        selectedConnectionId = null;

        wirePropertiesPanel.classList.remove("panel-visible");
        wirePropertiesPanel.setAttribute("aria-hidden", "true");

        selectedWireInfo.textContent = "Select a wire to edit its properties.";
        wireEditLabelInput.value = "";

        renderCanvas();
    }

    /*
    Applies the Wire Properties Panel label value to the selected wire.
    The wire type is not changed here.
*/
    function applyWireProperties() {
        const connection = getConnectionById(selectedConnectionId);

        if (!connection) {
            window.alert("Select a wire first.");
            return;
        }

        connection.wireLabel = wireEditLabelInput.value.trim() || getDefaultWireLabel(connection.wireType);

        selectedWireInfo.textContent = getWireSummary(connection);

        renderCanvas();
    }

    /*
    Deletes the currently selected wire.
*/
    function deleteSelectedWire() {
        if (!selectedConnectionId) return;

        deleteWireConnectionById(selectedConnectionId);
    }

    /*
    Deletes one wire connection by ID.
*/
    function deleteWireConnectionById(connectionId) {
        const index = connections.findIndex((connection) => connection.connectionId === connectionId);

        if (index === -1) return;

        connections.splice(index, 1);

        clearWireSelection();
        renderCanvas();
    }

    /*
    Finds a connection object by its unique wire ID.
*/
    function getConnectionById(connectionId) {
        return connections.find((connection) => connection.connectionId === connectionId);
    }

    /*
    Builds a readable summary for the selected wire.
*/
    function getWireSummary(connection) {
        const wireTypeLabel = getDefaultWireLabel(connection.wireType);
        const wireLabel = connection.wireLabel || wireTypeLabel;

        return `${wireLabel} — ${wireTypeLabel}`;
    }

    /*
        Handles clicking/tapping a terminal while Connect Mode is active.

        First terminal click:
        - Selects the starting terminal.

        Second terminal click:
        - Creates a connection from the first terminal to the second.
    */
    function handleConnectionSelection(terminal) {
        const parentItem = terminal.closest(".placed-item");

        if (!parentItem) return;

        if (!selectedTerminal) {
            selectFirstTerminal(terminal, parentItem);
            return;
        }

        if (selectedTerminal === terminal) {
            clearConnectionSelection();
            return;
        }

        createConnectionBetweenTerminals(selectedTerminal, terminal);
        clearConnectionSelection();
        renderCanvas();
    }

    /*
        Visually selects the first terminal in a new connection.
    */
    function selectFirstTerminal(terminal, parentItem) {
        selectedTerminal = terminal;
        selectedTerminal.classList.add("terminal-selected");
        parentItem.classList.add("connection-selected");
    }

    /*
    Creates a stored connection object between two terminals.

    The connection stores:
    - Unique wire ID
    - From terminal
    - To terminal
    - Wire type
    - Default wire label

    The wire label can be edited later by clicking the wire
    and using the Wire Properties panel.
*/
    function createConnectionBetweenTerminals(firstTerminal, secondTerminal) {
        const firstItem = firstTerminal.closest(".placed-item");
        const secondItem = secondTerminal.closest(".placed-item");

        if (!firstItem || !secondItem) return;

        const wireType = wireTypeSelect.value;

        const newConnection = {
            connectionId: `wire-${nextConnectionId}`,
            fromInstanceId: firstItem.dataset.instanceId,
            fromTerminalId: firstTerminal.dataset.terminalId,
            toInstanceId: secondItem.dataset.instanceId,
            toTerminalId: secondTerminal.dataset.terminalId,
            wireType: wireType,
            wireLabel: getDefaultWireLabel(wireType)
        };

        if (!connectionAlreadyExists(newConnection)) {
            connections.push(newConnection);
            nextConnectionId += 1;
        }
    }

    /*
    Returns a default label for a new wire based on the selected wire type.
*/
    function getDefaultWireLabel(wireType) {
        if (wireTypes[wireType]) {
            return wireTypes[wireType].label;
        }

        return "Wire";
    }

    /*
        Checks whether the same connection already exists.
        Direction does not matter, so A-to-B and B-to-A are treated
        as the same wire.
    */
    function connectionAlreadyExists(newConnection) {
        return connections.some((existingConnection) => {
            const sameDirection =
                existingConnection.fromInstanceId === newConnection.fromInstanceId &&
                existingConnection.fromTerminalId === newConnection.fromTerminalId &&
                existingConnection.toInstanceId === newConnection.toInstanceId &&
                existingConnection.toTerminalId === newConnection.toTerminalId;

            const oppositeDirection =
                existingConnection.fromInstanceId === newConnection.toInstanceId &&
                existingConnection.fromTerminalId === newConnection.toTerminalId &&
                existingConnection.toInstanceId === newConnection.fromInstanceId &&
                existingConnection.toTerminalId === newConnection.fromTerminalId;

            return sameDirection || oppositeDirection;
        });
    }

    /*
        Clears the currently selected first terminal, if one is selected.
    */
    function clearConnectionSelection() {
        if (!selectedTerminal) return;

        const parentItem = selectedTerminal.closest(".placed-item");

        selectedTerminal.classList.remove("terminal-selected");

        if (parentItem) {
            parentItem.classList.remove("connection-selected");
        }

        selectedTerminal = null;
    }

    /*
        ============================================================
        DRAG START FUNCTIONS
        ============================================================
    */

    /*
    Starts dragging a new part from the Parts Menu.
*/
    function startDraggingNewPart(partButton, event) {
        event.preventDefault();

        isNewItem = true;
        activeItem = createPlacedItem(partButton);
        activePointerElement = partButton;

        offsetX = CONFIG.itemWidth / 2;
        offsetY = CONFIG.itemHeight / 2;

        if (partButton.setPointerCapture && event.pointerId !== undefined) {
            try {
                partButton.setPointerCapture(event.pointerId);
            } catch (error) {
                console.warn("Pointer capture was not available for this drag.", error);
            }
        }

        createPreviewItem(partButton, event.clientX, event.clientY);
        addDragListeners();
    }

    /*
    Starts moving a part that is already inside the drop zone.

    Normal Mode:
    - Selects the part.
    - Allows the part to be moved.

    Connect Mode:
    - Does not select or move the part.
    - User must tap terminal dots to connect wires.

    Delete Mode:
    - Deletes the clicked part.
    
    Starts moving a part that is already inside the drop zone.
*/
    function startMovingPlacedItem(event) {
        if (deleteMode) {
            event.preventDefault();
            deletePlacedItem(event.currentTarget);
            return;
        }

        if (connectMode) {
            event.preventDefault();
            return;
        }

        event.preventDefault();

        selectPlacedItem(event.currentTarget);

        isNewItem = false;
        activeItem = event.currentTarget;
        activePointerElement = activeItem;

        const itemRect = activeItem.getBoundingClientRect();

        offsetX = event.clientX - itemRect.left;
        offsetY = event.clientY - itemRect.top;

        originalLeft = parseFloat(activeItem.style.left) || 0;
        originalTop = parseFloat(activeItem.style.top) || 0;

        activeItem.style.opacity = CONFIG.movingOpacity;

        if (activeItem.setPointerCapture && event.pointerId !== undefined) {
            try {
                activeItem.setPointerCapture(event.pointerId);
            } catch (error) {
                console.warn("Pointer capture was not available for this drag.", error);
            }
        }

        createPreviewItem(activeItem, event.clientX, event.clientY);
        addDragListeners();
    }

    /*
    Handles pointer down on a connection terminal.

    Delete Mode:
    - Removes wires attached to that terminal.

    Connect Mode:
    - Selects terminals and creates wires.

    Normal Mode:
    - Does nothing.
*/
    function handleTerminalPointerDown(event) {
        const terminal = event.currentTarget;

        if (deleteMode) {
            event.preventDefault();
            event.stopPropagation();

            const parentItem = terminal.closest(".placed-item");

            if (!parentItem) return;

            removeConnectionsForTerminal(parentItem.dataset.instanceId, terminal.dataset.terminalId);

            return;
        }

        if (connectMode) {
            event.preventDefault();
            event.stopPropagation();

            handleConnectionSelection(terminal);
            return;
        }
    }

    /*
        ============================================================
        DRAG MOVE / DROP FUNCTIONS
        ============================================================
    */

    /*
        Adds the document-level drag listeners.

        These are placed on document so dragging continues to work even
        when the pointer moves outside the original button or part.
    */
    function addDragListeners() {
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", handlePointerCancel);
    }

    /*
        Removes the document-level drag listeners after a drag ends.
    */
    function removeDragListeners() {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerCancel);
    }

    /*
        Moves the floating preview while dragging.
    */
    function handlePointerMove(event) {
        if (!activeItem) return;

        event.preventDefault();
        movePreview(event.clientX, event.clientY);
    }

    /*
        Handles dropping a dragged part.

        If dropped inside the gray area:
        - Places the part at the pointer location.

        If dropped outside the gray area:
        - New parts disappear.
        - Existing parts return to their original position.
    */
    function handlePointerUp(event) {
        if (!activeItem) return;

        event.preventDefault();

        if (isPointerInsideDropZone(event)) {
            dropActiveItemInsideZone(event);
        } else {
            returnOrRemoveActiveItem();
        }

        resetDrag();
        renderCanvas();
    }

    /*
        Handles a canceled pointer event.

        This can happen if the browser interrupts a touch event.
    */
    function handlePointerCancel() {
        if (!activeItem) return;

        returnOrRemoveActiveItem();
        resetDrag();
        renderCanvas();
    }

    /*
    Places the active dragged item inside the drop zone.

    If Snap Mode is ON:
    - The part snaps to the nearest grid point.

    If Snap Mode is OFF:
    - The part lands exactly where it was released.
*/
    function dropActiveItemInsideZone(event) {
        const position = getDropZonePosition(event);

        const newX = position.x - offsetX;
        const newY = position.y - offsetY;
        const finalPosition = getFinalDropPosition(newX, newY);

        activeItem.style.left = `${finalPosition.x}px`;
        activeItem.style.top = `${finalPosition.y}px`;
        activeItem.style.opacity = "1";

        if (isNewItem) {
            boardWorld.appendChild(activeItem);
        }
    }

    /*
    Sets up mouse-wheel zoom and two-finger touch pinch zoom.
*/
    function setupBoardZoomControls() {
        dropZone.addEventListener("wheel", handleBoardWheelZoom, {
            passive: false
        });

        dropZone.addEventListener("touchstart", handlePinchStart, {
            passive: false
        });

        dropZone.addEventListener("touchmove", handlePinchMove, {
            passive: false
        });

        dropZone.addEventListener("touchend", handlePinchEnd);
        dropZone.addEventListener("touchcancel", handlePinchEnd);
    }

    /*
        Handles mouse wheel zoom.
        Scroll up = zoom in.
        Scroll down = zoom out.
    */
    function handleBoardWheelZoom(event) {
        event.preventDefault();

        const direction = event.deltaY < 0 ? 1 : -1;
        const nextZoom = zoomScale + direction * CONFIG.zoomStep;

        setBoardZoom(nextZoom, event.clientX, event.clientY);
    }

    /*
        Starts two-finger pinch zoom on touch screens.
    */
    function handlePinchStart(event) {
        if (event.touches.length !== 2) return;

        event.preventDefault();

        isPinching = true;
        pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
        pinchStartZoom = zoomScale;
    }

    /*
        Updates two-finger pinch zoom on touch screens.
    */
    function handlePinchMove(event) {
        if (!isPinching || event.touches.length !== 2) return;

        event.preventDefault();

        const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        const pinchCenter = getTouchCenter(event.touches[0], event.touches[1]);

        const nextZoom = pinchStartZoom * (currentDistance / pinchStartDistance);

        setBoardZoom(nextZoom, pinchCenter.x, pinchCenter.y);
    }

    /*
        Ends pinch zoom mode.
    */
    function handlePinchEnd(event) {
        if (event.touches.length < 2) {
            isPinching = false;
        }
    }

    /*
        Applies a new board zoom level and keeps the zoom centered
        around the mouse pointer or pinch center.
    */
    function setBoardZoom(nextZoom, focalClientX, focalClientY) {
        const oldZoom = zoomScale;
        const newZoom = clampNumber(nextZoom, CONFIG.minZoom, CONFIG.maxZoom);

        if (newZoom === oldZoom) return;

        const viewportRect = dropZone.getBoundingClientRect();

        const focalBoardX = (dropZone.scrollLeft + (focalClientX - viewportRect.left)) / oldZoom;
        const focalBoardY = (dropZone.scrollTop + (focalClientY - viewportRect.top)) / oldZoom;

        zoomScale = newZoom;
        applyBoardZoom();

        dropZone.scrollLeft = focalBoardX * newZoom - (focalClientX - viewportRect.left);
        dropZone.scrollTop = focalBoardY * newZoom - (focalClientY - viewportRect.top);

        renderCanvas();
    }

    /*
        Applies the visual zoom transform and updates the scrollable area.
    */
    function applyBoardZoom() {
        boardWorld.style.transform = `scale(${zoomScale})`;

        boardScrollArea.style.width = `${CONFIG.defaultCanvasWidth * zoomScale}px`;
        boardScrollArea.style.height = `${CONFIG.defaultCanvasHeight * zoomScale}px`;
    }

    /*
        Calculates the distance between two touch points.
    */
    function getTouchDistance(firstTouch, secondTouch) {
        return Math.hypot(
            firstTouch.clientX - secondTouch.clientX,
            firstTouch.clientY - secondTouch.clientY
        );
    }

    /*
        Calculates the center point between two touch points.
    */
    function getTouchCenter(firstTouch, secondTouch) {
        return {
            x: (firstTouch.clientX + secondTouch.clientX) / 2,
            y: (firstTouch.clientY + secondTouch.clientY) / 2
        };
    }

    /*
        Keeps a number inside a min/max range.
    */
    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    /*
        Removes a new item or returns an existing item to its original
        location when dropped outside the drop zone.
    */
    function returnOrRemoveActiveItem() {
        if (isNewItem) {
            activeItem.remove();
            return;
        }

        activeItem.style.left = `${originalLeft}px`;
        activeItem.style.top = `${originalTop}px`;
        activeItem.style.opacity = "1";
    }

    /*
    Resets all drag-related state after a drag is complete.
*/
    function resetDrag() {
        activeItem = null;
        isNewItem = false;
        activePointerElement = null;

        removePreview();
        removeDragListeners();
    }

    /*
    Saves the current board layout to browser localStorage.

    This stores:
    - Dropped parts
    - Part positions
    - Wire connections
    - Wire type selection
    - Snap Mode setting
*/
    function saveBoardToLocalStorage() {
        const saveData = {
            version: 1,
            boardName: getBoardNameForSave(),
            templateName: "CAD Parts Repair",
            savedAt: new Date().toISOString(),
            nextInstanceId: nextInstanceId,
            nextConnectionId: nextConnectionId,
            settings: {
                snapMode: snapMode,
                selectedWireType: wireTypeSelect.value
            },
            parts: getSavedParts(),
            connections: getSavedConnections()
        };

        localStorage.setItem(CONFIG.storageKey, JSON.stringify(saveData));

        showTemporaryButtonText(saveBoardBtn, "Saved!");
    }

    /*
    Returns the display name used on the Saved Boards page.
    Later, this can come from a project-name input field.
*/
    function getBoardNameForSave() {
        return "CAD Parts Repair Board";
    }

    /*
    Loads a saved board automatically when the URL requests it.
    Example:
    game_1.html?load=latest
*/
    function loadBoardFromUrlIfRequested() {
        const params = new URLSearchParams(window.location.search);
        const requestedBoard = params.get("load");

        if (requestedBoard === "latest") {
            loadBoardFromLocalStorage();
        }
    }

    /*
    Loads the saved board layout from browser localStorage.
*/
    function loadBoardFromLocalStorage() {
        const rawSaveData = localStorage.getItem(CONFIG.storageKey);

        if (!rawSaveData) {
            window.alert("No saved board was found.");
            return;
        }

        try {
            const saveData = JSON.parse(rawSaveData);

            clearBoardFromScreen();

            restoreParts(saveData.parts || []);
            restoreConnections(saveData.connections || []);
            restoreSettings(saveData.settings || {});

            nextInstanceId = Math.max(saveData.nextInstanceId || 1, getNextInstanceIdFromPlacedItems());

            nextConnectionId = Math.max(saveData.nextConnectionId || 1, getNextConnectionIdFromConnections());

            clearConnectionSelection();
            updateModeButtons();
            renderCanvas();

            showTemporaryButtonText(loadBoardBtn, "Loaded!");
        } catch (error) {
            console.error("Could not load saved board:", error);
            window.alert("The saved board could not be loaded.");
        }
    }

    /*
    Clears the visible board without deleting the saved localStorage file.
*/
    function clearBoardFromScreen() {
        const placedItems = dropZone.querySelectorAll(".placed-item");

        placedItems.forEach((item) => {
            item.remove();
        });

        connections.length = 0;
        selectedTerminal = null;
        activeItem = null;
        previewItem = null;

        clearConnectionSelection();
        clearPartSelection();
        clearWireSelection();
        removePreview();
        renderCanvas();
    }

    /*
    Clears the current board layout from the screen.
    This does not erase the saved board in localStorage.
*/
    function clearBoard() {
        clearBoardFromScreen();
        nextInstanceId = 1;
        nextConnectionId = 1;
        showTemporaryButtonText(clearBoardBtn, "Cleared!");
    }

    /*
    Collects all dropped parts currently inside the drop zone.
*/
    function getSavedParts() {
        const placedItems = dropZone.querySelectorAll(".placed-item");

        return Array.from(placedItems).map((item) => {
            return {
                partId: item.dataset.partId || "",
                fullPath: item.dataset.fullPath || "",
                categoryClass: item.dataset.categoryClass || "part-generic",
                label: item.dataset.label || item.textContent.trim(),
                instanceId: item.dataset.instanceId,
                left: parseFloat(item.style.left) || 0,
                top: parseFloat(item.style.top) || 0,
                image: item.dataset.image || "",

                tagName: item.dataset.tagName || "",
                description: item.dataset.description || "",
                voltage: item.dataset.voltage || "",
                outputType: item.dataset.outputType || "",
                contactType: item.dataset.contactType || ""
            };
        });
    }

    /*
    Selects a dropped part and opens only the Part Properties Panel.
    The Wire Properties Panel is hidden when a part is selected.
*/
    function selectPlacedItem(item) {
        if (!item) return;

        clearWireSelection();
        clearPartSelection();

        selectedPart = item;
        selectedPart.classList.add("part-selected");

        partPropertiesPanel.classList.add("panel-visible");
        partPropertiesPanel.setAttribute("aria-hidden", "false");

        selectedPartPath.textContent = item.dataset.fullPath || item.dataset.label || "Selected Part";

        partTagInput.value = item.dataset.tagName || "";
        partDescriptionInput.value = item.dataset.description || "";
        partVoltageSelect.value = item.dataset.voltage || "";
        partOutputTypeSelect.value = item.dataset.outputType || "";
        partContactTypeSelect.value = item.dataset.contactType || "";
    }

    /*
    Clears the selected part and hides the Part Properties Panel.
*/
    function clearPartSelection() {
        if (selectedPart) {
            selectedPart.classList.remove("part-selected");
        }

        selectedPart = null;

        selectedPartPath.textContent = "Select a dropped part to edit its properties.";

        partTagInput.value = "";
        partDescriptionInput.value = "";
        partVoltageSelect.value = "";
        partOutputTypeSelect.value = "";
        partContactTypeSelect.value = "";

        partPropertiesPanel.classList.remove("panel-visible");
        partPropertiesPanel.setAttribute("aria-hidden", "true");
    }

    /*
    Applies the Part Properties Panel values to the selected dropped part.
*/
    function applyPartProperties() {
        if (!selectedPart) {
            window.alert("Select a dropped part first.");
            return;
        }

        selectedPart.dataset.tagName = partTagInput.value.trim();
        selectedPart.dataset.description = partDescriptionInput.value.trim();
        selectedPart.dataset.voltage = partVoltageSelect.value;
        selectedPart.dataset.outputType = partOutputTypeSelect.value;
        selectedPart.dataset.contactType = partContactTypeSelect.value;

        updatePlacedItemLabel(selectedPart);
        selectedPartPath.textContent = getSelectedPartSummary(selectedPart);
    }

    /*
    Updates the visible label on a dropped part.
    If a tag name exists, it displays the tag above the part name.
*/
    function updatePlacedItemLabel(item) {
        const label = item.querySelector(".placed-item-label");

        if (!label) return;

        const tagName = item.dataset.tagName || "";
        const partLabel = item.dataset.label || "Part";

        if (tagName) {
            label.textContent = `${tagName} — ${partLabel}`;
        } else {
            label.textContent = partLabel;
        }
    }

    /*
    Builds a short summary line for the selected part.
*/
    function getSelectedPartSummary(item) {
        const tagName = item.dataset.tagName || "No Tag";
        const fullPath = item.dataset.fullPath || item.dataset.label || "Selected Part";

        return `${tagName} — ${fullPath}`;
    }

    /*
    Copies the connection data into a save-friendly format.
*/
    function getSavedConnections() {
        return connections.map((connection) => {
            return {
                connectionId: connection.connectionId,
                fromInstanceId: connection.fromInstanceId,
                fromTerminalId: connection.fromTerminalId,
                toInstanceId: connection.toInstanceId,
                toTerminalId: connection.toTerminalId,
                wireType: connection.wireType,
                wireLabel: connection.wireLabel || ""
            };
        });
    }

    /*
    Rebuilds all dropped parts from saved data.
*/
    function restoreParts(savedParts) {
        savedParts.forEach((savedPart) => {
            const restoredItem = createPlacedItemFromSavedData(savedPart);
            boardWorld.appendChild(restoredItem);
        });
    }

    /*
    Rebuilds all stored wire connections from saved data.
*/
    function restoreConnections(savedConnections) {
        connections.length = 0;

        savedConnections.forEach((connection) => {
            if (isValidSavedConnection(connection)) {
                const restoredConnection = {
                    connectionId: connection.connectionId || `wire-${nextConnectionId}`,
                    fromInstanceId: connection.fromInstanceId,
                    fromTerminalId: connection.fromTerminalId,
                    toInstanceId: connection.toInstanceId,
                    toTerminalId: connection.toTerminalId,
                    wireType: connection.wireType || "signal",
                    wireLabel: connection.wireLabel || getDefaultWireLabel(connection.wireType || "signal")
                };

                connections.push(restoredConnection);

                if (!connection.connectionId) {
                    nextConnectionId += 1;
                }
            }
        });
    }

    /*
    Restores saved board settings.
*/
    function restoreSettings(settings) {
        if (typeof settings.snapMode === "boolean") {
            snapMode = settings.snapMode;
        }

        if (settings.selectedWireType && wireTypes[settings.selectedWireType]) {
            wireTypeSelect.value = settings.selectedWireType;
        }
    }

    /*
    Creates a dropped part from saved board data.
*/
    function createPlacedItemFromSavedData(savedPart) {
        const item = document.createElement("div");

        item.classList.add("placed-item");
        item.classList.add(savedPart.categoryClass || "part-generic");

        item.dataset.partId = savedPart.partId || "";
        item.dataset.fullPath = savedPart.fullPath || savedPart.label || "";
        item.dataset.categoryClass = savedPart.categoryClass || "part-generic";
        item.dataset.label = savedPart.label || "Part";
        item.dataset.image = savedPart.image || "";
        item.dataset.instanceId = savedPart.instanceId || `part-${nextInstanceId}`;

        item.dataset.tagName = savedPart.tagName || "";
        item.dataset.description = savedPart.description || "";
        item.dataset.voltage = savedPart.voltage || "";
        item.dataset.outputType = savedPart.outputType || "";
        item.dataset.contactType = savedPart.contactType || "";

        if (!savedPart.instanceId) {
            nextInstanceId += 1;
        }

        item.title = item.dataset.fullPath;
        item.style.left = `${savedPart.left || 0}px`;
        item.style.top = `${savedPart.top || 0}px`;

        buildPlacedItemBody(item);
        createConnectionTerminals(item);
        updatePlacedItemLabel(item);

        item.addEventListener("pointerdown", startMovingPlacedItem);

        return item;
    }

    /*
    Checks whether a saved connection has enough information to restore.
*/
    function isValidSavedConnection(connection) {
        return (
            connection &&
            connection.fromInstanceId &&
            connection.fromTerminalId &&
            connection.toInstanceId &&
            connection.toTerminalId
        );
    }

    /*
    Finds the next safe instance number based on currently loaded parts.
*/
    function getNextInstanceIdFromPlacedItems() {
        const placedItems = dropZone.querySelectorAll(".placed-item");
        let highestIdNumber = 0;

        placedItems.forEach((item) => {
            const instanceId = item.dataset.instanceId || "";
            const match = instanceId.match(/^part-(\d+)$/);

            if (match) {
                highestIdNumber = Math.max(highestIdNumber, Number(match[1]));
            }
        });

        return highestIdNumber + 1;
    }

    /*
    Finds the next safe wire number based on currently loaded connections.
*/
    function getNextConnectionIdFromConnections() {
        let highestIdNumber = 0;

        connections.forEach((connection) => {
            const connectionId = connection.connectionId || "";
            const match = connectionId.match(/^wire-(\d+)$/);

            if (match) {
                highestIdNumber = Math.max(highestIdNumber, Number(match[1]));
            }
        });

        return highestIdNumber + 1;
    }

    /*
    Temporarily changes a button's text to give user feedback.
*/
    function showTemporaryButtonText(button, temporaryText) {
        const originalText = button.textContent;

        button.textContent = temporaryText;

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 1200);
    }

    /*
    Saves the current board layout to localStorage.
*/
    saveBoardBtn.addEventListener("click", () => {
        saveBoardToLocalStorage();
    });

    /*
    Loads the saved board layout from localStorage.
*/
    loadBoardBtn.addEventListener("click", () => {
        loadBoardFromLocalStorage();
    });

    /*
    Clears the current board from the screen.
    This does not erase the saved localStorage board.
*/
    clearBoardBtn.addEventListener("click", () => {
        clearBoard();
    });

    /*
        ============================================================
        CONTROL BUTTON LISTENERS
        ============================================================
    */

    /*
    Applies edited wire label/type to the selected wire.
*/
    applyWirePropertiesBtn.addEventListener("click", () => {
        applyWireProperties();
    });

    /*
    Deletes only the currently selected wire.
*/
    deleteSelectedWireBtn.addEventListener("click", () => {
        deleteSelectedWire();
    });

    /*
    Clears the selected wire and hides the Wire Properties Panel.
*/
    clearWireSelectionBtn.addEventListener("click", () => {
        clearWireSelection();
    });

    /*
        Turns Connect Mode on or off.

        When Connect Mode is ON:
        - Existing parts cannot be dragged.
        - Terminal dots can be clicked/tapped to create wires.
    */
    /*
    Turns Connect Mode on or off.

    Connect Mode and Delete Mode cannot be active at the same time.
*/
    connectModeBtn.addEventListener("click", () => {
        setConnectMode(!connectMode);
    });

    /*
    Turns Delete Mode on or off.

    Delete Mode removes dropped parts or terminal wires.
    Connect Mode and Delete Mode cannot be active at the same time.
*/
    deleteModeBtn.addEventListener("click", () => {
        setDeleteMode(!deleteMode);
    });

    /*
    Clears all wire connections from the board.
*/
    clearLinesBtn.addEventListener("click", () => {
        connections.length = 0;
        clearConnectionSelection();
        clearWireSelection();
        renderCanvas();
    });

    /*
        Redraws the canvas when the selected wire type changes.

        Existing wires keep the wire type they were created with.
        The new selection affects future wires only.
    */
    wireTypeSelect.addEventListener("change", () => {
        renderCanvas();
    });

    /*
    Applies the values from the Part Properties Panel to the selected part.
*/
    applyPartPropertiesBtn.addEventListener("click", () => {
        applyPartProperties();
    });

    /*
    Clears the selected part from the Part Properties Panel.
*/
    clearPartSelectionBtn.addEventListener("click", () => {
        clearPartSelection();
    });

    /*
        ============================================================
        PARTS MENU LISTENER
        ============================================================
    */

    /*
        Uses event delegation for the Parts Menu.

        Because the menu buttons are created dynamically by JavaScript,
        this listener is attached to the parent menu tree instead of
        attaching a separate listener to every button.
    */
    partsMenuTree.addEventListener("pointerdown", (event) => {
        const partButton = event.target.closest(".drag-item");

        if (!partButton) return;

        startDraggingNewPart(partButton, event);
    });

    /*
    Turns Snap Mode on or off.

    Snap Mode can stay active while using Normal, Connect, or Delete Mode.
*/
    snapModeBtn.addEventListener("click", () => {
        setSnapMode(!snapMode);
    });

    /*
    Allows the user to click/tap near a wire to select or delete it.
*/
    dropZone.addEventListener("pointerdown", (event) => {
        handleDropZonePointerDown(event);
    });

    /*
        ============================================================
        THEME CHANGE SUPPORT
        ============================================================
    */

    /*
        Watches the <html data-theme=""> attribute.

        When your dark/light mode script changes the theme, this redraws
        the canvas so the board background and text update too.
    */
    const themeObserver = new MutationObserver(() => {
        renderCanvas();
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });
});
