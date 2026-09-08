"use client";

import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Plus, Trash2, Copy, Film, Download, ChevronDown,
} from "lucide-react";

function FrameThumb({ layers, canvasWidth, canvasHeight, isActive, frameNum, onClick }: {
  layers: import("@/stores/pixelEditor-store").Layer[];
  canvasWidth: number;
  canvasHeight: number;
  isActive: boolean;
  frameNum: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0, cursor: "pointer",
        borderRadius: "8px",
        border: `2px solid ${isActive ? "var(--accent-primary, #4772b3)" : "rgba(255,255,255,0.08)"}`,
        overflow: "hidden", position: "relative",
        background: isActive ? "rgba(71,114,179,0.08)" : "#13141a",
        transition: "all 0.15s",
        boxShadow: isActive ? "0 0 0 2px rgba(71,114,179,0.3), 0 4px 12px rgba(0,0,0,0.4)" : "0 2px 6px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
      title={isActive ? "Active frame" : `Frame ${frameNum}`}
    >
      <svg width={52} height={52} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} shapeRendering="crispEdges"
        style={{ display: "block" }}
      >
        {/* Checkerboard background */}
        <rect width={canvasWidth} height={canvasHeight} fill="#1a1a2a" />
        {layers.filter(l => l.visible).map(layer =>
          Object.entries(layer.pixels).map(([key, color]) => {
            const [x, y] = key.split(",").map(Number);
            return <rect key={key} x={x} y={y} width={1} height={1} fill={color} />;
          })
        )}
      </svg>

      {/* Frame number badge */}
      <div style={{
        position: "absolute", top: "3px", left: "4px",
        fontSize: "0.5rem", fontWeight: 700, color: isActive ? "#559BFF" : "rgba(255,255,255,0.3)",
        fontFamily: "var(--font-mono)", lineHeight: 1,
        textShadow: isActive ? "0 1px 3px rgba(0,0,0,0.8)" : "none",
      }}>
        {frameNum}
      </div>

      {/* Active bottom bar */}
      {isActive && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "3px", background: "linear-gradient(90deg, var(--accent-primary, #4772b3), #559BFF)",
        }} />
      )}
    </div>
  );
}

export function AnimationTimeline() {
  const {
    frames, activeFrameIndex, isPlaying, fps,
    addFrame, deleteFrame, duplicateFrame, setActiveFrame,
    setIsPlaying, setFps, setFrameDuration, layers,
  } = usePixelEditorStore();

  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playFrameRef = useRef(activeFrameIndex);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Playback
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        playFrameRef.current = (playFrameRef.current + 1) % frames.length;
        setActiveFrame(playFrameRef.current);
      }, 1000 / fps);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, fps, frames.length]);

  const handleExportGif = async (scale: number = 4) => {
    if (typeof window === "undefined") return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const { default: GIF } = await import("gif.js");
      const { canvasWidth, canvasHeight, activeFrameIndex, layers } = usePixelEditorStore.getState();
      const exportFrames = frames.map((f, i) => i === activeFrameIndex ? { ...f, layers } : f);
      
      const gif = new GIF({
        workers: 2, quality: 10,
        width: canvasWidth * scale, height: canvasHeight * scale,
        workerScript: "/gif.worker.js",
        transparent: "0xFF00FF" // Magenta as chroma key for transparency
      });
      for (const frame of exportFrames) {
        const off = document.createElement("canvas");
        off.width = canvasWidth * scale; off.height = canvasHeight * scale;
        const ctx = off.getContext("2d")!;
        
        // Fill canvas with magenta to act as our transparent background
        ctx.fillStyle = "#FF00FF"; 
        ctx.fillRect(0, 0, off.width, off.height);
        
        for (const layer of frame.layers) {
          if (!layer.visible) continue;
          ctx.globalAlpha = layer.opacity;
          for (const [key, color] of Object.entries(layer.pixels)) {
            const [px, py] = key.split(",").map(Number);
            ctx.fillStyle = color;
            ctx.fillRect(px * scale, py * scale, scale, scale);
          }
        }
        ctx.globalAlpha = 1;
        gif.addFrame(off, { delay: frame.duration });
      }
      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `corden-animation-${canvasWidth * scale}x${canvasHeight * scale}.gif`; a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      });
      gif.render();
    } catch {
      setIsExporting(false);
    }
  };

  const totalDuration = frames.reduce((s, f) => s + f.duration, 0);

  return (
    <div style={{
      height: "96px", flexShrink: 0,
      background: "rgba(8,9,14,0.96)",
      backdropFilter: "blur(32px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", gap: "0",
      fontFamily: "var(--font-sans)",
      position: "relative",
    }}>

      {/* Left Controls */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "8px",
        padding: "12px 16px", flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.05)",
        height: "100%", justifyContent: "center",
        minWidth: "140px",
      }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={11} color="#4772b3" />
          <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Timeline
          </span>
          <span style={{
            background: "rgba(71,114,179,0.15)", color: "#8bb8ff",
            fontSize: "0.55rem", fontWeight: 700, padding: "1px 5px", borderRadius: "8px",
          }}>
            {frames.length}
          </span>
        </div>

        {/* Playback + FPS */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "30px", height: "30px", borderRadius: "50%", border: "none",
              background: isPlaying ? "rgba(255,180,0,0.18)" : "rgba(71,114,179,0.25)",
              color: isPlaying ? "#ffb400" : "#8bb8ff",
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: isPlaying ? "0 0 12px rgba(255,180,0,0.25)" : "none",
              flexShrink: 0,
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>FPS</span>
            <input
              type="number" min={1} max={60} value={fps}
              onChange={e => setFps(Number(e.target.value))}
              style={{
                width: "34px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none", borderRadius: "5px",
                padding: "3px 5px", fontSize: "0.65rem", textAlign: "center",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>
        </div>

        {/* Export */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={isExporting}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 8px", borderRadius: "6px", border: "none",
              background: isExporting ? "rgba(255,255,255,0.06)" : "rgba(71,114,179,0.15)",
              color: isExporting ? "rgba(255,255,255,0.4)" : "#8bb8ff",
              cursor: isExporting ? "default" : "pointer",
              fontSize: "0.6rem", fontWeight: 600, transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!isExporting) e.currentTarget.style.background = "rgba(71,114,179,0.28)"; }}
            onMouseLeave={e => { if (!isExporting) e.currentTarget.style.background = "rgba(71,114,179,0.15)"; }}
          >
            {isExporting ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> : <Download size={10} />}
            {isExporting ? "Encoding…" : "Export"}
            {!isExporting && <ChevronDown size={9} style={{ opacity: 0.6 }} />}
          </button>

          {showExportMenu && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 4px)", left: 0,
              background: "rgba(12,13,18,0.98)", backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
              padding: "6px", zIndex: 200, minWidth: "160px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", gap: "2px"
            }}>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", padding: "4px 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Export GIF</div>
              {[1, 2, 4, 8].map(scale => (
                <button
                  key={scale}
                  onClick={() => handleExportGif(scale)}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: "7px", border: "none",
                    background: "transparent", color: "rgba(255,255,255,0.82)", cursor: "pointer",
                    textAlign: "left", fontSize: "0.73rem", display: "flex", alignItems: "center", gap: "8px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,144,226,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Film size={12} /> {scale}x Scale
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Frame strip */}
      <div style={{
        flex: 1, overflowX: "auto", overflowY: "hidden",
        display: "flex", alignItems: "center", gap: "6px",
        padding: "0 14px",
        scrollbarWidth: "none",
      }}>
        {frames.map((frame, i) => (
          <div key={frame.id} style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <FrameThumb
              layers={frame.layers}
              canvasWidth={usePixelEditorStore.getState().canvasWidth}
              canvasHeight={usePixelEditorStore.getState().canvasHeight}
              isActive={i === activeFrameIndex}
              frameNum={i + 1}
              onClick={() => setActiveFrame(i)}
            />

            {/* Duration input */}
            <input
              type="number" min={16} max={5000} value={frame.duration}
              onChange={e => setFrameDuration(i, Number(e.target.value))}
              style={{
                width: "48px", background: "transparent", border: "none",
                color: "rgba(255,255,255,0.25)", outline: "none",
                fontSize: "0.52rem", textAlign: "center",
                fontFamily: "var(--font-mono)",
              }}
              title="Frame duration (ms)"
            />

            {/* Actions on active frame */}
            {i === activeFrameIndex && (
              <div style={{ position: "absolute", top: "-7px", right: "-5px", display: "flex", gap: "2px" }}>
                <button
                  onClick={() => duplicateFrame(i)}
                  title="Duplicate frame"
                  style={{
                    width: "16px", height: "16px", borderRadius: "50%", border: "none",
                    background: "rgba(71,114,179,0.85)", color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  <Copy size={8} />
                </button>
                {frames.length > 1 && (
                  <button
                    onClick={() => deleteFrame(i)}
                    title="Delete frame"
                    style={{
                      width: "16px", height: "16px", borderRadius: "50%", border: "none",
                      background: "rgba(180,40,40,0.85)", color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Trash2 size={8} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add frame */}
        <button
          onClick={addFrame}
          style={{
            flexShrink: 0, width: "52px", height: "52px", borderRadius: "8px",
            border: "2px dashed rgba(255,255,255,0.12)", background: "transparent",
            color: "rgba(255,255,255,0.25)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(71,114,179,0.6)";
            e.currentTarget.style.color = "#8bb8ff";
            e.currentTarget.style.background = "rgba(71,114,179,0.06)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "rgba(255,255,255,0.25)";
            e.currentTarget.style.background = "transparent";
          }}
          title="Add new frame"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Right info */}
      <div style={{
        padding: "0 14px", display: "flex", flexDirection: "column", gap: "4px",
        alignItems: "flex-end", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)",
        height: "100%", justifyContent: "center",
      }}>
        <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>
          {frames.length}f · {(totalDuration / 1000).toFixed(1)}s
        </span>
        <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-mono)" }}>
          {fps} fps
        </span>
      </div>
    </div>
  );
}
