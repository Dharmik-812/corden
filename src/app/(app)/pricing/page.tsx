"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const PLANS = [
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
    badge: "Pro",
    badgeClass: "pricing-badge pricing-badge--pro",
    name: "Master Draftsman",
    price: "$12",
    period: "/month",
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

export default function PricingPage() {
  const { user, upgradeToPro } = useAuthStore();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const isPro = user?.membership_tier === "pro";

  const handleUpgrade = () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    setUpgrading(true);
    setTimeout(() => {
      upgradeToPro();
      setUpgrading(false);
      setUpgraded(true);
    }, 1500);
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
          {PLANS.map((plan) => (
            <motion.article
              key={plan.id}
              className={`pricing-card-premium${plan.featured ? " pricing-card-premium--featured" : ""}`}
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
          <div className="pricing-faq-grid">
            {FAQ.map((item) => (
              <div key={item.q} className="pricing-faq-item">
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </div>
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
