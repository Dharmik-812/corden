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
import { useProjectSave3D } from "@/hooks/useProjectSave";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SceneObject } from "@/stores/editor3d-store";

export function Editor3DClient({ projectId }: { projectId: string }) {
  const { showLeftPanel, showRightPanel, showNPanel, showTimeline, setObjects, objects, commitHistory } = useEditor3DStore();
  const { resolvedId, saveStatus, save, title } = useProjectSave3D(projectId);
  const searchParams = useSearchParams();

  useEffect(() => {
    const importKey = searchParams.get('voxel_import');
    if (importKey) {
      const data = localStorage.getItem(importKey);
      if (data) {
        try {
          const voxels: {x:number, y:number, z:number, color:string}[] = JSON.parse(data);
          const newObjects: SceneObject[] = voxels.map((v, i) => ({
            id: `voxel_${Date.now()}_${i}`,
            name: `Voxel ${i}`,
            type: 'cube',
            objectType: 'mesh',
            // Scale and position so 1 pixel = 0.5 units
            position: [(v.x - 16) * 0.5, (v.y) * 0.5, 0],
            rotation: [0, 0, 0],
            scale: [0.5, 0.5, 0.5],
            color: v.color,
            roughness: 0.8,
            metalness: 0,
            visible: true,
            hidden: false,
            renderVisible: true,
            locked: false,
            smoothShading: false,
            modifiers: [],
            keyframes: [],
          }));
          
          commitHistory();
          // Add voxels to scene, replacing the default cube if it's untouched
          if (objects.length === 1 && objects[0].type === 'cube' && objects[0].position[0] === 0) {
            setObjects(newObjects);
          } else {
            setObjects([...objects, ...newObjects]);
          }
          
          // Cleanup
          localStorage.removeItem(importKey);
          
          // Clean up URL
          window.history.replaceState({}, '', `/editor/3d/${projectId}`);
        } catch (e) {
          console.error("Failed to parse voxel import", e);
        }
      }
    }
  }, [searchParams, projectId]);

  if (!resolvedId) {
    return (
      <div style={{
        position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#13151a', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem',
      }}>
        Loading project…
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: '#13151a',
    }}>
      {/* Top menu bar — integrates save status */}
      <TopMenuBar onSave={save} saveStatus={saveStatus} title={title} />

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left Toolbar */}
        {showLeftPanel && (
          <div
            className="editor-left-panel"
            style={{
              width: '48px', background: '#1a1c22',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0, overflowY: 'auto', overflowX: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <Toolbar3D />
          </div>
        )}

        {/* Center Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Viewport3D />

            {/* N-Panel */}
            {showNPanel && (
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '256px',
                background: 'rgba(22,24,30,0.97)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                overflowY: 'auto',
              }}>
                <NPanelTransform />
              </div>
            )}
          </div>

          {/* Timeline */}
          {showTimeline && (
            <div style={{
              height: '160px', flexShrink: 0,
              background: '#1a1c22',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <Timeline />
            </div>
          )}
        </div>

        {/* Right Properties Panel */}
        {showRightPanel && (
          <div
            className="editor-right-panel"
            style={{
              width: '340px', display: 'flex', flexDirection: 'column',
              background: '#1a1c22',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            {/* Outliner */}
            <div style={{ height: '220px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
              <SceneOutliner />
            </div>

            {/* Properties */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
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
