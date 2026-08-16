"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { SceneObjects } from "./SceneObjects";
import { useEditor3DStore } from "@/stores/editor3d-store";
import { useEffect, useRef, Suspense } from "react";
import * as THREE from "three";

function CameraController() {
  const { camera, gl } = useThree();
  const { viewPreset, isOrtho, objects, selectedId } = useEditor3DStore();
  const prevPreset = useRef(viewPreset);

  // Find an active camera from scene objects
  const sceneCamera = objects.find(o => o.objectType === 'camera' && o.id === selectedId) || objects.find(o => o.objectType === 'camera');

  useEffect(() => {
    if (viewPreset === prevPreset.current && viewPreset !== 'camera' && viewPreset !== 'perspective') return;
    prevPreset.current = viewPreset;
    const dist = 8;
    
    if (viewPreset === 'camera' && sceneCamera) {
      camera.position.set(sceneCamera.position[0], sceneCamera.position[1], sceneCamera.position[2]);
      camera.rotation.set(sceneCamera.rotation[0], sceneCamera.rotation[1], sceneCamera.rotation[2]);
      if (camera instanceof THREE.PerspectiveCamera && sceneCamera.fov) {
        camera.fov = sceneCamera.fov;
        camera.updateProjectionMatrix();
      }
      return; // Skip lookAt to keep exact rotation
    }

    switch (viewPreset) {
      case 'front':    camera.position.set(0, 0, dist); break;
      case 'back':     camera.position.set(0, 0, -dist); break;
      case 'right':    camera.position.set(dist, 0, 0); break;
      case 'left':     camera.position.set(-dist, 0, 0); break;
      case 'top':      camera.position.set(0, dist, 0); break;
      case 'bottom':   camera.position.set(0, -dist, 0); break;
      case 'perspective': camera.position.set(5, 5, 5); break;
      case 'camera': // Fallback if no camera found
        camera.position.set(5, 5, 5); break;
    }
    camera.lookAt(0, 0, 0);
  }, [viewPreset, camera, sceneCamera]);

  return null;
}

function AnimationPlayer() {
  const { isPlaying, currentFrame, totalFrames, fps, setCurrentFrame, setIsPlaying, objects, updateObject } = useEditor3DStore();
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    accRef.current += delta;
    const frameDuration = 1 / fps;
    if (accRef.current >= frameDuration) {
      accRef.current -= frameDuration;
      const nextFrame = currentFrame >= totalFrames ? 1 : currentFrame + 1;
      setCurrentFrame(nextFrame);
      // Apply keyframes
      objects.forEach(obj => {
        const kfs = obj.keyframes;
        if (kfs.length < 2) return;
        const before = [...kfs].reverse().find(k => k.frame <= nextFrame);
        const after = kfs.find(k => k.frame >= nextFrame);
        if (!before || !after || before === after) return;
        const t = (nextFrame - before.frame) / (after.frame - before.frame);
        const lerp = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];
        const updates: any = {};
        if (before.position && after.position) updates.position = lerp(before.position, after.position);
        if (before.rotation && after.rotation) updates.rotation = lerp(before.rotation, after.rotation);
        if (before.scale && after.scale) updates.scale = lerp(before.scale, after.scale);
        if (Object.keys(updates).length > 0) updateObject(obj.id, updates);
      });
    }
  });
  return null;
}

function Cursor3DMarker() {
  const { cursor3D } = useEditor3DStore();
  return (
    <group position={cursor3D}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Cross hair lines */}
      {[
        [[0.2, 0, 0], [0, 0, 0]], [[-0.2, 0, 0], [0, 0, 0]],
        [[0, 0.2, 0], [0, 0, 0]], [[0, -0.2, 0], [0, 0, 0]],
        [[0, 0, 0.2], [0, 0, 0]], [[0, 0, -0.2], [0, 0, 0]],
      ].map(([start, end], i) => {
        const points = [new THREE.Vector3(...start as [number,number,number]), new THREE.Vector3(...end as [number,number,number])];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geom}>
            <lineBasicMaterial color="#ff6600" linewidth={2} />
          </line>
        );
      })}
    </group>
  );
}

export function Viewport3D() {
  const {
    setTransformMode, removeObject, selectedId, shadingMode, environmentPreset,
    showGrid, toggleGrid, setShowShaderPie, duplicateObject,
    undo, redo, hideObject, unhideAll, addObject, addMenuPosition, setAddMenuPosition,
    setViewPreset, isOrtho, setIsOrtho, showNPanel, setShowNPanel,
    showLeftPanel, setShowLeftPanel, showRightPanel, setShowRightPanel,
    showTimeline, setShowTimeline, addKeyframe, setIsPlaying, isPlaying,
    selectionMode, setSelectionMode, commitHistory, setAddMenuPosition: setMenu,
    showAxes, viewPreset,
  } = useEditor3DStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const k = e.key.toLowerCase();

      // Prevent browser shortcuts from stealing
      if ((e.ctrlKey || e.metaKey)) {
        switch (k) {
          case 'z': e.preventDefault(); undo(); return;
          case 'y': e.preventDefault(); redo(); return;
          case 'd': e.preventDefault(); if (selectedId) duplicateObject(selectedId); return;
        }
      }

      switch (k) {
        case 'g': setTransformMode('translate'); break;
        case 'r': setTransformMode('rotate'); break;
        case 's': if (!e.shiftKey) setTransformMode('scale'); break;
        case 'x': case 'delete':
          if (selectedId) removeObject(selectedId); break;
        case 'h':
          if (e.altKey) unhideAll();
          else if (selectedId) hideObject(selectedId);
          break;
        case 'z': setShowShaderPie(true); break;
        case 't': setShowLeftPanel(!useEditor3DStore.getState().showLeftPanel); break;
        case 'n': setShowNPanel(!useEditor3DStore.getState().showNPanel); break;
        case 'i':
          if (selectedId) addKeyframe(selectedId); break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!useEditor3DStore.getState().isPlaying);
          break;
        case 'tab':
          e.preventDefault();
          const cur = useEditor3DStore.getState().selectionMode;
          setSelectionMode(cur === 'object' ? 'edit' : 'object');
          break;
      }

      // Numpad shortcuts (via numeric keys with Shift as workaround)
      if (e.code === 'Numpad1') setViewPreset(e.ctrlKey ? 'back' : 'front');
      if (e.code === 'Numpad3') setViewPreset(e.ctrlKey ? 'left' : 'right');
      if (e.code === 'Numpad7') setViewPreset(e.ctrlKey ? 'bottom' : 'top');
      if (e.code === 'Numpad5') setIsOrtho(!useEditor3DStore.getState().isOrtho);
      if (e.code === 'Numpad0') setViewPreset('camera');

      if (e.shiftKey && k === 'a') {
        e.preventDefault();
        setAddMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
      if (k === 'escape') {
        setAddMenuPosition(null);
        setShowShaderPie(false);
      }

      // Alt+G/R/S: clear transforms
      if (e.altKey) {
        const sel = useEditor3DStore.getState().selectedId;
        if (!sel) return;
        if (k === 'g') useEditor3DStore.getState().updateObject(sel, { position: [0, 0, 0] });
        if (k === 'r') useEditor3DStore.getState().updateObject(sel, { rotation: [0, 0, 0] });
        if (k === 's') useEditor3DStore.getState().updateObject(sel, { scale: [1, 1, 1] });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z') {
        // small delay so pie can be activated
        setTimeout(() => useEditor3DStore.getState().setShowShaderPie(false), 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId]);

  const isWireframe = shadingMode === 'wireframe';
  const showEnv = shadingMode === 'material' || shadingMode === 'rendered';

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative', background: shadingMode === 'rendered' ? '#050505' : '#1a1a1f' }}
    >
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 45, near: 0.01, far: 1000 }}
        gl={{ antialias: true, toneMapping: shadingMode === 'rendered' ? THREE.ACESFilmicToneMapping : THREE.LinearToneMapping, toneMappingExposure: 1 }}
        onContextMenu={(e) => {
          // Right-click sets 3D cursor (simplified — world pos would need raycasting)
          e.preventDefault();
        }}
      >
        <CameraController />
        <AnimationPlayer />

        {/* Lighting */}
        {shadingMode === 'solid' && (
          <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
          </>
        )}
        {shadingMode === 'wireframe' && <ambientLight intensity={1} />}
        {(shadingMode === 'material' || shadingMode === 'rendered') && (
          <>
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
          </>
        )}

        {/* Environment */}
        {showEnv && (
          <Suspense fallback={null}>
            <Environment preset={environmentPreset} background={shadingMode === 'rendered'} />
          </Suspense>
        )}

        {/* Grid */}
        {showGrid && (
          <Grid
            infiniteGrid
            fadeDistance={60}
            sectionColor={isWireframe ? '#3a3a4a' : '#4A90E2'}
            cellColor={isWireframe ? '#2a2a3a' : 'rgba(255,255,255,0.05)'}
            sectionSize={1}
            cellSize={0.2}
            position={[0, -0.001, 0]}
          />
        )}

        {/* Scene objects */}
        <Suspense fallback={null}>
          <SceneObjects />
        </Suspense>

        {/* 3D Cursor */}
        <Cursor3DMarker />

        {/* Orbit controls */}
        <OrbitControls
          makeDefault
          enablePan={viewPreset !== 'camera'}
          enableZoom={viewPreset !== 'camera'}
          enableRotate={viewPreset !== 'camera'}
        />

        {/* Navigation gizmo */}
        <GizmoHelper alignment="top-right" margin={[72, 72]}>
          <GizmoViewport
            axisColors={['#e05050', '#50e050', '#5080e0']}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>

      {/* Viewport HUD — shading mode selector */}
      <div style={{
        position: 'absolute', top: '8px', right: '90px',
        display: 'flex', gap: '4px', zIndex: 30,
      }}>
        {(['solid', 'wireframe', 'material', 'rendered'] as const).map((mode) => {
          const icons = { solid: '●', wireframe: '⊡', material: '◈', rendered: '◉' };
          const labels = { solid: 'Solid', wireframe: 'Wireframe', material: 'Material Preview', rendered: 'Rendered' };
          const isActive = shadingMode === mode;
          return (
            <button
              key={mode}
              title={labels[mode]}
              onClick={() => useEditor3DStore.getState().setShadingMode(mode)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(10px)',
                transition: 'all 0.15s',
              }}
            >
              {icons[mode]}
            </button>
          );
        })}
      </div>

      {/* View mode indicator + keyboard hint */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '16px',
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)',
        userSelect: 'none', pointerEvents: 'none', lineHeight: 1.8,
      }}>
        <div>G: Grab | R: Rotate | S: Scale | Alt+G/R/S: Clear</div>
        <div>X/Del: Delete | Shift+D: Duplicate | H: Hide | Alt+H: Show All</div>
        <div>Shift+A: Add | Z: Shading | Tab: Edit Mode | I: Keyframe | Space: Play</div>
        <div>Numpad 1/3/7: Front/Right/Top | Numpad 5: Ortho/Persp</div>
      </div>
    </div>
  );
}
