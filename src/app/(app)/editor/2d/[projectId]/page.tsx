"use client";

import { useParams } from "next/navigation";
import { PixelCanvas } from "@/components/editor-2d/PixelCanvas";
import { PixelToolbar } from "@/components/editor-2d/PixelToolbar";
import { ColorPalette } from "@/components/editor-2d/ColorPalette";
import { TopMenuBar2D } from "@/components/editor-2d/TopMenuBar2D";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useProjectSave2D } from "@/hooks/useProjectSave";

function PixelEditorHUD() {
  const { primaryColor, activeTool, canvasWidth, canvasHeight, zoom } = usePixelEditorStore();

  const toolLabel: Record<string, string> = {
    pencil: '✏ Pencil',
    eraser: '⬜ Eraser',
    fill: '🪣 Fill',
    eyedropper: '🔬 Eyedropper',
  };

  return (
    <div style={{
      position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 40, display: 'flex', alignItems: 'center', gap: '12px',
      padding: '8px 18px', background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px',
      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)',
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
    }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: primaryColor, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
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
    <div style={{
      position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: '#080a0f',
    }}>
      <TopMenuBar2D onSave={save} saveStatus={saveStatus} title={title} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <PixelCanvas />
        </div>

        <div
          className="editor-2d-toolbar"
          style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 40,
          }}
        >
          <PixelToolbar onSave={save} />
        </div>

        <PixelEditorHUD />

        <div
          className="editor-2d-palette"
          style={{
            position: 'absolute', right: '16px', top: '16px', bottom: '16px',
            zIndex: 40, width: '240px',
            background: 'rgba(8, 8, 12, 0.88)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '18px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <ColorPalette />
        </div>
      </div>
    </div>
  );
}
