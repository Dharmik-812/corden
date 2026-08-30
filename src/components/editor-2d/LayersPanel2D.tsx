"use client";

import { usePixelEditorStore, type Layer } from "@/stores/pixelEditor-store";
import { useState, useRef } from "react";
import {
  Plus, Trash2, Eye, EyeOff, Lock, Unlock, Copy,
  ChevronUp, ChevronDown, Layers, Merge, Minimize2,
} from "lucide-react";

function LayerRow({ layer, isActive, index, total }: {
  layer: Layer;
  isActive: boolean;
  index: number;
  total: number;
}) {
  const {
    setActiveLayer, updateLayer, deleteLayer, duplicateLayer,
    moveLayer, mergeLayerDown, layers,
  } = usePixelEditorStore();

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(layer.name);
  const nameRef = useRef<HTMLInputElement>(null);

  const rowBg = isActive
    ? "rgba(71,114,179,0.18)"
    : "transparent";

  return (
    <div
      onClick={() => setActiveLayer(layer.id)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 12px", borderRadius: "10px", cursor: "pointer",
        background: rowBg,
        border: `1px solid ${isActive ? "rgba(71,114,179,0.35)" : "transparent"}`,
        transition: "all 0.15s",
        opacity: layer.visible ? 1 : 0.45,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Thumbnail */}
      <LayerThumb layer={layer} />

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editingName ? (
          <input
            ref={nameRef}
            value={tempName}
            autoFocus
            onChange={e => setTempName(e.target.value)}
            onBlur={() => { updateLayer(layer.id, { name: tempName.trim() || layer.name }); setEditingName(false); }}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") nameRef.current?.blur(); }}
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(71,114,179,0.5)",
              color: "#fff", outline: "none", borderRadius: "4px", padding: "2px 6px",
              fontSize: "0.75rem", width: "100%", fontFamily: "inherit",
            }}
          />
        ) : (
          <span
            onDoubleClick={e => { e.stopPropagation(); setEditingName(true); setTempName(layer.name); }}
            style={{ fontSize: "0.75rem", fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
            title="Double-click to rename"
          >
            {layer.name}
          </span>
        )}
        {/* Opacity slider (only when active) */}
        {isActive && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
            <input
              type="range" min={0} max={100} value={Math.round(layer.opacity * 100)}
              onChange={e => updateLayer(layer.id, { opacity: Number(e.target.value) / 100 })}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, height: "3px", accentColor: "#4772b3" }}
            />
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", minWidth: "26px", textAlign: "right" }}>
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
        <IconBtn title="Toggle visibility" onClick={e => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}>
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </IconBtn>
        <IconBtn title={layer.locked ? "Unlock" : "Lock"} onClick={e => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}>
          {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </IconBtn>
        {isActive && (
          <>
            <IconBtn title="Move up" disabled={index >= total - 1} onClick={e => { e.stopPropagation(); moveLayer(layer.id, "up"); }}>
              <ChevronUp size={12} />
            </IconBtn>
            <IconBtn title="Move down" disabled={index <= 0} onClick={e => { e.stopPropagation(); moveLayer(layer.id, "down"); }}>
              <ChevronDown size={12} />
            </IconBtn>
            <IconBtn title="Duplicate layer" onClick={e => { e.stopPropagation(); duplicateLayer(layer.id); }}>
              <Copy size={12} />
            </IconBtn>
            {index > 0 && (
              <IconBtn title="Merge down" onClick={e => { e.stopPropagation(); mergeLayerDown(layer.id); }}>
                <Merge size={12} />
              </IconBtn>
            )}
            <IconBtn title="Delete layer" danger onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}>
              <Trash2 size={12} />
            </IconBtn>
          </>
        )}
      </div>
    </div>
  );
}

function LayerThumb({ layer }: { layer: Layer }) {
  const { canvasWidth, canvasHeight } = usePixelEditorStore();
  // Paint a tiny 16x16 thumbnail
  const size = 26;
  const scale = Math.max(1, Math.floor(16 / Math.max(canvasWidth, canvasHeight)));
  const colors = Object.entries(layer.pixels).slice(0, 200);
  return (
    <svg width={size} height={size} style={{ borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, background: "#1a1a2a" }} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} shapeRendering="crispEdges">
      {colors.map(([key, color]) => {
        const [x, y] = key.split(",").map(Number);
        return <rect key={key} x={x} y={y} width={1} height={1} fill={color} />;
      })}
    </svg>
  );
}

function IconBtn({ children, title, onClick, disabled = false, danger = false }: {
  children: React.ReactNode; title: string; onClick: (e: React.MouseEvent) => void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent", border: "none", color: disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.45)",
        cursor: disabled ? "default" : "pointer", padding: "3px", borderRadius: "4px",
        display: "flex", alignItems: "center", transition: "all 0.1s",
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = danger ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.color = danger ? "#ff6b6b" : "#fff"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.45)"; }}
    >
      {children}
    </button>
  );
}

export function LayersPanel2D() {
  const { layers, activeLayerId, addLayer, flattenAllLayers } = usePixelEditorStore();
  // layers are stored bottom-to-top in array; display top-to-bottom
  const reversed = [...layers].reverse();

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 0, border: 'none', background: 'transparent' }}>
      {/* Header */}
      <div className="panel-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Layers size={13} color="var(--accent-primary)" />
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
            Layers
          </span>
          <span style={{
            background: "var(--bg-card)", color: "var(--accent-primary)",
            fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
            border: "1px solid var(--border-secondary)"
          }}>
            {layers.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          <IconBtn title="Flatten all layers" onClick={() => { if (confirm("Flatten all layers into one?")) flattenAllLayers(); }}>
            <Minimize2 size={12} />
          </IconBtn>
          <IconBtn title="Add new layer" onClick={() => addLayer()}>
            <Plus size={12} />
          </IconBtn>
        </div>
      </div>

      {/* Layer list */}
      <div className="panel-body" style={{ flex: 1, overflowY: "auto", padding: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
        {reversed.map((layer, displayIdx) => {
          const realIdx = layers.findIndex(l => l.id === layer.id);
          return (
            <LayerRow
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              index={realIdx}
              total={layers.length}
            />
          );
        })}
      </div>
    </div>
  );
}
