"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Script from "next/script";

/* ─── 3D Floating Ambient Shape (from old hero, preserved) ─── */
function FloatingShape({
  position,
  geometry,
  color,
  speed,
}: {
  position: [number, number, number];
  geometry: string;
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.6) * 0.6;
    meshRef.current.rotation.y = Math.cos(t * 0.4) * 0.6;
    // Subtle mouse parallax
    meshRef.current.position.x = position[0] + state.pointer.x * 0.5;
    meshRef.current.position.y = position[1] + state.pointer.y * 0.5;
  });

  return (
    <Float speed={speed * 0.7} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={0.55}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 1]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {geometry === "torus" && <torusGeometry args={[1, 0.3, 16, 32]} />}
        {geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
        <meshPhysicalMaterial
          color={color}
          roughness={0.05}
          metalness={0.9}
          clearcoat={1}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

/* ─── 3D High-quality Scene ─── */
function Scene3D() {
  const mainRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const px = (state.pointer.x * Math.PI) / 9;
    const py = (state.pointer.y * Math.PI) / 9;

    if (mainRef.current) {
      mainRef.current.rotation.x +=
        (py * 0.5 - mainRef.current.rotation.x) * 0.04;
      mainRef.current.rotation.y +=
        (px * 0.5 + t * 0.06 - mainRef.current.rotation.y) * 0.02;
    }
    if (wireRef.current) {
      wireRef.current.rotation.copy(
        mainRef.current?.rotation ?? new THREE.Euler(),
      );
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.5;
      innerRef.current.rotation.z = -t * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.18 + px * 0.25;
      ringRef.current.rotation.x = Math.sin(t * 0.12) * 0.3 + py * 0.25;
    }
  });

  return (
    <>
      {/* Lighting — same family as the floating shapes */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 7, 5]} intensity={1.8} color="#C5A059" />
      <pointLight position={[-6, 3, 4]} intensity={2.2} color="#8B1E2D" />
      <pointLight position={[4, -5, -3]} intensity={1.2} color="#1B233D" />
      <pointLight position={[0, 6, -6]} intensity={1.0} color="#ffffff" />

      {/* ── Central Icosahedron — dark metal, matching the satellites ── */}
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.3}>
        {/* Solid core — dark brushed metal */}
        <mesh ref={mainRef} scale={2.1}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#0B0D12"
            roughness={0.15}
            metalness={0.95}
            envMapIntensity={2}
          />
        </mesh>

        {/* Wireframe overlay — glowing edges like the floating shapes */}
        <mesh ref={wireRef} scale={2.12}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#C5A059"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Inner spinning octahedron visible through the faces */}
        <mesh ref={innerRef} scale={0.9}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#8B1E2D"
            emissive="#8B1E2D"
            emissiveIntensity={3}
            roughness={0}
            metalness={1}
            toneMapped={false}
          />
        </mesh>

        {/* Subtle outer wireframe shell — bigger, faint */}
        <mesh scale={2.5}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#C5A059"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </Float>

      {/* ── Thin orbiting rings ── */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={4}>
          <torusGeometry args={[1, 0.003, 16, 256]} />
          <meshBasicMaterial color="#C5A059" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, Math.PI / 5, 0]} scale={5}>
          <torusGeometry args={[1, 0.002, 16, 256]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 1.6, Math.PI / 3, 0]} scale={5.8}>
          <torusGeometry args={[1, 0.002, 16, 256]} />
          <meshBasicMaterial color="#8B1E2D" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* ── Same floating wireframe satellites from the original ── */}
      <FloatingShape
        position={[3.2, 1.6, -2]}
        geometry="octahedron"
        color="#C5A059"
        speed={1.1}
      />
      <FloatingShape
        position={[-2.6, -2, -2.5]}
        geometry="torus"
        color="#8B1E2D"
        speed={0.75}
      />
      <FloatingShape
        position={[2, -2.6, 1]}
        geometry="box"
        color="#1B233D"
        speed={1.3}
      />
      <FloatingShape
        position={[-3.2, 1.4, 0.5]}
        geometry="icosahedron"
        color="#C5A059"
        speed={0.95}
      />

      <Environment preset="night" />
    </>
  );
}

/* ─── Vanta.js TRUNK Background ─── */
function Interactive2DCanvas() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vantaEffect: any = null;
    const initVanta = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!vantaEffect && (window as any).VANTA && (window as any).VANTA.TRUNK && (window as any).p5) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vantaEffect = (window as any).VANTA.TRUNK({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          spacing: 1.50,
          chaos: 10.00,
          color: 0xc5a059, // Brass
          backgroundColor: 0x0b0d12 // Midnight
        });
      }
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).VANTA && (window as any).VANTA.TRUNK && (window as any).p5) {
      initVanta();
    } else {
      const interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).VANTA && (window as any).VANTA.TRUNK && (window as any).p5) {
          initVanta();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js" strategy="lazyOnload" />
      <div
        ref={vantaRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </>
  );
}

/* ─── Main Hero ─── */
export function InteractiveHero() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        background: "#080808",
      }}
    >
      {/* Left-side gradient to ensure text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, #080808 28%, rgba(8,8,8,0.55) 60%, transparent 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          zIndex: 2,
          pointerEvents: "none",
          background: "linear-gradient(to top, #080808 0%, transparent 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {mode === "3d" ? (
          <motion.div
            key="3d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Canvas
              camera={{ position: [0, 0, 7], fov: 48 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
              }}
            >
              <Scene3D />
            </Canvas>
          </motion.div>
        ) : (
          <motion.div
            key="2d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Interactive2DCanvas />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode toggle */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          right: "3rem",
          zIndex: 20,
          display: "flex",
          gap: "2px",
          padding: "4px",
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {(["3d", "2d"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              position: "relative",
              padding: "8px 22px",
              borderRadius: "9999px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.35)",
              transition: "color 0.25s ease",
            }}
          >
            {mode === m && (
              <motion.span
                layoutId="mode-pill"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
