"use client";

import { motion } from "framer-motion";

export function Logo({ className = "", size = 32 }: { className?: string, size?: number }) {
  return (
    <motion.div 
      className={`flex items-center font-semibold tracking-tight text-primary ${className}`} 
      style={{ gap: '12px' }}
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
          animate: { rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
          hover: { rotate: 180, scale: 1.15, transition: { type: "spring", stiffness: 260, damping: 20 } }
        }}
      >
        {/* Isometric Cube / Drafting Lines */}
        <motion.path
          d="M50 15L85 35L85 75L50 95L15 75L15 35L50 15Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            animate: { pathLength: 1, transition: { duration: 1.5, ease: "easeInOut" } },
            hover: { stroke: "var(--accent-primary)", filter: "drop-shadow(0 0 8px rgba(74, 144, 226, 0.6))" }
          }}
        />
        <motion.path
          d="M15 35L50 55L85 35"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            animate: { pathLength: 1, transition: { duration: 1, delay: 0.5, ease: "easeInOut" } },
            hover: { stroke: "var(--accent-brass)", filter: "drop-shadow(0 0 8px rgba(142, 84, 233, 0.6))" }
          }}
        />
        <motion.path
          d="M50 55L50 95"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          variants={{
            initial: { pathLength: 0 },
            animate: { pathLength: 1, transition: { duration: 0.8, delay: 1, ease: "easeInOut" } },
            hover: { stroke: "var(--accent-brass)", filter: "drop-shadow(0 0 8px rgba(142, 84, 233, 0.6))" }
          }}
        />
        {/* Glowing Center Node */}
        <motion.circle
          cx="50"
          cy="55"
          r="8"
          fill="var(--accent-primary)"
          variants={{
            initial: { scale: 0 },
            animate: { 
              scale: [1, 1.25, 1], 
              opacity: [1, 0.7, 1],
              transition: { delay: 1.5, duration: 2.5, repeat: Infinity, ease: "easeInOut" } 
            },
            hover: { scale: 1.5, fill: "#fff", transition: { type: "spring", stiffness: 300 } }
          }}
        />
      </motion.svg>
      <motion.span 
        style={{ fontSize: size * 0.6, letterSpacing: '-0.03em' }}
        variants={{
          hover: { color: "#fff", textShadow: "0 0 12px rgba(255,255,255,0.4)" }
        }}
      >
        corden
      </motion.span>
    </motion.div>
  );
}
