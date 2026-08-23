"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { X, Upload } from "lucide-react";

const PREDEFINED_SIZES = [8, 16, 32, 48, 64, 128];

export function ImageImportModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [step, setStep] = useState<"upload" | "config">("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  
  const [sizeMode, setSizeMode] = useState<"predefined" | "original" | "custom">("predefined");
  const [predefinedSize, setPredefinedSize] = useState<number>(32);
  const [customWidth, setCustomWidth] = useState<number>(128);
  const [customHeight, setCustomHeight] = useState<number>(128);
  
  const { importPixels } = usePixelEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setCustomWidth(img.width);
        setCustomHeight(img.height);
        setStep("config");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    if (!imageSrc) return;

    let targetW = 0;
    let targetH = 0;

    if (sizeMode === "predefined") {
      targetW = predefinedSize;
      targetH = predefinedSize;
    } else if (sizeMode === "original") {
      targetW = originalWidth;
      targetH = originalHeight;
    } else {
      targetW = customWidth;
      targetH = customHeight;
    }

    if (targetW <= 0 || targetH <= 0) return;

    setIsProcessing(true);

    // Yield to main thread so UI can update to show loading state
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Draw image to target size
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;

        const newPixels: Record<string, string> = {};

        for (let y = 0; y < targetH; y++) {
          for (let x = 0; x < targetW; x++) {
            const index = (y * targetW + x) * 4;
            const a = data[index + 3];

            // Ignore fully transparent pixels
            if (a > 10) {
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              newPixels[`${x},${y}`] = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
          }
        }

        importPixels(newPixels, targetW, targetH);
        setIsProcessing(false);
        onClose();
      };
      img.src = imageSrc;
    }, 50);
  };

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        width: '400px',
        padding: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>Import Image to Pixel Art</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {step === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '40px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <Upload size={32} color="var(--accent-primary)" />
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Click to upload an image</div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}

        {step === "config" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <img src={imageSrc!} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Size Mode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSizeMode("predefined")}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: sizeMode === "predefined" ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.8rem'
                  }}
                >
                  Predefined
                </button>
                <button
                  onClick={() => setSizeMode("original")}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: sizeMode === "original" ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.8rem'
                  }}
                >
                  Original ({originalWidth}x{originalHeight})
                </button>
                <button
                  onClick={() => setSizeMode("custom")}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: sizeMode === "custom" ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.8rem'
                  }}
                >
                  Custom
                </button>
              </div>
            </div>

            {sizeMode === "predefined" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Select Size</label>
                <select
                  value={predefinedSize}
                  onChange={(e) => setPredefinedSize(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', outline: 'none'
                  }}
                >
                  {PREDEFINED_SIZES.map(s => <option key={s} value={s}>{s} x {s}</option>)}
                </select>
              </div>
            )}

            {sizeMode === "custom" && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Width</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Height</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
            
            {(sizeMode === "custom" || sizeMode === "original") && (originalWidth > 256 || originalHeight > 256) && (
              <div style={{ fontSize: '0.75rem', color: '#ffb347' }}>
                Warning: Large resolutions may cause performance issues.
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={isProcessing}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                background: isProcessing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)',
                color: isProcessing ? 'rgba(255,255,255,0.5)' : '#fff', 
                fontWeight: 600, cursor: isProcessing ? 'default' : 'pointer', marginTop: '10px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              {isProcessing && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              {isProcessing ? "Processing..." : "Convert to Pixel Art"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
