"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { SPLASH_CONFIG } from "@/data/splash";

/* ─── Cinematic 3D Spatial Grid Canvas ─── */
function SpatialGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    init();
    window.addEventListener("resize", init);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = Date.now();

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // Extremely dark, muted matte background
      ctx.fillStyle = '#0B0D12';
      ctx.fillRect(0, 0, w, h);

      const elapsed = (Date.now() - startTime) / 1000;
      
      const cx = w / 2;
      const cy = h * 0.45; // Horizon line
      
      // Central brass radial glow (very subtle)
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.6);
      glowGrad.addColorStop(0, 'rgba(197, 160, 89, 0.06)');
      glowGrad.addColorStop(0.5, 'rgba(11, 13, 18, 0.4)');
      glowGrad.addColorStop(1, 'rgba(11, 13, 18, 1)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid settings
      const fov = 400; // Camera field of view
      const planeY = 60; // Distance of plane from camera
      const gridSize = 100;
      const speed = 60; // Pixels per second forward
      
      const zOffset = (elapsed * speed) % gridSize;

      ctx.lineWidth = 1;

      // Render bottom grid plane
      for (let x = -3000; x <= 3000; x += gridSize) {
        // Vertical lines radiating from vanishing point
        const pxStart = cx + x * (fov / 10);
        const pyStart = cy + planeY * (fov / 10);
        
        const pxEnd = cx + x * (fov / 2000);
        const pyEnd = cy + planeY * (fov / 2000);

        // Distance fading gradient for vertical lines
        const lineGrad = ctx.createLinearGradient(pxStart, pyStart, pxEnd, pyEnd);
        lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        lineGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.03)');
        lineGrad.addColorStop(1, 'rgba(197, 160, 89, 0.12)'); // Brass near horizon

        ctx.strokeStyle = lineGrad;
        ctx.beginPath();
        ctx.moveTo(pxStart, pyStart);
        ctx.lineTo(pxEnd, pyEnd);
        ctx.stroke();
      }

      // Horizontal lines (moving forward)
      for (let z = 10; z < 2000; z += gridSize) {
        const actualZ = z - zOffset;
        if (actualZ <= 5) continue;
        
        const scale = fov / actualZ;
        const py = cy + planeY * scale;
        
        // Don't draw if it's off the bottom of the screen
        if (py > h + 100) continue;

        // Alpha calculation based on distance Z
        // Fade out in distance (high Z) and very close (low Z)
        let alpha = 0.05;
        if (actualZ < 100) alpha *= (actualZ / 100);
        if (actualZ > 1000) alpha *= (1 - (actualZ - 1000) / 1000);
        
        // Slight brass tint in distance
        const isBrass = actualZ > 1200;

        ctx.strokeStyle = isBrass ? `rgba(197, 160, 89, ${alpha * 2})` : `rgba(255, 255, 255, ${alpha})`;
        
        ctx.beginPath();
        ctx.moveTo(cx - 3000 * scale, py);
        ctx.lineTo(cx + 3000 * scale, py);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", init);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

/* ─── Animated Letter-by-Letter Text ─── */
function SplitText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-flex", overflow: "hidden" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Main Splash Screen ─── */
interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!show) return;
    const start = Date.now();
    const duration = SPLASH_CONFIG.durationMs;
    const totalSteps = SPLASH_CONFIG.steps.length;

    let frameId: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      setStepIndex(
        Math.min(totalSteps - 1, Math.floor((elapsed / duration) * totalSteps))
      );
      if (elapsed < duration) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [show]);

  const easeOutExpo = [0.16, 1, 0.3, 1] as const;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0B0D12", overflow: "hidden",
          }}
        >
          {/* Cinematic 3D Spatial Grid background */}
          <SpatialGridCanvas />

          {/* Radial vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "radial-gradient(circle at 50% 45%, transparent 30%, rgba(11,13,18,0.85) 70%, #0B0D12 100%)",
            pointerEvents: "none",
          }} />

          {/* Subtle horizontal line accents */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: easeOutExpo }}
            style={{
              position: "absolute", top: "50%", left: "10%", right: "10%",
              height: "1px", background: "rgba(197, 160, 89, 0.06)",
              transformOrigin: "center", zIndex: 1,
            }}
          />

          {/* Center content */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "2.5rem",
          }}>

            {/* Logo with cinematic reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: easeOutExpo, delay: 0.1 }}
              style={{ perspective: "800px" }}
            >
              <motion.svg
                width={72}
                height={72}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(197, 160, 89, 0.15))",
                    "drop-shadow(0 0 40px rgba(197, 160, 89, 0.3))",
                    "drop-shadow(0 0 20px rgba(197, 160, 89, 0.15))",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Outer hexagonal frame */}
                <motion.path
                  d="M50 15L85 35L85 75L50 95L15 75L15 35L50 15Z"
                  stroke="#C5A059"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                />
                {/* Inner cross lines */}
                <motion.path
                  d="M15 35L50 55L85 35"
                  stroke="#C5A059"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
                />
                <motion.path
                  d="M50 55L50 95"
                  stroke="#C5A059"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeInOut", delay: 1.1 }}
                />
                {/* Pulsing center node */}
                <motion.circle
                  cx="50"
                  cy="55"
                  r="5"
                  fill="#C5A059"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0.85],
                  }}
                  transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
                />
                {/* Corner accents */}
                {[
                  [50, 15], [85, 35], [85, 75], [50, 95], [15, 75], [15, 35],
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="2"
                    fill="#C5A059"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                  />
                ))}
              </motion.svg>
            </motion.div>

            {/* Brand name — letter by letter reveal */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.5rem",
            }}>
              <div style={{
                fontFamily: "var(--font-tall), 'Syne', sans-serif",
                fontSize: "2.8rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#F3F4F6",
                lineHeight: 1,
              }}>
                <SplitText text="CORDEN" delay={0.5} />
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.0, duration: 0.8, ease: easeOutExpo }}
                style={{
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #C5A059, transparent)",
                  maxWidth: "200px",
                }}
              />

              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                style={{
                  fontFamily: "var(--font-serif-stately), 'Cormorant Garamond', serif",
                  fontSize: "0.85rem",
                  fontWeight: 400,
                  fontStyle: "italic",
                  letterSpacing: "0.2em",
                  color: "#C5A059",
                  textTransform: "uppercase",
                }}
              >
                Atelier
              </motion.span>
            </div>

            {/* Loading status + progress */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "1rem", minWidth: "280px",
              }}
            >
              {/* Step label */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    margin: 0,
                  }}
                >
                  {SPLASH_CONFIG.steps[stepIndex]?.label}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px", width: "100%",
              }}>
                <div style={{
                  flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.06)",
                  position: "relative", overflow: "hidden",
                }}>
                  <motion.div
                    animate={{ scaleX: progress / 100 }}
                    transition={{ ease: "linear", duration: 0.05 }}
                    style={{
                      position: "absolute", inset: 0,
                      transformOrigin: "left",
                      background: "linear-gradient(90deg, #C5A059, #D4B06A)",
                    }}
                  />
                  {/* Glow at the tip */}
                  <motion.div
                    animate={{ left: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.05 }}
                    style={{
                      position: "absolute", top: "-3px", width: "6px", height: "7px",
                      background: "radial-gradient(circle, rgba(197,160,89,0.8), transparent)",
                      borderRadius: "50%", pointerEvents: "none",
                    }}
                  />
                </div>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#C5A059",
                  minWidth: "2.5rem",
                  textAlign: "right",
                  opacity: 0.7,
                }}>
                  {progress}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Version — bottom */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            style={{
              position: "absolute", bottom: "2rem",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.625rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(156, 163, 175, 0.45)",
              zIndex: 2,
            }}
          >
            {SPLASH_CONFIG.versionText}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
