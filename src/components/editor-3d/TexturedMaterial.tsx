"use client";

import { useTexture } from "@react-three/drei";
import { SceneObject } from "@/stores/editor3d-store";
import * as THREE from "three";

export function TexturedMaterial({ obj, isSelected, shadingMode }: { obj: SceneObject, isSelected: boolean, shadingMode: string }) {
  const isWire = shadingMode === 'wireframe' || obj.wireframe;
  const color = shadingMode === 'solid' ? '#b0b0b0' : obj.color;

  if (shadingMode === 'wireframe') {
    return <meshBasicMaterial color={isSelected ? '#ffaa00' : '#888888'} wireframe />;
  }

  if (shadingMode === 'solid') {
    return <meshStandardMaterial color={color} roughness={1} metalness={0} wireframe={obj.wireframe} flatShading={!obj.smoothShading} />;
  }

  // Load textures if available
  const hasTextures = !!obj.map || !!obj.normalMap || !!obj.roughnessMap;
  
  // We can't conditionally call hooks easily inside the same component if they change, 
  // but useTexture can take an array. To avoid hook errors, we'll use a sub-component strategy or 
  // just load all three if any exist, passing a tiny white pixel for missing ones.
  // Actually, standard useTexture expects valid URLs.
  // We will let a dedicated component handle the async load.
  
  if (!hasTextures) {
    return (
      <meshPhysicalMaterial 
        color={color}
        roughness={obj.roughness}
        metalness={obj.metalness}
        emissive={obj.emissive || '#000000'}
        emissiveIntensity={obj.emissiveIntensity || 0}
        transparent={(obj.opacity || 1) < 1}
        opacity={obj.opacity || 1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
        wireframe={obj.wireframe}
        flatShading={!obj.smoothShading}
      />
    );
  }

  return <AsyncMaterial obj={obj} color={color} />;
}

function AsyncMaterial({ obj, color }: { obj: SceneObject, color: string }) {
  // We only call this if we have at least one texture.
  // To avoid hook inconsistencies, we create a stable array of URLs or fallback to empty string (which useTexture might fail on)
  // Better approach: filter out undefined, load them, then apply them.
  // useTexture can take an object mapping.
  
  const textureMap = useTexture({
    ...(obj.map ? { map: obj.map } : {}),
    ...(obj.normalMap ? { normalMap: obj.normalMap } : {}),
    ...(obj.roughnessMap ? { roughnessMap: obj.roughnessMap } : {})
  });

  // Apply color space for albedo
  if (textureMap.map) {
    textureMap.map.colorSpace = THREE.SRGBColorSpace;
  }

  return (
    <meshPhysicalMaterial 
      color={color}
      roughness={obj.roughnessMap ? 1 : obj.roughness} // If map exists, use it fully
      metalness={obj.metalness}
      emissive={obj.emissive || '#000000'}
      emissiveIntensity={obj.emissiveIntensity || 0}
      transparent={(obj.opacity || 1) < 1}
      opacity={obj.opacity || 1}
      clearcoat={1}
      clearcoatRoughness={0.1}
      side={THREE.DoubleSide}
      wireframe={obj.wireframe}
      flatShading={!obj.smoothShading}
      {...textureMap}
    />
  );
}
