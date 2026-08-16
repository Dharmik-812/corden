"use client";

import { motion } from "framer-motion";

export function Logo({ className = "", size = 32 }: { className?: string, size?: number }) {
  return (
    <div className={`flex items-center gap-sm font-semibold tracking-tight text-primary ${className}`} style={{ gap: '12px' }}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Isometric Cube / Drafting Lines */}
        <motion.path
          d="M50 15L85 35L85 75L50 95L15 75L15 35L50 15Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M15 35L50 55L85 35"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M50 55L50 95"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
        />
        {/* Glowing Center Node */}
        <motion.circle
          cx="50"
          cy="55"
          r="8"
          fill="var(--accent-primary)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 1.5 }}
        />
      </motion.svg>
      <span style={{ fontSize: size * 0.6, letterSpacing: '-0.03em' }}>corden</span>
    </div>
  );
}
