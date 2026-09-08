"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Star } from "lucide-react";

const getPlans = (billing: "monthly" | "annual") => [
  {
    id: "free",
    badge: "Free",
    badgeClass: "pricing-badge pricing-badge--free",
    name: "Apprentice",
    price: "$0",
    period: "forever",
    desc: "Everything you need to explore 2D and 3D drafting.",
    features: [
      "Unlimited 2D pixel drafts",
      "Core 3D primitives & lighting",
      "PNG export",
      "Local project saves",
      "2 starter presets",
    ],
    cta: "Open Dashboard",
    href: "/dashboard",
    featured: false,
  },
  {
    id: "pro",
    badge: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <Star size={12} fill="currentColor" /> Most Popular
      </span>
    ),
    badgeClass: "pricing-badge pricing-badge--pro",
    name: "Master Draftsman",
    price: billing === "monthly" ? "$12" : "$9",
    period: billing === "monthly" ? "/month" : "/mo, billed annually",
    desc: "For makers who ship professional work from the browser.",
    features: [
      "Everything in Apprentice",
      "High-res glTF export",
      "Advanced modifier stack",
      "DXF / DWG export (soon)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
];

const FAQ = [
  { q: "Can I use Corden without signing up?", a: "Yes — open the dashboard and start with presets. Sign up to keep your profile across sessions." },
  { q: "Where are projects saved?", a: "Locally in your browser for now. Your work persists until you clear site data." },
  { q: "Can I cancel Pro anytime?", a: "This is a demo checkout — upgrading activates Pro instantly with no payment." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: "14px",
      background: "rgba(255,255,255,0.02)",
      border: open ? "1px solid rgba(71,114,179,0.3)" : "1px solid rgba(255,255,255,0.07)",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          cursor: "pointer", padding: "1.125rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", flexShrink: 0, color: "rgba(255,255,255,0.4)" }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              margin: 0, padding: "0 1.5rem 1.125rem",
              fontSize: "0.8125rem", color: "rgba(255,255,255,0.58)", lineHeight: 1.65,
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const { user, upgradeToPro } = useAuthStore();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const isPro = user?.membership_tier === "pro";

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    setUpgrading(true);
    await new Promise((r) => setTimeout(r, 1500));
    await upgradeToPro();
    setUpgrading(false);
    setUpgraded(true);
  };

  return (
    <div className="page-shell page-shell--pricing">
      <div className="page-mesh" aria-hidden />

      <main className="page-content">
        <motion.header
          className="page-hero page-hero--centered"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="page-eyebrow">
            <Sparkles size={14} />
            Simple pricing
          </span>
          <h1 className="page-title">
            Start free.<br />
            <span className="page-title-gradient">Scale when you&apos;re ready.</span>
          </h1>
          <p className="page-desc">
            No install, no lock-in. Draft in 2D and 3D from any modern browser.
          </p>

          {/* Billing toggle placeholder */}
          <div style={{
            display: "inline-flex", marginTop: "1.5rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "999px", padding: "4px", gap: "2px",
          }}>
            {(["monthly", "annual"] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: "7px 20px", borderRadius: "999px", border: "none", cursor: "pointer",
                  fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.03em",
                  transition: "all 0.2s",
                  background: billing === b ? "rgba(71,114,179,0.25)" : "transparent",
                  color: billing === b ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: billing === b ? "inset 0 0 0 1px rgba(71,114,179,0.4)" : "none",
                }}
              >
                {b.charAt(0).toUpperCase() + b.slice(1)}
                {b === "annual" && <span style={{ marginLeft: 6, fontSize: "0.65rem", color: "#34d399", fontWeight: 700 }}>–20%</span>}
              </button>
            ))}
          </div>
        </motion.header>

        <motion.div
          className="pricing-grid-premium"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          {getPlans(billing).map((plan) => (
            <motion.article
              key={plan.id}
              className={`pricing-card-premium${plan.featured ? " pricing-card-premium--featured" : ""}`}
              style={plan.featured ? { transform: "scale(1.025)", transformOrigin: "bottom center" } : undefined}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
              }}
            >
              {plan.featured && <div className="pricing-card-shine" aria-hidden />}
              <div className={plan.badgeClass}>{plan.badge}</div>

              <div className="pricing-card-head">
                {plan.featured ? <Crown size={22} className="pricing-icon" /> : <Zap size={22} className="pricing-icon" />}
                <h2>{plan.name}</h2>
                <p>{plan.desc}</p>
              </div>

              <div className="pricing-card-price">
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>

              <ul className="pricing-features-premium">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link href={plan.href!} className="pricing-btn pricing-btn--outline">
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              ) : isPro || upgraded ? (
                <button className="pricing-btn pricing-btn--success" disabled>
                  <Check size={16} />
                  Pro activated
                </button>
              ) : (
                <button
                  className="pricing-btn pricing-btn--primary"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <>
                      <Loader2 size={16} className="auth-spinner" />
                      Processing…
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </motion.article>
          ))}
        </motion.div>

        <motion.section
          className="pricing-faq"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <h3>Frequently asked</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </motion.section>

        <motion.div
          className="pricing-trust-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {[
            "No credit card for free tier",
            "Cancel Pro anytime",
            "Works offline in browser",
          ].map((text) => (
            <span key={text} className="pricing-trust-item">
              <Check size={16} />
              {text}
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
