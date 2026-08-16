"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PencilRuler, Box, Plus, Clock, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

// Mock data for demo
const MOCK_PROJECTS = [
  { id: "proj-1", title: "Modern Chair Concept", type: "3d", updated_at: "2 hours ago" },
  { id: "proj-2", title: "Floor Plan — Unit A", type: "2d", updated_at: "Yesterday" },
  { id: "proj-3", title: "Mechanical Assembly", type: "3d", updated_at: "3 days ago" },
];

/* ─── Animated Thumbnails ─── */
function Thumbnail2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const grid = 20;

    // Background
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw a floor plan silhouette
    ctx.strokeStyle = "rgba(74, 144, 226, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, 120, 80);
    ctx.strokeRect(20, 20, 60, 40);
    ctx.strokeRect(80, 60, 60, 40);
    ctx.strokeStyle = "rgba(74, 144, 226, 0.3)";
    ctx.beginPath(); ctx.moveTo(80, 20); ctx.lineTo(80, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(80, 60); ctx.stroke();

    // Dimension lines
    ctx.strokeStyle = "rgba(142, 84, 233, 0.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(20, 110); ctx.lineTo(140, 110); ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

function Thumbnail3D({ seed = 0 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(seed * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;

    const drawWireframeCube = (t: number) => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      const gs = 20;
      for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const size = 35;
      const angle = t * 0.008;
      
      // 3D cube projection
      const pts3d: [number, number, number][] = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
      ];

      const cos = Math.cos(angle), sin = Math.sin(angle);
      const cosy = Math.cos(angle * 0.7), siny = Math.sin(angle * 0.7);

      const project = ([x, y, z]: [number, number, number]): [number, number] => {
        // Rotate Y
        const x1 = x * cos - z * sin;
        const z1 = x * sin + z * cos;
        // Rotate X
        const y2 = y * cosy - z1 * siny;
        const z2 = y * siny + z1 * cosy;
        const fov = 3;
        const scale = fov / (fov + z2 * 0.3);
        return [cx + x1 * size * scale, cy + y2 * size * scale];
      };

      const projected = pts3d.map(project);
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

      ctx.strokeStyle = "rgba(74, 144, 226, 0.6)";
      ctx.lineWidth = 1.2;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a][0], projected[a][1]);
        ctx.lineTo(projected[b][0], projected[b][1]);
        ctx.stroke();
      });

      // Glow dots at vertices
      projected.forEach(([px, py]) => {
        ctx.fillStyle = "rgba(142, 84, 233, 0.7)";
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      tRef.current += 1;
      drawWireframeCube(tRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 2rem",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: "var(--radius-lg)",
        background: "var(--accent-primary-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Plus size={32} color="var(--accent-primary)" />
      </div>
      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Start your first project
        </h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: "400px", lineHeight: 1.6 }}>
          Open the 2D drafting board for floor plans and schematics, or jump into the 3D editor to sculpt your vision.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/editor/2d/new" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PencilRuler size={16} /> New 2D Draft
        </Link>
        <Link href="/editor/3d/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box size={16} /> New 3D Model
        </Link>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      {/* Dashboard-specific top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem",
        background: "rgba(5,5,5,0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(32px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo size={24} />
          </Link>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Projects
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ThemeToggle />
          <Link href="/editor/2d/new" className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <PencilRuler size={14} /> 2D Draft
          </Link>
          <Link href="/editor/3d/new" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box size={14} /> 3D Model
          </Link>
        </div>
      </div>

      <main style={{ paddingTop: "60px", minHeight: "100vh", background: "var(--bg-primary)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "2.5rem" }}
          >
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
              Your Workspace
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              {MOCK_PROJECTS.length} project{MOCK_PROJECTS.length !== 1 ? "s" : ""} · All recent
            </p>
          </motion.div>

          <motion.div
            className="dashboard-grid"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {MOCK_PROJECTS.length === 0 ? (
              <EmptyState />
            ) : (
              MOCK_PROJECTS.map((project, i) => (
                <motion.div key={project.id} variants={cardVariants}>
                  <Link href={`/editor/${project.type}/${project.id}`} style={{ textDecoration: "none" }}>
                    <div className="project-card">
                      <div className="project-card-thumb">
                        {project.type === "2d" ? <Thumbnail2D /> : <Thumbnail3D seed={i} />}
                        {/* Type badge overlay */}
                        <div style={{
                          position: "absolute", top: "0.75rem", left: "0.75rem",
                          padding: "3px 10px", borderRadius: "9999px",
                          background: "rgba(5,5,5,0.7)", backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "0.7rem", fontFamily: "var(--font-mono)",
                          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                          color: project.type === "2d" ? "var(--accent-brass)" : "var(--accent-primary)",
                        }}>
                          {project.type}
                        </div>
                        {/* Hover arrow */}
                        <div style={{
                          position: "absolute", bottom: "0.75rem", right: "0.75rem",
                          width: 32, height: 32, borderRadius: "50%",
                          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <ArrowRight size={14} color="var(--text-secondary)" />
                        </div>
                      </div>
                      <div className="project-card-body">
                        <h3 className="project-card-title">{project.title}</h3>
                        <div className="project-card-meta" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={11} />
                          <span>{project.updated_at}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
