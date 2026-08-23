"use client";

import { useParams } from "next/navigation";
import { PixelCanvas } from "@/components/editor-2d/PixelCanvas";
import { PixelToolbar } from "@/components/editor-2d/PixelToolbar";
import { ColorPalette } from "@/components/editor-2d/ColorPalette";
import { TopMenuBar2D } from "@/components/editor-2d/TopMenuBar2D";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useProjectSave2D } from "@/hooks/useProjectSave";

import { LayersPanel2D } from "@/components/editor-2d/LayersPanel2D";
import { AnimationTimeline } from "@/components/editor-2d/AnimationTimeline";

import styles from "./editor2d.module.css";
import { useState } from "react";
import { Menu } from "lucide-react";

function PixelEditorHUD() {
  const { primaryColor, activeTool, canvasWidth, canvasHeight, zoom } = usePixelEditorStore();

  const toolLabel: Record<string, string> = {
    pencil: '✏ Pencil',
    eraser: '⬜ Eraser',
    fill: '🪣 Fill',
    eyedropper: '🔬 Eyedropper',
    line: '➖ Line',
    rectangle: '⬜ Rectangle',
    'filled-rectangle': '⬛ Filled Rectangle',
    circle: '⭕ Circle',
    triangle: '🔺 Triangle',
    select: '⬚ Select',
    move: '🤚 Move',
  };

  return (
    <div style={{
      position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 40, display: 'flex', alignItems: 'center', gap: '12px',
      padding: '8px 18px', background: 'rgba(10,12,18,0.85)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)',
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: primaryColor, border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{toolLabel[activeTool]}</span>
      <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
      <span>{canvasWidth} × {canvasHeight}</span>
      <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
      <span>{zoom}x</span>
    </div>
  );
}

export default function Editor2DPage() {
  const params = useParams();
  const projectId = (params.projectId as string) ?? "new";
  const { resolvedId, saveStatus, save, title } = useProjectSave2D(projectId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!resolvedId) {
    return (
      <div style={{
        position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080a0f', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem',
      }}>
        Loading project…
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <TopMenuBar2D onSave={save} saveStatus={saveStatus} title={title} />

      <div className={styles.workspace}>
        {/* Left Toolbar */}
        <div className={styles.toolbarContainer}>
          <PixelToolbar onSave={save} />
        </div>

        {/* Center Canvas */}
        <div className={styles.canvasArea}>
          <PixelCanvas />
          <PixelEditorHUD />

          <div className={styles.mobileToggleBar}>
            <button className={styles.mobileToggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </button>
          </div>
          
          <div 
            className={`${styles.mobileOverlay} ${sidebarOpen ? styles.open : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* Right Sidebar (Layers & Palette) */}
        <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.open : ''}`}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <LayersPanel2D />
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <div style={{ height: '50%', flexShrink: 0, overflow: 'hidden' }}>
            <ColorPalette />
          </div>
        </div>
      </div>
      
      {/* Bottom Timeline */}
      <div className={styles.timelineContainer}>
        <AnimationTimeline />
      </div>
    </div>
  );
}
