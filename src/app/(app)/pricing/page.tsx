"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PricingPage() {
  const { user, upgradeToPro } = useAuthStore();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const handleUpgrade = () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    setUpgrading(true);
    // Simulate a short checkout delay
    setTimeout(() => {
      upgradeToPro();
      setUpgrading(false);
      setUpgraded(true);
    }, 1500);
  };

  const isPro = user?.membership_tier === "pro";

  return (
    <main className="dashboard">
      <div className="dashboard-header text-center flex-col" style={{ alignItems: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Plans & Pricing</h1>
        <p className="hero-subtitle" style={{ marginBottom: 0 }}>Choose the plan that fits your drafting needs.</p>
      </div>

      <motion.div 
        className="pricing-grid"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Free Tier */}
        <motion.div className="pricing-card" variants={cardVariants}>
          <div className="badge badge-free" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>Free</div>
          <h3 className="font-serif">Apprentice</h3>
          <div className="pricing-price">$0<span>/mo</span></div>
          <p className="text-secondary text-sm">Perfect for hobbyists and students.</p>

          <ul className="pricing-features">
            <li>Unlimited 2D drafts</li>
            <li>Basic 3D primitives</li>
            <li>Standard web export (SVG/PNG)</li>
            <li>Community support</li>
          </ul>

          <button className="btn btn-outline w-full" onClick={() => router.push('/dashboard')}>
            {isPro ? "Downgrade" : "Current Plan"}
          </button>
        </motion.div>

        {/* Pro Tier */}
        <motion.div className="pricing-card featured" variants={cardVariants}>
          <div className="badge badge-pro" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>Pro</div>
          <h3 className="font-serif">Master Draftsman</h3>
          <div className="pricing-price">$12<span>/mo</span></div>
          <p className="text-secondary text-sm">For professional makers and studios.</p>

          <ul className="pricing-features">
            <li>Everything in Apprentice</li>
            <li>DXF/DWG Export (Soon)</li>
            <li>Advanced boolean modifier stack</li>
            <li>High-res glTF export</li>
            <li>Priority email support</li>
          </ul>

          {isPro || upgraded ? (
            <button className="btn btn-brass w-full" disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={16} /> Pro Activated
            </button>
          ) : (
            <button
              className="btn btn-brass w-full"
              onClick={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? "Processing..." : "Upgrade to Pro"}
            </button>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
