"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { motion } from "framer-motion";
import { Box, Globe, Cylinder, Triangle, Square } from "lucide-react";

export function SceneOutliner() {
  const { objects, selectedId, setSelectedId } = useEditor3DStore();

  return (
    <div className="h-full flex flex-col w-full">
      <div className="panel-header">
        <span>Outliner</span>
      </div>
      <div className="panel-body p-xs">
        {objects.length === 0 ? (
          <div className="text-tertiary text-sm text-center p-md">
            Scene is empty
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {objects.map((obj) => (
              <div 
                key={obj.id} 
                className={`outliner-item ${selectedId === obj.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(obj.id)}
              >
                <span className="mr-2 opacity-70">
                  {obj.type === 'cube' ? <Box size={14} /> : 
                   obj.type === 'sphere' ? <Globe size={14} /> : 
                   obj.type === 'cylinder' ? <Cylinder size={14} /> : 
                   obj.type === 'cone' ? <Triangle size={14} /> : <Square size={14} />}
                </span>
                <span className="flex-1 truncate">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
