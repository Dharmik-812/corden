# Corden-the Atelier — Product Requirements Document

_A browser-based 3D + 2D modeling studio, drafted in a vintage hand_

> Working title: **Corden-the Atelier **. Swap it for whatever you like — the rest of this doc doesn't depend on the name.

---

## 1. Overview

Atelier is a browser-only design studio that merges two worlds on each axis:

- **3D:** Blender's depth of tooling + Spline's ease and shareability
- **2D:** AutoCAD's precision + SmartDraw's approachable diagramming

Wrapped around both is a full account system — signup, email verification, and a membership model with a real (sandboxed) payment flow — so the project demonstrates a complete product, not just a canvas demo.

## 2. Vision & Goals

For a competition build, the goal isn't "replicate four industry tools." It's: **prove the merge concept clearly, in a small number of features executed well, wrapped in a distinct identity.** Judges tend to reward three things — does it work end-to-end, does it feel like _a product_ rather than a tech demo, and is there something technically impressive under the hood. This PRD is structured so each of those has a clear home: Section 5 covers "does it work," Section 4 covers "does it feel like a product," and Sections 5.1/5.2/5.4 each have at least one technically-impressive stretch feature flagged.

## 3. Target Users

- **Primary (for the demo):** competition judges and fellow students — people who'll spend 3–10 minutes with it and need to _get_ the concept fast.
- **Secondary (the fiction you're designing for):** hobbyist makers and small design teams who want one browser tab that covers both "block out a 3D idea" and "draft the 2D plan for it" — think someone designing a piece of furniture: 2D floor-plan sketch, then 3D visualization, in the same project.

## 4. Design Direction: "Drafting Studio" Vintage

Since you're merging CAD-lineage tools (AutoCAD, Blender's technical roots) with an artistic studio feel, **vintage drafting-room** is the natural flavor of "vintage" here — it gives you a built-in reason for every stylistic choice instead of vintage-for-its-own-sake. If you had a different flavor in mind (art deco, retro-terminal/CRT, 70s NASA console), swap the palette below and the rest of the structure still holds — but here's the fully worked-out direction:

**Two modes, one identity:**

- **Vellum (light mode):** aged paper background, sepia ink text, blueprint-blue accents — like a drafting table lit by daylight.
- **Blueprint (dark mode):** deep navy background, white/cyan linework, brass accents — a literal cyanotype blueprint. This isn't a re-skinned dark mode; it's the second half of the same metaphor, and it happens to satisfy the modern "does it have dark mode" expectation for free.

**Palette (starting point, tune to taste):**
| Token | Vellum (light) | Blueprint (dark) |
|---|---|---|
| Background | `#F3EAD3` aged paper | `#122236` cyanotype navy |
| Primary text | `#3B2A1A` sepia ink | `#E7EEF5` chalk white |
| Accent (primary) | `#2C4A6E` drafting blue | `#6FB3E0` cyan linework |
| Accent (secondary) | `#B08D57` brass | `#C9A15E` brass |
| Grid lines | `#D8CBA6` faint sepia | `#2A4A66` faint cyan |

**Typography:**

- Headings / wordmark: a warm serif with character — _Fraunces_ or _Playfair Display_.
- Technical labels, coordinates, dimensions: a monospace with a typewriter feel — _IBM Plex Mono_ or _Courier Prime_.
- Body / UI text: a clean, legible sans (_Inter_ or _Source Sans_) so usability doesn't suffer for the theme — vintage flavor lives in the accents and headings, not in your paragraph text.

**Motifs to actually build:**

- Default 2D canvas background is a faint graph/blueprint grid (not a flat white void).
- Tool icons reference physical drafting instruments: compass for circle tool, T-square for align, triangle ruler for snap-to-angle.
- Membership tier badges rendered as ink-stamp graphics ("PRO" as a rubber stamp, rotated slightly).
- Panel corners get a subtle brass-bracket flourish rather than plain rounded rects.
- Loading/empty states use a "blueprint being drafted" line-drawing animation instead of a generic spinner.
- Optional stretch: soft pencil-scratch / typewriter-click micro-sounds on key actions (toggle-able, off by default).

## 5. Feature Requirements

### 5.1 3D Modeling Module (Blender × Spline)

**Core (MVP):**

- [ ] Viewport with orbit/pan/zoom camera controls
- [ ] Primitive creation: cube, sphere, cylinder, cone, plane
- [ ] Transform gizmo: move / rotate / scale, both drag and numeric input
- [ ] Scene outliner (hierarchy list of objects, click to select)
- [ ] Material panel: base color, roughness/metalness sliders
- [ ] At least one boolean modifier (union/subtract/intersect)
- [ ] Save/load project; export to glTF
- [ ] Keyboard shortcuts matching Blender convention (G/R/S for grab/rotate/scale) — instant recognition for anyone who's touched Blender

**Stretch:**

- [ ] Real-time multiplayer editing (see Section 6 — Yjs-backed)
- [ ] Modifier stack (bevel, array, subdivision surface) rather than one-off booleans
- [ ] Node-based material editor
- [ ] Shareable read-only view link (Spline's signature feature)
- [ ] OBJ / STL export for 3D printing

### 5.2 2D Drafting & Diagramming Module (AutoCAD × SmartDraw)

**Core (MVP):**

- [ ] Shape tools: rectangle, ellipse, line, freehand, text
- [ ] Snap-to-grid and snap-to-object
- [ ] Layers panel (visibility + lock toggles)
- [ ] Connectors/arrows that stay bound to shapes when moved (SmartDraw-style flowcharting)
- [ ] Numeric precision input for line length / angle (AutoCAD-style exactness)
- [ ] Export to SVG and PNG

**Stretch:**

- [ ] DXF/DWG **import** — genuinely impressive to demo, since it's normally a backend round-trip; doing it client-side is a real technical flex
- [ ] Dimension/measurement annotation tool
- [ ] Template library (flowchart, floor plan, org chart starting layouts)
- [ ] A "quick sketch" mode with a looser, hand-drawn line style as a toggleable alternative to precision mode

### 5.3 Accounts & Auth

**Core (MVP):**

- [ ] Email/password signup and login
- [ ] Email verification required before a project can be saved (send via transactional email provider)
- [ ] Password reset flow
- [ ] Basic profile (display name, avatar)

**Stretch:**

- [ ] OAuth login (Google/GitHub) as a faster path in
- [ ] Session management UI (see active sessions, sign out elsewhere)

### 5.4 Membership & Payments

**Core (MVP):**

- [ ] Two tiers: **Free** and **Pro**
- [ ] Pro gates something visibly demo-able — e.g., premium shape/asset library, DXF export, or a higher project-count limit
- [ ] Checkout flow using a real payment provider's **test/sandbox mode** (not a hand-rolled fake form — see Section 6 for why this is actually the stronger choice)
- [ ] Membership status reflected immediately in the account (tier badge, unlocked features)
- [ ] Ability to simulate cancel/downgrade in the demo

**Stretch:**

- [ ] Simulated time-jump to show a subscription renewing or expiring live in the demo (the payment provider's sandbox supports this natively)
- [ ] Usage-based free-tier limits (e.g., 3 saved projects) with an upgrade prompt when hit

### 5.5 Cross-Cutting Features

- [ ] Light/dark ("Vellum"/"Blueprint") theme toggle
- [ ] Responsive layout down to tablet width (full desktop-grade editing isn't realistic on phone, but the marketing/landing pages should work anywhere)
- [ ] Undo/redo
- [ ] Autosave with a visible "last saved" indicator
- Stretch: offline-first editing (Service Worker + IndexedDB) that syncs once back online — reinforces the "runs solely in the browser" pitch

## 6. Technical Architecture

| Layer                    | Choice                                                 | Why                                                                                                                |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Frontend framework       | Next.js (React)                                        | One codebase for pages + API routes; easy deploy                                                                   |
| 3D engine                | Three.js + React Three Fiber                           | Largest ecosystem, WebGPU-ready, integrates cleanly with React state                                               |
| 3D booleans              | `three-bvh-csg`                                        | Fast, purpose-built CSG so you're not writing BSP math by hand                                                     |
| 3D collab (stretch)      | Yjs + a WebSocket provider (self-hosted or Liveblocks) | CRDT sync means concurrent edits merge automatically, no manual conflict handling                                  |
| 2D engine                | Fabric.js                                              | Object-model canvas with strong SVG export — closest fit to precision drafting                                     |
| 2D file import (stretch) | `libredwg-web`                                         | Parses DWG/DXF client-side via WebAssembly, no backend round-trip                                                  |
| Auth + DB + Storage      | Supabase (Postgres)                                    | Bundles all three with a generous free tier; built-in email-verification flow                                      |
| Transactional email      | Resend                                                 | Clean API, free tier covers competition-scale usage                                                                |
| Payments                 | Stripe, **test mode / sandbox**                        | Full real Checkout + Billing + webhooks with simulated cards and no real money — flip one setting to go live later |
| Hosting                  | Vercel (app) + Supabase cloud (data)                   | Minimal ops overhead for a time-boxed build                                                                        |

## 7. Data Model (high level)

- **User** — id, email, verified (bool), display_name, membership_tier
- **Project** — id, owner_id, title, type (`3d` / `2d`), scene_data (JSON, points at Storage for large assets), created_at, updated_at
- **Collaborator** (stretch) — project_id, user_id, role
- **Membership** — user_id, tier, stripe_customer_id, stripe_subscription_id, status, current_period_end
- **Asset** — id, project_id, storage_url, type (texture / model / template)

## 8. Key User Flows

1. **Sign up → verify → first project:** land on marketing page → sign up → verification email arrives (Resend) → click link → choose "New 3D" or "New 2D" project → land in the editor with a blank blueprint-grid canvas.
2. **Upgrade to Pro:** hit a gated feature (e.g., DXF export) → prompt with what Pro unlocks → Stripe Checkout (test mode) → webhook flips `membership_tier` → feature unlocks without a page reload.
3. **Save and return:** autosave fires while editing → close tab → log back in → project list shows thumbnail + "last edited."
4. (Stretch) **Share a view:** generate a public read-only link from a 3D project → recipient can orbit the model without an account.

## 9. Non-Functional Requirements

- Editors should hold 60fps with a moderate scene (a few dozen objects) on a mid-range laptop.
- Target latest Chrome/Edge/Firefox/Safari — WebGPU has broad support now, but keep the WebGL fallback path since it's nearly free with Three.js/Babylon's renderer abstraction.
- No sensitive data (passwords, payment details) ever touches the client-side code directly — auth and payments always go through Supabase/Stripe's hosted flows.

## 10. Roadmap & Scope Phasing

**Phase 0 — Demo-critical (build this first, in this order):**

1. Auth + email verification
2. 2D editor core (shapes, snap, layers, export)
3. 3D editor core (primitives, transform, one boolean, material, export)
4. Stripe test-mode checkout gating one Pro feature
5. Vintage theme applied across all of the above

**Phase 1 — If time allows:**

- Real-time multiplayer (3D and/or 2D)
- DXF import
- Modifier stack / node materials
- Shareable view links
- Template library

**Phase 2 — Post-competition / dream list:**

- OpenCascade.js-based precision CAD kernel
- Sculpting tools
- Plugin/extension system
- Native mobile companion viewer

## 11. Out of Scope (v1)

- Real payment processing (stays in sandbox indefinitely for a student project — no need to go live)
- Full CAD-kernel precision (exact NURBS geometry, STEP file round-tripping) — flagged as Phase 2 for a reason
- Mobile editing (viewing only, if anything)
- Enterprise features: teams/orgs, SSO, granular permissions

## 12. Demo-Day Checklist

- [ ] One pre-built "hero" project in each mode (3D and 2D) ready to open instantly — don't build from a blank canvas live if you can avoid it
- [ ] The Pro-tier upgrade flow rehearsed end-to-end, including the webhook actually firing
- [ ] Both theme modes (Vellum/Blueprint) toggled at least once during the pitch — it's your most visually distinct feature
- [ ] A one-sentence answer ready for "why merge these four tools specifically" — tie it back to Section 2
