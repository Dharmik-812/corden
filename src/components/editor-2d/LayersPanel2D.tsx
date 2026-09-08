"use client";

import { usePixelEditorStore, type Layer } from "@/stores/pixelEditor-store";
import { useState, useRef } from "react";
import {
  Plus, Trash2, Eye, EyeOff, Lock, Unlock, Copy,
  ChevronUp, ChevronDown, Layers, Merge, Minimize2,
} from "lucide-react";
import { motion } from "framer-motion";

function LayerThumb({ layer }: { layer: Layer }) {
  const { canvasWidth, canvasHeight } = usePixelEditorStore();
  const size = 28;
  const colors = Object.entries(layer.pixels).slice(0, 200);
  return (
    <svg
      width={size} height={size}
      style={{ borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, background: "#0d0e14" }}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      shapeRendering="crispEdges"
    >
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
        background: "transparent", border: "none",
        color: disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)",
        cursor: disabled ? "default" : "pointer", padding: "4px", borderRadius: "5px",
        display: "flex", alignItems: "center", transition: "all 0.12s",
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = danger ? "rgba(255,80,80,0.12)" : "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = danger ? "#f87171" : "#fff";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)";
      }}
    >
      {children}
    </button>
  );
}

function LayerRow({ layer, isActive, index, total }: {
  layer: Layer;
  isActive: boolean;
  index: number;
  total: number;
}) {
  const {
    setActiveLayer, updateLayer, deleteLayer, duplicateLayer,
    moveLayer, mergeLayerDown,
  } = usePixelEditorStore();

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(layer.name);
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setActiveLayer(layer.id)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 10px", borderRadius: "10px", cursor: "pointer",
        background: isActive ? "rgba(71,114,179,0.15)" : "transparent",
        border: `1px solid ${isActive ? "rgba(71,114,179,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        opacity: layer.visible ? 1 : 0.45,
        boxShadow: isActive ? "inset 2px 0 0 #4772b3, inset 0 1px 6px rgba(71,114,179,0.05)" : "none",
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.boxShadow = "inset 2px 0 0 rgba(255,255,255,0.15)"; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {/* Thumbnail */}
      <LayerThumb layer={layer} />

      {/* Name + Opacity */}
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
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(71,114,179,0.5)",
              color: "#fff", outline: "none", borderRadius: "5px", padding: "2px 6px",
              fontSize: "0.73rem", width: "100%", fontFamily: "inherit",
              boxShadow: "0 0 0 2px rgba(71,114,179,0.2)",
            }}
          />
        ) : (
          <span
            onDoubleClick={e => { e.stopPropagation(); setEditingName(true); setTempName(layer.name); }}
            style={{
              fontSize: "0.73rem", fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block",
              transition: "color 0.15s",
            }}
            title="Double-click to rename"
          >
            {layer.name}
          </span>
        )}
        {/* Opacity slider (only when active) */}
        {isActive && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <input
              type="range" min={0} max={100} value={Math.round(layer.opacity * 100)}
              onChange={e => updateLayer(layer.id, { opacity: Number(e.target.value) / 100 })}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, height: "3px", accentColor: "#4772b3", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", minWidth: "28px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "1px", flexShrink: 0 }}>
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
    </motion.div>
  );
}

export function LayersPanel2D() {
  const { layers, activeLayerId, addLayer, flattenAllLayers } = usePixelEditorStore();
  const reversed = [...layers].reverse();

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 0, border: "none", background: "transparent" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <Layers size={14} color="#4772b3" />
          <span style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.04em", color: "#fff" }}>
            Layers
          </span>
          <span style={{
            background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.6)",
            fontSize: "0.65rem", fontWeight: 600, padding: "1px 7px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {layers.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          <button
            title="Flatten all layers"
            onClick={() => { if (confirm("Flatten all layers into one?")) flattenAllLayers(); }}
            style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.35)",
              cursor: "pointer", padding: "5px", borderRadius: "6px", display: "flex", transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            <Minimize2 size={13} />
          </button>
          <button
            title="Add new layer"
            onClick={() => addLayer()}
            style={{
              background: "rgba(71,114,179,0.15)", border: "1px solid rgba(71,114,179,0.3)",
              color: "#8bb8ff", cursor: "pointer", padding: "5px 8px", borderRadius: "6px",
              display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(71,114,179,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(71,114,179,0.15)"; }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {reversed.map(layer => {
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
        {layers.length === 0 && (
          <div style={{
            margin: "16px", padding: "24px 0", textAlign: "center",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.2)",
            border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "10px",
          }}>
            No layers
          </div>
        )}
      </div>
    </div>
  );
}
