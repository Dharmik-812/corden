"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PencilRuler, Box, Plus, Clock, ArrowUpRight, Search,
  Grid3X3, LayoutList, Star, MoreHorizontal, Trash2,
  Sparkles, FolderOpen,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getAllProjects,
  deleteProject,
  formatRelativeTime,
  isPresetProject,
  type ProjectMeta,
} from "@/lib/project-storage";

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
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    ctx.fillStyle = "#0a0d12"; ctx.fillRect(0, 0, w, h);
    const grid = 18;
    ctx.strokeStyle = "rgba(71,114,179,0.1)"; ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(71,144,226,0.7)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(24, 22, 130, 88);
    ctx.strokeRect(24, 22, 65, 44);
    ctx.strokeRect(89, 66, 65, 44);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

function Thumbnail3D({ seed = 0 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(seed * 80);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    const cx = w / 2, cy = h / 2, size = 32;
    const draw = (t: number) => {
      ctx.fillStyle = "#0a0d12"; ctx.fillRect(0, 0, w, h);
      const angle = t * 0.007;
      const pts: [number, number, number][] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      const c = Math.cos(angle), s = Math.sin(angle);
      const proj = ([x, y, z]: [number, number, number]): [number, number] => {
        const x1 = x * c - z * s, z1 = x * s + z * c;
        const f = 3 / (3 + z1 * 0.3);
        return [cx + x1 * size * f, cy + y * size * f];
      };
      const pp = pts.map(proj);
      const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      ctx.strokeStyle = "rgba(71,144,226,0.65)"; ctx.lineWidth = 1.2;
      edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(pp[a][0], pp[a][1]); ctx.lineTo(pp[b][0], pp[b][1]); ctx.stroke(); });
    };
    const animate = () => { tRef.current += 1; draw(tRef.current); rafRef.current = requestAnimationFrame(animate); };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

function CardMenu({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="project-card-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" className="project-card-menu-item project-card-menu-item--danger" onClick={() => { onDelete(); onClose(); }}>
        <Trash2 size={13} /> Delete
      </button>
    </motion.div>
  );
}

function ProjectCard({
  project, index, view, onDelete,
}: {
  project: ProjectMeta; index: number; view: "grid" | "list"; onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const updatedLabel = formatRelativeTime(project.updated_at);
  const badgeClass = project.type === "2d" ? "project-card-badge--2d" : "project-card-badge--3d";

  if (view === "list") {
    return (
      <motion.div
        className="project-row"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className={`project-card-new-icon project-card-new-icon--${project.type}`} style={{ width: 40, height: 40 }}>
          {project.type === "2d" ? <PencilRuler size={16} /> : <Box size={16} />}
        </div>
        <div style={{ flex: 1 }}>
          <p className="project-card-title">{project.title}</p>
          <p className="project-card-meta"><Clock size={10} /> {updatedLabel}</p>
        </div>
        <span className={`project-card-badge ${badgeClass}`} style={{ position: "static" }}>{project.type}</span>
        <Link href={`/editor/${project.type}/${project.id}`} className="project-card-menu-btn">
          <ArrowUpRight size={14} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.015 }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <Link href={`/editor/${project.type}/${project.id}`} className="project-card-thumb">
        {project.type === "2d" ? <Thumbnail2D /> : <Thumbnail3D seed={index} />}
        <div className="project-card-thumb-overlay" />
        <span className={`project-card-badge ${badgeClass}`}>
          {project.isPreset ? "preset" : project.type}
        </span>
        {project.starred && <Star size={14} fill="#f59e0b" className="project-card-star" />}
        <span className="project-card-open"><ArrowUpRight size={12} /> Open</span>
      </Link>
      <div className="project-card-body">
        <div>
          <p className="project-card-title">{project.title}</p>
          <p className="project-card-meta"><Clock size={10} /> {updatedLabel}</p>
        </div>
        {!project.isPreset && (
          <div style={{ position: "relative" }}>
            <div className="project-card-hover-actions">
              <button className="project-card-menu-btn" title="Delete" onClick={(e) => { e.preventDefault(); onDelete(project.id); }}>
                <Trash2 size={13} color="#f87171" />
              </button>
            </div>
            <button
              type="button"
              className={`project-card-menu-btn${menuOpen ? " project-card-menu-btn--open" : ""}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && <CardMenu onClose={() => setMenuOpen(false)} onDelete={() => onDelete(project.id)} />}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function NewProjectCard({ type }: { type: "2d" | "3d" }) {
  return (
    <Link href={`/editor/${type}/new`} className={`project-card-new project-card-new--${type}`}>
      <div className={`project-card-new-icon project-card-new-icon--${type}`}>
        <Plus size={20} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p className="project-card-new-title">New {type === "2d" ? "2D Draft" : "3D Model"}</p>
        <p className="project-card-new-desc">
          {type === "2d" ? "Pixel art & blueprints" : "3D scene & modeling"}
        </p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "2d" | "3d">("all");
  const [projects, setProjects] = useState<ProjectMeta[]>([]);

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const handleDelete = (id: string) => {
    if (isPresetProject(id)) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    deleteProject(id);
    setProjects(getAllProjects());
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-shell page-shell--dashboard dashboard-hero-bg">
      <div className="page-mesh" aria-hidden />

      <main className="page-content page-content--dashboard">
        <motion.header
          className="dashboard-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dashboard-hero-text">
            <span className="page-eyebrow"><Sparkles size={14} /> Workspace</span>
            <h1 className="page-title page-title--compact">Your projects</h1>
            <p className="page-desc page-desc--compact">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""} · 2 presets + saved work
            </p>
          </div>
          <div className="dashboard-stats">
            <div
              className={`dashboard-stat ${filter === "2d" ? "dashboard-stat--active" : ""}`}
              onClick={() => setFilter(filter === "2d" ? "all" : "2d")}
            >
              <span className="dashboard-stat-value">{projects.filter((p) => p.type === "2d").length}</span>
              <span className="dashboard-stat-label">2D</span>
            </div>
            <div
              className={`dashboard-stat ${filter === "3d" ? "dashboard-stat--active" : ""}`}
              onClick={() => setFilter(filter === "3d" ? "all" : "3d")}
            >
              <span className="dashboard-stat-value">{projects.filter((p) => p.type === "3d").length}</span>
              <span className="dashboard-stat-label">3D</span>
            </div>
            <div
              className="dashboard-stat dashboard-stat--accent"
              style={{ cursor: "default" }}
            >
              <span className="dashboard-stat-value">{projects.filter((p) => p.isPreset).length}</span>
              <span className="dashboard-stat-label">Presets</span>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="dashboard-toolbar glass-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          whileHover={{ boxShadow: "0 12px 24px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.12)" }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 360 }}>
            <Search size={14} className="dashboard-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="dashboard-search-input"
            />
          </div>
          <div className="dashboard-filter-group">
            {(["all", "2d", "3d"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`dashboard-filter-btn${filter === f ? " dashboard-filter-btn--active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="dashboard-view-toggle">
            {([["grid", <Grid3X3 key="g" size={14} />], ["list", <LayoutList key="l" size={14} />]] as const).map(([v, icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v as "grid" | "list")}
                className={`dashboard-view-btn${view === v ? " dashboard-view-btn--active" : ""}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div className="project-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FolderOpen size={40} className="project-empty-icon" />
            <p className="project-empty-title">No projects found</p>
            <p className="project-empty-desc">Try a different search or create a new draft.</p>
          </motion.div>
        ) : view === "grid" ? (
          <div className="project-grid">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} view="grid" onDelete={handleDelete} />
            ))}
            <NewProjectCard type="2d" />
            <NewProjectCard type="3d" />
          </div>
        ) : (
          <div className="project-list">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} view="list" onDelete={handleDelete} />
            ))}
          </div>
        )}


      </main>
    </div>
  );
}
