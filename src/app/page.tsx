"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { InteractiveHero } from "@/components/home/InteractiveHero";
import { Box, PencilRuler, Sparkles, Layers, Cpu, Zap, ArrowRight, Github } from "lucide-react";

/* ─── Reusable animated section wrapper ─── */
function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Magnetic Glow Button ─── */
function GlowLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: variant === "primary" ? "14px 36px" : "14px 24px",
        borderRadius: "9999px",
        fontSize: "0.9rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        ...(variant === "primary" ? {
          background: hovered
            ? "linear-gradient(135deg, #5a88cc, #3655a3)"
            : "linear-gradient(135deg, #4772b3, #2d4a8a)",
          color: "#fff",
          boxShadow: hovered
            ? "0 8px 32px rgba(71, 114, 179, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 4px 20px rgba(71, 114, 179, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        } : {
          background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
          color: hovered ? "#ffffff" : "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
        }),
      }}
    >
      {children}
    </Link>
  );
}

/* ─── Bento Feature Card ─── */
function BentoCard({
  icon, title, description, gradient, accentColor, href, delay = 0, colSpan = 1,
}: {
  icon: React.ReactNode; title: string; description: string;
  gradient: string; accentColor: string; href: string; delay?: number; colSpan?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: `span ${colSpan}`,
        position: "relative",
        borderRadius: "24px",
        padding: "2px",
        background: hovered
          ? `linear-gradient(135deg, ${accentColor}40, transparent, ${accentColor}20)`
          : "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01))",
        transition: "all 0.4s ease",
        cursor: "pointer",
      }}
    >
      <Link href={href} style={{ display: "block", height: "100%", textDecoration: "none" }}>
        <div
          style={{
            height: "100%",
            borderRadius: "22px",
            padding: "36px",
            background: hovered
              ? "rgba(15,15,20,0.95)"
              : "rgba(12,12,16,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden",
            position: "relative",
            transition: "background 0.4s ease",
          }}
        >
          {/* Background glow blob */}
          <div style={{
            position: "absolute", top: "-20%", right: "-10%",
            width: "60%", height: "60%",
            background: gradient,
            filter: "blur(60px)",
            opacity: hovered ? 0.4 : 0.2,
            transition: "opacity 0.4s ease",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          {/* Icon */}
          <div style={{
            display: "inline-flex",
            padding: "12px",
            borderRadius: "14px",
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            marginBottom: "20px",
            color: accentColor,
            transition: "all 0.3s ease",
            boxShadow: hovered ? `0 0 20px ${accentColor}40` : "none",
          }}>
            {icon}
          </div>

          <h3 style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}>
            {title}
          </h3>

          <p style={{
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}>
            {description}
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: accentColor,
            transition: "gap 0.2s ease",
          }}>
            Open Editor <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { hydrate } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    hydrate();
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, [hydrate]);

  return (
    <>
      <SplashScreen show={showSplash} />

      {/* Navbar */}
      <SiteHeader variant="marketing" />

      {/* Main Content */}
      <main style={{ background: "#080808", minHeight: "100vh" }}>

        {/* HERO SECTION */}
        <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
          <InteractiveHero />

          {/* Hero Text Overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "0 6rem", maxWidth: "680px",
          }}>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.035em",
                color: "#f5f5f5",
                marginBottom: "20px",
              }}
            >
              Design without{" "}
              <span style={{
                background: "linear-gradient(135deg, #4a7dc4 0%, #8eb3e8 50%, #d0e4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                limits.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.65, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.8,
                marginBottom: "36px",
                maxWidth: "480px",
              }}
            >
              Blender-grade 3D modelling meets precision 2D drafting —
              all running live in your browser, zero install.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", gap: "12px", pointerEvents: "auto" }}
            >
              <GlowLink href="/dashboard" variant="primary">
                Launch Studio <ArrowRight size={14} />
              </GlowLink>
              <GlowLink href="/dashboard" variant="ghost">
                See Examples
              </GlowLink>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 3.5, duration: 1 }}
            style={{
              position: "absolute", bottom: "2.5rem", left: "50%",
              transform: "translateX(-50%)", zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)" }}
            />
          </motion.div>
        </section>

      </main>
    </>
  );
}
