"use client";

import { motion } from "framer-motion";

export function Logo({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={`flex items-center font-semibold tracking-tight ${className}`}
      style={{
        gap: "10px",
        color: "#F3F4F6",
        cursor: "pointer",
        userSelect: "none",
      }}
      whileHover="hover"
      initial="initial"
      animate="animate"
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={{
          initial: { rotate: -90, opacity: 0 },
          animate: {
            rotate: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 },
          },
          hover: {
            rotate: 180,
            scale: 1.12,
            transition: { type: "spring", stiffness: 260, damping: 20 },
          },
        }}
      >
        {/* Isometric Cube / Drafting Lines */}
        <motion.path
          d="M50 15L85 35L85 75L50 95L15 75L15 35L50 15Z"
          stroke="rgba(243, 244, 246, 0.9)"
          strokeWidth="6"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            animate: {
              pathLength: 1,
              transition: { duration: 1.5, ease: "easeInOut" },
            },
            hover: {
              stroke: "#C5A059",
              filter: "drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))",
            },
          }}
        />
        <motion.path
          d="M15 35L50 55L85 35"
          stroke="rgba(243, 244, 246, 0.9)"
          strokeWidth="6"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            animate: {
              pathLength: 1,
              transition: { duration: 1, delay: 0.5, ease: "easeInOut" },
            },
            hover: {
              stroke: "#C5A059",
              filter: "drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))",
            },
          }}
        />
        <motion.path
          d="M50 55L50 95"
          stroke="rgba(243, 244, 246, 0.9)"
          strokeWidth="6"
          strokeLinecap="round"
          variants={{
            initial: { pathLength: 0 },
            animate: {
              pathLength: 1,
              transition: { duration: 0.8, delay: 1, ease: "easeInOut" },
            },
            hover: {
              stroke: "#C5A059",
              filter: "drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))",
            },
          }}
        />
        {/* Glowing Center Node (Warm Brass matching project theme) */}
        <motion.circle
          cx="50"
          cy="55"
          r="8"
          fill="#C5A059"
          variants={{
            initial: { scale: 0 },
            animate: {
              scale: [1, 1.25, 1],
              opacity: [1, 0.8, 1],
              transition: {
                delay: 1.5,
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            },
            hover: {
              scale: 1.4,
              fill: "#FFFFFF",
              transition: { type: "spring", stiffness: 300 },
            },
          }}
        />
      </motion.svg>
      <motion.span
        style={{
          fontSize: size * 0.65,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          color: "#F3F4F6",
          fontFamily: "var(--font-tall), 'Syne', sans-serif",
          lineHeight: 1,
        }}
        variants={{
          hover: {
            color: "#FFFFFF",
            textShadow: "0 0 12px rgba(197, 160, 89, 0.35)",
          },
        }}
      >
        corden
      </motion.span>
    </motion.div>
  );
}
