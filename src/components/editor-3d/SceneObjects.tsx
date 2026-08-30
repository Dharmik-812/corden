"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useState, useMemo, Suspense } from "react";
import { LightObjects } from "./LightObjects";
import { TexturedMaterial } from "./TexturedMaterial";
import { RigidBody } from "@react-three/rapier";

function CameraObject({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject, transformMode, viewPreset } = useEditor3DStore();
  const isSelected = selectedId === obj.id;
  const meshRef = useRef<THREE.Group>(null);
  const [target, setTarget] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (isSelected && meshRef.current) {
      setTarget(meshRef.current);
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

  // When we are actively looking through this camera, we don't render its frustum box
  const isActiveView = viewPreset === 'camera' && isSelected;

  return (
    <>
      <group
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        userData={{ isExportable: true }}
        onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
      >
        {!isActiveView && (
          <group>
            {/* Main camera box */}
            <mesh>
              <boxGeometry args={[0.4, 0.4, 0.6]} />
              <meshBasicMaterial color={isSelected ? "#ffaa00" : "#aaaaaa"} wireframe />
            </mesh>
            {/* Triangle pointing "up" */}
            <mesh position={[0, 0.3, -0.3]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshBasicMaterial color={isSelected ? "#ffaa00" : "#aaaaaa"} wireframe />
            </mesh>
            {/* Lens */}
            <mesh position={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
              <meshBasicMaterial color={isSelected ? "#ffaa00" : "#aaaaaa"} wireframe />
            </mesh>
          </group>
        )}
      </group>

      {target && !isActiveView && (
        <TransformControls
          object={target}
          mode={transformMode}
          translationSnap={snap ? 1 : null}
          rotationSnap={snap ? Math.PI / 12 : null}
          scaleSnap={snap ? 0.5 : null}
          onMouseUp={() => {
            if (target) {
              updateObject(obj.id, {
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

function ObjectMesh({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject, transformMode, shadingMode, physicsEnabled } = useEditor3DStore();
  const meshRef = useRef<THREE.Group>(null);
  const isSelected = selectedId === obj.id;

  // Geometry
  const geometry = useMemo(() => {
    let base: THREE.BufferGeometry;
    switch (obj.type) {
      case 'cube': base = new THREE.BoxGeometry(1, 1, 1); break;
      case 'sphere': base = new THREE.SphereGeometry(0.5, 32, 32); break;
      case 'cylinder': base = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
      case 'cone': base = new THREE.ConeGeometry(0.5, 1, 32); break;
      case 'plane': base = new THREE.PlaneGeometry(1, 1); break;
      case 'torus': base = new THREE.TorusGeometry(0.5, 0.2, 16, 100); break;
      case 'icosphere': base = new THREE.IcosahedronGeometry(0.5, 1); break;
      default: base = new THREE.BoxGeometry(1, 1, 1); break;
    }

    // Apply geometry-level modifiers
    obj.modifiers.filter(m => m.enabled).forEach(mod => {
      if (mod.type === 'subdivision') {
        // Simulate subdivision by replacing with a higher-poly version of the same primitive
        const levels = Math.max(1, Math.min(4, mod.levels || 1));
        const seg = Math.min(2 + levels * 8, 64);
        switch (obj.type) {
          case 'sphere': base = new THREE.SphereGeometry(0.5, seg, seg); break;
          case 'cylinder': base = new THREE.CylinderGeometry(0.5, 0.5, 1, seg); break;
          case 'cone': base = new THREE.ConeGeometry(0.5, 1, seg); break;
          case 'cube': base = new THREE.BoxGeometry(1, 1, 1, levels, levels, levels); break;
          case 'torus': base = new THREE.TorusGeometry(0.5, 0.2, seg / 2, seg); break;
          case 'icosphere': base = new THREE.IcosahedronGeometry(0.5, levels); break;
          default: base = new THREE.BoxGeometry(1, 1, 1, levels, levels, levels); break;
        }
      } else if (mod.type === 'solidify') {
        const thickness = mod.thickness ?? 0.2;
        const clone = base.clone();
        clone.computeVertexNormals();
        const pos = clone.attributes.position as THREE.BufferAttribute;
        const norm = clone.attributes.normal as THREE.BufferAttribute;
        if (pos && norm) {
          for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(
              i,
              pos.getX(i) + norm.getX(i) * thickness,
              pos.getY(i) + norm.getY(i) * thickness,
              pos.getZ(i) + norm.getZ(i) * thickness
            );
          }
          pos.needsUpdate = true;
        }
        clone.computeVertexNormals();
        base = clone;
      }
    });

    return base;
  }, [obj.type, obj.modifiers]);

  // Edges geometry with proper disposal to prevent memory leaks
  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry);
  }, [geometry]);

  useEffect(() => {
    return () => {
      edgesGeometry.dispose();
    };
  }, [edgesGeometry]);

  const [snap, setSnap] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setSnap(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control') setSnap(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  // Modifiers simulation (basic visual for array/mirror)
  const renderInstances = () => {
    type Instance = { position: THREE.Vector3; scale: THREE.Vector3 };
    let instances: Instance[] = [{ position: new THREE.Vector3(), scale: new THREE.Vector3(1, 1, 1) }];

    obj.modifiers.filter(m => m.enabled).forEach(mod => {
      if (mod.type === 'array') {
        const count = mod.count || 1;
        const newInstances: Instance[] = [];
        for (let i = 0; i < count; i++) {
          instances.forEach(inst => {
            const pos = inst.position.clone().add(new THREE.Vector3((mod.offsetX||0)*i, (mod.offsetY||0)*i, (mod.offsetZ||0)*i));
            newInstances.push({ position: pos, scale: inst.scale.clone() });
          });
        }
        instances = newInstances;
      }
      if (mod.type === 'mirror') {
        const newInstances: Instance[] = [];
        instances.forEach(inst => {
          newInstances.push(inst); // original
          if (mod.mirrorX) {
            newInstances.push({ position: new THREE.Vector3(-inst.position.x, inst.position.y, inst.position.z), scale: new THREE.Vector3(-inst.scale.x, inst.scale.y, inst.scale.z) });
          }
          if (mod.mirrorY) {
            newInstances.push({ position: new THREE.Vector3(inst.position.x, -inst.position.y, inst.position.z), scale: new THREE.Vector3(inst.scale.x, -inst.scale.y, inst.scale.z) });
          }
          if (mod.mirrorZ) {
            newInstances.push({ position: new THREE.Vector3(inst.position.x, inst.position.y, -inst.position.z), scale: new THREE.Vector3(inst.scale.x, inst.scale.y, -inst.scale.z) });
          }
        });
        instances = newInstances;
      }
    });

    const content = (
      <group
        ref={!physicsEnabled ? meshRef : undefined}
        position={!physicsEnabled ? obj.position : [0, 0, 0]}
        rotation={!physicsEnabled ? obj.rotation : [0, 0, 0]}
        scale={obj.scale}
        userData={{ isExportable: true }}
        onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
      >
        {instances.map((inst, i) => (
          <mesh
            key={i}
            geometry={geometry}
            position={inst.position}
            scale={inst.scale}
            castShadow
            receiveShadow
          >
            <Suspense fallback={<meshBasicMaterial color={obj.color} />}>
              <TexturedMaterial obj={obj} isSelected={isSelected && i===0} shadingMode={shadingMode} />
            </Suspense>
          </mesh>
        ))}
        {/* Selection outline — rendered as sibling lineSegments (correct hierarchy) */}
        {isSelected && shadingMode !== 'wireframe' && (
          <lineSegments geometry={edgesGeometry}>
            <lineBasicMaterial color="#ffaa00" linewidth={2} depthTest={false} />
          </lineSegments>
        )}
      </group>
    );

    if (physicsEnabled) {
      const isFixed = obj.type === 'plane' || obj.position[1] <= 0.25;
      return (
        <RigidBody type={isFixed ? 'fixed' : 'dynamic'} colliders="hull" position={obj.position} rotation={obj.rotation}>
          {content}
        </RigidBody>
      );
    }

    return content;
  };

  const [target, setTarget] = useState<THREE.Group | null>(null);

  // FIX: Removed shadingMode from deps — it caused TransformControls to unmount/remount on every shading change
  useEffect(() => {
    if (isSelected && meshRef.current) {
      setTarget(meshRef.current);
    } else {
      setTarget(null);
    }
  }, [isSelected, obj.type]);

  return (
    <>
      {renderInstances()}
      {/* FIX: Don't attach TransformControls in physics mode — position sync breaks */}
      {target && !physicsEnabled && (
        <TransformControls
          object={target}
          mode={transformMode}
          translationSnap={snap ? 1 : null}
          rotationSnap={snap ? Math.PI / 12 : null}
          scaleSnap={snap ? 0.5 : null}
          onMouseUp={() => {
            if (target) {
              updateObject(obj.id, {
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

export function SceneObjects() {
  const { objects, setSelectedId } = useEditor3DStore();
  // FIX: Use reactive hook instead of getState() so this re-renders when physicsEnabled changes
  const physicsEnabled = useEditor3DStore(s => s.physicsEnabled);

  const meshes = objects.filter(o => o.objectType === 'mesh' && o.visible && !o.hidden);
  const cameras = objects.filter(o => o.objectType === 'camera' && o.visible && !o.hidden);

  return (
    <group onPointerMissed={() => setSelectedId(null)}>
      {/* Invisible floor for physics so things don't fall forever if there's no ground plane */}
      {physicsEnabled && (
        <RigidBody type="fixed" position={[0, -0.5, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[100, 1, 100]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      )}
      {meshes.map(obj => (
        <ObjectMesh key={obj.id} obj={obj} />
      ))}
      {cameras.map(obj => (
        <CameraObject key={obj.id} obj={obj} />
      ))}
      <LightObjects />
    </group>
  );
}
