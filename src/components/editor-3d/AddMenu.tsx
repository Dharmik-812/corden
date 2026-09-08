"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Box, Circle, Cylinder, Cone, Square, Lightbulb, Sun, Target, Camera, Triangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_WIDTH = 192;
const MENU_ESTIMATED_HEIGHT = 360;

export function AddMenu() {
  const { addMenuPosition, setAddMenuPosition, addObject, addLight, addCamera } = useEditor3DStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAddMenuPosition(null);
      }
    };
    if (addMenuPosition) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuPosition, setAddMenuPosition]);

  if (!addMenuPosition) return null;

  // FIX: Clamp to viewport so menu never goes off-screen
  const clampedX = Math.min(addMenuPosition.x, window.innerWidth - MENU_WIDTH - 8);
  const clampedY = Math.min(addMenuPosition.y, window.innerHeight - MENU_ESTIMATED_HEIGHT - 8);

  const categories = [
    {
      name: 'Mesh',
      color: '#8bb8ff',
      items: [
        { label: 'Cube', icon: <Box size={13} />, action: () => addObject('cube') },
        { label: 'Sphere', icon: <Circle size={13} />, action: () => addObject('sphere') },
        { label: 'Cylinder', icon: <Cylinder size={13} />, action: () => addObject('cylinder') },
        { label: 'Cone', icon: <Cone size={13} />, action: () => addObject('cone') },
        { label: 'Plane', icon: <Square size={13} />, action: () => addObject('plane') },
        { label: 'Torus', icon: <Circle size={13} />, action: () => addObject('torus') },
        { label: 'Icosphere', icon: <Triangle size={13} />, action: () => addObject('icosphere') },
      ]
    },
    {
      name: 'Light',
      color: '#f5a623',
      items: [
        { label: 'Point Light', icon: <Lightbulb size={13} />, action: () => addLight('point') },
        { label: 'Sun', icon: <Sun size={13} />, action: () => addLight('sun') },
        { label: 'Spot Light', icon: <Target size={13} />, action: () => addLight('spot') },
        { label: 'Area Light', icon: <Square size={13} />, action: () => addLight('area') },
      ]
    },
    {
      name: 'Other',
      color: '#6bffc0',
      items: [
        { label: 'Camera', icon: <Camera size={13} />, action: () => addCamera() },
      ]
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        key="add-menu"
        initial={{ opacity: 0, scale: 0.93, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: -4 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          left: clampedX,
          top: clampedY,
          background: 'rgba(18, 19, 24, 0.97)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
          width: `${MENU_WIDTH}px`,
          zIndex: 1000,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-primary)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '8px 12px 6px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Add Object</span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>Shift+A</span>
        </div>

        <div style={{ padding: '4px 0' }}>
          {categories.map((cat, i) => (
            <div key={cat.name}>
              {i > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '3px 0' }} />}
              <div style={{
                padding: '4px 12px 2px',
                fontSize: '0.6rem', color: cat.color,
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                opacity: 0.8,
              }}>
                {cat.name}
              </div>
              {cat.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setAddMenuPosition(null); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '6px 16px 6px 20px',
                    background: 'transparent', border: 'none',
                    color: 'rgba(255,255,255,0.72)', cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.72rem', transition: 'background 0.1s, color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${cat.color}22`;
                    e.currentTarget.style.color = cat.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
