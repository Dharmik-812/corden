"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { InteractiveHero } from "@/components/home/InteractiveHero";
import { Box, PencilRuler, Sparkles } from "lucide-react";

export default function Home() {
  const { hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    hydrate();
    setMounted(true);
    // Hide splash screen after animation completes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [hydrate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {/* Background Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'var(--accent-primary)',
                filter: 'blur(120px)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Logo size={80} />
              
              <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Initializing Workspace
                </motion.div>
                
                {/* Progress Bar */}
                <div style={{ width: "240px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2.2, ease: "circOut" }}
                    style={{ width: "100%", height: "100%", background: "var(--accent-primary)" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="navbar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size={28} />
        </Link>

        <div className="navbar-actions">
          {mounted && <ThemeToggle />}
          <Link href="/dashboard" className="btn btn-ghost">
            Dashboard
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            Start Drafting
          </Link>
        </div>
      </nav>

      <main style={{ position: 'relative', height: 'calc(100vh - var(--navbar-height))', overflow: 'hidden' }}>
        <InteractiveHero />
        
        <motion.section 
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', zIndex: 10, padding: '0 var(--space-xl)', pointerEvents: 'none' }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 className="hero-title" variants={itemVariants} style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.1, marginBottom: 'var(--space-md)' }}>
            Drafting the future, <br />
            <span className="accent" style={{ color: 'var(--accent-primary)' }}>in a vintage hand.</span>
          </motion.h1>
          
          <motion.p className="hero-subtitle" variants={itemVariants} style={{ maxWidth: '600px', margin: '0 auto var(--space-xl)', color: 'var(--text-secondary)' }}>
            Corden Atelier is a browser-based architectural workspace seamlessly blending 
            2D geometric drafting with modern 3D boolean operations. 
            Built for the modern artisan.
          </motion.p>
          
          <motion.div className="hero-actions" variants={itemVariants} style={{ pointerEvents: 'auto' }}>
            <Link href="/dashboard" className="btn btn-brass btn-lg">
              Open the Atelier
            </Link>
          </motion.div>
        </motion.section>
      </main>

    </>
  );
}
