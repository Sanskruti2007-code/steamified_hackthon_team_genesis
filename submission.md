# CRO V-Lab — Virtual CRO & Function Generator Laboratory

## Problem Statement Fit

**Selected Problem Statement:** Familiarisation with Oscilloscope and Function Generator

CRO V-Lab is an interactive virtual electronics laboratory designed to help students understand and operate a Cathode Ray Oscilloscope (CRO) and Function Generator without requiring continuous access to physical laboratory equipment.

The project provides a realistic 3D CRO interface, interactive controls, waveform generation, measurement activities, graticule-based observation, and guided experiments. Students can learn how different CRO controls affect the displayed waveform in a safe and accessible virtual environment.

## Target Users

* Engineering students learning basic electronics and instrumentation
* Students who are unfamiliar with physical CRO equipment
* Students preparing for practical examinations and viva
* Educational institutions that want an interactive laboratory learning tool

### Main Pain Points

* CROs can be difficult for beginners to understand.
* Physical laboratory equipment may have limited availability.
* Students often memorize controls without understanding their practical effect.
* Incorrect connections or settings can make initial experimentation confusing.

## What We Built

We built an interactive **Virtual CRO Laboratory** that combines a mathematical waveform engine with a 3D representation of a CRO and Function Generator.

Students can:

1. Power on the virtual equipment.
2. Connect and configure channels.
3. Select waveform types.
4. Adjust frequency and amplitude.
5. Change Volts/Division and Time/Division.
6. Adjust vertical and horizontal positioning.
7. Configure triggering and coupling.
8. Observe the waveform on a functional graticule.
9. Measure voltage and time characteristics.
10. Experiment with X-Y mode and Lissajous patterns.
11. Complete guided learning missions and receive feedback.

## Core Features

* **Realistic 3D CRO:** Interactive virtual CRO with front-panel controls, CRT display, input terminals, switches, and knobs.
* **Function Generator:** Virtual signal generator with adjustable frequency, amplitude, and waveform selection.
* **Interactive Knobs:** Volts/Div, Time/Div, frequency, amplitude, and positioning controls provide immediate visual feedback.
* **Dual-Channel Operation:** CH1 and CH2 can be configured independently.
* **Procedural Waveforms:** Sine, square, and triangle waveforms are generated mathematically.
* **Functional Graticule:** Students can count divisions and understand V/div and time/div measurements.
* **Trigger Controls:** Trigger level and trigger mode help students understand waveform stability.
* **AC/DC/GND Coupling:** Demonstrates how coupling changes the displayed signal.
* **X-Y Mode:** Generates Lissajous patterns for comparing two signals.
* **Focus & Intensity:** Simulates important CRT display controls.
* **Guided Mission:** Students follow a practical CRO experiment workflow instead of simply viewing a static model.
* **Fault/Mystery Signal Mode:** Students can identify and measure an unknown waveform.
* **Educational Callouts:** Important CRO components are clearly identified for beginners.
* **Responsive Interface:** Designed to work across different screen sizes.

## Technical Architecture

The project follows a component-based web architecture.

### Main Components

**User Interface → React Application → Signal Engine → CRO Display / 3D Model**

The React application manages the user interface and experiment state.

The waveform engine mathematically generates signal values according to parameters such as:

* Waveform type
* Frequency
* Amplitude
* Phase
* Time/Division
* Volts/Division
* Channel configuration

The generated data is then visualized through the virtual CRT display.

### 3D Layer

The CRO and Function Generator are represented using **React Three Fiber / Three.js** components.

Interactive 3D elements include:

* CRO chassis
* CRT screen
* Control knobs
* Buttons
* Input terminals
* Function generator
* Front-panel labels
* Educational callouts

### Visualization Layer

The CRT display contains:

* Oscilloscope graticule
* Waveform traces
* Measurement readouts
* Channel information
* XY/Lissajous visualization
* Simulated CRT appearance

## Tech Stack

* **React**
* **JavaScript**
* **Vite**
* **Three.js**
* **React Three Fiber**
* **@react-three/drei**
* **HTML5**
* **CSS3**
* **SVG**
* **Mathematical waveform generation**
* **Local browser storage for theme/state preferences**

## Innovation / Uniqueness

The main innovation is combining **3D equipment familiarisation with an interactive mathematical CRO simulation**.

Instead of presenting only a diagram or video, CRO V-Lab allows students to interact with the virtual instrument and immediately observe the effect of changing its controls.

### Key Differentiators

* 3D CRO familiarisation for students
* Real-time waveform response
* Mathematical signal generation
* Dual-channel experimentation
* Graticule-based measurement learning
* X-Y/Lissajous visualization
* Guided practical workflow
* Mystery/fault-based learning
* Educational component callouts
* Safe experimentation without risk of damaging physical equipment

The project focuses not only on showing students **what a CRO looks like**, but also on helping them understand **how the controls affect what they see**.

## Demo Instructions

A judge can test the project quickly using the following flow:

### Step 1 — Launch

Open the project in the browser.

### Step 2 — Start the Experiment

Power on the virtual Function Generator and CRO.

### Step 3 — Select Signal

Choose a waveform such as:

* Sine
* Square
* Triangle

### Step 4 — Configure Signal

Set:

* Frequency
* Amplitude
* Channel

### Step 5 — Observe the CRO

Watch the generated waveform appear on the CRT display.

### Step 6 — Adjust CRO Controls

Change:

* Volts/Div
* Time/Div
* Vertical Position
* Horizontal Position
* Trigger
* Coupling

Observe the waveform response.

### Step 7 — Measurement

Use the graticule to determine:

* Peak-to-peak voltage
* Time period
* Frequency

### Step 8 — Try X-Y Mode

Enable X-Y visualization and experiment with different channel frequencies to observe Lissajous patterns.

### Step 9 — Try Mystery/Fault Mode

Use the unknown signal and attempt to identify its characteristics.

## Known Limitations

* The current version is a browser-based simulation and does not physically reproduce the electrical behavior of real CRO hardware.
* Some physical interactions are represented through software controls rather than true hardware-like mechanical behavior.
* The multi-user/spectator functionality is currently limited compared with a full networked collaborative laboratory.
* The simulation focuses primarily on educational familiarisation rather than professional-grade measurement accuracy.
* Real-time networking and cloud synchronization are not included in the current prototype.
* Physical BNC connection behavior is represented virtually rather than through physical hardware.

## Future Work

Future versions can expand the laboratory into a complete virtual electronics learning platform.

### Planned Improvements

* **True multiplayer laboratory:** Allow multiple students to enter the same virtual lab.
* **Spectator mode:** Enable teachers or judges to observe a student's experiment remotely.
* **Physics-based BNC connections:** Add realistic snapping and cable interaction.
* **More CRO controls:** Add additional advanced controls found on professional oscilloscopes.
* **Advanced signal types:** Add noise, modulation, pulses, and user-defined signals.
* **Experiment assessment:** Automatically evaluate student measurements and generate scores.
* **Learning analytics:** Track experiments, mistakes, completion time, and progress.
* **Voice-guided learning:** Provide step-by-step audio instructions.
* **VR/AR support:** Extend the laboratory to immersive VR environments.
* **Cloud-based laboratory:** Allow students to access experiments from anywhere.
* **More instruments:** Add multimeter, power supply, digital oscilloscope, and other electronics equipment.

## Conclusion

CRO V-Lab transforms traditional CRO familiarisation into an **interactive, visual, and experiment-based learning experience**.

By combining a realistic 3D instrument, mathematical waveform simulation, interactive controls, measurement activities, and guided experiments, the project helps students move from **memorizing CRO controls to actually understanding their behavior**.