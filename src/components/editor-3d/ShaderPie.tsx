"use client";

import { useEditor3DStore, ShadingMode } from "@/stores/editor3d-store";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function ShaderPie() {
  const { showShaderPie, setShowShaderPie, setShadingMode, shadingMode } = useEditor3DStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (showShaderPie) {
      initialPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      setMousePos(initialPos.current);
      setIsReady(true);
    } else {
      setIsReady(false);
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

  const dx = mousePos.x - initialPos.current.x;
  const dy = mousePos.y - initialPos.current.y;
  
  // Calculate which slice is hovered based on angle
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  let activeMode: ShadingMode | null = null;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 20) {
    if (angle >= 315 || angle < 45) activeMode = 'solid'; // Right
    else if (angle >= 45 && angle < 135) activeMode = 'material'; // Bottom
    else if (angle >= 135 && angle < 225) activeMode = 'wireframe'; // Left
    else activeMode = 'rendered'; // Top
  }

  const items: { mode: ShadingMode, label: string, pos: { x: number, y: number } }[] = [
    { mode: 'rendered', label: 'Rendered (8)', pos: { x: 0, y: -70 } },
    { mode: 'solid', label: 'Solid (6)', pos: { x: 90, y: 0 } },
    { mode: 'material', label: 'Material Preview (2)', pos: { x: 0, y: 70 } },
    { mode: 'wireframe', label: 'Wireframe (4)', pos: { x: -90, y: 0 } },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '1px', height: '1px' }}>
        {items.map(item => {
          const isActive = activeMode === item.mode || (!activeMode && shadingMode === item.mode);
          return (
            <div
              key={item.mode}
              style={{
                position: 'absolute',
                left: item.pos.x,
                top: item.pos.y,
                transform: 'translate(-50%, -50%)',
                background: isActive ? 'var(--accent-primary)' : 'rgba(20,20,25,0.8)',
                color: isActive ? '#fff' : 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.1s',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onClick={() => {
                setShadingMode(item.mode);
                setShowShaderPie(false);
              }}
              onMouseEnter={() => setShadingMode(item.mode)}
            >
              {item.label}
            </div>
          );
        })}
        {/* Center dot */}
        <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        Move mouse to select • Click to confirm
      </div>
    </div>
  );
}
