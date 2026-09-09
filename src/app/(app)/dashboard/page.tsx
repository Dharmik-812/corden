"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  getAllProjects,
  deleteProject,
  formatRelativeTime,
  isPresetProject,
  type ProjectMeta,
} from "@/lib/project-storage";
import { DASHBOARD_DATA } from "@/data/dashboard";

/* ─── Bespoke Hairline Architectural SVG Icons (Zero Lucide) ─── */
function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 4h10" />
      <path d="M3 8h10" />
      <path d="M3 12h10" />
    </svg>
  );
}

function IconDraft2D({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="3,15 15,15 15,3" />
      <polygon points="6,12 12,12 12,6" strokeDasharray="1 1.5" />
    </svg>
  );
}

function IconSpatial3D({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 2L15.5 5.5V12.5L9 16L2.5 12.5V5.5L9 2Z" />
      <path d="M9 2V16" />
      <path d="M2.5 5.5L9 9L15.5 5.5" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3V13" />
      <path d="M3 8H13" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5V8L10 10" />
    </svg>
  );
}

function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12L12 4" />
      <path d="M6 4H12V10" />
    </svg>
  );
}

function IconMore({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="3" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="13" cy="8" r="1.3" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 4H13.5" />
      <path d="M5.5 4V2.5H10.5V4" />
      <path d="M4 4L4.8 13.5H11.2L12 4" />
      <path d="M7 7V10.5" />
      <path d="M9 7V10.5" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="8,2 10,6 14.5,6.5 11,10 12,14.5 8,12 4,14.5 5,10 1.5,6.5 6,6" />
    </svg>
  );
}

function IconEmptyArchive({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6L5 3H19L21 6V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V6Z" />
      <path d="M3 6H21" />
      <path d="M10 12H14" />
    </svg>
  );
}

/* ─── Architectural Canvas Thumbnails ─── */
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

    ctx.fillStyle = "#0B0D12";
    ctx.fillRect(0, 0, w, h);

    const grid = 18;
    ctx.strokeStyle = "rgba(197, 160, 89, 0.08)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(197, 160, 89, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(24, 22, 130, 88);
    ctx.strokeRect(24, 22, 65, 44);
    ctx.strokeRect(89, 66, 65, 44);
  }, []);

  return <canvas ref={canvasRef} className="project-card-canvas" />;
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
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const size = 32;

    const draw = (t: number) => {
      ctx.fillStyle = "#0B0D12";
      ctx.fillRect(0, 0, w, h);
      const angle = t * 0.007;
      const pts: [number, number, number][] = [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ];
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const proj = ([x, y, z]: [number, number, number]): [number, number] => {
        const x1 = x * c - z * s;
        const z1 = x * s + z * c;
        const f = 3 / (3 + z1 * 0.3);
        return [cx + x1 * size * f, cy + y * size * f];
      };
      const pp = pts.map(proj);
      const edges = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      ctx.strokeStyle = "rgba(243, 244, 246, 0.55)";
      ctx.lineWidth = 1.0;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pp[a][0], pp[a][1]);
        ctx.lineTo(pp[b][0], pp[b][1]);
        ctx.stroke();
      });
    };

    const animate = () => {
      tRef.current += 1;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} className="project-card-canvas" />;
}

/* ─── Project Card Context Menu ─── */
function CardMenu({
  onClose,
  onDelete,
}: {
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="project-card-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="project-card-menu-item project-card-menu-item--danger"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <IconTrash /> {DASHBOARD_DATA.actions.delete}
      </button>
    </motion.div>
  );
}

/* ─── Project Card & Row Component ─── */
function ProjectCard({
  project,
  index,
  view,
  onDelete,
}: {
  project: ProjectMeta;
  index: number;
  view: "grid" | "list";
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const updatedLabel = formatRelativeTime(project.updated_at);
  const badgeClass =
    project.type === "2d" ? "project-card-badge--2d" : "project-card-badge--3d";

  if (view === "list") {
    return (
      <motion.div
        className="project-row"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
      >
        <div className="project-row-icon">
          {project.type === "2d" ? <IconDraft2D /> : <IconSpatial3D />}
        </div>
        <div className="project-row-body">
          <p className="project-card-title">{project.title}</p>
          <p className="project-card-meta">
            <IconClock /> {updatedLabel}
          </p>
        </div>
        <span className={`project-card-badge project-row-badge ${badgeClass}`}>
          {project.isPreset ? "PRESET" : project.type.toUpperCase()}
        </span>
        <div className="project-row-actions">
          {!project.isPreset && (
            <button
              type="button"
              className="project-card-menu-btn"
              title={DASHBOARD_DATA.actions.delete}
              onClick={() => onDelete(project.id)}
            >
              <IconTrash />
            </button>
          )}
          <Link
            href={`/editor/${project.type}/${project.id}`}
            className="project-card-menu-btn"
            title={DASHBOARD_DATA.actions.open}
          >
            <IconArrowUpRight />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <Link
        href={`/editor/${project.type}/${project.id}`}
        className="project-card-thumb"
      >
        {project.type === "2d" ? <Thumbnail2D /> : <Thumbnail3D seed={index} />}
        <div className="project-card-thumb-overlay" />
        <span className={`project-card-badge ${badgeClass}`}>
          {project.isPreset ? "PRESET" : project.type.toUpperCase()}
        </span>
        {project.starred && <IconStar className="project-card-star" />}
        <span className="project-card-open">
          <IconArrowUpRight /> {DASHBOARD_DATA.actions.open}
        </span>
      </Link>
      <div className="project-card-body">
        <div className="project-card-info">
          <p className="project-card-title">{project.title}</p>
          <p className="project-card-meta">
            <IconClock /> {updatedLabel}
          </p>
        </div>
        {!project.isPreset && (
          <div className="project-card-menu-anchor">
            <button
              type="button"
              className={`project-card-menu-btn${menuOpen ? " project-card-menu-btn--open" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              <IconMore />
            </button>
            {menuOpen && (
              <CardMenu
                onClose={() => setMenuOpen(false)}
                onDelete={() => onDelete(project.id)}
              />
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* ─── Main Dashboard Page Component ─── */
export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "2d" | "3d">("all");
  const [projects, setProjects] = useState<ProjectMeta[]>([]);

  useEffect(() => {
    getAllProjects().then(setProjects);
  }, []);

  const handleDelete = (id: string) => {
    if (isPresetProject(id)) return;
    if (!confirm(DASHBOARD_DATA.actions.confirmDelete)) return;
    deleteProject(id).then(() => getAllProjects().then(setProjects));
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.type === filter;
    return matchSearch && matchFilter;
  });

  const twoDCount = projects.filter((p) => p.type === "2d").length;
  const threeDCount = projects.filter((p) => p.type === "3d").length;
  const presetsCount = projects.filter((p) => p.isPreset).length;

  return (
    <div className="page-shell page-shell--dashboard">
      <main className="page-content page-content--dashboard">
        <motion.header
          className="dashboard-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dashboard-hero-text">
            <span className="dashboard-eyebrow">
              <span className="dashboard-eyebrow-dot" />
              {DASHBOARD_DATA.eyebrow}
            </span>
            <h1 className="dashboard-title">{DASHBOARD_DATA.title}</h1>
            <p className="dashboard-desc">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""} · {presetsCount}{" "}
              {DASHBOARD_DATA.subtitleSuffix}
            </p>
          </div>

          <div className="dashboard-stats">
            <button
              type="button"
              className={`dashboard-stat ${filter === "2d" ? "dashboard-stat--active" : ""}`}
              onClick={() => setFilter(filter === "2d" ? "all" : "2d")}
            >
              <span className="dashboard-stat-value">{twoDCount}</span>
              <span className="dashboard-stat-label">
                {DASHBOARD_DATA.stats.twoDLabel}
              </span>
            </button>
            <button
              type="button"
              className={`dashboard-stat ${filter === "3d" ? "dashboard-stat--active" : ""}`}
              onClick={() => setFilter(filter === "3d" ? "all" : "3d")}
            >
              <span className="dashboard-stat-value">{threeDCount}</span>
              <span className="dashboard-stat-label">
                {DASHBOARD_DATA.stats.threeDLabel}
              </span>
            </button>
            <div className="dashboard-stat dashboard-stat--accent">
              <span className="dashboard-stat-value">{presetsCount}</span>
              <span className="dashboard-stat-label">
                {DASHBOARD_DATA.stats.presetsLabel}
              </span>
            </div>
          </div>
        </motion.header>

        <motion.div
          className="dashboard-toolbar"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.35 }}
        >
          <div className="dashboard-search-wrap">
            <IconSearch className="dashboard-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={DASHBOARD_DATA.searchPlaceholder}
              className="dashboard-search-input"
            />
          </div>

          <div className="dashboard-filter-group">
            {DASHBOARD_DATA.filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key as "all" | "2d" | "3d")}
                className={`dashboard-filter-btn${filter === f.key ? " dashboard-filter-btn--active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="dashboard-toolbar-actions">
            <Link
              href="/editor/2d/new"
              className="dashboard-btn-create dashboard-btn-create--2d"
            >
              <IconPlus />
              <span>{DASHBOARD_DATA.createButtons.twoD}</span>
            </Link>
            <Link
              href="/editor/3d/new"
              className="dashboard-btn-create dashboard-btn-create--3d"
            >
              <IconPlus />
              <span>{DASHBOARD_DATA.createButtons.threeD}</span>
            </Link>
          </div>

          <div className="dashboard-view-toggle">
            <button
              type="button"
              aria-label="Grid View"
              onClick={() => setView("grid")}
              className={`dashboard-view-btn${view === "grid" ? " dashboard-view-btn--active" : ""}`}
            >
              <IconGrid />
            </button>
            <button
              type="button"
              aria-label="List View"
              onClick={() => setView("list")}
              className={`dashboard-view-btn${view === "list" ? " dashboard-view-btn--active" : ""}`}
            >
              <IconList />
            </button>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div
            className="project-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <IconEmptyArchive className="project-empty-icon" />
            <p className="project-empty-title">{DASHBOARD_DATA.empty.title}</p>
            <p className="project-empty-desc">{DASHBOARD_DATA.empty.desc}</p>
            <div className="project-empty-actions">
              <Link
                href="/editor/2d/new"
                className="dashboard-btn-create dashboard-btn-create--2d"
              >
                <IconPlus />
                <span>{DASHBOARD_DATA.empty.createTwoD}</span>
              </Link>
              <Link
                href="/editor/3d/new"
                className="dashboard-btn-create dashboard-btn-create--3d"
              >
                <IconPlus />
                <span>{DASHBOARD_DATA.empty.createThreeD}</span>
              </Link>
            </div>
          </motion.div>
        ) : view === "grid" ? (
          <div className="project-grid">
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                view="grid"
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="project-list">
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                view="list"
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
