"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Viewport3D } from "@/components/editor-3d/Viewport3D";
import { Toolbar3D } from "@/components/editor-3d/Toolbar3D";
import { SceneOutliner } from "@/components/editor-3d/SceneOutliner";
import { MaterialPanel } from "@/components/editor-3d/MaterialPanel";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Editor3DClient() {
  const { 
    showLeftPanel, showRightPanel, setShowLeftPanel, setShowRightPanel, 
    addMenuPosition, setAddMenuPosition, addObject 
  } = useEditor3DStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 't':
          setShowLeftPanel(!useEditor3DStore.getState().showLeftPanel);
          break;
        case 'n':
          setShowRightPanel(!useEditor3DStore.getState().showRightPanel);
          break;
        case 'a':
          if (e.shiftKey) {
            e.preventDefault();
            // Just place it in the center for now, or track mouse position globally
            setAddMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          }
          break;
        case 'escape':
          setAddMenuPosition(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowLeftPanel, setShowRightPanel, setAddMenuPosition]);

  return (
    <div className="editor-layout flex overflow-hidden" style={{ position: 'relative', marginTop: 'var(--navbar-height)' }}>
      
      {/* Top Menu Bar - blender style */}
      <div className="absolute top-0 left-0 w-full h-8 z-50 flex items-center px-4 font-mono text-xs" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-white">File</span>
          <span className="cursor-pointer hover:text-white">Edit</span>
          <span className="cursor-pointer hover:text-white">Add</span>
          <span className="cursor-pointer hover:text-white">View</span>
        </div>
        <div className="flex-1" />
        <div>Blender Layout</div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 w-full h-full pt-8">
        
        {/* Left Toolbar */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 56, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full flex flex-col items-center py-2 shrink-0 z-40"
              style={{ overflow: 'hidden', background: 'var(--bg-panel)', borderRight: '1px solid var(--border-primary)' }}
            >
              <Toolbar3D />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewport */}
        <div className="flex-1 h-full relative">
          <Viewport3D />
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full flex flex-col shrink-0 z-40"
              style={{ overflow: 'hidden', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-primary)' }}
            >
              {/* Top half: Outliner */}
              <div className="flex-1 overflow-hidden" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <SceneOutliner />
              </div>
              
              {/* Bottom half: Properties */}
              <div className="flex-1 overflow-hidden">
                <MaterialPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Add Object Menu */}
      <AnimatePresence>
        {addMenuPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 bg-panel border border-primary rounded shadow-lg p-2 min-w-[150px]"
            style={{ 
              left: addMenuPosition.x, 
              top: addMenuPosition.y,
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="text-xs text-secondary font-mono mb-2 px-2 border-b border-primary pb-1">Add Mesh</div>
            <div className="flex flex-col">
              {['cube', 'sphere', 'cylinder', 'cone', 'plane'].map((type) => (
                <button
                  key={type}
                  className="text-left text-sm px-2 py-1 hover:bg-primary/20 rounded capitalize"
                  onClick={() => {
                    addObject(type as any);
                    setAddMenuPosition(null);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
