"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport, Line, Text } from "@react-three/drei";
import { SceneObjects } from "./SceneObjects";
import { useEditor3DStore } from "@/stores/editor3d-store";
import { useEffect, useRef, Suspense } from "react";
import * as THREE from "three";
import { GLTFExporter, OBJExporter } from "three-stdlib";
import { EffectComposer, Bloom, SSAO, DepthOfField, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Physics } from "@react-three/rapier";

function CameraController() {
  const { camera } = useThree();
  const { viewPreset, objects, selectedId } = useEditor3DStore();
  const prevPreset = useRef(viewPreset);

  // Find an active camera from scene objects
  const sceneCamera = objects.find(o => o.objectType === 'camera' && o.id === selectedId) || objects.find(o => o.objectType === 'camera');

   
  useEffect(() => {
    // FIX: only skip if preset hasn't changed AND it's not a camera/perspective transition
    if (viewPreset === prevPreset.current && viewPreset !== 'camera') return;
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
  const { isPlaying, currentFrame, totalFrames, fps, setCurrentFrame, objects, updateObject } = useEditor3DStore();
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
        const updates: Record<string, unknown> = {};
        if (before.position && after.position) updates.position = lerp(before.position, after.position);
        if (before.rotation && after.rotation) updates.rotation = lerp(before.rotation, after.rotation);
        if (before.scale && after.scale) updates.scale = lerp(before.scale, after.scale);
        if (Object.keys(updates).length > 0) updateObject(obj.id, updates);
      });
    }
  });
  return null;
}

// FIX: Use drei's <Line> for cursor marker segments to avoid Three.js object leaks in render
function Cursor3DMarker() {
  const { cursor3D } = useEditor3DStore();
  const axisSegments: Array<[[number,number,number],[number,number,number]]> = [
    [[0.22, 0, 0], [0, 0, 0]],
    [[-0.22, 0, 0], [0, 0, 0]],
    [[0, 0.22, 0], [0, 0, 0]],
    [[0, -0.22, 0], [0, 0, 0]],
    [[0, 0, 0.22], [0, 0, 0]],
    [[0, 0, -0.22], [0, 0, 0]],
  ];
  const colors = ['#e05050', '#e05050', '#50e050', '#50e050', '#5080e0', '#5080e0'];

  return (
    <group position={cursor3D}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {axisSegments.map(([start, end], i) => (
        <Line
          key={i}
          points={[start, end]}
          color={colors[i]}
          lineWidth={2}
        />
      ))}
    </group>
  );
}

function GLTFExporterComponent() {
  const { scene } = useThree();

  useEffect(() => {
    const handleExport = () => {
      const exporter = new GLTFExporter();
      const exportScene = new THREE.Scene();

      // Only export objects we tagged as exportable
      scene.traverse((child) => {
        if (child.userData.isExportable) {
          exportScene.add(child.clone());
        }
      });

      exporter.parse(
        exportScene,
        (gltf) => {
          const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'corden-scene.gltf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        (error) => {
          console.error("GLTF Export failed", error);
        },
        { onlyVisible: true, trs: true }
      );
    };

    window.addEventListener('export-gltf', handleExport as EventListener);
    return () => window.removeEventListener('export-gltf', handleExport as EventListener);
  }, [scene]);

  return null;
}

function OBJExporterComponent() {
  const { scene } = useThree();

  useEffect(() => {
    const handleExport = () => {
      const exporter = new OBJExporter();
      const exportScene = new THREE.Scene();

      scene.traverse((child) => {
        if (child.userData.isExportable) {
          exportScene.add(child.clone());
        }
      });

      const result = exporter.parse(exportScene);
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'corden-scene.obj';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    window.addEventListener('export-obj', handleExport as EventListener);
    return () => window.removeEventListener('export-obj', handleExport as EventListener);
  }, [scene]);

  return null;
}

function RenderExporterComponent() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const handleRender = () => {
      gl.render(scene, camera);
      const dataURL = gl.domElement.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'corden-render.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener('render-image', handleRender as EventListener);
    return () => window.removeEventListener('render-image', handleRender as EventListener);
  }, [gl, scene, camera]);

  return null;
}

function InteractionController() {
  const { camera, raycaster, scene, gl } = useThree();
  const isDrawingRef = useRef(false);
  const currentIdRef = useRef('');

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const store = useEditor3DStore.getState();
      if (store.interactionMode === 'select') return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObjects(scene.children, true).filter(i => i.object.userData.isExportable);
      let point = new THREE.Vector3();

      if (intersects.length > 0) {
        point = intersects[0].point;
      } else {
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        raycaster.ray.intersectPlane(plane, point);
      }

      if (!point) return;

      if (store.interactionMode === 'cursor') {
        store.setCursor3D([point.x, point.y, point.z]);
      } else if (store.interactionMode === 'annotate') {
        isDrawingRef.current = true;
        currentIdRef.current = Math.random().toString();
        store.setAnnotations([...store.annotations, { id: currentIdRef.current, points: [[point.x, point.y, point.z]] }]);
      } else if (store.interactionMode === 'measure') {
        isDrawingRef.current = true;
        currentIdRef.current = Math.random().toString();
        store.setMeasurements([...store.measurements, { id: currentIdRef.current, start: [point.x, point.y, point.z], end: null }]);
      }
    };

    // FIX: attach pointermove to canvas element, not window — prevents drawing continuing after leaving canvas
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      const store = useEditor3DStore.getState();
      if (store.interactionMode === 'select' || store.interactionMode === 'cursor') return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObjects(scene.children, true).filter(i => i.object.userData.isExportable);
      let point = new THREE.Vector3();

      if (intersects.length > 0) {
        point = intersects[0].point;
      } else {
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        raycaster.ray.intersectPlane(plane, point);
      }

      if (!point) return;

      if (store.interactionMode === 'annotate') {
        const ann = [...store.annotations];
        const idx = ann.findIndex(a => a.id === currentIdRef.current);
        if (idx !== -1) {
          ann[idx] = { ...ann[idx], points: [...ann[idx].points, [point.x, point.y, point.z]] };
          store.setAnnotations(ann);
        }
      } else if (store.interactionMode === 'measure') {
        const meas = [...store.measurements];
        const idx = meas.findIndex(m => m.id === currentIdRef.current);
        if (idx !== -1) {
          meas[idx] = { ...meas[idx], end: [point.x, point.y, point.z] };
          store.setMeasurements(meas);
        }
      }
    };

    const handlePointerUp = () => {
      isDrawingRef.current = false;
    };

    gl.domElement.addEventListener('pointerdown', handlePointerDown);
    gl.domElement.addEventListener('pointermove', handlePointerMove);
    gl.domElement.addEventListener('pointerup', handlePointerUp);
    gl.domElement.addEventListener('pointerleave', handlePointerUp);

    return () => {
      gl.domElement.removeEventListener('pointerdown', handlePointerDown);
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      gl.domElement.removeEventListener('pointerup', handlePointerUp);
      gl.domElement.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [camera, raycaster, scene, gl]);

  const annotations = useEditor3DStore(s => s.annotations);
  const measurements = useEditor3DStore(s => s.measurements);

  return (
    <>
      {annotations.map(a => (
        a.points.length > 1 && <Line key={a.id} points={a.points} color="#ff3366" lineWidth={3} />
      ))}
      {measurements.map(m => {
        if (!m.end) return null;
        const start = new THREE.Vector3(...m.start);
        const end = new THREE.Vector3(...m.end);
        const dist = start.distanceTo(end).toFixed(2);
        const mid = start.clone().lerp(end, 0.5);
        return (
          <group key={m.id}>
            <Line points={[m.start, m.end]} color="#33ccff" lineWidth={2} dashed dashSize={0.1} gapSize={0.1} />
            <Text position={mid} color="#33ccff" fontSize={0.2} anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000">
              {dist}m
            </Text>
          </group>
        );
      })}
    </>
  );
}

const SHADING_MODES = ['solid', 'wireframe', 'material', 'rendered'] as const;
const SHADING_ICONS: Record<string, string> = { solid: '●', wireframe: '⊡', material: '◈', rendered: '◉' };
const SHADING_LABELS: Record<string, string> = { solid: 'Solid', wireframe: 'Wireframe', material: 'Material Preview', rendered: 'Rendered' };

export function Viewport3D() {
  const {
    shadingMode, environmentPreset,
    showGrid,
    selectionMode,
    viewPreset, postFX, physicsEnabled
  } = useEditor3DStore();

  // FIX: Access all store functions via getState() inside handlers to avoid stale closures.
  // Only re-add listener when selectedId changes (needed for delete/hide/duplicate which depend on it).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useEditor3DStore.getState();
      const k = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) {
        switch (k) {
          case 'z': e.preventDefault(); store.undo(); return;
          case 'y': e.preventDefault(); store.redo(); return;
          case 'd': e.preventDefault(); if (store.selectedId) store.duplicateObject(store.selectedId); return;
          case 's': e.preventDefault(); return; // handled by save hook
        }
      }

      switch (k) {
        case 'g': store.setTransformMode('translate'); break;
        case 'r': store.setTransformMode('rotate'); break;
        case 's': if (!e.shiftKey) store.setTransformMode('scale'); break;
        case 'e':
          if (store.selectionMode === 'edit' && store.selectedId) {
            store.addModifier(store.selectedId, 'solidify', { thickness: 0.1 });
          }
          break;
        case 'i':
          if (store.selectionMode === 'edit' && store.selectedId) {
            store.addModifier(store.selectedId, 'solidify', { thickness: -0.1 });
          } else if (store.selectedId) {
            store.addKeyframe(store.selectedId);
          }
          break;
        case 'x': case 'delete':
          if (store.selectedId) store.removeObject(store.selectedId); break;
        case 'h':
          if (e.altKey) store.unhideAll();
          else if (store.selectedId) store.hideObject(store.selectedId);
          break;
        case 'z': store.setShowShaderPie(true); break;
        case 't': store.setShowLeftPanel(!store.showLeftPanel); break;
        case 'n': store.setShowNPanel(!store.showNPanel); break;
        case ' ':
          e.preventDefault();
          store.setIsPlaying(!store.isPlaying);
          break;
        case 'tab':
          e.preventDefault();
          store.setSelectionMode(store.selectionMode === 'object' ? 'edit' : 'object');
          break;
      }

      if (e.code === 'Numpad1') store.setViewPreset(e.ctrlKey ? 'back' : 'front');
      if (e.code === 'Numpad3') store.setViewPreset(e.ctrlKey ? 'left' : 'right');
      if (e.code === 'Numpad7') store.setViewPreset(e.ctrlKey ? 'bottom' : 'top');
      if (e.code === 'Numpad5') store.setIsOrtho(!store.isOrtho);
      if (e.code === 'Numpad0') store.setViewPreset('camera');

      if (e.shiftKey && k === 'a') {
        e.preventDefault();
        store.setAddMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
      if (k === 'escape') {
        store.setAddMenuPosition(null);
        store.setShowShaderPie(false);
      }

      if (e.altKey) {
        if (!store.selectedId) return;
        if (k === 'g') store.updateObject(store.selectedId, { position: [0, 0, 0] });
        if (k === 'r') store.updateObject(store.selectedId, { rotation: [0, 0, 0] });
        if (k === 's') store.updateObject(store.selectedId, { scale: [1, 1, 1] });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z') {
        setTimeout(() => useEditor3DStore.getState().setShowShaderPie(false), 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // FIX: Empty deps — all functions accessed via getState() to prevent stale closures

  const isWireframe = shadingMode === 'wireframe';
  const showEnv = shadingMode === 'material' || shadingMode === 'rendered';

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative', background: shadingMode === 'rendered' ? '#060608' : '#13151a' }}
    >
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 45, near: 0.01, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: shadingMode === 'rendered' ? THREE.ACESFilmicToneMapping : THREE.LinearToneMapping, toneMappingExposure: 1 }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <CameraController />
        <AnimationPlayer />
        <GLTFExporterComponent />
        <OBJExporterComponent />
        <RenderExporterComponent />
        <InteractionController />

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
          {physicsEnabled ? (
            <Physics>
              <SceneObjects />
            </Physics>
          ) : (
            <SceneObjects />
          )}
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

        {/* Post-Processing */}
        {postFX.enabled && (
          <EffectComposer multisampling={4}>
            {postFX.bloom.enabled && (
              <Bloom
                intensity={postFX.bloom.intensity}
                luminanceThreshold={postFX.bloom.luminanceThreshold}
                luminanceSmoothing={0.9}
                blendFunction={BlendFunction.SCREEN}
              />
            )}
            {postFX.ssao.enabled && (
              <SSAO
                samples={31}
                radius={postFX.ssao.radius}
                intensity={postFX.ssao.intensity}
                luminanceInfluence={0.5}
              />
            )}
            {postFX.dof.enabled && (
              <DepthOfField
                focusDistance={postFX.dof.focusDistance}
                focalLength={postFX.dof.focalLength}
                bokehScale={postFX.dof.bokehScale}
              />
            )}
            {postFX.chromaticAberration.enabled && (
              <ChromaticAberration
                offset={[postFX.chromaticAberration.offset[0], postFX.chromaticAberration.offset[1]] as any}
              />
            )}
          </EffectComposer>
        )}
      </Canvas>

      {/* Edit Mode Indicator — top center pill */}
      {selectionMode === 'edit' && (
        <div style={{
          position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
          padding: '5px 18px', borderRadius: '100px', zIndex: 30,
          background: 'rgba(20,16,0,0.92)', border: '1px solid rgba(255,180,0,0.5)',
          backdropFilter: 'blur(12px)',
          color: '#ffb400', fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
          fontWeight: 700, letterSpacing: '0.1em', userSelect: 'none',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 0 24px rgba(255,180,0,0.15)',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#ffb400', display: 'inline-block',
            boxShadow: '0 0 8px #ffb400',
          }} />
          EDIT MODE
          <span style={{ color: 'rgba(255,180,0,0.5)', fontWeight: 400, fontSize: '0.62rem' }}>
            E: Extrude &nbsp;·&nbsp; I: Inset &nbsp;·&nbsp; Tab: Exit
          </span>
        </div>
      )}

      {/* Shading mode HUD — top right (improved with labels on hover) */}
      <div style={{
        position: 'absolute', top: '10px', right: '80px',
        display: 'flex', gap: '2px', zIndex: 30,
        background: 'rgba(10,12,16,0.82)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
        padding: '3px',
      }}>
        {SHADING_MODES.map((mode) => {
          const isActive = shadingMode === mode;
          return (
            <button
              key={mode}
              title={SHADING_LABELS[mode]}
              onClick={() => useEditor3DStore.getState().setShadingMode(mode)}
              style={{
                padding: '5px 9px', borderRadius: '5px', border: 'none',
                background: isActive ? 'rgba(71,114,179,0.5)' : 'transparent',
                color: isActive ? '#8bb8ff' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', fontSize: '12px',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
                outline: isActive ? '1px solid rgba(71,114,179,0.4)' : 'none',
              }}
            >
              <span>{SHADING_ICONS[mode]}</span>
              {isActive && (
                <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {SHADING_LABELS[mode].split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcut hint — bottom left */}
      <div style={{
        position: 'absolute', bottom: '10px', left: '14px',
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
        color: 'rgba(255,255,255,0.22)', userSelect: 'none', pointerEvents: 'none',
        lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {selectionMode === 'edit' ? (
          <>
            <div><span style={{ color: 'rgba(255,180,0,0.6)' }}>E</span> Extrude &nbsp; <span style={{ color: 'rgba(255,180,0,0.6)' }}>I</span> Inset &nbsp; <span style={{ color: 'rgba(255,180,0,0.6)' }}>Tab</span> Exit Edit Mode</div>
            <div>G: Grab · R: Rotate · S: Scale</div>
          </>
        ) : (
          <>
            <div>G: Grab · R: Rotate · S: Scale · Alt+G/R/S: Clear</div>
            <div>X/Del: Delete · Ctrl+D: Duplicate · H: Hide · Alt+H: Show All</div>
            <div>Shift+A: Add · Z: Shading · Tab: Edit Mode · I: Keyframe · Space: Play</div>
          </>
        )}
      </div>

      {/* Interaction mode indicator — bottom center */}
      {useEditor3DStore.getState().interactionMode !== 'select' && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          padding: '4px 14px', borderRadius: '100px', zIndex: 30,
          background: 'rgba(10,12,16,0.88)', border: '1px solid rgba(51,204,255,0.35)',
          backdropFilter: 'blur(12px)',
          color: '#33ccff', fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
          fontWeight: 600, letterSpacing: '0.08em', userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {useEditor3DStore.getState().interactionMode.toUpperCase()} MODE
        </div>
      )}
    </div>
  );
}
