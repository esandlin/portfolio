/* jshint browser: true, esversion: 6 */
"use strict";

/*
    ============================================================
    SHARED INDUSTRIAL PARTS CATALOG
    ------------------------------------------------------------
    This is the single source of truth for parts.

    Used by:
    - game_1.js / CAD Parts Repair
    - ConveyorLocationsCAD.js / Conveyor Locations CAD

    Each draggable part can have:
    - label
    - shortLabel
    - image
    - categoryClass
    - children
    ============================================================
*/

window.IndustrialPartsCatalog = [
    /*
        Paste your existing partsCatalog array items here.
    */

    /*
        ============================================================
        PARTS CATALOG
        ------------------------------------------------------------
        - Objects with children become dropdown categories.
        - Objects without children become draggable parts.
        - This structure can be nested as deep as needed.
        ============================================================
    */

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
                        shortLabel: "Single Cylinder",
                        image: "../images/parts/Pneumatics/four-way.png"
                    },
                    {
                        label: "Double Acting Cylinder",
                        shortLabel: "Double Cylinder",
                        image: "../images/parts/Pneumatics/four-way.png"
                    }
                ]
            },
            {
                label: "Air Prep",
                children: [
                    {
                        label: "Filter",
                        shortLabel: "Air Filter",
                        image: "../images/parts/Pneumatics/air-filter.png"
                    },
                    {
                        label: "Regulator",
                        shortLabel: "Regulator",
                        image: "../images/parts/Pneumatics/regulator.png"
                    },
                    {
                        label: "Lubricator",
                        shortLabel: "Lubricator",
                        image: "../images/parts/Pneumatics/lubricatior.png"
                    },
                    {
                        label: "FRL Combo",
                        shortLabel: "FRL",
                        image: "../images/parts/Pneumatics/frl.png"
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
                        shortLabel: "Directional Valve",
                        image: "../images/parts/Hydraulics/direction.png"
                    },
                    {
                        label: "Pressure Relief Valve",
                        shortLabel: "Relief Valve",
                        image: "../images/parts/Hydraulics/pressure-relief.png"
                    },
                    {
                        label: "Flow Control Valve",
                        shortLabel: "Flow Valve",
                        image: "../images/parts/Hydraulics/flow-control.png"
                    },
                    {
                        label: "Check Valve",
                        shortLabel: "Check Valve",
                        image: "../images/parts/Hydraulics/check-vlv.png"
                    }
                ]
            },
            {
                label: "Hydraulic Actuators",
                children: [
                    {
                        label: "Hydraulic Cylinder",
                        shortLabel: "Hyd Cylinder",
                        image: "../images/parts/Hydraulics/hyd-cyl.png"
                    },
                    {
                        label: "Hydraulic Motor",
                        shortLabel: "Hyd Motor",
                        image: "../images/parts/Hydraulics/hyd-motor.png"
                    }
                ]
            },
            {
                label: "Hydraulic Power",
                children: [
                    {
                        label: "Hydraulic Pump",
                        shortLabel: "Hyd Pump",
                        image: "../images/parts/Hydraulics/hyd-pump.png"
                    },
                    {
                        label: "Reservoir",
                        shortLabel: "Reservoir",
                        image: "../images/parts/Hydraulics/reservoir.png"
                    },
                    {
                        label: "Accumulator",
                        shortLabel: "Accumulator",
                        image: "../images/parts/Hydraulics/accumulator.png"
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
                        shortLabel: "Fuse",
                        image: "../images/parts/Electrical/fuse.png"
                    },
                    {
                        label: "Circuit Breaker",
                        shortLabel: "Breaker",
                        image: "../images/parts/Electrical/cb.png"
                    },
                    {
                        label: "Surge Protector",
                        shortLabel: "Surge Protect",
                        image: "../images/parts/Electrical/surge.png"
                    }
                ]
            },
            {
                label: "Power Supplies",
                children: [
                    {
                        label: "24VDC Power Supply",
                        shortLabel: "24VDC Supply",
                        image: "../images/parts/Electrical/24dc-supply.png"
                    },
                    {
                        label: "120VAC Transformer",
                        shortLabel: "Transformer",
                        image: "../images/parts/Electrical/120V-trans.png"
                    },
                    {
                        label: "480VAC Transformer",
                        shortLabel: "480V XFMR",
                        image: "../images/parts/Electrical/480vac-trans.png"
                    }
                ]
            },
            {
                label: "Terminals",
                children: [
                    {
                        label: "Terminal Block",
                        shortLabel: "Terminal Block",
                        image: "../images/parts/Electrical/terminal.png"
                    },
                    {
                        label: "Ground Terminal",
                        shortLabel: "Ground Terminal",
                        image: "../images/parts/Electrical/ground.png"
                    },
                    {
                        label: "Fuse Terminal",
                        shortLabel: "Fuse Terminal",
                        image: "../images/parts/Electrical/fuse-block.png"
                    }
                ]
            }
        ]
    }
];
