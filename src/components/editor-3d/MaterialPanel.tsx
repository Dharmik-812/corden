"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { motion } from "framer-motion";

export function MaterialPanel() {
  const { objects, selectedId, updateObject } = useEditor3DStore();
  
  const selectedObj = objects.find(o => o.id === selectedId);

  if (!selectedObj) {
    return (
      <div className="h-full flex flex-col w-full">
        <div className="panel-header">Properties</div>
        <div className="panel-body text-center text-tertiary text-sm">
          No object selected
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="panel-header">
        Properties - {selectedObj.name}
      </div>
      <div className="panel-body flex flex-col gap-md">
        
        {/* Transform Info (Read-only for now, driven by gizmo) */}
        <div>
          <label className="label">Transform</label>
          <div className="grid grid-cols-3 gap-xs">
            <div className="text-xs font-mono text-tertiary text-center">X</div>
            <div className="text-xs font-mono text-tertiary text-center">Y</div>
            <div className="text-xs font-mono text-tertiary text-center">Z</div>
            
            <div className="input input-mono text-center p-1">{selectedObj.position[0].toFixed(2)}</div>
            <div className="input input-mono text-center p-1">{selectedObj.position[1].toFixed(2)}</div>
            <div className="input input-mono text-center p-1">{selectedObj.position[2].toFixed(2)}</div>
          </div>
        </div>

        <div className="divider my-xs" />

        {/* Material */}
        <div>
          <label className="label block mb-md">Material</label>
          
          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base Color</span>
              <input 
                type="color" 
                value={selectedObj.color} 
                onChange={(e) => updateObject(selectedObj.id, { color: e.target.value })}
                className="w-8 h-8 p-0 border rounded cursor-pointer"
              />
            </div>
            
            <div className="flex flex-col gap-xs mt-2">
              <div className="flex justify-between">
                <span className="text-sm">Roughness</span>
                <span className="text-xs font-mono">{selectedObj.roughness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                className="slider" 
                min="0" max="1" step="0.01" 
                value={selectedObj.roughness}
                onChange={(e) => updateObject(selectedObj.id, { roughness: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-xs mt-2">
              <div className="flex justify-between">
                <span className="text-sm">Metalness</span>
                <span className="text-xs font-mono">{selectedObj.metalness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                className="slider" 
                min="0" max="1" step="0.01" 
                value={selectedObj.metalness}
                onChange={(e) => updateObject(selectedObj.id, { metalness: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
