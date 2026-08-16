"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";

export function LightObjects() {
  const { objects, selectedId, transformMode, updateObject, shadingMode } = useEditor3DStore();
  const lights = objects.filter(o => o.objectType === 'light');

  // We only show helper gizmos if we are not in rendered mode, or if selected
  const showGizmos = shadingMode !== 'rendered';

  return (
    <>
      {lights.map(light => (
        <LightObject key={light.id} light={light} showGizmos={showGizmos} selectedId={selectedId} transformMode={transformMode} updateObject={updateObject} />
      ))}
    </>
  );
}

function LightObject({ light, showGizmos, selectedId, transformMode, updateObject }: any) {
  const isSelected = selectedId === light.id;
  const groupRef = useRef<THREE.Group>(null);
  const [target, setTarget] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (isSelected && groupRef.current) {
      setTarget(groupRef.current);
    } else {
      setTarget(null);
    }
  }, [isSelected]);

  const [snap, setSnap] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setSnap(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control') setSnap(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  const color = new THREE.Color(light.lightColor);

  return (
    <>
      <group 
        ref={groupRef}
        position={light.position}
        rotation={light.rotation}
        scale={light.scale}
        onClick={(e) => { e.stopPropagation(); useEditor3DStore.getState().setSelectedId(light.id); }}
      >
        {/* The actual light */}
        {light.lightType === 'point' && (
          <pointLight 
            color={color} 
            intensity={light.lightIntensity} 
            distance={light.lightDistance} 
            castShadow 
          />
        )}
        {light.lightType === 'sun' && (
          <directionalLight 
            color={color} 
            intensity={light.lightIntensity} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
          />
        )}
        {light.lightType === 'spot' && (
          <spotLight 
            color={color} 
            intensity={light.lightIntensity} 
            distance={light.lightDistance} 
            angle={light.lightAngle} 
            penumbra={light.lightPenumbra} 
            castShadow 
          />
        )}
        {light.lightType === 'area' && (
          <rectAreaLight 
            color={color} 
            intensity={light.lightIntensity} 
            width={light.scale[0]} 
            height={light.scale[1]} 
          />
        )}

        {/* The helper gizmo (always rendered but visible depends on mode/selection) */}
        {(showGizmos || isSelected) && (
          <mesh>
            {light.lightType === 'sun' ? (
              <sphereGeometry args={[0.2, 16, 16]} />
            ) : light.lightType === 'spot' ? (
              <coneGeometry args={[0.2, 0.4, 16]} />
            ) : light.lightType === 'area' ? (
              <planeGeometry args={[1, 1]} />
            ) : (
              <octahedronGeometry args={[0.15, 0]} />
            )}
            <meshBasicMaterial color={isSelected ? "#ffaa00" : light.lightColor} wireframe={!isSelected} />
            
            {/* Draw a dashed line pointing down for sun/spot to show direction */}
            {(light.lightType === 'sun' || light.lightType === 'spot') && (
              <lineSegments>
                <lineBasicMaterial color={isSelected ? "#ffaa00" : "#aaaaaa"} />
                <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-2)])} />
              </lineSegments>
            )}
          </mesh>
        )}
      </group>

      {/* Transform controls if selected */}
      {target && (
        <TransformControls 
          object={target}
          mode={transformMode}
          translationSnap={snap ? 1 : null}
          rotationSnap={snap ? Math.PI / 12 : null}
          scaleSnap={snap ? 0.5 : null}
          onMouseUp={() => {
            if (target) {
              updateObject(light.id, {
                position: target.position.toArray(),
                rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
                scale: target.scale.toArray(),
              });
            }
          }}
        />
      )}
    </>
  );
}
