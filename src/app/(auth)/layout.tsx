"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Box, Layers, PencilRuler, Sparkles, Quote } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const FEATURES = [
  { icon: <PencilRuler size={18} />, title: "2D Pixel Studio", desc: "Draft blueprints and pixel art" },
  { icon: <Box size={18} />, title: "3D Scene Editor", desc: "Model, light, and animate in-browser" },
  { icon: <Layers size={18} />, title: "Saved Projects", desc: "Pick up where you left off" },
];

/** Mini product preview drawn entirely with CSS / inline SVG */
function ProductPreview() {
  return (
    <div style={{
      width: "100%", borderRadius: "16px", overflow: "hidden",
      border: "1px solid rgba(71,114,179,0.25)",
      background: "#0a0c12",
      boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      marginBottom: "2rem",
    }}>
      {/* Toolbar strip */}
      <div style={{
        height: "28px", background: "#0d1018",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "6px", padding: "0 12px",
      }}>
        {["#f87171","#fbbf24","#34d399"].map(c => (
          <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
        <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginLeft: 8 }}>corden — scene editor</span>
      </div>
      {/* Preview content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "110px" }}>
        {/* Left: pixel grid */}
        <div style={{
          position: "relative", borderRight: "1px solid rgba(255,255,255,0.04)",
          background: "#080a0e",
          backgroundImage: "linear-gradient(rgba(71,114,179,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(71,114,179,0.08) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "30%", left: "25%", display: "grid", gridTemplateColumns: "repeat(5,8px)", gap: "2px" }}>
            {["#4772b3","#559BFF","#8E54E9","#4772b3","transparent",
              "#559BFF","#8E54E9","#4772b3","transparent","#559BFF",
              "transparent","#4772b3","#8E54E9","#559BFF","#4772b3"].map((c, i) => (
              <span key={i} style={{ width: 8, height: 8, background: c, borderRadius: "1px", opacity: c === "transparent" ? 0 : 0.85 }} />
            ))}
          </div>
          <span style={{ position: "absolute", bottom: 6, left: 8, fontSize: "0.5rem", color: "rgba(71,114,179,0.7)", fontFamily: "monospace" }}>2D</span>
        </div>
        {/* Right: 3D wireframe */}
        <div style={{ position: "relative", background: "#080a0e", overflow: "hidden" }}>
          <svg viewBox="0 0 100 80" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <g stroke="rgba(85,155,255,0.6)" strokeWidth="1" fill="none">
              <polyline points="30,55 70,55 70,25 30,25 30,55" />
              <polyline points="40,47 80,47 80,17 40,17 40,47" />
              <line x1="30" y1="55" x2="40" y2="47" />
              <line x1="70" y1="55" x2="80" y2="47" />
              <line x1="70" y1="25" x2="80" y2="17" />
              <line x1="30" y1="25" x2="40" y2="17" />
            </g>
          </svg>
          <span style={{ position: "absolute", bottom: 6, right: 8, fontSize: "0.5rem", color: "rgba(85,155,255,0.7)", fontFamily: "monospace" }}>3D</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      {/* Top bar */}
      <header className="auth-shell-header">
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo size={26} />
        </Link>
      </header>

      <div className="auth-shell-body">
        {/* Left branding panel */}
        <motion.aside
          className="auth-brand-panel"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-brand-glow" />
          <div className="auth-brand-content">
            <div className="auth-brand-badge">
              <Sparkles size={12} />
              Corden Studio
            </div>
            <h2 className="auth-brand-title">
              Your drafting workspace,<br />
              <span>in the browser.</span>
            </h2>
            <p className="auth-brand-desc">
              Design in 2D and 3D without installing anything. Projects save locally so you can jump back in anytime.
            </p>

            {/* Product preview mockup */}
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ cursor: "pointer", perspective: 1000, marginTop: "2rem" }}
            >
              <div style={{
                width: "100%", borderRadius: "16px", overflow: "hidden",
                border: "1px solid rgba(71,114,179,0.25)",
                background: "#0a0c12",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                marginBottom: "1rem",
              }}>
                {/* Toolbar strip */}
                <div style={{
                  height: "32px", background: "#0d1018",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", gap: "8px", padding: "0 16px",
                }}>
                  {["#f87171","#fbbf24","#34d399"].map(c => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
                  ))}
                  <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginLeft: 12 }}>corden — scene editor</span>
                </div>
                {/* Preview content */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "180px" }}>
                  {/* Left: pixel grid */}
                  <div style={{
                    position: "relative", borderRight: "1px solid rgba(255,255,255,0.04)",
                    background: "#080a0e",
                    backgroundImage: "linear-gradient(rgba(71,114,179,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(71,114,179,0.08) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,12px)", gap: "2px" }}>
                      {["#4772b3","#559BFF","#8E54E9","#4772b3","transparent",
                        "#559BFF","#8E54E9","#4772b3","transparent","#559BFF",
                        "transparent","#4772b3","#8E54E9","#559BFF","#4772b3"].map((c, i) => (
                        <span key={i} style={{ width: 12, height: 12, background: c, borderRadius: "2px", opacity: c === "transparent" ? 0 : 0.85 }} />
                      ))}
                    </div>
                    <span style={{ position: "absolute", bottom: 8, left: 12, fontSize: "0.6rem", color: "rgba(71,114,179,0.7)", fontFamily: "monospace" }}>2D</span>
                  </div>
                  {/* Right: 3D wireframe */}
                  <div style={{ position: "relative", background: "#080a0e", overflow: "hidden" }}>
                    <svg viewBox="0 0 100 80" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                      <g stroke="rgba(85,155,255,0.6)" strokeWidth="1.5" fill="none">
                        <polyline points="25,60 75,60 75,20 25,20 25,60" />
                        <polyline points="35,50 85,50 85,10 35,10 35,50" />
                        <line x1="25" y1="60" x2="35" y2="50" />
                        <line x1="75" y1="60" x2="85" y2="50" />
                        <line x1="75" y1="20" x2="85" y2="10" />
                        <line x1="25" y1="20" x2="35" y2="10" />
                      </g>
                    </svg>
                    <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: "0.6rem", color: "rgba(85,155,255,0.7)", fontFamily: "monospace" }}>3D</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* Form panel */}
        <motion.main
          className="auth-form-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-card auth-card--modern">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
