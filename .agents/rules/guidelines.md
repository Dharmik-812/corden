# AI Agent Guidelines & Architecture Rules

These rules apply to all AI agents, subagents, and developers contributing to the codebase.

---

## 🚫 STRICTLY BANNED "VIBE-CODED" & AI-TEMPLATE TROPES (ZERO TOLERANCE)

All AI agents MUST NEVER generate or use any of the following cliché design elements:

1. **NO Harsh Gradients or Rainbow Coloring**: No neon gradients, no multi-color text gradients, no purple-to-blue gradients.
2. **NO Lucide Icons or Sparkle Icons (✨)**: Do not use Lucide icon packages or decorative sparkle emojis.
3. **NO Pure White (#FFFFFF) Backgrounds**: Canvas must be dark, understated matte tone (`#0B0D12`).
4. **NO Drop Shadows**: No heavy fuzzy box shadows (`shadow-2xl`, `shadow-xl`, `shadow-brass/25`). Keep borders flat and hairline crisp (`border-subtle`).
5. **NO 3 Feature Cards in a Row**: Do not build generic 3-column card rows.
6. **NO Emojis or Checkmark Bullets**: No checkmark icons, no emoji bullet points.
7. **NO Liquid Glass / Glassmorphism**: No heavy `backdrop-blur` frosted glass effects (`backdrop-blur-md`, `bg-white/10`).
8. **NO Em Dashes (—)**: Do not use em dashes in typography or copy.
9. **NO Inter, Geist, or Space Grotesk Fonts**: Do not use generic AI template fonts. Use ONLY **Syne / Bebas Neue** (tall display), **Cormorant Garamond** (stately serif), and **Plus Jakarta Sans** (body text).
10. **NO Colored Left Stripe**: No left-border accent lines (`border-l-4 border-brass`).
11. **NO Fake Testimonials or Skeleton Loaders**: No dummy avatar reviews or pulsating placeholder loading skeletons.
12. **NO Bento Grids or Terminal Windows**: No bento-box grid layouts or fake CLI terminal mockups.
13. **NO "It's Not X, It's Y" Copy Tropes**: Do not use formulaic AI contrast copy.
14. **NO 3 Pricing Tiers**: Do not build 3-card pricing tables (Basic / Pro / Enterprise).
15. **NO Soft Corner Radius**: No bubbly rounded corners (`rounded-2xl`, `rounded-3xl`, `rounded-full`). Use crisp sharp or minimal 2px corners (`rounded-none` or `rounded-sm`).
16. **NO Purple & Black, Neon, or Pastel Colors**: No cyan, neon green, neon purple, bright pink, or basic pastel colors.
17. **NO Radial Orbs or Dot Grids**: No blurred radial background glows, glow orbs, or dot grid SVG patterns.
18. **NO Animated Bouncing Arrows or Hover Bounces**: No pulsing dots, bouncing arrows, or hover scale transformations (`hover:scale-[1.02]`).

---

## 1. Core Architecture & Tech Stack Rules
- **TypeScript Strict Mode**: All files must use strict TypeScript. Define explicit interfaces or types for all props and state.
- **No Inline Styles**: Never use `style={{ ... }}` or raw hex codes in JSX/TSX. Use predefined CSS classes, Tailwind classes, or CSS variables.
- **JSON-Driven Architecture & Modularity**: NEVER hardcode copy, text arrays, or duplicate repetitive JSX blocks in section components. All section content must be extracted into structured JSON files under `src/data/`. Components MUST import JSON data and map over it using modular, reusable sub-components for clean readability and DRY code.

---

## 2. Branding & Messaging Rules (Outcome-Driven Copy)
- **Outcome-Driven Copy ONLY**: Always express services in terms of commercial outcomes and business results.
- **Premium Positioning**: Targets high-budget brands. Tone must be authoritative, stately, and confident.
- **Global / India Narrative**: Highlight the Made in India for the World vision, bringing global playbooks to empower top founders.

---

## 3. Design System & Aesthetic Rules
- **Typography Restrictions**:
  - Display / Headlines: MUST use `.font-tall` (Syne, Bebas Neue).
  - Editorial Accents: MUST use `.font-serif-stately` (Cormorant Garamond).
  - Body Copy: MUST use `.font-body` (Plus Jakarta Sans).
- **Color Restrictions**:
  - `var(--color-midnight)` → `#0B0D12`
  - `var(--color-charcoal)` → `#12151E`
  - `var(--color-brass-muted)` → `#C5A059`
  - `var(--color-crimson-muted)` → `#8B1E2D`
  - `var(--color-indigo-muted)` → `#1B233D`
  - `var(--color-border-subtle)` → `rgba(255, 255, 255, 0.08)`
  - Text: `#F3F4F6` (Primary) & `#9CA3AF` (Muted).
