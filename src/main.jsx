import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox, Text, Line } from "@react-three/drei";
import "./style.css";

const WAVEFORMS = ["Sine", "Square", "Triangle"];
const TIME_DIVS = [0.1, 0.2, 0.5, 1, 2, 5, 10];
const VOLTS_DIVS = [0.2, 0.5, 1, 2, 5];

const FAULTS = {
  BNC: {
    title: "BNC Disconnected",
    hint: "Reconnect Generator OUTPUT → CRO CH1."
  },
  GENERATOR: {
    title: "Generator OFF",
    hint: "Turn the generator output ON."
  },
  TRIGGER: {
    title: "Wrong Trigger Source",
    hint: "Set trigger source to the active channel."
  },
  GROUND: {
    title: "Ground Coupling",
    hint: "Change coupling from GND to DC or AC."
  },
  TIME: {
    title: "Wrong Time/Div",
    hint: "Choose a smaller Time/Div for a readable waveform."
  }
};

function waveValue(type, phase) {
  const c = ((phase % 1) + 1) % 1;
  if (type === "Sine") return Math.sin(c * Math.PI * 2);
  if (type === "Square") return c < 0.5 ? 1 : -1;
  return 1 - 4 * Math.abs(Math.round(c) - c);
}

function PanelKnob({
  position,
  label,
  value,
  color = "#10b981",
  onClick,
  size = 0.28,
  isLight = false
}) {
  const [hover, setHover] = useState(false);
  const textColor = isLight ? "#0f172a" : "#f1f5f9";

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size, size * 0.92, 0.16, 32]} />
        <meshStandardMaterial
          color={hover ? "#cbd5e1" : (isLight ? "#e2e8f0" : "#334155")}
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.09, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.035, size * 1.35, 0.035]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      <Text
        position={[0, -size - 0.16, 0.02]}
        fontSize={0.065}
        color={textColor}
        anchorX="center"
        fontWeight="bold"
      >
        {label}
      </Text>

      <Text
        position={[0, -size - 0.25, 0.02]}
        fontSize={0.055}
        color={color}
        anchorX="center"
        fontWeight="bold"
      >
        {String(value)}
      </Text>
    </group>
  );
}

function Callout({
  position,
  target,
  label,
  color = "#10b981",
  side = "right"
}) {
  const [x, y, z] = position;

  return (
    <group>
      <Line
        points={[position, target]}
        color={color}
        lineWidth={1.2}
        transparent
        opacity={0.8}
      />

      <mesh position={target}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      <Text
        position={[x, y, z]}
        fontSize={0.078}
        color={color}
        anchorX={side === "right" ? "left" : "right"}
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
}

function LabDevice({
  generatorOn,
  frequency,
  amplitude,
  waveform,
  channel,
  timeDiv,
  voltsDiv,
  setFrequency,
  setAmplitude,
  setGeneratorOn,
  setChannel,
  setTimeDiv,
  setVoltsDiv,
  theme
}) {
  const light = theme === "light";

  // Distinct contrast levels for both light & dark environments
  const body = light ? "#cbd5e1" : "#424d57";
  const front = light ? "#f8fafc" : "#232a30";
  const edge = light ? "#94a3b8" : "#64748b";
  const label = light ? "#0f172a" : "#f8fafc";
  const primaryAccent = light ? "#047857" : "#10b981";
  const secondaryAccent = light ? "#0284c7" : "#38bdf8";
  const tertiaryAccent = light ? "#d97706" : "#fbbf24";

  return (
    <group position={[0, 0.15, 0]}>
      {/* MAIN CRO BODY */}
      <RoundedBox
        args={[8.8, 4.75, 1.65]}
        radius={0.25}
        smoothness={6}
        position={[0, 1.8, 0]}
      >
        <meshStandardMaterial
          color={body}
          metalness={0.4}
          roughness={0.4}
        />
      </RoundedBox>

      <RoundedBox
        args={[8.35, 4.28, 0.22]}
        radius={0.12}
        smoothness={5}
        position={[0, 1.8, 0.86]}
      >
        <meshStandardMaterial
          color={front}
          metalness={0.3}
          roughness={0.45}
        />
      </RoundedBox>

      {/* TOP HANDLE */}
      <RoundedBox
        args={[3.2, 0.3, 0.52]}
        radius={0.08}
        smoothness={4}
        position={[0, 4.35, 0]}
      >
        <meshStandardMaterial
          color={edge}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      {/* VENTILATION */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={i}
          position={[-3.55 + i * 0.32, 3.82, 0.91]}
        >
          <boxGeometry args={[0.18, 0.035, 0.02]} />
          <meshStandardMaterial color={light ? "#94a3b8" : "#1e293b"} />
        </mesh>
      ))}

      {/* BRAND */}
      <Text
        position={[-3.55, 3.55, 0.98]}
        fontSize={0.17}
        color={label}
        anchorX="left"
        fontWeight="bold"
      >
        CRO V-LAB 5000
      </Text>

      <Text
        position={[3.35, 3.55, 0.98]}
        fontSize={0.11}
        color={primaryAccent}
        anchorX="right"
        fontWeight="bold"
      >
        PRECISION OSCILLOSCOPE
      </Text>

      {/* CRT BEZEL */}
      <RoundedBox
        args={[4.85, 2.55, 0.22]}
        radius={0.18}
        smoothness={6}
        position={[-1.28, 2.08, 1.0]}
      >
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.3}
          roughness={0.5}
        />
      </RoundedBox>

      {/* CRT SCREEN */}
      <mesh position={[-1.28, 2.08, 1.125]}>
        <planeGeometry args={[4.35, 2.08]} />
        <meshStandardMaterial
          color="#02140a"
          emissive="#042611"
          emissiveIntensity={0.7}
          roughness={0.3}
        />
      </mesh>

      <Text
        position={[-1.28, 3.2, 1.16]}
        fontSize={0.075}
        color={primaryAccent}
        anchorX="center"
        fontWeight="bold"
      >
        CRT / DISPLAY • 8 × 10 GRATICULE
      </Text>

      <Html
        transform
        position={[-1.28, 2.08, 1.15]}
        distanceFactor={4.2}
      >
        <div className="real-crt-screen">
          <div className="real-crt-grid" />
          <div className={`real-crt-wave ${waveform.toLowerCase()}`} />
          <div className="crt-readout">
            {channel} • {voltsDiv} V/DIV • {timeDiv} ms/DIV
          </div>
        </div>
      </Html>

      {/* VERTICAL CONTROLS */}
      <Text
        position={[1.72, 3.13, 1.0]}
        fontSize={0.095}
        color={label}
        anchorX="center"
        fontWeight="bold"
      >
        VERTICAL
      </Text>

      <PanelKnob
        position={[1.15, 2.55, 1.04]}
        label="POSITION"
        value="CH1"
        color={primaryAccent}
        isLight={light}
      />

      <PanelKnob
        position={[2.25, 2.55, 1.04]}
        label="VOLTS/DIV"
        value={`${voltsDiv}V`}
        color={primaryAccent}
        isLight={light}
        onClick={() =>
          setVoltsDiv(
            VOLTS_DIVS[
              (VOLTS_DIVS.indexOf(voltsDiv) + 1) % VOLTS_DIVS.length
            ]
          )
        }
      />

      <PanelKnob
        position={[1.15, 1.45, 1.04]}
        label="CH2 POS"
        value="CH2"
        color={secondaryAccent}
        isLight={light}
      />

      <PanelKnob
        position={[2.25, 1.45, 1.04]}
        label="COUPLING"
        value="DC"
        color={secondaryAccent}
        isLight={light}
      />

      {/* HORIZONTAL / TRIGGER */}
      <Text
        position={[1.72, 0.48, 1.0]}
        fontSize={0.095}
        color={label}
        anchorX="center"
        fontWeight="bold"
      >
        HORIZONTAL / TRIGGER
      </Text>

      <PanelKnob
        position={[0.9, 0.85, 1.04]}
        label="TIME/DIV"
        value={`${timeDiv}ms`}
        color={secondaryAccent}
        isLight={light}
        onClick={() =>
          setTimeDiv(
            TIME_DIVS[
              (TIME_DIVS.indexOf(timeDiv) + 1) % TIME_DIVS.length
            ]
          )
        }
      />

      <PanelKnob
        position={[1.85, 0.85, 1.04]}
        label="TRIGGER"
        value="CH1"
        color={tertiaryAccent}
        isLight={light}
      />

      <PanelKnob
        position={[2.8, 0.85, 1.04]}
        label="LEVEL"
        value="AUTO"
        color={tertiaryAccent}
        isLight={light}
      />

      {/* INTENSITY / FOCUS */}
      <PanelKnob
        position={[3.72, 2.55, 1.04]}
        label="INTENSITY"
        value="70%"
        color={tertiaryAccent}
        size={0.24}
        isLight={light}
      />

      <PanelKnob
        position={[3.72, 1.55, 1.04]}
        label="FOCUS"
        value="70%"
        color={tertiaryAccent}
        size={0.24}
        isLight={light}
      />

      {/* POWER */}
      <Text
        position={[3.7, 0.48, 1.0]}
        fontSize={0.075}
        color={label}
        anchorX="center"
        fontWeight="bold"
      >
        POWER / MODE
      </Text>

      <mesh
        position={[3.15, 0.08, 1.03]}
        onClick={() => setGeneratorOn(!generatorOn)}
      >
        <cylinderGeometry args={[0.13, 0.13, 0.09, 24]} />
        <meshStandardMaterial
          color={generatorOn ? primaryAccent : "#dc2626"}
          emissive={generatorOn ? primaryAccent : "#dc2626"}
          emissiveIntensity={1.5}
        />
      </mesh>

      <Text
        position={[3.15, -0.2, 1.03]}
        fontSize={0.06}
        color={generatorOn ? primaryAccent : "#dc2626"}
        anchorX="center"
        fontWeight="bold"
      >
        POWER
      </Text>

      {/* BNC INPUT TERMINALS */}
      <Text
        position={[3.7, -0.34, 1.0]}
        fontSize={0.075}
        color={label}
        anchorX="center"
        fontWeight="bold"
      >
        INPUT TERMINALS
      </Text>

      {["CH1", "CH2", "EXT"].map((name, i) => (
        <group
          key={name}
          position={[3.0 + i * 0.7, -0.72, 1.04]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.1, 32]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>

          <mesh
            position={[0, 0.065, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.075, 0.075, 0.025, 24]} />
            <meshStandardMaterial
              color={
                i === 0
                  ? primaryAccent
                  : i === 1
                  ? secondaryAccent
                  : tertiaryAccent
              }
              emissiveIntensity={0.5}
            />
          </mesh>

          <Text
            position={[0, -0.22, 0]}
            fontSize={0.06}
            color={label}
            anchorX="center"
            fontWeight="bold"
          >
            {name}
          </Text>
        </group>
      ))}

      {/* BNC CABLE */}
      {generatorOn && (
        <>
          <Line
            points={[
              [6.0, 0.08, 0.98],
              [5.55, -0.35, 1.05],
              [4.55, -0.48, 1.08],
              [3.0, -0.72, 1.04]
            ]}
            color="#0f172a"
            lineWidth={8}
          />

          <Line
            points={[
              [6.0, 0.08, 1.0],
              [5.55, -0.35, 1.06],
              [4.55, -0.48, 1.09],
              [3.0, -0.72, 1.05]
            ]}
            color={primaryAccent}
            lineWidth={2.4}
            transparent
            opacity={0.85}
          />
        </>
      )}

      {/* FUNCTION GENERATOR UNIT */}
      <RoundedBox
        args={[3.4, 2.0, 1.35]}
        radius={0.16}
        smoothness={5}
        position={[5.25, 1.05, 0]}
      >
        <meshStandardMaterial
          color={light ? "#cbd5e1" : "#334155"}
          metalness={0.4}
          roughness={0.45}
        />
      </RoundedBox>

      <Text
        position={[5.25, 1.82, 0.73]}
        fontSize={0.11}
        color={label}
        anchorX="center"
        fontWeight="bold"
      >
        FUNCTION GENERATOR
      </Text>

      <mesh position={[5.25, 1.25, 0.72]}>
        <planeGeometry args={[2.2, 0.55]} />
        <meshStandardMaterial
          color="#02140a"
          emissive="#042611"
          emissiveIntensity={0.65}
        />
      </mesh>

      <Html
        transform
        position={[5.25, 1.25, 0.8]}
        distanceFactor={4}
      >
        <div className="mini-generator-real">
          <b>{frequency} Hz</b>
          <span>
            {waveform.toUpperCase()} • {amplitude} Vpp
          </span>
        </div>
      </Html>

      <PanelKnob
        position={[4.45, 0.45, 0.76]}
        label="FREQUENCY"
        value={frequency}
        color={secondaryAccent}
        isLight={light}
        onClick={() =>
          setFrequency(
            frequency >= 5000 ? 100 : frequency + 100
          )
        }
        size={0.23}
      />

      <PanelKnob
        position={[5.25, 0.45, 0.76]}
        label="AMPLITUDE"
        value={`${amplitude}V`}
        color={primaryAccent}
        isLight={light}
        onClick={() =>
          setAmplitude(
            amplitude >= 5 ? 0.5 : amplitude + 0.5
          )
        }
        size={0.23}
      />

      <PanelKnob
        position={[6.05, 0.45, 0.76]}
        label="WAVEFORM"
        value={waveform}
        color={tertiaryAccent}
        isLight={light}
        size={0.23}
      />

      {/* CALLOUT LABELS */}
      <Callout
        position={[-5.0, 3.15, 1.25]}
        target={[-1.28, 2.9, 1.12]}
        label="CRT / DISPLAY"
        side="right"
        color={primaryAccent}
      />

      <Callout
        position={[4.8, 3.15, 1.25]}
        target={[2.25, 2.55, 1.04]}
        label="VOLTS / DIV"
        side="left"
        color={primaryAccent}
      />

      <Callout
        position={[4.8, 2.72, 1.25]}
        target={[0.9, 0.85, 1.04]}
        label="TIME / DIV"
        side="left"
        color={secondaryAccent}
      />

      <Callout
        position={[-5.0, 2.45, 1.25]}
        target={[1.85, 0.85, 1.04]}
        label="TRIGGER CONTROLS"
        side="right"
        color={tertiaryAccent}
      />

      <Callout
        position={[-5.0, 1.75, 1.25]}
        target={[1.15, 2.55, 1.04]}
        label="VERTICAL CONTROLS"
        side="right"
        color={primaryAccent}
      />

      <Callout
        position={[-5.0, 1.05, 1.25]}
        target={[0.9, 0.85, 1.04]}
        label="HORIZONTAL CONTROLS"
        side="right"
        color={secondaryAccent}
      />

      {/* RUBBER FEET */}
      {[-3.6, 3.6].map((x) => (
        <mesh
          key={x}
          position={[x, -0.63, 0.45]}
        >
          <cylinderGeometry args={[0.16, 0.18, 0.12, 20]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Workbench(props) {
  const isLight = props.theme === "light";
  return (
    <group>
      {/* Workbench surface with clear outline */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[14, 0.35, 8]} />
        <meshStandardMaterial
          color={isLight ? "#cbd5e1" : "#1e293b"}
          metalness={0.2}
          roughness={0.65}
        />
      </mesh>

      <mesh position={[0, 3.1, -3.6]}>
        <boxGeometry args={[14, 6.8, 0.25]} />
        <meshStandardMaterial
          color={isLight ? "#94a3b8" : "#111827"}
          roughness={0.85}
        />
      </mesh>

      <LabDevice {...props} />

      <Text
        position={[-5.5, 0.02, 1.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color={isLight ? "#475569" : "#94a3b8"}
        fontWeight="bold"
      >
        VIRTUAL ELECTRONICS WORKBENCH
      </Text>
    </group>
  );
}

function CRODisplay({ state, phase }) {
  const {
    generatorOn,
    bncConnected,
    coupling,
    waveform,
    frequency,
    amplitude,
    timeDiv,
    voltsDiv,
    channel,
    trigger,
    focus,
    intensity,
    xyMode,
    frequency2,
    amplitude2,
    waveform2,
    horizontal,
    vertical
  } = state;

  const visible = generatorOn && bncConnected && coupling !== "GND";
  const unstable = trigger !== channel;
  const blur = Math.max(0.2, (100 - focus) / 18);
  const opacity = intensity / 100;
  const width = 1000;
  const height = 420;

  const makePoints = (freq, amp, type, ph, xOffset = 0, yOffset = 0) => {
    const totalTime = (timeDiv * 10) / 1000;
    const center = height / 2 + yOffset;
    const pxPerVolt = height / (8 * Math.max(voltsDiv, 0.1));
    const points = [];

    for (let x = 0; x <= width; x += 2) {
      const t = (x / width) * totalTime;
      const v = waveValue(type, t * freq + ph);
      let y = center - v * (amp / 2) * pxPerVolt;
      y = Math.max(4, Math.min(height - 4, y));
      points.push(`${x + xOffset},${y}`);
    }
    return points.join(" ");
  };

  const ch1 = makePoints(
    frequency,
    amplitude,
    waveform,
    phase + (unstable ? 0.15 : 0),
    horizontal,
    vertical
  );

  const ch2 = makePoints(
    frequency2,
    amplitude2,
    waveform2,
    phase * 0.7,
    horizontal,
    vertical + 18
  );

  const xyPoints = useMemo(() => {
    const pts = [];
    const ratio = Math.max(
      0.25,
      Math.min(4, frequency2 / Math.max(frequency, 1))
    );

    for (let i = 0; i <= 720; i += 2) {
      const t = i / 720;
      const x = 500 + Math.sin(t * Math.PI * 2 * ratio + phase) * 350 * Math.min(1, amplitude / 2);
      const y = 210 - Math.sin(t * Math.PI * 2 + phase * 0.8) * 160 * Math.min(1, amplitude2 / 2);
      pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  }, [frequency, frequency2, amplitude, amplitude2, phase]);

  return (
    <div
      className={`cro-screen ${xyMode ? "xy-active" : ""}`}
      style={{
        "--crt-opacity": opacity,
        "--focus-blur": `${blur}px`
      }}
    >
      <div className="screen-readout">
        <span>{xyMode ? "X-Y" : channel}</span>
        <span>{coupling}</span>
        <span>{voltsDiv} V/DIV</span>
        <span>{timeDiv} ms/DIV</span>
        <span>TRIG {trigger}</span>
      </div>

      <div className="graticule-large">
        <div className="axis-x" />
        <div className="axis-y" />

        {!visible ? (
          <div className="no-signal-large">
            NO SIGNAL
            <small>Check generator • BNC connection • coupling</small>
          </div>
        ) : (
          <svg viewBox="0 0 1000 420" preserveAspectRatio="none">
            <defs>
              <filter id="crtGlow">
                <feGaussianBlur stdDeviation={blur} result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {xyMode ? (
              <polyline
                points={xyPoints}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.8"
                opacity={opacity}
                filter="url(#crtGlow)"
              />
            ) : (
              <>
                <polyline
                  points={ch1}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  opacity={opacity * 0.25}
                  filter="url(#crtGlow)"
                />
                <polyline
                  points={ch1}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.8"
                  opacity={opacity}
                  filter="url(#crtGlow)"
                />
                <polyline
                  points={ch2}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.4"
                  opacity={channel === "CH2" ? opacity : opacity * 0.6}
                  filter="url(#crtGlow)"
                />
              </>
            )}
          </svg>
        )}

        <div className="trigger-arrow">▶</div>
      </div>

      <div className="screen-footer">
        <span>CH1 {amplitude.toFixed(1)} Vpp</span>
        <span>CH2 {amplitude2.toFixed(1)} Vpp</span>
        <span>{frequency} Hz</span>
        <span>{unstable ? "UNSTABLE" : "TRIGGERED"}</span>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cro-theme") || "dark"
  );

  const [generatorOn, setGeneratorOn] = useState(true);
  const [bncConnected, setBncConnected] = useState(true);
  const [channel, setChannel] = useState("CH1");
  const [trigger, setTrigger] = useState("CH1");
  const [coupling, setCoupling] = useState("DC");
  const [timeDiv, setTimeDiv] = useState(1);
  const [voltsDiv, setVoltsDiv] = useState(1);
  const [frequency, setFrequency] = useState(1000);
  const [amplitude, setAmplitude] = useState(2);
  const [waveform, setWaveform] = useState("Sine");
  const [frequency2, setFrequency2] = useState(1000);
  const [amplitude2, setAmplitude2] = useState(1);
  const [waveform2, setWaveform2] = useState("Sine");
  const [xyMode, setXyMode] = useState(false);
  const [focus, setFocus] = useState(70);
  const [intensity, setIntensity] = useState(85);
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [fault, setFault] = useState(null);
  const [hint, setHint] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);
  const [measurement, setMeasurement] = useState({ vpp: "", hz: "" });
  const [message, setMessage] = useState("");
  const [mystery, setMystery] = useState(true);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    localStorage.setItem("cro-theme", theme);
  }, [theme]);

  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setPhase((p) => (p + frequency * dt * 0.001) % 100000);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frequency]);

  const visible = generatorOn && bncConnected && coupling !== "GND";
  const stable = trigger === channel && timeDiv <= 2 && visible;

  const activeFault =
    fault &&
    ((fault === "BNC" && !bncConnected) ||
      (fault === "GENERATOR" && !generatorOn) ||
      (fault === "TRIGGER" && trigger !== channel) ||
      (fault === "GROUND" && coupling === "GND") ||
      (fault === "TIME" && timeDiv >= 5));

  const guided = [
    ["Power generator output", generatorOn],
    ["Connect BNC → CH1", bncConnected],
    ["Set 1 kHz Sine", frequency === 1000 && waveform === "Sine"],
    ["Stabilize with trigger", stable],
    ["Submit manual measurements", message.startsWith("✓")]
  ];

  const completed = guided.filter((x) => x[1]).length;

  useEffect(() => {
    const n = guided.findIndex((x) => !x[1]);
    setGuidedStep(n < 0 ? 5 : n + 1);
  }, [generatorOn, bncConnected, frequency, waveform, stable, message]);

  const injectFault = (type) => {
    setFault(type);
    setHint(0);
    if (type === "BNC") setBncConnected(false);
    if (type === "GENERATOR") setGeneratorOn(false);
    if (type === "TRIGGER") setTrigger(channel === "CH1" ? "CH2" : "CH1");
    if (type === "GROUND") setCoupling("GND");
    if (type === "TIME") setTimeDiv(5);
  };

  const reset = () => {
    setGeneratorOn(true);
    setBncConnected(true);
    setChannel("CH1");
    setTrigger("CH1");
    setCoupling("DC");
    setTimeDiv(1);
    setVoltsDiv(1);
    setFrequency(1000);
    setAmplitude(2);
    setWaveform("Sine");
    setFrequency2(1000);
    setAmplitude2(1);
    setWaveform2("Sine");
    setXyMode(false);
    setFocus(70);
    setIntensity(85);
    setHorizontal(0);
    setVertical(0);
    setFault(null);
    setHint(0);
    setMeasurement({ vpp: "", hz: "" });
    setMessage("");
    setMystery(true);
    setScore(0);
    setDemoMode(false);
  };

  const checkMeasurement = () => {
    const v = Number(measurement.vpp);
    const h = Number(measurement.hz);
    const expectedVpp = amplitude;
    const expectedHz = frequency;

    if (Math.abs(v - expectedVpp) < 0.05 && Math.abs(h - expectedHz) < 2) {
      setMessage("✓ Correct — signal successfully characterized.");
      setScore((s) => Math.min(100, s + 25));
    } else {
      setMessage("Not yet. Use Vpp = vertical divisions × V/Div and f = 1/T.");
    }
  };

  const state = {
    generatorOn,
    bncConnected,
    coupling,
    waveform,
    frequency,
    amplitude,
    timeDiv,
    voltsDiv,
    channel,
    trigger,
    focus,
    intensity,
    xyMode,
    frequency2,
    amplitude2,
    waveform2,
    horizontal,
    vertical
  };

  return (
    <div className="app" data-theme={theme}>
      {/* HEADER */}
      <header className="header">
        <div>
          <div className="kicker">ENGINEERING • ANALOG ELECTRONICS - 1772</div>
          <h1>
            🔬 CRO <span>V-LAB V5</span>
          </h1>
          <p>Interactive Oscilloscope &amp; Function Generator Bench</p>
        </div>

        <div className="header-actions">
          <div className="theme-switch">
            <button
              className={theme === "dark" ? "theme-btn active" : "theme-btn"}
              onClick={() => setTheme("dark")}
            >
              ◐ Dark
            </button>
            <button
              className={theme === "light" ? "theme-btn active" : "theme-btn"}
              onClick={() => setTheme("light")}
            >
              ☼ Light
            </button>
          </div>

          <button
            className={demoMode ? "demo-btn active" : "demo-btn"}
            onClick={() => setDemoMode(!demoMode)}
          >
            {demoMode ? "● SPECTATOR LIVE" : "▶ SPECTATOR MODE"}
          </button>

          <div className="header-status">
            <i /> LAB ONLINE
          </div>
        </div>
      </header>

      {/* MISSION BAR */}
      <section className="mission-bar">
        <div className="mission-title">
          <span>LAB MISSION</span>
          <strong>Connect → Stabilise → Measure → Diagnose</strong>
        </div>

        <div className="progress-wrap">
          <div className="progress-track">
            <i style={{ width: `${completed * 20}%` }} />
          </div>
          <b>{completed}/5</b>
        </div>

        <div className="score-pill">
          SCORE <b>{score}</b>/100
        </div>
      </section>

      {/* CONTROL / HERO AREA */}
      <section className="hero">
        <aside className="control-panel">
          {/* FUNCTION GENERATOR */}
          <div className="panel-card">
            <div className="panel-title">
              <div>
                <span>FUNCTION GENERATOR</span>
                <h2>Signal Source</h2>
              </div>
              <b>{generatorOn ? "ON" : "OFF"}</b>
            </div>

            <div className="two-col">
              <label>
                Waveform
                <select
                  value={waveform}
                  onChange={(e) => setWaveform(e.target.value)}
                  disabled={demoMode}
                >
                  {WAVEFORMS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                CH2 Waveform
                <select
                  value={waveform2}
                  onChange={(e) => setWaveform2(e.target.value)}
                  disabled={demoMode}
                >
                  {WAVEFORMS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="slider">
              <span>
                Frequency <b>{frequency} Hz</b>
              </span>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={frequency}
                onChange={(e) => setFrequency(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="slider">
              <span>
                Amplitude <b>{amplitude} Vpp</b>
              </span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={amplitude}
                onChange={(e) => setAmplitude(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="slider">
              <span>
                CH2 Frequency <b>{frequency2} Hz</b>
              </span>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={frequency2}
                onChange={(e) => setFrequency2(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="button-row">
              <button
                className={generatorOn ? "green" : ""}
                onClick={() => setGeneratorOn(!generatorOn)}
                disabled={demoMode}
              >
                OUTPUT {generatorOn ? "ON" : "OFF"}
              </button>

              <button
                className={bncConnected ? "green" : "red"}
                onClick={() => setBncConnected(!bncConnected)}
                disabled={demoMode}
              >
                BNC {bncConnected ? "SNAPPED ✓" : "OPEN"}
              </button>
            </div>

            <div className={`bnc-visual ${bncConnected ? "connected" : ""}`}>
              <span>GEN OUT</span>
              <i />
              <span>CRO {channel}</span>
              <b>{bncConnected ? "BNC CABLE LOCKED" : "DRAG / CLICK TO CONNECT"}</b>
            </div>
          </div>

          {/* CRO CONTROL */}
          <div className="panel-card">
            <div className="panel-title">
              <div>
                <span>CRO CONTROL</span>
                <h2>Scale / Trigger / CRT</h2>
              </div>
            </div>

            <div className="two-col">
              <label>
                Channel
                <select
                  value={channel}
                  onChange={(e) => {
                    const next = e.target.value;
                    setChannel(next);
                    if (trigger === channel) setTrigger(next);
                  }}
                  disabled={demoMode}
                >
                  <option>CH1</option>
                  <option>CH2</option>
                </select>
              </label>

              <label>
                Trigger Source
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  disabled={demoMode}
                >
                  <option>CH1</option>
                  <option>CH2</option>
                </select>
              </label>

              <label>
                Coupling
                <select
                  value={coupling}
                  onChange={(e) => setCoupling(e.target.value)}
                  disabled={demoMode}
                >
                  <option>DC</option>
                  <option>AC</option>
                  <option>GND</option>
                </select>
              </label>

              <label>
                Time/Div
                <select
                  value={timeDiv}
                  onChange={(e) => setTimeDiv(+e.target.value)}
                  disabled={demoMode}
                >
                  {TIME_DIVS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Volts/Div
                <select
                  value={voltsDiv}
                  onChange={(e) => setVoltsDiv(+e.target.value)}
                  disabled={demoMode}
                >
                  {VOLTS_DIVS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Display Mode
                <select
                  value={xyMode ? "XY" : "YT"}
                  onChange={(e) => setXyMode(e.target.value === "XY")}
                  disabled={demoMode}
                >
                  <option>YT</option>
                  <option>XY</option>
                </select>
              </label>
            </div>

            <div className="slider">
              <span>
                Vertical Position <b>{vertical}</b>
              </span>
              <input
                type="range"
                min="-80"
                max="80"
                value={vertical}
                onChange={(e) => setVertical(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="slider">
              <span>
                Horizontal Position <b>{horizontal}</b>
              </span>
              <input
                type="range"
                min="-80"
                max="80"
                value={horizontal}
                onChange={(e) => setHorizontal(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="slider">
              <span>
                Intensity <b>{intensity}%</b>
              </span>
              <input
                type="range"
                min="20"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(+e.target.value)}
                disabled={demoMode}
              />
            </div>

            <div className="slider">
              <span>
                Focus <b>{focus}%</b>
              </span>
              <input
                type="range"
                min="20"
                max="100"
                value={focus}
                onChange={(e) => setFocus(+e.target.value)}
                disabled={demoMode}
              />
            </div>
          </div>

          {/* GUIDED EXPERIMENT */}
          <div className="panel-card mission-card">
            <div className="panel-title">
              <div>
                <span>GUIDED EXPERIMENT</span>
                <h2>Step {guidedStep} / 5</h2>
              </div>
              <b>{completed * 20}%</b>
            </div>

            {guided.map((s, i) => (
              <div
                key={s[0]}
                className={
                  s[1]
                    ? "step done"
                    : i + 1 === guidedStep
                    ? "step current"
                    : "step"
                }
              >
                <i>{s[1] ? "✓" : i + 1}</i>
                <span>{s[0]}</span>
              </div>
            ))}

            <p className="muted">
              Complete the setup in order; the simulator responds to real control changes.
            </p>
          </div>

          {/* AI INSTRUCTOR */}
          <div className="panel-card ai">
            <div className="panel-title">
              <div>
                <span>CONTEXT-AWARE AI</span>
                <h2>Instructor</h2>
              </div>
              <b>AI</b>
            </div>

            <div className="diagnosis">
              {activeFault
                ? `⚠ ${FAULTS[fault].title}`
                : stable
                ? "✓ Waveform stable"
                : "⚠ Check setup"}
            </div>

            <p>
              {activeFault
                ? FAULTS[fault].hint
                : !generatorOn
                ? "Generator output is OFF."
                : !bncConnected
                ? "BNC path is open. Reconnect Generator OUTPUT to CRO."
                : coupling === "GND"
                ? "GND coupling hides the input signal."
                : trigger !== channel
                ? "Trigger source does not match the displayed channel; the trace may drift."
                : timeDiv > 2
                ? "Time/Div is large for a 1 kHz demonstration. Reduce it to see more useful cycles."
                : xyMode
                ? "X-Y mode is active. Change CH2 frequency to reveal different Lissajous ratios."
                : "Signal path healthy. Use the graticule to measure Vpp and period."}
            </p>

            {activeFault && (
              <button
                className="green full"
                onClick={() => setHint((h) => Math.min(3, h + 1))}
              >
                ✦ GET HINT {hint}/3
              </button>
            )}
          </div>
        </aside>
      </section>

      {/* PHYSICAL 3D CRO SECTION */}
      <section className="physical-cro card">
        <div className="scene physical-scene">
          <Canvas
            camera={{
              position: [9, 6, 10],
              fov: 42
            }}
            shadows
          >
            {/* Soft studio slate background in dark mode, light slate in light mode */}
            <color
              attach="background"
              args={[theme === "light" ? "#dce6ed" : "#131b22"]}
            />

            {/* Carefully balanced lighting for high-contrast visibility */}
            <ambientLight
              intensity={theme === "light" ? 1.5 : 1.1}
              color={theme === "light" ? "#ffffff" : "#cdd9e5"}
            />

            <directionalLight
              position={[5, 9, 6]}
              intensity={theme === "light" ? 2.0 : 2.4}
              castShadow
            />

            {/* Silhouette rim-light outlining the CRO chassis against the background */}
            <directionalLight
              position={[-6, 5, -4]}
              intensity={theme === "light" ? 0.6 : 1.4}
              color="#8ca3b8"
            />

            <pointLight
              position={[-4, 3, 2]}
              intensity={14}
              distance={10}
              color={theme === "light" ? "#047857" : "#10b981"}
            />

            <Workbench
              generatorOn={generatorOn}
              frequency={frequency}
              amplitude={amplitude}
              waveform={waveform}
              channel={channel}
              timeDiv={timeDiv}
              voltsDiv={voltsDiv}
              setFrequency={setFrequency}
              setAmplitude={setAmplitude}
              setGeneratorOn={setGeneratorOn}
              setChannel={setChannel}
              setTimeDiv={setTimeDiv}
              setVoltsDiv={setVoltsDiv}
              theme={theme}
            />

            <OrbitControls
              enablePan={false}
              minDistance={6}
              maxDistance={18}
              target={[0, 1.2, 0]}
            />
          </Canvas>

          <div className="scene-label">DRAG TO ORBIT • 3D WORKBENCH</div>

          {demoMode && (
            <div className="demo-overlay">
              <span>LIVE SPECTATOR</span>
              <strong>Signal path → CRO response</strong>
              <small>Controls are intentionally locked visually; demo follows the lab state.</small>
            </div>
          )}
        </div>

        <div className="physical-caption">
          <span>PHYSICAL INSTRUMENT VIEW</span>
          <strong>Realistic CRO Front Panel • Drag to Inspect</strong>
          <small>
            Use callouts to identify CRT, deflection scaling, trigger controls, input channels, intensity, and focus.
          </small>
        </div>
      </section>

      {/* LIVE CRO DISPLAY */}
      <section className="scope-section card">
        <div className="section-head">
          <div>
            <span>PRIMARY INSTRUMENT</span>
            <h2>Live CRO Display</h2>
          </div>

          <span className={stable ? "tag" : "tag warning"}>
            {stable ? "TRIGGERED" : "CHECK TRIGGER"}
          </span>
        </div>

        <CRODisplay state={state} phase={phase} />

        <div className="scope-controls">
          <button
            className={xyMode ? "active" : ""}
            onClick={() => setXyMode(!xyMode)}
          >
            {xyMode ? "● X-Y / LISSAJOUS" : "○ Y-T WAVEFORM"}
          </button>

          <span>Focus and intensity change the CRT trace • CH1 green • CH2 cyan</span>
        </div>
      </section>

      {/* LOWER LEARNING GRID */}
      <section className="lower-grid">
        {/* MYSTERY SIGNAL CHALLENGE */}
        <div className="card">
          <div className="section-head">
            <div>
              <span>PROCEDURAL LEARNING</span>
              <h2>Mystery Signal Challenge</h2>
            </div>

            <button
              className="tag-button"
              onClick={() => {
                setMystery(!mystery);
                setMessage("");
              }}
            >
              {mystery ? "HIDDEN VALUES" : "SHOW VALUES"}
            </button>
          </div>

          <p className="muted">
            Count graticule divisions yourself. Vpp = vertical divisions × V/Div. Frequency = 1 / period.
          </p>

          <div className="measurement-grid">
            <div>
              <span>VOLTS/DIV</span>
              <strong>{voltsDiv} V</strong>
            </div>

            <div>
              <span>TIME/DIV</span>
              <strong>{timeDiv} ms</strong>
            </div>

            <div>
              <span>REFERENCE Vpp</span>
              <strong>{mystery ? "•••" : `${amplitude.toFixed(1)} V`}</strong>
            </div>

            <div>
              <span>REFERENCE f</span>
              <strong>{mystery ? "•••" : `${frequency} Hz`}</strong>
            </div>
          </div>

          <div className="answer-row">
            <label>
              Your Vpp (V)
              <input
                type="number"
                step="0.1"
                value={measurement.vpp}
                onChange={(e) =>
                  setMeasurement({
                    ...measurement,
                    vpp: e.target.value
                  })
                }
              />
            </label>

            <label>
              Your Frequency (Hz)
              <input
                type="number"
                value={measurement.hz}
                onChange={(e) =>
                  setMeasurement({
                    ...measurement,
                    hz: e.target.value
                  })
                }
              />
            </label>

            <button className="check" onClick={checkMeasurement}>
              CHECK + SCORE
            </button>
          </div>

          {message && (
            <div className={message.startsWith("✓") ? "result good" : "result"}>
              {message}
            </div>
          )}
        </div>

        {/* SIGNAL HEALTH */}
        <div className="card status-card">
          <div className="section-head">
            <div>
              <span>DUAL CHANNEL / XY</span>
              <h2>Signal Health</h2>
            </div>
            <span className="tag">2 CHANNELS</span>
          </div>

          <div className="health-grid">
            <div>
              <span>CH1</span>
              <strong className="good">{frequency} Hz</strong>
            </div>

            <div>
              <span>CH2</span>
              <strong className="good">{frequency2} Hz</strong>
            </div>

            <div>
              <span>TRIGGER</span>
              <strong className={stable ? "good" : "bad"}>
                {stable ? "STABLE" : "CHECK"}
              </strong>
            </div>

            <div>
              <span>CRT</span>
              <strong className="good">{focus}% FOCUS</strong>
            </div>
          </div>

          <div className="xy-info">
            <b>{xyMode ? "LISSAJOUS ACTIVE" : "DUAL-CHANNEL Y-T"}</b>
            <span>
              {xyMode
                ? "CH1 drives X • CH2 drives Y"
                : "Both channel traces are rendered simultaneously."}
            </span>
          </div>
        </div>

        {/* FAULT INJECTION */}
        <div className="card">
          <div className="section-head">
            <div>
              <span>DIAGNOSTIC TRAINING</span>
              <h2>Fault Injection</h2>
            </div>
            <span className="tag warning">5 FAULTS</span>
          </div>

          <div className="faults">
            {Object.entries(FAULTS).map(([key, item]) => (
              <button
                key={key}
                className={fault === key ? "fault active" : "fault"}
                onClick={() => injectFault(key)}
              >
                <span>{key}</span>
                <small>{item.title}</small>
              </button>
            ))}
          </div>

          <button className="reset" onClick={reset}>
            ↻ RESET LAB
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span>CRO V-LAB V5 • 3D ELECTRONICS LABORATORY</span>
        <span>Dual CH ✓</span>
        <span>X-Y ✓</span>
        <span>Guided ✓</span>
        <span>Mystery ✓</span>
        <span>Spectator ✓</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
