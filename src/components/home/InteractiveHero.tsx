"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ─── 3D Floating Ambient Shape (from old hero, preserved) ─── */
function FloatingShape({
  position, geometry, color, speed,
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
          opacity={0.55}
          wireframe
        />
      </mesh>
    </Float>
  );
}

/* ─── 3D High-quality Scene ─── */
function Scene3D() {
  const mainRef   = useRef<THREE.Mesh>(null);
  const wireRef   = useRef<THREE.Mesh>(null);
  const innerRef  = useRef<THREE.Mesh>(null);
  const ringRef   = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t  = state.clock.elapsedTime;
    const px = (state.pointer.x * Math.PI) / 9;
    const py = (state.pointer.y * Math.PI) / 9;

    if (mainRef.current) {
      mainRef.current.rotation.x += (py * 0.5 - mainRef.current.rotation.x) * 0.04;
      mainRef.current.rotation.y += (px * 0.5 + t * 0.06 - mainRef.current.rotation.y) * 0.02;
    }
    if (wireRef.current) {
      wireRef.current.rotation.copy(mainRef.current?.rotation ?? new THREE.Euler());
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
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 7, 5]}  intensity={1.4} color="#c8deff" />
      <pointLight      position={[-6, 3, 4]}  intensity={1.6} color="#4a7dc4" />
      <pointLight      position={[4, -5, -3]} intensity={0.6} color="#8E54E9" />
      <pointLight      position={[0, 6, -6]}  intensity={0.5} color="#ffffff" />

      {/* ── Central Icosahedron — dark metal, matching the satellites ── */}
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.3}>
        {/* Solid core — dark brushed metal */}
        <mesh ref={mainRef} scale={2.1}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#1a1e2e"
            roughness={0.15}
            metalness={0.95}
            envMapIntensity={2}
          />
        </mesh>

        {/* Wireframe overlay — glowing edges like the floating shapes */}
        <mesh ref={wireRef} scale={2.12}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#4a7dc4"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Inner spinning octahedron visible through the faces */}
        <mesh ref={innerRef} scale={0.9}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#4772b3"
            emissive="#2a4a8a"
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
            color="#8EA8D8"
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      </Float>

      {/* ── Thin orbiting rings ── */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={4}>
          <torusGeometry args={[1, 0.003, 16, 256]} />
          <meshBasicMaterial color="#4772b3" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, Math.PI / 5, 0]} scale={5}>
          <torusGeometry args={[1, 0.002, 16, 256]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
        <mesh rotation={[Math.PI / 1.6, Math.PI / 3, 0]} scale={5.8}>
          <torusGeometry args={[1, 0.002, 16, 256]} />
          <meshBasicMaterial color="#8E54E9" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* ── Same floating wireframe satellites from the original ── */}
      <FloatingShape position={[3.2, 1.6, -2]}   geometry="octahedron"  color="#8E54E9" speed={1.1} />
      <FloatingShape position={[-2.6, -2, -2.5]} geometry="torus"       color="#4A90E2" speed={0.75} />
      <FloatingShape position={[2, -2.6, 1]}     geometry="box"         color="#34D399" speed={1.3} />
      <FloatingShape position={[-3.2, 1.4, 0.5]} geometry="icosahedron" color="#F87171" speed={0.95} />

      <Environment preset="night" />
    </>
  );
}

/* ─── 2D Combined Canvas: Blueprint grid + mouse trail + crosshair ─── */
function Interactive2DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const pointsRef = useRef<{ x: number; y: number; age: number; vx: number; vy: number }[]>([]);
  const timeRef   = useRef(0);
  const rafRef    = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    // Smooth mouse
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;
    timeRef.current += 0.008;
    const t = timeRef.current;

    // Clear with slight trail effect — gives motion blur feel
    ctx.fillStyle = "rgba(10, 13, 18, 0.92)";
    ctx.fillRect(0, 0, W, H);

    const gridSize = 40;
    // Parallax offset from mouse
    const ox = ((mouseRef.current.x * -0.04) % gridSize + gridSize) % gridSize;
    const oy = ((mouseRef.current.y * -0.04) % gridSize + gridSize) % gridSize;

    // ── Faint grid ──
    ctx.strokeStyle = "rgba(71, 114, 179, 0.1)";
    ctx.lineWidth = 0.5;
    for (let x = ox; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = oy; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Heavier major grid ──
    ctx.strokeStyle = "rgba(71, 114, 179, 0.22)";
    ctx.lineWidth = 1;
    for (let x = ox; x < W; x += gridSize * 5) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = oy; y < H; y += gridSize * 5) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Ambient schematic shapes (drifting with time) ──
    const drawBlueprint = (cx: number, cy: number, w: number, h: number, phase: number) => {
      const bx = cx + Math.sin(t * 0.4 + phase) * 12 - mouseRef.current.x * 0.015;
      const by = cy + Math.cos(t * 0.3 + phase) * 12 - mouseRef.current.y * 0.015;

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bx - w / 2, by - h / 2, w, h);

      // Dimension lines
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = "rgba(71, 114, 179, 0.6)";
      // horizontal dim
      ctx.beginPath();
      ctx.moveTo(bx - w / 2, by - h / 2 - 10);
      ctx.lineTo(bx + w / 2, by - h / 2 - 10);
      ctx.stroke();
      // vertical dim
      ctx.beginPath();
      ctx.moveTo(bx + w / 2 + 10, by - h / 2);
      ctx.lineTo(bx + w / 2 + 10, by + h / 2);
      ctx.stroke();

      ctx.setLineDash([]);
      // Corner tick marks
      for (const [tx, ty] of [
        [bx - w / 2, by - h / 2],
        [bx + w / 2, by - h / 2],
        [bx - w / 2, by + h / 2],
        [bx + w / 2, by + h / 2],
      ] as [number, number][]) {
        ctx.fillStyle = "rgba(71, 114, 179, 0.9)";
        ctx.fillRect(tx - 2, ty - 2, 4, 4);
      }

      // Measurement label
      ctx.fillStyle = "rgba(71, 114, 179, 0.75)";
      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.fillText(`${(w * 0.8).toFixed(0)}`, bx - w / 2, by - h / 2 - 14);
      ctx.fillText(`${(h * 0.8).toFixed(0)}`, bx + w / 2 + 14, by);
      ctx.restore();
    };

    drawBlueprint(W * 0.72, H * 0.3,  130, 90,  0);
    drawBlueprint(W * 0.84, H * 0.68, 80,  60,  Math.PI);
    drawBlueprint(W * 0.62, H * 0.75, 160, 110, Math.PI / 2);

    // ── Mouse trail points (from old hero) ──
    const pts = pointsRef.current;
    for (let i = pts.length - 1; i >= 0; i--) {
      pts[i].age += 1;
      pts[i].x  += pts[i].vx;
      pts[i].y  += pts[i].vy;
      pts[i].vx *= 0.97;
      pts[i].vy *= 0.97;
      if (pts[i].age > 100) { pts.splice(i, 1); continue; }
      const a = 1 - pts[i].age / 100;
      ctx.fillStyle = `rgba(74, 144, 226, ${a * 0.55})`;
      ctx.fillRect(pts[i].x - 1.5, pts[i].y - 1.5, 3, 3);
    }

    // Connect nearby trail points with lines (from old hero)
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) {
          const a = (1 - dist / 70) * Math.min(1 - pts[i].age / 100, 1 - pts[j].age / 100);
          ctx.strokeStyle = `rgba(142, 84, 233, ${a * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    // ── Interactive crosshair + snap (from old hero, enhanced) ──
    if (mouseRef.current.active) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const snappedX = Math.round((mx - ox) / gridSize) * gridSize + ox;
      const snappedY = Math.round((my - oy) / gridSize) * gridSize + oy;

      // Dashed crosshair
      ctx.strokeStyle = "rgba(74, 144, 226, 0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(mx, 0); ctx.lineTo(mx, H);
      ctx.moveTo(0, my); ctx.lineTo(W, my);
      ctx.stroke();
      ctx.setLineDash([]);

      // Lines to nearby grid intersections
      ctx.strokeStyle = "rgba(74, 144, 226, 0.12)";
      ctx.lineWidth = 0.8;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          if (dx === 0 && dy === 0) continue;
          ctx.beginPath();
          ctx.moveTo(snappedX, snappedY);
          ctx.lineTo(snappedX + dx * gridSize, snappedY + dy * gridSize);
          ctx.stroke();
        }
      }

      // Snap ring glow
      const glow = ctx.createRadialGradient(snappedX, snappedY, 0, snappedX, snappedY, 16);
      glow.addColorStop(0, "rgba(74,144,226,0.6)");
      glow.addColorStop(1, "rgba(74,144,226,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(snappedX, snappedY, 16, 0, Math.PI * 2); ctx.fill();

      // Snap dot
      ctx.fillStyle = "rgba(74, 144, 226, 1)";
      ctx.beginPath(); ctx.arc(snappedX, snappedY, 3, 0, Math.PI * 2); ctx.fill();

      // Coordinate label
      ctx.fillStyle = "rgba(74, 144, 226, 0.9)";
      ctx.font = "11px 'IBM Plex Mono', monospace";
      const label = `(${Math.round((snappedX - ox) / gridSize)}, ${Math.round((snappedY - oy) / gridSize)})`;
      ctx.fillText(label, mx + 16, my - 12);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setTimeout(resize, 0);
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.offsetWidth  / rect.width;
      const sy = canvas.offsetHeight / rect.height;
      mouseRef.current.targetX = (e.clientX - rect.left) * sx;
      mouseRef.current.targetY = (e.clientY - rect.top)  * sy;
      mouseRef.current.active  = true;

      // Spawn trail particles
      for (let i = 0; i < 2; i++) {
        pointsRef.current.push({
          x: mouseRef.current.targetX,
          y: mouseRef.current.targetY,
          age: 0,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
        });
      }
      if (pointsRef.current.length > 300) pointsRef.current.splice(0, 50);
    };

    const handleLeave = () => { mouseRef.current.active = false; };

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

/* ─── Main Hero ─── */
export function InteractiveHero() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, background: "#080808" }}>

      {/* Left-side gradient to ensure text readability */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(90deg, #080808 28%, rgba(8,8,8,0.55) 60%, transparent 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", zIndex: 2, pointerEvents: "none",
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
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
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
          position: "absolute", bottom: "2.5rem", right: "3rem", zIndex: 20,
          display: "flex", gap: "2px", padding: "4px",
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
                  position: "absolute", inset: 0, borderRadius: "9999px",
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
