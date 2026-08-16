"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ─── 3D Floating Shapes ─── */
function FloatingShape({ position, geometry, color, speed }: { position: [number, number, number], geometry: string, color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.rotation.x = Math.sin(t) * 0.5;
      meshRef.current.rotation.y = Math.cos(t * 0.7) * 0.5;
      meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;

      // Subtle mouse follow
      meshRef.current.position.x = position[0] + state.pointer.x * 0.3;
      meshRef.current.position.y = position[1] + state.pointer.y * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={0.6}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 1]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {geometry === "torus" && <torusGeometry args={[1, 0.3, 16, 32]} />}
        {geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.9}
          clearcoat={1}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  const mainRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mainRef.current) {
      const tx = (state.pointer.x * Math.PI) / 3;
      const ty = (state.pointer.y * Math.PI) / 3;
      mainRef.current.rotation.x += (ty - mainRef.current.rotation.x) * 0.04;
      mainRef.current.rotation.y += (tx - mainRef.current.rotation.y) * 0.04;
    }
  });

  return (
    <>
      {/* Main centerpiece */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh ref={mainRef} scale={1.8}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            roughness={0.05}
            metalness={1}
            clearcoat={1}
            transparent
            opacity={0.4}
            wireframe
          />
          <mesh scale={0.6}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#4A90E2"
              emissive="#4A90E2"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        </mesh>
      </Float>

      {/* Orbiting smaller shapes */}
      <FloatingShape position={[2.5, 1.5, -1]} geometry="octahedron" color="#8E54E9" speed={1.2} />
      <FloatingShape position={[-2, -1.5, -2]} geometry="torus" color="#4A90E2" speed={0.8} />
      <FloatingShape position={[1.5, -2, 1]} geometry="box" color="#34D399" speed={1.5} />
      <FloatingShape position={[-2.5, 1, 0.5]} geometry="icosahedron" color="#F87171" speed={1} />
    </>
  );
}

/* ─── 2D Interactive Canvas ─── */
function Interactive2DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number; age: number; vx: number; vy: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use CSS dimensions for clearing and drawing since ctx is scaled
    const cssWidth = canvas.offsetWidth;
    const cssHeight = canvas.offsetHeight;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Draw subtle grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < cssWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssHeight);
      ctx.stroke();
    }
    for (let y = 0; y < cssHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssWidth, y);
      ctx.stroke();
    }

    // Draw interactive drafting lines from mouse
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    if (mx > 0 && my > 0) {
      // Crosshair
      ctx.strokeStyle = "rgba(74, 144, 226, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(mx, 0); ctx.lineTo(mx, cssHeight);
      ctx.moveTo(0, my); ctx.lineTo(cssWidth, my);
      ctx.stroke();
      ctx.setLineDash([]);

      // Coordinate readout
      ctx.fillStyle = "rgba(74, 144, 226, 0.8)";
      ctx.font = "11px 'IBM Plex Mono', monospace";
      const snappedX = Math.round(mx / gridSize) * gridSize;
      const snappedY = Math.round(my / gridSize) * gridSize;
      ctx.fillText(`(${snappedX}, ${snappedY})`, mx + 14, my - 10);

      // Snap indicator
      ctx.strokeStyle = "rgba(74, 144, 226, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(snappedX, snappedY, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Draw lines to nearby grid intersections
      ctx.strokeStyle = "rgba(74, 144, 226, 0.15)";
      ctx.lineWidth = 1;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          if (dx === 0 && dy === 0) continue;
          const gx = snappedX + dx * gridSize;
          const gy = snappedY + dy * gridSize;
          ctx.beginPath();
          ctx.moveTo(snappedX, snappedY);
          ctx.lineTo(gx, gy);
          ctx.stroke();
        }
      }
    }

    // Update and draw trail points
    const pts = pointsRef.current;
    for (let i = pts.length - 1; i >= 0; i--) {
      pts[i].age += 1;
      pts[i].x += pts[i].vx;
      pts[i].y += pts[i].vy;
      pts[i].vx *= 0.98;
      pts[i].vy *= 0.98;
      if (pts[i].age > 120) {
        pts.splice(i, 1);
        continue;
      }
      const alpha = 1 - pts[i].age / 120;
      ctx.fillStyle = `rgba(74, 144, 226, ${alpha * 0.5})`;
      ctx.fillRect(pts[i].x - 1.5, pts[i].y - 1.5, 3, 3);
    }

    // Connect nearby trail points
    ctx.strokeStyle = "rgba(142, 84, 233, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const alpha = (1 - dist / 80) * Math.min(1 - pts[i].age / 120, 1 - pts[j].age / 120);
          ctx.strokeStyle = `rgba(142, 84, 233, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    // Need a tiny delay to ensure offsetWidth is computed after layout
    setTimeout(resize, 0);
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.offsetWidth / rect.width;   // relationship bitmap vs. element for X
      const scaleY = canvas.offsetHeight / rect.height; // relationship bitmap vs. element for Y
      
      mouseRef.current = { 
        x: (e.clientX - rect.left) * scaleX, 
        y: (e.clientY - rect.top) * scaleY 
      };
      // Add trail points
      for (let i = 0; i < 2; i++) {
        pointsRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          age: 0,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    };

    const handleLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ─── Main Hero Component ─── */
export function InteractiveHero() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {/* Gradient overlay for text readability (3D mode only) */}
      <AnimatePresence>
        {mode === "3d" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: "linear-gradient(90deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0.1) 70%, transparent 100%)",
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === "3d" ? (
          <motion.div
            key="3d-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "65%" }}
          >
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <pointLight position={[-5, -5, 5]} color="#8E54E9" intensity={0.5} />
              <Scene3D />
              <Environment preset="city" />
            </Canvas>
          </motion.div>
        ) : (
          <motion.div
            key="2d-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Interactive2DCanvas />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Toggle */}
      <div style={{
        position: "absolute", bottom: "2rem", right: "2rem",
        display: "flex", alignItems: "center", padding: "4px",
        borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        zIndex: 20,
      }}>
        {(["2d", "3d"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              position: "relative", padding: "8px 20px",
              borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600,
              color: mode === m ? "#fff" : "#555",
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {mode === m && (
              <motion.div
                layoutId="hero-toggle-pill"
                style={{
                  position: "absolute", inset: 0, borderRadius: "9999px",
                  background: "var(--accent-primary)", zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
