"use client";

import { useEditor3DStore, PrimitiveType } from "@/stores/editor3d-store";
import { Box, Globe, Cylinder, Triangle, Square, Move, RotateCw, Maximize2, MousePointer2 } from "lucide-react";

export function Toolbar3D() {
  const { transformMode, setTransformMode } = useEditor3DStore();

  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} strokeWidth={1.5} />, label: 'Select (Box)' },
    { id: 'translate', icon: <Move size={20} strokeWidth={1.5} />, label: 'Move (G)' },
    { id: 'rotate', icon: <RotateCw size={20} strokeWidth={1.5} />, label: 'Rotate (R)' },
    { id: 'scale', icon: <Maximize2 size={20} strokeWidth={1.5} />, label: 'Scale (S)' },
  ];

  return (
    <div className="flex flex-col w-full items-center gap-2 mt-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors relative group ${
            transformMode === tool.id || (tool.id === 'select' && transformMode === 'translate') /* simplified */
              ? "bg-primary text-white"
              : "text-secondary hover:bg-secondary/20 hover:text-white"
          }`}
          onClick={() => {
            if (tool.id !== 'select') setTransformMode(tool.id as any);
          }}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
