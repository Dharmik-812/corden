"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Viewport3D } from "@/components/editor-3d/Viewport3D";
import { Toolbar3D } from "@/components/editor-3d/Toolbar3D";
import { SceneOutliner } from "@/components/editor-3d/SceneOutliner";
import { PropertiesEditor } from "@/components/editor-3d/PropertiesEditor";
import { NPanelTransform } from "@/components/editor-3d/NPanelTransform";
import { Timeline } from "@/components/editor-3d/Timeline";
import { ShaderPie } from "@/components/editor-3d/ShaderPie";
import { AddMenu } from "@/components/editor-3d/AddMenu";
import { TopMenuBar } from "@/components/editor-3d/TopMenuBar";
import { SaveIndicator } from "@/components/shared/SaveIndicator";
import { useProjectSave3D } from "@/hooks/useProjectSave";

export function Editor3DClient({ projectId }: { projectId: string }) {
  const { showLeftPanel, showRightPanel, showNPanel, showTimeline } = useEditor3DStore();
  const { resolvedId, saveStatus, save, title } = useProjectSave3D(projectId);

  if (!resolvedId) {
    return (
      <div style={{
        position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#181818', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem',
      }}>
        Loading project…
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#181818' }}>
      <TopMenuBar onSave={save} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '4px 12px', background: '#1e1e1e', borderBottom: '1px solid #282828' }}>
        <SaveIndicator status={saveStatus} onSave={save} title={title} />
      </div>

      {/* Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Toolbar (T-Panel) */}
        {showLeftPanel && (
          <div style={{ width: '40px', background: '#282828', borderRight: '1px solid #1e1e1e', flexShrink: 0, overflowY: 'auto' }}>
            <Toolbar3D />
          </div>
        )}

        {/* Center Viewport Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <Viewport3D />

            {/* N-Panel (Docked inside viewport to the right) */}
            {showNPanel && (
              <div style={{ 
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '250px', 
                background: '#282828', borderLeft: '1px solid #1e1e1e', opacity: 0.95, overflowY: 'auto' 
              }}>
                <NPanelTransform />
              </div>
            )}
          </div>
          
          {/* Timeline Panel (Bottom, Docked) */}
          {showTimeline && (
            <div style={{ height: '140px', background: '#282828', borderTop: '1px solid #1e1e1e', flexShrink: 0 }}>
              <Timeline />
            </div>
          )}
        </div>

        {/* Right Properties Panel (Docked) */}
        {showRightPanel && (
          <div style={{ width: '320px', display: 'flex', flexDirection: 'column', background: '#282828', borderLeft: '1px solid #1e1e1e', flexShrink: 0 }}>
            {/* Outliner (Top Half) */}
            <div style={{ flex: 1, minHeight: '200px', borderBottom: '1px solid #1e1e1e', overflow: 'hidden' }}>
              <SceneOutliner />
            </div>
            
            {/* Properties (Bottom Half) */}
            <div style={{ flex: 2, overflow: 'hidden' }}>
              <PropertiesEditor />
            </div>
          </div>
        )}
      </div>

      {/* Overlays */}
      <ShaderPie />
      <AddMenu />

    </div>
  );
}
