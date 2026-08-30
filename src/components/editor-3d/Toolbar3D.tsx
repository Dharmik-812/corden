"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import {
  MousePointer2, Move, RotateCw, Scaling, Crosshair,
  Wrench, Spline, ArrowUp, ArrowDown, LayoutGrid,
  Pencil,
} from "lucide-react";
import { useState } from "react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
  accentColor?: string;
}

function ToolbarButton({ icon, label, shortcut, active, onClick, accentColor = '#4772b3' }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          width: '36px', height: '34px', borderRadius: '6px', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? `${accentColor}44` : hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
          color: active ? accentColor : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
          transition: 'all 0.12s',
          outline: 'none',
          boxShadow: active ? `inset 0 0 0 1px ${accentColor}66` : 'none',
        }}
      >
        {icon}
      </button>
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)',
          background: '#0f1115', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', padding: '5px 10px', borderRadius: '6px',
          fontSize: '0.68rem', whiteSpace: 'nowrap', zIndex: 200,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '1px',
          pointerEvents: 'none',
        }}>
          <span style={{ fontWeight: 600 }}>{label}</span>
          {shortcut && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="toolbar3d-divider" style={{ width: '26px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '3px 0', flexShrink: 0 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
      marginTop: '6px', marginBottom: '1px', userSelect: 'none',
    }}>
      {label}
    </span>
  );
}

export function Toolbar3D() {
  const { transformMode, setTransformMode, selectionMode, selectedId, addModifier } = useEditor3DStore();

  const handleExtrude = () => {
    if (selectedId) addModifier(selectedId, 'solidify', { thickness: 0.15 });
  };

  const handleInset = () => {
    if (selectedId) addModifier(selectedId, 'solidify', { thickness: -0.1 });
  };

  const handleSubdivide = () => {
    if (selectedId) addModifier(selectedId, 'subdivision', { levels: 1 });
  };

  if (selectionMode === 'edit') {
    return (
      <div className="toolbar3d-wrapper" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2px', width: '100%', padding: '8px 6px',
      }}>
        {/* Edit mode header */}
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          background: 'linear-gradient(90deg, #ffb400, #ff8c00)',
          marginBottom: '6px', flexShrink: 0,
        }} />

        <SectionLabel label="Ops" />
        <ToolbarButton
          icon={<ArrowUp size={15} strokeWidth={2} />}
          label="Extrude Region"
          shortcut="E"
          active={false}
          onClick={handleExtrude}
          accentColor="#ffb400"
        />
        <ToolbarButton
          icon={<ArrowDown size={15} strokeWidth={2} />}
          label="Inset Faces"
          shortcut="I"
          active={false}
          onClick={handleInset}
          accentColor="#ff6b6b"
        />
        <Divider />
        <SectionLabel label="Mesh" />
        <ToolbarButton
          icon={<LayoutGrid size={15} strokeWidth={1.5} />}
          label="Subdivide"
          active={false}
          onClick={handleSubdivide}
          accentColor="#6bffc0"
        />
      </div>
    );
  }

  return (
    <div className="toolbar3d-wrapper" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '2px', width: '100%', padding: '8px 6px',
    }}>
      <SectionLabel label="Sel" />
      <ToolbarButton
        icon={<MousePointer2 size={15} strokeWidth={1.5} />}
        label="Select Box"
        shortcut="B"
        active={useEditor3DStore.getState().interactionMode === 'select'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('select')}
      />
      <ToolbarButton
        icon={<Crosshair size={15} strokeWidth={1.5} />}
        label="3D Cursor"
        shortcut="Shift+RMB"
        active={useEditor3DStore.getState().interactionMode === 'cursor'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('cursor')}
      />
      <Divider />
      <SectionLabel label="Trans" />
      <ToolbarButton
        icon={<Move size={15} strokeWidth={1.5} />}
        label="Move"
        shortcut="G"
        active={transformMode === 'translate'}
        onClick={() => setTransformMode('translate')}
      />
      <ToolbarButton
        icon={<RotateCw size={15} strokeWidth={1.5} />}
        label="Rotate"
        shortcut="R"
        active={transformMode === 'rotate'}
        onClick={() => setTransformMode('rotate')}
      />
      <ToolbarButton
        icon={<Scaling size={15} strokeWidth={1.5} />}
        label="Scale"
        shortcut="S"
        active={transformMode === 'scale'}
        onClick={() => setTransformMode('scale')}
      />
      <Divider />
      <SectionLabel label="Tools" />
      <ToolbarButton
        icon={<Spline size={15} strokeWidth={1.5} />}
        label="Annotate"
        active={useEditor3DStore.getState().interactionMode === 'annotate'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('annotate')}
      />
      <ToolbarButton
        icon={<Wrench size={15} strokeWidth={1.5} />}
        label="Measure"
        active={useEditor3DStore.getState().interactionMode === 'measure'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('measure')}
      />
    </div>
  );
}
