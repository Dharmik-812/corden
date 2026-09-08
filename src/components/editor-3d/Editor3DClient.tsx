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
  const { showLeftPanel, showRightPanel, showNPanel, showTimeline, setObjects, commitHistory } = useEditor3DStore();
  const { resolvedId, saveStatus, save, title } = useProjectSave3D(projectId);
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const importKey = searchParams.get('voxel_import');
    if (!importKey) return;

    const data = localStorage.getItem(importKey);
    if (!data) return;

    try {
      const voxels: {x:number, y:number, z:number, color:string}[] = JSON.parse(data);
      const newObjects: SceneObject[] = voxels.map((v, i) => ({
        id: `voxel_${Date.now()}_${i}`,
        name: `Voxel ${i}`,
        type: 'cube' as const,
        objectType: 'mesh' as const,
        position: [(v.x - 16) * 0.5, (v.y) * 0.5, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [0.5, 0.5, 0.5] as [number, number, number],
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
      setObjects(newObjects);
      localStorage.removeItem(importKey);
      // Clean the param from the URL without re-render
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error("Failed to parse voxel import", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
