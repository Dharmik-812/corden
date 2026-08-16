"use client";

import { useEditor3DStore, PrimitiveType, LightType } from "@/stores/editor3d-store";
import { Box, Circle, Cylinder, Cone, Square, Lightbulb, Sun, Target, Subtitles, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

  const categories = [
    {
      name: 'Mesh',
      items: [
        { label: 'Cube', icon: <Box size={14} />, action: () => addObject('cube') },
        { label: 'Sphere', icon: <Circle size={14} />, action: () => addObject('sphere') },
        { label: 'Cylinder', icon: <Cylinder size={14} />, action: () => addObject('cylinder') },
        { label: 'Cone', icon: <Cone size={14} />, action: () => addObject('cone') },
        { label: 'Plane', icon: <Square size={14} />, action: () => addObject('plane') },
        { label: 'Torus', icon: <Circle size={14} />, action: () => addObject('torus') },
        { label: 'Icosphere', icon: <Circle size={14} />, action: () => addObject('icosphere') },
      ]
    },
    {
      name: 'Light',
      items: [
        { label: 'Point', icon: <Lightbulb size={14} />, action: () => addLight('point') },
        { label: 'Sun', icon: <Sun size={14} />, action: () => addLight('sun') },
        { label: 'Spot', icon: <Target size={14} />, action: () => addLight('spot') },
        { label: 'Area', icon: <Square size={14} />, action: () => addLight('area') },
      ]
    },
    {
      name: 'Other',
      items: [
        { label: 'Camera', icon: <Camera size={14} />, action: () => addCamera() },
        { label: 'Text', icon: <Subtitles size={14} />, action: () => console.log('Add text') },
      ]
    }
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'absolute',
        left: addMenuPosition.x,
        top: addMenuPosition.y,
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        width: '180px',
        zIndex: 1000,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--text-primary)',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        Add Menu
      </div>
      
      <div style={{ padding: '4px 0' }}>
        {categories.map((cat, i) => (
          <div key={cat.name}>
            {i > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />}
            <div style={{ padding: '2px 12px', fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {cat.name}
            </div>
            {cat.items.map(item => (
              <button
                key={item.label}
                onClick={() => { item.action(); setAddMenuPosition(null); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 16px', background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
