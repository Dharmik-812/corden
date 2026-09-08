"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import {
  MousePointer2, Move, RotateCw, Scaling, Crosshair,
  Wrench, Spline, ArrowUp, ArrowDown, LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
  accentColor?: string;
}

function ToolbarButton({ icon, label, shortcut, active, onClick, accentColor = '#6366f1' }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? `${accentColor}25` : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: active ? accentColor : hovered ? '#fff' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          boxShadow: active 
            ? `inset 0 0 0 1px ${accentColor}50, 0 4px 12px ${accentColor}20` 
            : hovered ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: hovered && !active ? 'scale(1.05)' : active ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {icon}
      </button>
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div 
            initial={{ opacity: 0, x: -5, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', left: 'calc(100% + 14px)', top: '50%', y: '-50%',
              background: 'rgba(6, 7, 10, 0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '6px 12px', borderRadius: '8px',
              fontSize: '0.7rem', whiteSpace: 'nowrap', zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 1px 1px 0 rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', gap: '2px',
              pointerEvents: 'none',
            }}>
            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
            {shortcut && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0', flexShrink: 0, borderRadius: '1px' }} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
      marginTop: '6px', marginBottom: '4px', userSelect: 'none',
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
        gap: '4px', width: '100%', padding: '12px 0',
      }}>
        {/* Edit mode indicator */}
        <div style={{
          width: '32px', height: '4px', borderRadius: '2px',
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          marginBottom: '8px', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
        }} />

        <SectionLabel label="Ops" />
        <ToolbarButton
          icon={<ArrowUp size={16} strokeWidth={2} />}
          label="Extrude Region"
          shortcut="E"
          active={false}
          onClick={handleExtrude}
          accentColor="#f59e0b"
        />
        <ToolbarButton
          icon={<ArrowDown size={16} strokeWidth={2} />}
          label="Inset Faces"
          shortcut="I"
          active={false}
          onClick={handleInset}
          accentColor="#ef4444"
        />
        <Divider />
        <SectionLabel label="Mesh" />
        <ToolbarButton
          icon={<LayoutGrid size={16} strokeWidth={1.5} />}
          label="Subdivide"
          active={false}
          onClick={handleSubdivide}
          accentColor="#10b981"
        />
      </div>
    );
  }

  return (
    <div className="toolbar3d-wrapper" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', width: '100%', padding: '12px 0',
    }}>
      <SectionLabel label="Sel" />
      <ToolbarButton
        icon={<MousePointer2 size={16} strokeWidth={1.5} />}
        label="Select Box"
        shortcut="B"
        active={useEditor3DStore.getState().interactionMode === 'select'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('select')}
      />
      <ToolbarButton
        icon={<Crosshair size={16} strokeWidth={1.5} />}
        label="3D Cursor"
        shortcut="Shift+RMB"
        active={useEditor3DStore.getState().interactionMode === 'cursor'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('cursor')}
      />
      <Divider />
      <SectionLabel label="Trans" />
      <ToolbarButton
        icon={<Move size={16} strokeWidth={1.5} />}
        label="Move"
        shortcut="G"
        active={transformMode === 'translate'}
        onClick={() => setTransformMode('translate')}
      />
      <ToolbarButton
        icon={<RotateCw size={16} strokeWidth={1.5} />}
        label="Rotate"
        shortcut="R"
        active={transformMode === 'rotate'}
        onClick={() => setTransformMode('rotate')}
      />
      <ToolbarButton
        icon={<Scaling size={16} strokeWidth={1.5} />}
        label="Scale"
        shortcut="S"
        active={transformMode === 'scale'}
        onClick={() => setTransformMode('scale')}
      />
      <Divider />
      <SectionLabel label="Tools" />
      <ToolbarButton
        icon={<Spline size={16} strokeWidth={1.5} />}
        label="Annotate"
        active={useEditor3DStore.getState().interactionMode === 'annotate'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('annotate')}
        accentColor="#a855f7"
      />
      <ToolbarButton
        icon={<Wrench size={16} strokeWidth={1.5} />}
        label="Measure"
        active={useEditor3DStore.getState().interactionMode === 'measure'}
        onClick={() => useEditor3DStore.getState().setInteractionMode('measure')}
        accentColor="#0ea5e9"
      />
    </div>
  );
}
