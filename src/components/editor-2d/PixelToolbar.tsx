"use client";

import { usePixelEditorStore, PixelTool, CanvasSize } from "@/stores/pixelEditor-store";
import {
  Pencil, Eraser, PaintBucket, Pipette, Grid3X3, Trash2, Download,
  ZoomIn, ZoomOut, Undo2, Redo2, Save, Minus, Square, SplitSquareHorizontal,
  ChevronDown, ImagePlus, Circle, Triangle, Shapes, SquareDashed, Move,
} from "lucide-react";
import { useState } from "react";
import { ImageImportModal } from "./ImageImportModal";
import styles from "./pixel-toolbar.module.css";

const CANVAS_SIZES: CanvasSize[] = [8, 16, 32, 48, 64, 128];

/* ─── Shared dropdown style ───────────────────────────────────────── */
const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  left: "52px",
  top: 0,
  zIndex: 200,
  background: "rgba(10,11,16,0.97)",
  backdropFilter: "blur(40px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  minWidth: "160px",
  boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset",
};

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

  return (
    <button
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "40px", height: "40px", borderRadius: "10px", border: "none",
        cursor: "pointer", transition: "all 0.15s ease",
        background: active
          ? "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)"
          : hov ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? "#fff" : danger && hov ? "#ff6b6b" : "var(--text-secondary)",
        boxShadow: active ? "0 4px 16px rgba(74,144,226,0.4)" : "none",
        transform: active ? "scale(1)" : hov ? "scale(1.05)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
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

  const handleExportPNG = (scale: number) => {
    const { layers, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasWidth * scale;
    offscreen.height = canvasHeight * scale;
    const ctx = offscreen.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    // Flatten all visible layers
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
    setShowExportMenu(false);
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

  const shapeIcon = activeShape
    ? activeShape.icon
    : <Shapes size={18} strokeWidth={1.5} />;

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
        <div style={{ position: "relative" }}>
          <ToolButton
            icon={shapeIcon}
            label="Shapes"
            active={isShapeTool}
            onClick={() => { setShowShapeMenu(v => !v); setShowSymmetryMenu(false); setShowSizeMenu(false); setShowExportMenu(false); }}
          />
          {showShapeMenu && (
            <div style={dropdownStyle}>
              <div style={dropdownTitleStyle}>Shapes</div>
              {shapeTools.map(s => (
                <DropdownItem
                  key={s.id} label={s.label} icon={s.icon}
                  active={activeTool === s.id}
                  onClick={() => { setActiveTool(s.id as PixelTool); setShowShapeMenu(false); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Symmetry ── */}
      <div className={styles.panelGroup}>
        <div style={{ position: "relative" }}>
          <ToolButton
            icon={<SplitSquareHorizontal size={18} strokeWidth={1.5} />}
            label={`Symmetry: ${symmetryMode}`}
            active={symmetryMode !== "none"}
            onClick={() => { setShowSymmetryMenu(v => !v); setShowShapeMenu(false); setShowSizeMenu(false); setShowExportMenu(false); }}
          />
          {showSymmetryMenu && (
            <div style={dropdownStyle}>
              <div style={dropdownTitleStyle}>Symmetry</div>
              {(["none", "horizontal", "vertical", "both"] as const).map(mode => (
                <DropdownItem
                  key={mode}
                  label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  active={symmetryMode === mode}
                  onClick={() => { setSymmetryMode(mode); setShowSymmetryMenu(false); }}
                />
              ))}
            </div>
          )}
        </div>
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
        <div style={{ position: "relative" }}>
          <button
            title="Canvas Size"
            onClick={() => { setShowSizeMenu(v => !v); setShowShapeMenu(false); setShowSymmetryMenu(false); setShowExportMenu(false); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
              width: "40px", height: "40px", borderRadius: "10px", border: "none",
              cursor: "pointer", background: showSizeMenu ? "rgba(255,255,255,0.1)" : "transparent",
              color: "var(--text-secondary)", transition: "all 0.15s", gap: "1px",
            }}
          >
            <span style={{ fontSize: "0.55rem", lineHeight: 1, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{canvasWidth}</span>
            <span style={{ fontSize: "0.42rem", color: "var(--text-tertiary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>PX</span>
          </button>
          {showSizeMenu && (
            <div style={dropdownStyle}>
              <div style={dropdownTitleStyle}>Canvas Size</div>
              {CANVAS_SIZES.map(s => (
                <DropdownItem
                  key={s}
                  label={`${s} × ${s}`}
                  active={canvasWidth === s}
                  onClick={() => { setCanvasSize(s, s); setShowSizeMenu(false); }}
                />
              ))}
            </div>
          )}
        </div>

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
        <div style={{ position: "relative" }}>
          <button
            title="Export PNG"
            onClick={() => { setShowExportMenu(v => !v); setShowShapeMenu(false); setShowSymmetryMenu(false); setShowSizeMenu(false); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
              width: "40px", height: "40px", borderRadius: "10px", border: "none",
              cursor: "pointer", transition: "all 0.15s ease",
              background: showExportMenu ? "rgba(255,255,255,0.1)" : "transparent",
              color: "var(--text-secondary)", gap: "1px",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = showExportMenu ? "rgba(255,255,255,0.1)" : "transparent"; }}
          >
            <Download size={15} strokeWidth={1.5} />
            <ChevronDown size={8} strokeWidth={2} style={{ opacity: 0.45 }} />
          </button>
          {showExportMenu && (
            <div style={{ ...dropdownStyle, minWidth: "210px", bottom: 0, top: "auto" }}>
              <div style={dropdownTitleStyle}>Export PNG</div>
              {[
                { scale: 16, label: "Ultra HQ (16×)", sub: `${canvasWidth * 16}×${canvasHeight * 16}px — print quality` },
                { scale: 8, label: "High Quality (8×)", sub: `${canvasWidth * 8}×${canvasHeight * 8}px — recommended` },
                { scale: 4, label: "Medium (4×)", sub: `${canvasWidth * 4}×${canvasHeight * 4}px` },
                { scale: 2, label: "Low (2×)", sub: `${canvasWidth * 2}×${canvasHeight * 2}px — smallest` },
              ].map(({ scale, label, sub }) => (
                <DropdownItem key={scale} label={label} subLabel={sub} onClick={() => handleExportPNG(scale)} />
              ))}
            </div>
          )}
        </div>

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
