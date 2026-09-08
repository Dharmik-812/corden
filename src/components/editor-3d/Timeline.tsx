"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Play, Pause, SkipBack, SkipForward, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export function Timeline() {
  const {
    currentFrame, setCurrentFrame, totalFrames, setTotalFrames,
    isPlaying, setIsPlaying, fps, objects, selectedId, addKeyframe
  } = useEditor3DStore();

  const trackAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getFrameFromEvent = (e: React.MouseEvent): number => {
    if (!trackAreaRef.current) return currentFrame;
    const rect = trackAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    return Math.max(1, Math.min(totalFrames, Math.round(ratio * (totalFrames - 1)) + 1));
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setCurrentFrame(getFrameFromEvent(e));
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentFrame(getFrameFromEvent(e));
  };

  const handleTrackMouseUp = () => setIsDragging(false);

  // Generate ruler ticks
  const tickCount = Math.min(totalFrames, 20);
  const tickStep = Math.ceil(totalFrames / tickCount);
  const ticks: number[] = [];
  for (let f = 1; f <= totalFrames; f += tickStep) ticks.push(f);
  if (!ticks.includes(totalFrames)) ticks.push(totalFrames);

  const objectsWithKeyframes = objects.filter(o => o.keyframes.length > 0);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'transparent',
      fontFamily: 'var(--font-mono)', userSelect: 'none',
    }}>
      {/* Header / Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '16px',
        background: 'rgba(0,0,0,0.3)', height: '44px', flexShrink: 0,
      }}>
        {/* Transport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setCurrentFrame(1)}
            title="Jump to Start"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '6px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            style={{
              background: isPlaying ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
              border: isPlaying ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: isPlaying ? '#818cf8' : '#fff', cursor: 'pointer', display: 'flex', padding: '6px 16px', borderRadius: '6px',
              transition: 'all 0.15s', alignItems: 'center', justifyContent: 'center',
              boxShadow: isPlaying ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
            }}
            onMouseEnter={e => { if(!isPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { if(!isPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => setCurrentFrame(totalFrames)}
            title="Jump to End"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '6px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Frame display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Frame</span>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
            <input
              type="number"
              value={currentFrame}
              onChange={e => setCurrentFrame(Math.max(1, Math.min(totalFrames, parseInt(e.target.value) || 1)))}
              style={{
                width: '48px', background: 'transparent', border: 'none',
                color: '#818cf8', padding: '4px', textAlign: 'center',
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none', fontWeight: 700
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.2)', padding: '0 4px' }}>/</span>
            <input
              type="number"
              value={totalFrames}
              onChange={e => setTotalFrames(Math.max(1, parseInt(e.target.value) || 250))}
              style={{
                width: '48px', background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.6)', padding: '4px', textAlign: 'center',
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none', fontWeight: 600
              }}
            />
          </div>
        </div>

        {/* FPS badge */}
        <div style={{
          fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700,
          background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {fps} fps
        </div>

        <div style={{ flex: 1 }} />

        {/* Insert Keyframe */}
        {selectedId && (
          <button
            onClick={() => addKeyframe(selectedId)}
            title="Insert Keyframe (I)"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              color: '#fcd34d', cursor: 'pointer', padding: '6px 12px',
              borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
              transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(245,158,11,0.15)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.15)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.15)'; }}
          >
            <Plus size={12} /> Keyframe
          </button>
        )}
      </div>

      {/* Timeline track area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Track label column */}
        <div style={{ width: '100px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
          {/* Ruler label space */}
          <div style={{ height: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
          {/* Object labels */}
          <div style={{ overflowY: 'auto', padding: '4px 0' }}>
            {objectsWithKeyframes.map(obj => (
              <div
                key={obj.id}
                style={{
                  height: '28px', display: 'flex', alignItems: 'center',
                  padding: '0 12px', margin: '2px 4px', borderRadius: '4px',
                  background: obj.id === selectedId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s'
                }}
                onClick={() => useEditor3DStore.getState().setSelectedId(obj.id)}
                onMouseEnter={e => { if (obj.id !== selectedId) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (obj.id !== selectedId) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize: '0.7rem', fontWeight: obj.id === selectedId ? 600 : 400,
                  color: obj.id === selectedId ? '#818cf8' : 'rgba(255,255,255,0.6)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Track & ruler area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Ruler */}
          <div style={{
            height: '24px', flexShrink: 0, position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {ticks.map(f => {
              const ratio = (f - 1) / Math.max(1, totalFrames - 1);
              return (
                <div
                  key={f}
                  style={{
                    position: 'absolute',
                    left: `${ratio * 100}%`,
                    top: 0, bottom: 0,
                    display: 'flex', alignItems: 'flex-end',
                    paddingBottom: '2px',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute', bottom: 0,
                    width: '1px', height: '8px',
                    background: 'rgba(255,255,255,0.2)',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', userSelect: 'none', whiteSpace: 'nowrap', fontWeight: 600, paddingBottom: '2px' }}>
                    {f}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scrubber + keyframe tracks */}
          <div
            ref={trackAreaRef}
            onMouseDown={handleTrackMouseDown}
            onMouseMove={handleTrackMouseMove}
            onMouseUp={handleTrackMouseUp}
            onMouseLeave={handleTrackMouseUp}
            style={{ flex: 1, position: 'relative', cursor: 'col-resize', overflow: 'hidden', padding: '4px 0' }}
          >
            {/* Alternating track backgrounds */}
            {objectsWithKeyframes.map((obj, i) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute', left: 0, right: 0,
                  top: i * 30 + 4, height: '28px',
                  background: obj.id === selectedId
                    ? 'rgba(99, 102, 241, 0.05)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                }}
              />
            ))}

            {/* Keyframe diamonds */}
            {objectsWithKeyframes.map((obj, i) =>
              obj.keyframes.map(kf => {
                const ratio = (kf.frame - 1) / Math.max(1, totalFrames - 1);
                const isCurrentKF = obj.id === selectedId && kf.frame === currentFrame;
                return (
                  <motion.div
                    key={`${obj.id}-${kf.frame}`}
                    whileHover={{ scale: 1.2 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentFrame(kf.frame); useEditor3DStore.getState().setSelectedId(obj.id); }}
                    style={{
                      position: 'absolute',
                      left: `${ratio * 100}%`,
                      top: i * 30 + 18,
                      x: '-50%', y: '-50%',
                      rotate: 45,
                      width: '10px', height: '10px',
                      background: isCurrentKF ? '#fcd34d' : obj.id === selectedId ? '#818cf8' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${isCurrentKF ? '#f59e0b' : obj.id === selectedId ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
                      cursor: 'pointer',
                      zIndex: 5,
                      boxShadow: isCurrentKF ? '0 0 12px rgba(245,158,11,0.8)' : obj.id === selectedId ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                    title={`Frame ${kf.frame}`}
                  />
                );
              })
            )}

            {/* Playhead */}
            <div style={{
              position: 'absolute',
              left: `calc((100%) * ${(currentFrame - 1) / Math.max(1, totalFrames - 1)})`,
              top: 0, bottom: 0,
              width: '1px',
              background: '#6366f1',
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.6), 0 0 2px rgba(99, 102, 241, 1)',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '-6px',
                width: '13px', height: '16px',
                background: 'linear-gradient(180deg, #818cf8, #6366f1)',
                clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.8)',
              }} />
            </div>

            {/* Empty state */}
            {objectsWithKeyframes.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', pointerEvents: 'none',
                fontWeight: 500, letterSpacing: '0.02em',
              }}>
                No keyframes — select an object and press <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', margin: '0 6px', color: 'rgba(255,255,255,0.6)' }}>I</span> to add
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
