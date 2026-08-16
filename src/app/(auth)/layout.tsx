"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Box, Layers, PencilRuler, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const FEATURES = [
  { icon: <PencilRuler size={18} />, title: "2D Pixel Studio", desc: "Draft blueprints and pixel art" },
  { icon: <Box size={18} />, title: "3D Scene Editor", desc: "Model, light, and animate in-browser" },
  { icon: <Layers size={18} />, title: "Saved Projects", desc: "Pick up where you left off" },
];

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
            <ul className="auth-feature-list">
              {FEATURES.map((f) => (
                <li key={f.title} className="auth-feature-item">
                  <div className="auth-feature-icon">{f.icon}</div>
                  <div>
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
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
