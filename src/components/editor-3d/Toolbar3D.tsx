"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { MousePointer2, Move, RotateCw, Scaling, Crosshair, Wrench, Spline } from "lucide-react";
import { useState } from "react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, active, onClick }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '36px', height: '36px', borderRadius: '4px', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? '#4772b3' : 'transparent',
          color: active ? '#fff' : (hovered ? 'var(--text-primary)' : 'var(--text-secondary)'),
          transition: 'all 0.1s'
        }}
      >
        {icon}
      </button>
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '12px',
          background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)',
          padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', whiteSpace: 'nowrap', zIndex: 100
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

export function Toolbar3D() {
  const { transformMode, setTransformMode } = useEditor3DStore();

  const dividerStyle: React.CSSProperties = {
    width: '24px', height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '4px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%', padding: '4px 0' }}>
      
      <ToolbarButton
        icon={<MousePointer2 size={16} strokeWidth={1.5} />}
        label="Select Box (B)"
        active={false}
        onClick={() => {}}
      />
      
      <ToolbarButton
        icon={<Crosshair size={16} strokeWidth={1.5} />}
        label="Cursor (Shift+RMB)"
        active={false}
        onClick={() => {}}
      />
      
      <div style={dividerStyle} />

      <ToolbarButton
        icon={<Move size={16} strokeWidth={1.5} />}
        label="Move (G)"
        active={transformMode === 'translate'}
        onClick={() => setTransformMode('translate')}
      />
      <ToolbarButton
        icon={<RotateCw size={16} strokeWidth={1.5} />}
        label="Rotate (R)"
        active={transformMode === 'rotate'}
        onClick={() => setTransformMode('rotate')}
      />
      <ToolbarButton
        icon={<Scaling size={16} strokeWidth={1.5} />}
        label="Scale (S)"
        active={transformMode === 'scale'}
        onClick={() => setTransformMode('scale')}
      />

      <div style={dividerStyle} />
      
      <ToolbarButton
        icon={<Spline size={16} strokeWidth={1.5} />}
        label="Annotate"
        active={false}
        onClick={() => {}}
      />
      <ToolbarButton
        icon={<Wrench size={16} strokeWidth={1.5} />}
        label="Measure"
        active={false}
        onClick={() => {}}
      />

    </div>
  );
}
