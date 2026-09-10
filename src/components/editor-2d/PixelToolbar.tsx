"use client";

import { usePixelEditorStore, PixelTool, CanvasSize } from "@/stores/pixelEditor-store";
import {
  Pencil, Eraser, PaintBucket, Pipette, Grid3X3, Trash2, Download,
  ZoomIn, ZoomOut, Undo2, Redo2, Save, Minus, Square, SplitSquareHorizontal,
  ChevronDown, ImagePlus, Circle, Triangle, Shapes, SquareDashed, Move,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ImageImportModal } from "./ImageImportModal";
import styles from "./pixel-toolbar.module.css";

const CANVAS_SIZES: CanvasSize[] = [8, 16, 32, 48, 64, 128];

/* ─── Portal Dropdown ─────────────────────────────────────────────── */
function PortalDropdown({
  anchorRef,
  children,
  minWidth = 160,
  alignBottom = false,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  minWidth?: number;
  alignBottom?: boolean;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top: alignBottom ? r.bottom - minWidth * 1.4 : r.top,
        left: r.right + 8,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, alignBottom, minWidth]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        background: "rgba(10,11,16,0.97)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        minWidth: `${minWidth}px`,
        boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

const dropdownTitleStyle: React.CSSProperties = {
  fontSize: "0.6rem",
  color: "rgba(255,255,255,0.3)",
  fontFamily: "var(--font-mono)",
  padding: "4px 8px 6px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  marginBottom: "2px",
};

function DropdownItem({
  label, icon, active, onClick, subLabel,
}: {
  label: string; icon?: React.ReactNode; active?: boolean;
  onClick: () => void; subLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: subLabel ? "7px 10px" : "8px 12px",
        borderRadius: "9px", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "8px",
        background: active ? "rgba(74,144,226,0.15)" : "transparent",
        color: active ? "var(--accent-primary)" : "rgba(255,255,255,0.82)",
        fontFamily: "var(--font-mono)", fontSize: "0.78rem",
        transition: "background 0.12s",
        textAlign: "left", flexDirection: subLabel ? "column" : "row",
        width: "100%",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {subLabel ? (
        <>
          <span style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.75rem", fontWeight: 600 }}>{label}</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.62rem" }}>{subLabel}</span>
        </>
      ) : (
        <>{icon && <span style={{ opacity: 0.7 }}>{icon}</span>}{label}</>
      )}
    </button>
  );
}

/* ─── Tool Button ─────────────────────────────────────────────────── */
interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

function ToolButton({ icon, label, shortcut, active, danger, onClick }: ToolButtonProps) {
  const [hov, setHov] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });

  const updateTip = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setTipPos({ top: r.top + r.height / 2, left: r.right + 14 });
  }, []);

  useEffect(() => {
    if (hov) updateTip();
  }, [hov, updateTip]);

  return (
    <div ref={btnRef} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => { setHov(true); updateTip(); }}
        onMouseLeave={() => setHov(false)}
        className={styles.toolBtn}
        style={{
          background: active
            ? "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)"
            : hov ? "rgba(255,255,255,0.08)" : "transparent",
          color: active ? "#fff" : danger && hov ? "#ff6b6b" : "var(--text-secondary)",
          boxShadow: active ? "0 4px 16px rgba(74,144,226,0.4)" : "none",
          transform: active ? "scale(1)" : hov ? "scale(1.05)" : "scale(1)",
        }}
      >
        {icon}
      </button>
      {hov && typeof document !== "undefined" && createPortal(
        <div style={{
          position: 'fixed',
          top: tipPos.top,
          left: tipPos.left,
          transform: 'translateY(-50%)',
          background: '#0f1115', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', padding: '5px 10px', borderRadius: '6px',
          fontSize: '0.68rem', whiteSpace: 'nowrap', zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '1px',
          pointerEvents: 'none',
        }}>
          <span style={{ fontWeight: 600 }}>{label}</span>
          {shortcut && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Divider ─────────────────────────────────────────────────────── */
function Divider() {
  return <div className={styles.divider} />;
}

/* ─── Main Toolbar ────────────────────────────────────────────────── */
export function PixelToolbar({ onSave }: { onSave?: () => void }) {
  const {
    activeTool, setActiveTool, gridVisible, toggleGrid,
    zoom, setZoom, canvasWidth, canvasHeight,
    clearCanvas, undo, redo,
    setCanvasSize, symmetryMode, setSymmetryMode,
  } = usePixelEditorStore();

  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSymmetryMenu, setShowSymmetryMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Refs for anchor positioning
  const shapeAnchorRef = useRef<HTMLButtonElement>(null);
  const symmetryAnchorRef = useRef<HTMLButtonElement>(null);
  const sizeAnchorRef = useRef<HTMLButtonElement>(null);
  const exportAnchorRef = useRef<HTMLButtonElement>(null);

  // Close all menus
  const closeAll = () => {
    setShowShapeMenu(false);
    setShowSymmetryMenu(false);
    setShowSizeMenu(false);
    setShowExportMenu(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const refs = [shapeAnchorRef, symmetryAnchorRef, sizeAnchorRef, exportAnchorRef];
      if (!refs.some(r => r.current?.contains(target))) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportPNG = (scale: number) => {
    const { layers, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasWidth * scale;
    offscreen.height = canvasHeight * scale;
    const ctx = offscreen.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    for (const layer of layers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;
      for (const [key, color] of Object.entries(layer.pixels)) {
        const [px, py] = key.split(",").map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(px * scale, py * scale, scale, scale);
      }
    }
    ctx.globalAlpha = 1;
    const url = offscreen.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `corden-pixel-${canvasWidth * scale}x${canvasHeight * scale}.png`;
    a.click();
    closeAll();
  };

  const primaryTools: { id: PixelTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: "pencil", icon: <Pencil size={18} strokeWidth={1.5} />, label: "Pencil", shortcut: "B" },
    { id: "eraser", icon: <Eraser size={18} strokeWidth={1.5} />, label: "Eraser", shortcut: "E" },
    { id: "fill", icon: <PaintBucket size={18} strokeWidth={1.5} />, label: "Fill Bucket", shortcut: "F" },
    { id: "eyedropper", icon: <Pipette size={18} strokeWidth={1.5} />, label: "Eyedropper", shortcut: "I" },
    { id: "select", icon: <SquareDashed size={18} strokeWidth={1.5} />, label: "Select Area", shortcut: "M" },
    { id: "move", icon: <Move size={18} strokeWidth={1.5} />, label: "Move Selected", shortcut: "V" },
  ];

  const shapeTools = [
    { id: "line", label: "Line", icon: <Minus size={14} /> },
    { id: "rectangle", label: "Rectangle", icon: <Square size={14} /> },
    { id: "filled-rectangle", label: "Filled Rect", icon: <Square size={14} fill="currentColor" /> },
    { id: "circle", label: "Circle", icon: <Circle size={14} /> },
    { id: "triangle", label: "Triangle", icon: <Triangle size={14} /> },
  ];

  const isShapeTool = shapeTools.some(s => s.id === activeTool);
  const activeShape = shapeTools.find(s => s.id === activeTool);
  const shapeIcon = activeShape ? activeShape.icon : <Shapes size={18} strokeWidth={1.5} />;

  return (
    <div className={styles.toolbarWrapper}>

      {/* ── Primary Drawing Tools ── */}
      <div className={styles.panelGroup}>
        {primaryTools.map(t => (
          <ToolButton
            key={t.id}
            icon={t.icon}
            label={t.label}
            shortcut={t.shortcut}
            active={activeTool === t.id}
            onClick={() => setActiveTool(t.id)}
          />
        ))}

        {/* Shapes dropdown */}
        <button
          ref={shapeAnchorRef}
          className={styles.toolBtn}
          style={{
            background: isShapeTool
              ? "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)"
              : showShapeMenu ? "rgba(255,255,255,0.08)" : "transparent",
            color: isShapeTool ? "#fff" : "var(--text-secondary)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => { setShowShapeMenu(v => !v); setShowSymmetryMenu(false); setShowSizeMenu(false); setShowExportMenu(false); }}
        >
          {shapeIcon}
        </button>
        {showShapeMenu && (
          <PortalDropdown anchorRef={shapeAnchorRef}>
            <div style={dropdownTitleStyle}>Shapes</div>
            {shapeTools.map(s => (
              <DropdownItem
                key={s.id} label={s.label} icon={s.icon}
                active={activeTool === s.id}
                onClick={() => { setActiveTool(s.id as PixelTool); closeAll(); }}
              />
            ))}
          </PortalDropdown>
        )}
      </div>

      {/* ── Symmetry ── */}
      <div className={styles.panelGroup}>
        <button
          ref={symmetryAnchorRef}
          className={styles.toolBtn}
          style={{
            background: symmetryMode !== "none"
              ? "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)"
              : showSymmetryMenu ? "rgba(255,255,255,0.08)" : "transparent",
            color: symmetryMode !== "none" ? "#fff" : "var(--text-secondary)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => { setShowSymmetryMenu(v => !v); setShowShapeMenu(false); setShowSizeMenu(false); setShowExportMenu(false); }}
        >
          <SplitSquareHorizontal size={18} strokeWidth={1.5} />
        </button>
        {showSymmetryMenu && (
          <PortalDropdown anchorRef={symmetryAnchorRef}>
            <div style={dropdownTitleStyle}>Symmetry</div>
            {(["none", "horizontal", "vertical", "both"] as const).map(mode => (
              <DropdownItem
                key={mode}
                label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                active={symmetryMode === mode}
                onClick={() => { setSymmetryMode(mode); closeAll(); }}
              />
            ))}
          </PortalDropdown>
        )}
      </div>

      {/* ── Zoom & Grid ── */}
      <div className={styles.panelGroup}>
        <ToolButton
          icon={<ZoomIn size={18} strokeWidth={1.5} />}
          label="Zoom In"
          onClick={() => setZoom(Math.min(64, Math.round(zoom * 1.5)))}
        />
        <ToolButton
          icon={<ZoomOut size={18} strokeWidth={1.5} />}
          label="Zoom Out"
          onClick={() => setZoom(Math.max(2, Math.round(zoom / 1.5)))}
        />
        <Divider />
        <ToolButton
          icon={<Grid3X3 size={18} strokeWidth={1.5} />}
          label="Toggle Grid (G)"
          active={gridVisible}
          onClick={toggleGrid}
        />
      </div>

      {/* ── History ── */}
      <div className={styles.panelGroup}>
        <ToolButton icon={<Undo2 size={18} strokeWidth={1.5} />} label="Undo (Ctrl+Z)" onClick={undo} />
        <ToolButton icon={<Redo2 size={18} strokeWidth={1.5} />} label="Redo (Ctrl+Y)" onClick={redo} />
      </div>

      {/* ── Canvas / Import / Export / Save ── */}
      <div className={styles.panelGroup}>
        {/* Canvas Size */}
        <button
          ref={sizeAnchorRef}
          className={styles.toolBtnText}
          onClick={() => { setShowSizeMenu(v => !v); setShowShapeMenu(false); setShowSymmetryMenu(false); setShowExportMenu(false); }}
          style={{
            background: showSizeMenu ? "rgba(255,255,255,0.1)" : "transparent",
            color: "var(--text-secondary)", gap: "1px", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "0.55rem", lineHeight: 1, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{canvasWidth}</span>
          <span style={{ fontSize: "0.42rem", color: "var(--text-tertiary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>PX</span>
        </button>
        {showSizeMenu && (
          <PortalDropdown anchorRef={sizeAnchorRef}>
            <div style={dropdownTitleStyle}>Canvas Size</div>
            {CANVAS_SIZES.map(s => (
              <DropdownItem
                key={s}
                label={`${s} × ${s}`}
                active={canvasWidth === s}
                onClick={() => { setCanvasSize(s, s); closeAll(); }}
              />
            ))}
          </PortalDropdown>
        )}

        <Divider />

        {onSave && (
          <ToolButton
            icon={<Save size={18} strokeWidth={1.5} />}
            label="Save (Ctrl+S)"
            onClick={onSave}
          />
        )}

        <ToolButton
          icon={<ImagePlus size={18} strokeWidth={1.5} />}
          label="Import Image"
          onClick={() => setShowImportModal(true)}
        />

        {/* Export PNG */}
        <button
          ref={exportAnchorRef}
          className={styles.toolBtnText}
          onClick={() => { setShowExportMenu(v => !v); setShowShapeMenu(false); setShowSymmetryMenu(false); setShowSizeMenu(false); }}
          style={{
            background: showExportMenu ? "rgba(255,255,255,0.1)" : "transparent",
            color: "var(--text-secondary)", gap: "2px", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          <Download size={15} strokeWidth={1.5} />
          <ChevronDown size={8} strokeWidth={2} style={{ opacity: 0.45 }} />
        </button>
        {showExportMenu && (
          <PortalDropdown anchorRef={exportAnchorRef} minWidth={210} alignBottom>
            <div style={dropdownTitleStyle}>Export PNG</div>
            {[
              { scale: 16, label: "Ultra HQ (16×)", sub: `${canvasWidth * 16}×${canvasHeight * 16}px — print quality` },
              { scale: 8, label: "High Quality (8×)", sub: `${canvasWidth * 8}×${canvasHeight * 8}px — recommended` },
              { scale: 4, label: "Medium (4×)", sub: `${canvasWidth * 4}×${canvasHeight * 4}px` },
              { scale: 2, label: "Low (2×)", sub: `${canvasWidth * 2}×${canvasHeight * 2}px — smallest` },
            ].map(({ scale, label, sub }) => (
              <DropdownItem key={scale} label={label} subLabel={sub} onClick={() => handleExportPNG(scale)} />
            ))}
          </PortalDropdown>
        )}

        <ToolButton
          icon={<Trash2 size={18} strokeWidth={1.5} />}
          label="Clear Canvas"
          danger
          onClick={() => { if (confirm("Clear the entire canvas?")) clearCanvas(); }}
        />
      </div>

      {showImportModal && (
        <ImageImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
