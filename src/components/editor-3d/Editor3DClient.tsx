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

import styles from "./editor3d.module.css";
import { useState } from "react";
import { Menu } from "lucide-react";

export function Editor3DClient({ projectId }: { projectId: string }) {
  const { showLeftPanel, showRightPanel, showNPanel, showTimeline, setObjects, objects, commitHistory } = useEditor3DStore();
  const { resolvedId, saveStatus, save, title } = useProjectSave3D(projectId);
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          if (objects.length === 1 && objects[0].type === 'cube' && objects[0].position[0] === 0) {
            setObjects(newObjects);
          } else {
            setObjects([...objects, ...newObjects]);
          }
          
          localStorage.removeItem(importKey);
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
        background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '0.85rem',
      }}>
        Loading project…
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <TopMenuBar onSave={save} saveStatus={saveStatus} title={title} />

      <div className={styles.workspace}>
        {/* Left Toolbar */}
        {showLeftPanel && (
          <div className={styles.toolbarContainer}>
            <Toolbar3D />
          </div>
        )}

        {/* Center Viewport */}
        <div className={styles.canvasArea}>
          <Viewport3D />
          
          <div className={styles.mobileToggleBar}>
            <button className={styles.mobileToggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </button>
          </div>
          
          <div 
            className={`${styles.mobileOverlay} ${sidebarOpen ? styles.open : ''}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* N-Panel */}
          {showNPanel && (
            <div className={styles.nPanelContainer}>
              <NPanelTransform />
            </div>
          )}
        </div>

        {/* Right Properties Panel */}
        {showRightPanel && (
          <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.open : ''}`}>
            <div style={{ height: '220px', borderBottom: '1px solid var(--border-primary)', overflow: 'hidden', flexShrink: 0 }}>
              <SceneOutliner />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PropertiesEditor />
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className={styles.timelineContainer}>
          <Timeline />
        </div>
      )}

      {/* Overlays */}
      <ShaderPie />
      <AddMenu />
    </div>
  );
}
