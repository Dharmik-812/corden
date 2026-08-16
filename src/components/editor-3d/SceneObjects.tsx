"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { TransformControls, OrbitControls, Grid } from "@react-three/drei";
import { Geometry, Base, Subtraction, Addition, Intersection } from "@react-three/csg";
import * as THREE from "three";
import { useRef, useEffect } from "react";

function ObjectMesh({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject, transformMode } = useEditor3DStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const isSelected = selectedId === obj.id;

  const GeometryComponent = () => {
    switch (obj.type) {
      case 'cube': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'plane': return <planeGeometry args={[1, 1]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const MaterialComponent = () => (
    <meshStandardMaterial 
      color={obj.color} 
      roughness={obj.roughness} 
      metalness={obj.metalness}
      side={THREE.DoubleSide}
    />
  );

  const renderMesh = () => {
    if (obj.isBoolean && obj.booleanChildren?.length) {
      return (
        <mesh 
          ref={meshRef}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
          castShadow
          receiveShadow
        >
          <Geometry>
            <Base>
              <GeometryComponent />
            </Base>
            {obj.booleanChildren.map((child, i) => {
              const ChildGeom = () => {
                switch (child.type) {
                  case 'cube': return <boxGeometry args={[1, 1, 1]} />;
                  case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
                  case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
                  case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
                  case 'plane': return <planeGeometry args={[1, 1]} />;
                  default: return <boxGeometry args={[1, 1, 1]} />;
                }
              };

              const props = {
                position: child.position,
                rotation: child.rotation,
                scale: child.scale,
              };

              if (child.booleanOperation === 'subtract') {
                return <Subtraction key={i} {...props}><ChildGeom /></Subtraction>;
              } else if (child.booleanOperation === 'intersect') {
                return <Intersection key={i} {...props}><ChildGeom /></Intersection>;
              } else {
                return <Addition key={i} {...props}><ChildGeom /></Addition>;
              }
            })}
          </Geometry>
          <MaterialComponent />
        </mesh>
      );
    }

    return (
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
        castShadow
        receiveShadow
      >
        <GeometryComponent />
        <MaterialComponent />
      </mesh>
    );
  };

  // If not selected, just render the mesh
  if (!isSelected) {
    return renderMesh();
  }

  // If selected, wrap in TransformControls
  return (
    <TransformControls 
      mode={transformMode}
      onMouseUp={() => {
        if (meshRef.current) {
          updateObject(obj.id, {
            position: meshRef.current.position.toArray(),
            rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
            scale: meshRef.current.scale.toArray(),
          });
        }
      }}
    >
      {renderMesh()}
    </TransformControls>
  );
}

export function SceneObjects() {
  const { objects, setSelectedId } = useEditor3DStore();

  return (
    <group onPointerMissed={() => setSelectedId(null)}>
      {objects.map(obj => (
        <ObjectMesh key={obj.id} obj={obj} />
      ))}
    </group>
  );
}
