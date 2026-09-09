"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { AUTH_DATA } from "@/data/auth";
import Script from "next/script";
import { useEffect, useRef } from "react";

/* ─── Vanta.js TOPOLOGY Background ─── */
function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vantaEffect: any = null;
    const initVanta = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!vantaEffect && (window as any).VANTA && (window as any).VANTA.TOPOLOGY) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vantaEffect = (window as any).VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xc5a059, // Brass
          backgroundColor: 0x0b0d12 // Midnight
        });
      }
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).VANTA && (window as any).VANTA.TOPOLOGY) {
      initVanta();
    } else {
      const interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).VANTA && (window as any).VANTA.TOPOLOGY) {
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
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js" strategy="lazyOnload" />
      <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
    </>
  );
}

/** Clean geometric drafting preview built with semantic CSS tokens */
function ProductPreview() {
  const pixelClasses = [
    "auth-preview-pixel--brass",
    "auth-preview-pixel--bright",
    "auth-preview-pixel--muted",
    "auth-preview-pixel--brass",
    "auth-preview-pixel--ghost",
    "auth-preview-pixel--bright",
    "auth-preview-pixel--brass",
    "auth-preview-pixel--muted",
    "auth-preview-pixel--ghost",
    "auth-preview-pixel--bright",
    "auth-preview-pixel--ghost",
    "auth-preview-pixel--brass",
    "auth-preview-pixel--muted",
    "auth-preview-pixel--bright",
    "auth-preview-pixel--brass",
  ];

  return (
    <div className="auth-preview-box">
      {/* Precision Header Strip */}
      <div className="auth-preview-header">
        <div className="auth-preview-dots">
          <span className="auth-preview-dot auth-preview-dot--active" />
          <span className="auth-preview-dot" />
          <span className="auth-preview-dot" />
        </div>
        <span className="auth-preview-title">{AUTH_DATA.previewTitle}</span>
      </div>

      {/* Preview Viewports */}
      <div className="auth-preview-split">
        {/* 2D Drafting Grid */}
        <div className="auth-preview-left">
          <div className="auth-preview-grid">
            {pixelClasses.map((cls, i) => (
              <span key={i} className={`auth-preview-pixel ${cls}`} />
            ))}
          </div>
          <span className="auth-preview-tag auth-preview-tag--left">2D</span>
        </div>

        {/* 3D Spatial Wireframe */}
        <div className="auth-preview-right">
          <svg viewBox="0 0 100 80" className="auth-preview-svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#C5A059" strokeWidth="1.2" fill="none" opacity="0.8">
              <polyline points="25,60 75,60 75,20 25,20 25,60" />
              <polyline points="35,50 85,50 85,10 35,10 35,50" opacity="0.5" />
              <line x1="25" y1="60" x2="35" y2="50" opacity="0.6" />
              <line x1="75" y1="60" x2="85" y2="50" opacity="0.6" />
              <line x1="75" y1="20" x2="85" y2="10" opacity="0.6" />
              <line x1="25" y1="20" x2="35" y2="10" opacity="0.6" />
            </g>
          </svg>
          <span className="auth-preview-tag auth-preview-tag--right">3D</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell" style={{ position: "relative", background: "transparent" }}>
      <VantaBackground />
      {/* Header bar */}
      <header className="auth-shell-header" style={{ position: "relative", zIndex: 10 }}>
        <Link href="/" className="auth-back-link">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{AUTH_DATA.backToHome}</span>
        </Link>
        <Link href="/" className="auth-logo-link">
          <Logo size={26} />
        </Link>
      </header>

      <div className="auth-shell-body" style={{ position: "relative", zIndex: 10 }}>
        {/* Left Branding Panel */}
        <motion.aside
          className="auth-brand-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-brand-content">
            <div className="auth-brand-badge">
              <span className="auth-brand-badge-dot" />
              <span>{AUTH_DATA.badge}</span>
            </div>

            <h2 className="auth-brand-title">
              {AUTH_DATA.title}
              <br />
              <span>{AUTH_DATA.titleHighlight}</span>
            </h2>

            <p className="auth-brand-desc">
              {AUTH_DATA.desc}
            </p>

            {/* Architectural Product Preview */}
            <ProductPreview />

            {/* Modular Features List */}
            <div className="auth-features-list">
              {AUTH_DATA.features.map((feature, idx) => (
                <div key={feature.title} className="auth-feature-row">
                  <span className="auth-feature-index">0{idx + 1}</span>
                  <div className="auth-feature-content">
                    <span className="auth-feature-name">{feature.title}</span>
                    <span className="auth-feature-text">{feature.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Right Form Panel */}
        <motion.main
          className="auth-form-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-card auth-card--modern">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
