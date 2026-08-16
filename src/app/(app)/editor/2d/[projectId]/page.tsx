"use client";

import { Canvas2D } from "@/components/editor-2d/Canvas2D";
import { Toolbar2D } from "@/components/editor-2d/Toolbar2D";
import { LayersPanel } from "@/components/editor-2d/LayersPanel";
import { PropertiesPanel } from "@/components/editor-2d/PropertiesPanel";

export default async function Editor2DPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div
      className="editor-layout flex overflow-hidden"
      style={{ position: 'relative', marginTop: 'var(--navbar-height)' }}
    >
      {/* Left Layers Panel */}
      <aside
        className="h-full flex flex-col shrink-0"
        style={{
          width: '220px',
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-primary)',
        }}
      >
        <LayersPanel />
      </aside>

      {/* Center: Toolbar + Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Toolbar */}
        <div
          style={{
            height: '48px',
            background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border-primary)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Toolbar2D />
        </div>

        {/* Canvas area */}
        <main className="flex-1 relative overflow-hidden">
          <Canvas2D />
        </main>
      </div>

      {/* Right Properties Panel */}
      <aside
        className="h-full flex flex-col shrink-0"
        style={{
          width: '260px',
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border-primary)',
        }}
      >
        <PropertiesPanel />
      </aside>
    </div>
  );
}
