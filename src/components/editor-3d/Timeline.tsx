"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { Play, Pause, SkipBack, SkipForward, Plus } from "lucide-react";
import { useRef, useState } from "react";

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
      background: '#1a1c22',
      fontFamily: 'var(--font-mono)', userSelect: 'none',
    }}>
      {/* Header / Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '10px',
        background: 'rgba(0,0,0,0.2)', height: '36px', flexShrink: 0,
      }}>
        {/* Transport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={() => setCurrentFrame(1)}
            title="Jump to Start"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <SkipBack size={13} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            style={{
              background: isPlaying ? '#4772b3' : 'rgba(71,114,179,0.25)',
              border: '1px solid rgba(71,114,179,0.4)',
              color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px 10px', borderRadius: '4px',
              transition: 'all 0.15s', alignItems: 'center', gap: '4px',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => setCurrentFrame(totalFrames)}
            title="Jump to End"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Frame display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>Frame</span>
          <input
            type="number"
            value={currentFrame}
            onChange={e => setCurrentFrame(Math.max(1, Math.min(totalFrames, parseInt(e.target.value) || 1)))}
            style={{
              width: '44px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8bb8ff', padding: '2px 5px', borderRadius: '4px', textAlign: 'center',
              fontSize: '0.7rem', fontFamily: 'var(--font-mono)', outline: 'none',
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <input
            type="number"
            value={totalFrames}
            onChange={e => setTotalFrames(Math.max(1, parseInt(e.target.value) || 250))}
            style={{
              width: '44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.5)', padding: '2px 5px', borderRadius: '4px', textAlign: 'center',
              fontSize: '0.7rem', fontFamily: 'var(--font-mono)', outline: 'none',
            }}
          />
        </div>

        {/* FPS badge */}
        <div style={{
          fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.07)',
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
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,180,0,0.12)', border: '1px solid rgba(255,180,0,0.3)',
              color: '#ffb400', cursor: 'pointer', padding: '3px 10px',
              borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,180,0,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,180,0,0.12)'; }}
          >
            <Plus size={10} /> Keyframe
          </button>
        )}
      </div>

      {/* Timeline track area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Track label column */}
        <div style={{ width: '80px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {/* Ruler label space */}
          <div style={{ height: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
          {/* Object labels */}
          <div style={{ overflowY: 'auto' }}>
            {objectsWithKeyframes.map(obj => (
              <div
                key={obj.id}
                style={{
                  height: '22px', display: 'flex', alignItems: 'center',
                  padding: '0 8px',
                  background: obj.id === selectedId ? 'rgba(71,114,179,0.12)' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => useEditor3DStore.getState().setSelectedId(obj.id)}
              >
                <span style={{
                  fontSize: '0.62rem', color: obj.id === selectedId ? '#8bb8ff' : 'rgba(255,255,255,0.45)',
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
            height: '18px', flexShrink: 0, position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.15)',
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
                    width: '1px', height: '6px',
                    background: 'rgba(255,255,255,0.15)',
                  }} />
                  <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.4)', userSelect: 'none', whiteSpace: 'nowrap' }}>
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
            style={{ flex: 1, position: 'relative', cursor: 'col-resize', overflow: 'hidden' }}
          >
            {/* Alternating track backgrounds */}
            {objectsWithKeyframes.map((obj, i) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute', left: 0, right: 0,
                  top: i * 22, height: '22px',
                  background: obj.id === selectedId
                    ? 'rgba(71,114,179,0.07)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.1)',
                }}
              />
            ))}

            {/* Keyframe diamonds */}
            {objectsWithKeyframes.map((obj, i) =>
              obj.keyframes.map(kf => {
                const ratio = (kf.frame - 1) / Math.max(1, totalFrames - 1);
                const isCurrentKF = obj.id === selectedId && kf.frame === currentFrame;
                return (
                  <div
                    key={`${obj.id}-${kf.frame}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentFrame(kf.frame); useEditor3DStore.getState().setSelectedId(obj.id); }}
                    style={{
                      position: 'absolute',
                      left: `${ratio * 100}%`,
                      top: i * 22 + 5,
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '8px', height: '8px',
                      background: isCurrentKF ? '#ffb400' : obj.id === selectedId ? '#8bb8ff' : '#666888',
                      border: `1px solid ${isCurrentKF ? '#ff8c00' : 'rgba(0,0,0,0.5)'}`,
                      cursor: 'pointer',
                      zIndex: 5,
                      boxShadow: isCurrentKF ? '0 0 8px rgba(255,180,0,0.6)' : 'none',
                      transition: 'background 0.1s, box-shadow 0.1s',
                    }}
                    title={`Frame ${kf.frame}`}
                  />
                );
              })
            )}

            {/* FIX: Correct playhead position formula */}
            <div style={{
              position: 'absolute',
              left: `calc((100%) * ${(currentFrame - 1) / Math.max(1, totalFrames - 1)})`,
              top: 0, bottom: 0,
              width: '1px',
              background: '#559BFF', // Brighter playhead line
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: '0 0 4px rgba(85,155,255,0.4)',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '-5.5px',
                width: '12px', height: '14px',
                background: '#559BFF',
                clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }} />
            </div>

            {/* Empty state */}
            {objectsWithKeyframes.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.15)', fontSize: '0.68rem', pointerEvents: 'none',
              }}>
                No keyframes — select an object and press I to add
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
