"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SPLASH_CONFIG } from "@/data/splash";

interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);

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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="splash-grid" aria-hidden />

          <motion.div
            className="splash-content"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo size={60} />
            </motion.div>

            <motion.div
              className="splash-meta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <span className="splash-badge">{SPLASH_CONFIG.badgeText}</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  className="splash-status"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {SPLASH_CONFIG.steps[stepIndex]?.label}
                </motion.p>
              </AnimatePresence>
              <div className="splash-progress-row">
                <div className="splash-progress-track">
                  <motion.div
                    className="splash-progress-bar"
                    animate={{ scaleX: progress / 100 }}
                    transition={{ ease: "linear", duration: 0.05 }}
                  />
                </div>
                <span className="splash-progress-pct">{progress}%</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.span
            className="splash-version"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {SPLASH_CONFIG.versionText}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
