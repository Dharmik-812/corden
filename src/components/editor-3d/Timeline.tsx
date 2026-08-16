"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Play, Pause, SkipBack, SkipForward, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Timeline() {
  const { 
    currentFrame, setCurrentFrame, totalFrames, setTotalFrames, 
    isPlaying, setIsPlaying, fps, objects, selectedId
  } = useEditor3DStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 60; // Left padding for controls
    const width = rect.width - padding;
    if (x < padding) return;
    
    let frame = Math.round(((x - padding) / width) * totalFrames) + 1;
    frame = Math.max(1, Math.min(totalFrames, frame));
    setCurrentFrame(frame);
  };

  const handleTimelineMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 60;
    const width = rect.width - padding;
    if (x < padding) return;
    
    let frame = Math.round(((x - padding) / width) * totalFrames) + 1;
    frame = Math.max(1, Math.min(totalFrames, frame));
    setCurrentFrame(frame);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#282828',
      fontFamily: 'var(--font-mono)', userSelect: 'none'
    }}>
      {/* Timeline Header / Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 12px',
        borderBottom: '1px solid #1e1e1e', gap: '16px',
        background: '#383838'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            onClick={() => setCurrentFrame(1)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px' }}
          >
            <SkipBack size={14} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: '#4772b3', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px 12px', borderRadius: '4px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button 
            onClick={() => setCurrentFrame(totalFrames)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px' }}
          >
            <SkipForward size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Current</span>
          <input 
            type="number" 
            value={currentFrame} 
            onChange={e => setCurrentFrame(Math.max(1, Math.min(totalFrames, parseInt(e.target.value) || 1)))}
            style={{ width: '40px', background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '2px 4px', borderRadius: '4px', textAlign: 'center' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>End</span>
          <input 
            type="number" 
            value={totalFrames} 
            onChange={e => setTotalFrames(Math.max(1, parseInt(e.target.value) || 250))}
            style={{ width: '40px', background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '2px 4px', borderRadius: '4px', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Timeline Track */}
      <div 
        ref={containerRef}
        onMouseDown={(e) => { setIsDragging(true); handleTimelineClick(e); }}
        onMouseMove={handleTimelineMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        style={{ flex: 1, position: 'relative', cursor: 'col-resize' }}
      >
        {/* Playhead */}
        <div style={{
          position: 'absolute',
          left: `calc(60px + ${((currentFrame - 1) / (totalFrames - 1)) * 100}% - 60px * ${((currentFrame - 1) / (totalFrames - 1))})`,
          top: 0, bottom: 0, width: '1px', background: 'var(--accent-primary)', zIndex: 10
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-4px', width: '9px', height: '12px',
            background: 'var(--accent-primary)', clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)'
          }} />
        </div>

        {/* Tracks per object (only showing selected for simplicity or all) */}
        <div style={{ paddingLeft: '60px', height: '100%', overflowY: 'auto' }}>
          {objects.filter(o => o.keyframes.length > 0).map(obj => (
            <div key={obj.id} style={{ display: 'flex', alignItems: 'center', height: '20px', position: 'relative', background: obj.id === selectedId ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
              <div style={{ position: 'absolute', left: '-50px', width: '50px', fontSize: '0.65rem', color: 'var(--text-tertiary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {obj.name}
              </div>
              <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                {obj.keyframes.map(kf => (
                  <div 
                    key={kf.frame}
                    style={{
                      position: 'absolute',
                      left: `${((kf.frame - 1) / (totalFrames - 1)) * 100}%`,
                      top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)',
                      width: '6px', height: '6px',
                      background: obj.id === selectedId && kf.frame === currentFrame ? 'var(--warning)' : '#aaaaaa',
                      border: '1px solid #000'
                    }}
                    title={`Frame ${kf.frame}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
