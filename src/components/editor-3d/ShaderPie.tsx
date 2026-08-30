"use client";

import { useEditor3DStore, ShadingMode } from "@/stores/editor3d-store";
import { useEffect, useState } from "react";

export function ShaderPie() {
  const { showShaderPie, setShowShaderPie, setShadingMode, shadingMode } = useEditor3DStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  // FIX: Track hover mode locally — don't commit to store until user clicks
  const [hoveredMode, setHoveredMode] = useState<ShadingMode | null>(null);

  useEffect(() => {
    if (showShaderPie) {
      const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      setInitialPos(pos);
      setMousePos(pos);
      setHoveredMode(null);
      setIsReady(true);
    } else {
      setIsReady(false);
      setHoveredMode(null);
    }
  }, [showShaderPie]);

  useEffect(() => {
    if (!showShaderPie) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showShaderPie]);

  if (!showShaderPie || !isReady) return null;

  const dx = mousePos.x - initialPos.x;
  const dy = mousePos.y - initialPos.y;

  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  let activeMode: ShadingMode | null = hoveredMode;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 20 && !hoveredMode) {
    if (angle >= 315 || angle < 45) activeMode = 'solid';
    else if (angle >= 45 && angle < 135) activeMode = 'material';
    else if (angle >= 135 && angle < 225) activeMode = 'wireframe';
    else activeMode = 'rendered';
  }

  const items: { mode: ShadingMode; label: string; pos: { x: number; y: number }; icon: string }[] = [
    { mode: 'rendered', label: 'Rendered', icon: '◉', pos: { x: 0, y: -76 } },
    { mode: 'solid', label: 'Solid', icon: '●', pos: { x: 96, y: 0 } },
    { mode: 'material', label: 'Material', icon: '◈', pos: { x: 0, y: 76 } },
    { mode: 'wireframe', label: 'Wireframe', icon: '⊡', pos: { x: -96, y: 0 } },
  ];

  const handleSelect = (mode: ShadingMode) => {
    setShadingMode(mode);
    setShowShaderPie(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '1px', height: '1px' }}>
        {/* Connection lines */}
        <svg style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none' }}>
          {items.map(item => (
            <line
              key={item.mode}
              x1={0} y1={0}
              x2={item.pos.x} y2={item.pos.y}
              stroke={activeMode === item.mode ? 'rgba(71,114,179,0.6)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={activeMode === item.mode ? 2 : 1}
              strokeDasharray={activeMode === item.mode ? 'none' : '3,4'}
            />
          ))}
        </svg>

        {/* Center dot */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          transform: 'translate(-50%, -50%)',
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(71,114,179,0.9)',
          boxShadow: '0 0 12px rgba(71,114,179,0.6)',
        }} />

        {items.map(item => {
          const isActive = activeMode === item.mode;
          const isCurrent = shadingMode === item.mode && !activeMode;
          return (
            <div
              key={item.mode}
              style={{
                position: 'absolute',
                left: item.pos.x,
                top: item.pos.y,
                transform: 'translate(-50%, -50%)',
                background: isActive
                  ? 'rgba(71,114,179,0.95)'
                  : isCurrent
                    ? 'rgba(40,40,55,0.95)'
                    : 'rgba(20,20,28,0.92)',
                color: isActive ? '#fff' : isCurrent ? '#8bb8ff' : 'rgba(255,255,255,0.7)',
                padding: '9px 18px',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                border: isActive
                  ? '1px solid rgba(71,114,179,0.8)'
                  : isCurrent
                    ? '1px solid rgba(71,114,179,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.1s',
                pointerEvents: 'auto',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 24px rgba(71,114,179,0.4)' : 'none',
                display: 'flex', alignItems: 'center', gap: '7px',
              }}
              // FIX: onMouseEnter only updates local hover state, NOT the store
              onMouseEnter={() => setHoveredMode(item.mode)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleSelect(item.mode)}
            >
              <span style={{ fontSize: '1rem', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>
      <div style={{
        position: 'absolute', bottom: '24px',
        color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
        background: 'rgba(0,0,0,0.5)', padding: '4px 14px', borderRadius: '100px',
        backdropFilter: 'blur(8px)',
      }}>
        Move to highlight · Click to select · Release Z to cancel
      </div>
    </div>
  );
}
