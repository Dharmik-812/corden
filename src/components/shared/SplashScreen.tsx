"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const STEPS = [
  "Loading modules",
  "Preparing canvas",
  "Syncing workspace",
  "Ready",
];

export function SplashScreen({ show }: { show: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!show) return;
    const start = Date.now();
    const duration = 2200;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      setStepIndex(Math.min(STEPS.length - 1, Math.floor((elapsed / duration) * STEPS.length)));
      if (elapsed < duration) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="splash-grid" aria-hidden />
          <motion.div
            className="splash-glow splash-glow--blue"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.35, scale: 1.4 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />
          <motion.div
            className="splash-glow splash-glow--purple"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.2, scale: 1.2 }}
            transition={{ duration: 2.4, delay: 0.2, ease: "easeOut" }}
          />

          <motion.div
            className="splash-content"
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo size={64} />
            </motion.div>

            <motion.div
              className="splash-meta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <span className="splash-badge">Corden Studio</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  className="splash-status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
              <div className="splash-progress-row">
                <div className="splash-progress-track">
                  <motion.div
                    className="splash-progress-bar"
                    style={{ transform: `scaleX(${progress / 100})` }}
                  />
                </div>
                <span className="splash-progress-pct">{progress}%</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.span
            className="splash-version"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            v0.1 · Browser-native drafting
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
