"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { SceneObjects } from "./SceneObjects";
import { useEditor3DStore } from "@/stores/editor3d-store";
import { useEffect, Suspense } from "react";

export function Viewport3D() {
  const { setTransformMode, removeObject, selectedId } = useEditor3DStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'g':
          setTransformMode('translate');
          break;
        case 'r':
          setTransformMode('rotate');
          break;
        case 's':
          setTransformMode('scale');
          break;
        case 'x':
        case 'delete':
          if (selectedId) removeObject(selectedId);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTransformMode, removeObject, selectedId]);

  return (
    <div className="editor-canvas w-full h-full" style={{ background: 'var(--bg-canvas)' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        
        {/* Lighting for dark theme */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -10]} color="#8E54E9" intensity={0.3} />
        
        {/* Environment map for nice metallic reflections */}
        <Environment preset="city" />

        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          sectionColor={'#4A90E2'} 
          cellColor={'rgba(255,255,255,0.04)'}
          sectionSize={1}
          cellSize={0.2}
          position={[0, -0.01, 0]}
        />

        <Suspense fallback={null}>
          <SceneObjects />
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
      
      {/* Viewport Overlay hints */}
      <div className="absolute bottom-4 left-4 font-mono text-xs text-tertiary">
        G: Grab &nbsp;|&nbsp; R: Rotate &nbsp;|&nbsp; S: Scale &nbsp;|&nbsp; X: Delete
      </div>
    </div>
  );
}
