import { create } from 'zustand';

export type PixelTool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'filled-rectangle' | 'select' | 'move';
export type CanvasSize = number;

const MAX_HISTORY = 60;

// --- Layer & Frame types ---
export interface Layer {
  id: string;
  name: string;
  pixels: Record<string, string>;
  visible: boolean;
  opacity: number; // 0-1
  locked: boolean;
}

export interface AnimFrame {
  id: string;
  layers: Layer[];
  duration: number; // ms per frame
}

// --- Selection state ---
export interface SelectionRect {
  x: number; y: number; w: number; h: number;
}

// --- History snapshot ---
export interface HistorySnapshot {
  layers: Layer[];
  activeLayerId: string;
}

// --- Built-in palettes ---
export const DEFAULT_PALETTES: Record<string, string[]> = {
  'Pico-8': [
    '#000000', '#1D2B53', '#7E2553', '#008751',
    '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
    '#FF004D', '#FFA300', '#FFEC27', '#00E436',
    '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
  ],
  'Gameboy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  'CGA': [
    '#000000', '#0000AA', '#00AA00', '#00AAAA',
    '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
    '#555555', '#5555FF', '#55FF55', '#55FFFF',
    '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF',
  ],
  'Endesga-32': [
    '#be4a2f', '#d77643', '#ead4aa', '#e4a672',
    '#b86f50', '#733e39', '#3e2731', '#a22633',
    '#e43b44', '#f77622', '#feae34', '#fee761',
    '#63c74d', '#3e8948', '#265c42', '#193c3e',
    '#124e89', '#0099db', '#2ce8f5', '#ffffff',
    '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466',
    '#262b44', '#181425', '#ff0044', '#68386c',
    '#b55088', '#f6757a', '#e8b796', '#c28569',
  ],
  'Pastel': [
    '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
    '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
    '#fffffc', '#d4a373', '#ccd5ae', '#e9edc9',
    '#fefae0', '#faedcd', '#f5ebe0', '#e3d5ca',
  ],
};

// Keep PALETTES exported for backward compat
export const PALETTES = DEFAULT_PALETTES;

function makeLayer(name: string, pixels: Record<string, string> = {}): Layer {
  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    pixels,
    visible: true,
    opacity: 1,
    locked: false,
  };
}

function makeFrame(layers?: Layer[]): AnimFrame {
  return {
    id: `frame-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    layers: layers ?? [makeLayer('Layer 1')],
    duration: 100,
  };
}

// ---- Clipboard (module-level, not reactive) ----
let _clipboard: Record<string, string> = {};

export interface PixelEditorState {
  // Canvas dimensions
  canvasWidth: CanvasSize;
  canvasHeight: CanvasSize;

  // Layers
  layers: Layer[];
  activeLayerId: string;

  // Animation frames
  frames: AnimFrame[];
  activeFrameIndex: number;
  isPlaying: boolean;
  fps: number;

  // Rendered composite (read-only, set by the render loop helper)
  renderTick: number;

  // Active tool
  activeTool: PixelTool;
  primaryColor: string;
  secondaryColor: string;

  // Selection
  selection: SelectionRect | null;
  selectionPixels: Record<string, string> | null; // cut pixels floating

  // View
  zoom: number;
  panX: number;
  panY: number;
  gridVisible: boolean;
  symmetryMode: 'none' | 'horizontal' | 'vertical' | 'both';

  // Palettes
  activePalette: string;
  customPalettes: Record<string, string[]>;

  // History
  history: HistorySnapshot[];
  historyIndex: number;

  // --- Computed helper ---
  /** Returns the active layer's pixels (convenience) */
  pixels: Record<string, string>;

  // --- Actions ---
  setPixel: (x: number, y: number, color: string) => void;
  erasePixel: (x: number, y: number) => void;
  floodFill: (x: number, y: number, color: string) => void;
  commitHistory: () => void;
  finalizeStroke: () => void;
  undo: () => void;
  redo: () => void;

  // Layer actions
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Omit<Layer, 'id' | 'pixels'>>) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  mergeLayerDown: (id: string) => void;
  flattenAllLayers: () => void;

  // Frame / animation actions
  addFrame: () => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;
  setActiveFrame: (index: number) => void;
  setFrameDuration: (index: number, ms: number) => void;
  setIsPlaying: (v: boolean) => void;
  setFps: (fps: number) => void;

  // Selection actions
  setSelection: (sel: SelectionRect | null) => void;
  cutSelection: () => void;
  copySelection: () => void;
  pasteSelection: () => void;
  deleteSelection: () => void;
  moveSelection: (dx: number, dy: number) => void;

  // Palette actions
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setActivePalette: (name: string) => void;
  createCustomPalette: (name: string, colors: string[]) => void;
  deleteCustomPalette: (name: string) => void;
  addColorToPalette: (paletteName: string, color: string) => void;
  removeColorFromPalette: (paletteName: string, colorIndex: number) => void;

  // Canvas actions
  setActiveTool: (tool: PixelTool) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleGrid: () => void;
  setSymmetryMode: (mode: 'none' | 'horizontal' | 'vertical' | 'both') => void;
  setCanvasSize: (w: CanvasSize, h: CanvasSize) => void;
  clearCanvas: () => void;
  importPixels: (newPixels: Record<string, string>, w: number, h: number) => void;
}

const _initialLayer = makeLayer('Layer 1');
const _initialFrame = makeFrame([_initialLayer]);

export const usePixelEditorStore = create<PixelEditorState>((set, get) => {
  // Helper: get active layer from layers array
  const activeLayer = () => {
    const { layers, activeLayerId } = get();
    return layers.find(l => l.id === activeLayerId) ?? layers[0];
  };

  // Helper: update active layer's pixels in-place and bump renderTick
  const writePixels = (fn: (pixels: Record<string, string>) => void) => {
    const { layers, activeLayerId, renderTick } = get();
    const idx = layers.findIndex(l => l.id === activeLayerId);
    if (idx === -1) return;
    fn(layers[idx].pixels);
    // pixels is the same object, but Zustand sees layers array ref unchanged —
    // we bump renderTick and also replace the pixels object for undo diffing.
    set({ renderTick: renderTick + 1, pixels: { ...layers[idx].pixels } });
  };

  // Helper: snapshot history
  const snapshot = (): HistorySnapshot => {
    const { layers, activeLayerId } = get();
    return {
      layers: layers.map(l => ({ ...l, pixels: { ...l.pixels } })),
      activeLayerId,
    };
  };

  const restoreSnapshot = (s: HistorySnapshot) => {
    const active = s.layers.find(l => l.id === s.activeLayerId) ?? s.layers[0];
    set({
      layers: s.layers,
      activeLayerId: s.activeLayerId,
      pixels: { ...(active?.pixels ?? {}) },
      renderTick: get().renderTick + 1,
    });
  };

  return {
    canvasWidth: 32,
    canvasHeight: 32,

    layers: [_initialLayer],
    activeLayerId: _initialLayer.id,

    frames: [_initialFrame],
    activeFrameIndex: 0,
    isPlaying: false,
    fps: 8,

    renderTick: 0,

    activeTool: 'pencil',
    primaryColor: '#ffffff',
    secondaryColor: '#000000',

    selection: null,
    selectionPixels: null,

    zoom: 16,
    panX: 0,
    panY: 0,
    gridVisible: true,
    symmetryMode: 'none',

    activePalette: 'Pico-8',
    customPalettes: {},

    history: [{ layers: [_initialLayer], activeLayerId: _initialLayer.id }],
    historyIndex: 0,

    pixels: _initialLayer.pixels,

    // -------- Drawing --------
    setPixel: (x, y, color) => {
      const { canvasWidth, canvasHeight, symmetryMode } = get();
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;
      writePixels(pixels => {
        pixels[`${x},${y}`] = color;
        if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
          const sx = canvasWidth - 1 - x; if (sx !== x) pixels[`${sx},${y}`] = color;
        }
        if (symmetryMode === 'vertical' || symmetryMode === 'both') {
          const sy = canvasHeight - 1 - y; if (sy !== y) pixels[`${x},${sy}`] = color;
        }
        if (symmetryMode === 'both') {
          const sx = canvasWidth - 1 - x; const sy = canvasHeight - 1 - y;
          if (sx !== x && sy !== y) pixels[`${sx},${sy}`] = color;
        }
      });
    },

    erasePixel: (x, y) => {
      const { canvasWidth, canvasHeight, symmetryMode } = get();
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;
      writePixels(pixels => {
        delete pixels[`${x},${y}`];
        if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
          const sx = canvasWidth - 1 - x; if (sx !== x) delete pixels[`${sx},${y}`];
        }
        if (symmetryMode === 'vertical' || symmetryMode === 'both') {
          const sy = canvasHeight - 1 - y; if (sy !== y) delete pixels[`${x},${sy}`];
        }
        if (symmetryMode === 'both') {
          const sx = canvasWidth - 1 - x; const sy = canvasHeight - 1 - y;
          if (sx !== x && sy !== y) delete pixels[`${sx},${sy}`];
        }
      });
    },

    floodFill: (x, y, fillColor) => {
      const { canvasWidth, canvasHeight } = get();
      const layer = activeLayer();
      if (!layer) return;
      const pixels = layer.pixels;
      const key = `${x},${y}`;
      const targetColor = pixels[key] || null;
      if (targetColor === fillColor) return;

      const visited = new Set<string>();
      const stack: [number, number][] = [[x, y]];
      const next = { ...pixels };
      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const ck = `${cx},${cy}`;
        if (visited.has(ck)) continue;
        if (cx < 0 || cy < 0 || cx >= canvasWidth || cy >= canvasHeight) continue;
        if ((next[ck] || null) !== targetColor) continue;
        visited.add(ck);
        next[ck] = fillColor;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }

      // Update the layer's pixels object
      const { layers, activeLayerId } = get();
      const layerIdx = layers.findIndex(l => l.id === activeLayerId);
      if (layerIdx === -1) return;
      const newLayers = [...layers];
      newLayers[layerIdx] = { ...newLayers[layerIdx], pixels: next };
      set({ layers: newLayers, pixels: next, renderTick: get().renderTick + 1 });
    },

    commitHistory: () => {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(snapshot());
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    finalizeStroke: () => {
      const { layers, activeLayerId } = get();
      const idx = layers.findIndex(l => l.id === activeLayerId);
      if (idx === -1) return;
      // Properly clone for Zustand detection & autosave
      const newLayers = [...layers];
      newLayers[idx] = { ...newLayers[idx], pixels: { ...newLayers[idx].pixels } };
      set({ layers: newLayers, pixels: newLayers[idx].pixels });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex <= 0) return;
      restoreSnapshot(history[historyIndex - 1]);
      set({ historyIndex: historyIndex - 1 });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      restoreSnapshot(history[historyIndex + 1]);
      set({ historyIndex: historyIndex + 1 });
    },

    // -------- Layers --------
    addLayer: () => {
      get().commitHistory();
      const { layers } = get();
      const newLayer = makeLayer(`Layer ${layers.length + 1}`);
      set({ layers: [...layers, newLayer], activeLayerId: newLayer.id, pixels: newLayer.pixels });
    },

    deleteLayer: (id) => {
      const { layers } = get();
      if (layers.length <= 1) return;
      get().commitHistory();
      const newLayers = layers.filter(l => l.id !== id);
      const newActive = newLayers[newLayers.length - 1];
      set({ layers: newLayers, activeLayerId: newActive.id, pixels: newActive.pixels });
    },

    duplicateLayer: (id) => {
      get().commitHistory();
      const { layers } = get();
      const src = layers.find(l => l.id === id);
      if (!src) return;
      const dup = makeLayer(`${src.name} Copy`, { ...src.pixels });
      const idx = layers.findIndex(l => l.id === id);
      const newLayers = [...layers];
      newLayers.splice(idx + 1, 0, dup);
      set({ layers: newLayers, activeLayerId: dup.id, pixels: dup.pixels });
    },

    setActiveLayer: (id) => {
      const { layers } = get();
      const layer = layers.find(l => l.id === id);
      if (layer) set({ activeLayerId: id, pixels: layer.pixels });
    },

    updateLayer: (id, updates) => {
      const { layers } = get();
      set({ layers: layers.map(l => l.id === id ? { ...l, ...updates } : l) });
    },

    moveLayer: (id, direction) => {
      const { layers } = get();
      const idx = layers.findIndex(l => l.id === id);
      if (direction === 'up' && idx >= layers.length - 1) return;
      if (direction === 'down' && idx <= 0) return;
      const newLayers = [...layers];
      const swapIdx = direction === 'up' ? idx + 1 : idx - 1;
      [newLayers[idx], newLayers[swapIdx]] = [newLayers[swapIdx], newLayers[idx]];
      set({ layers: newLayers });
    },

    mergeLayerDown: (id) => {
      const { layers } = get();
      const idx = layers.findIndex(l => l.id === id);
      if (idx <= 0) return;
      get().commitHistory();
      const topLayer = layers[idx];
      const bottomLayer = layers[idx - 1];
      const merged = { ...bottomLayer.pixels, ...topLayer.pixels };
      const mergedLayer: Layer = { ...bottomLayer, pixels: merged };
      const newLayers = [...layers];
      newLayers.splice(idx - 1, 2, mergedLayer);
      set({ layers: newLayers, activeLayerId: mergedLayer.id, pixels: mergedLayer.pixels, renderTick: get().renderTick + 1 });
    },

    flattenAllLayers: () => {
      get().commitHistory();
      const { layers } = get();
      const merged: Record<string, string> = {};
      for (const layer of layers) {
        if (layer.visible) Object.assign(merged, layer.pixels);
      }
      const flat = makeLayer('Background', merged);
      set({ layers: [flat], activeLayerId: flat.id, pixels: flat.pixels, renderTick: get().renderTick + 1 });
    },

    // -------- Frames / Animation --------
    addFrame: () => {
      const { frames, layers } = get();
      const newFrame = makeFrame(layers.map(l => makeLayer(l.name)));
      set({ frames: [...frames, newFrame], activeFrameIndex: frames.length });
    },

    deleteFrame: (index) => {
      const { frames, activeFrameIndex } = get();
      if (frames.length <= 1) return;
      const newFrames = frames.filter((_, i) => i !== index);
      const newActive = Math.min(activeFrameIndex, newFrames.length - 1);
      const frame = newFrames[newActive];
      set({
        frames: newFrames,
        activeFrameIndex: newActive,
        layers: frame.layers,
        activeLayerId: frame.layers[0]?.id ?? '',
        pixels: frame.layers[0]?.pixels ?? {},
      });
    },

    duplicateFrame: (index) => {
      const { frames } = get();
      const src = frames[index];
      const dup: AnimFrame = {
        id: `frame-${Date.now()}`,
        layers: src.layers.map(l => makeLayer(l.name, { ...l.pixels })),
        duration: src.duration,
      };
      const newFrames = [...frames];
      newFrames.splice(index + 1, 0, dup);
      set({ frames: newFrames, activeFrameIndex: index + 1, layers: dup.layers, activeLayerId: dup.layers[0]?.id ?? '', pixels: dup.layers[0]?.pixels ?? {} });
    },

    setActiveFrame: (index) => {
      const { frames, activeFrameIndex, layers } = get();
      // Save current layers into the current frame first
      const currentFrame = frames[activeFrameIndex];
      const savedFrames = frames.map((f, i) => i === activeFrameIndex ? { ...f, layers } : f);
      const newFrame = savedFrames[index];
      set({
        frames: savedFrames,
        activeFrameIndex: index,
        layers: newFrame.layers,
        activeLayerId: newFrame.layers[0]?.id ?? '',
        pixels: newFrame.layers[0]?.pixels ?? {},
        renderTick: get().renderTick + 1,
      });
    },

    setFrameDuration: (index, ms) => {
      const { frames } = get();
      set({ frames: frames.map((f, i) => i === index ? { ...f, duration: ms } : f) });
    },

    setIsPlaying: (v) => set({ isPlaying: v }),
    setFps: (fps) => set({ fps }),

    // -------- Selection --------
    setSelection: (sel) => set({ selection: sel }),

    cutSelection: () => {
      const { selection, layers, activeLayerId, canvasWidth, canvasHeight } = get();
      if (!selection) return;
      get().commitHistory();
      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer) return;
      const cut: Record<string, string> = {};
      const newPx = { ...layer.pixels };
      for (let dy = 0; dy < selection.h; dy++) {
        for (let dx = 0; dx < selection.w; dx++) {
          const px = selection.x + dx, py = selection.y + dy;
          const key = `${px},${py}`;
          if (newPx[key]) { cut[`${dx},${dy}`] = newPx[key]; delete newPx[key]; }
        }
      }
      _clipboard = { ...cut };
      const newLayers = layers.map(l => l.id === activeLayerId ? { ...l, pixels: newPx } : l);
      set({ layers: newLayers, pixels: newPx, selectionPixels: cut, renderTick: get().renderTick + 1 });
    },

    copySelection: () => {
      const { selection, layers, activeLayerId } = get();
      if (!selection) return;
      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer) return;
      const copy: Record<string, string> = {};
      for (let dy = 0; dy < selection.h; dy++) {
        for (let dx = 0; dx < selection.w; dx++) {
          const key = `${selection.x + dx},${selection.y + dy}`;
          if (layer.pixels[key]) copy[`${dx},${dy}`] = layer.pixels[key];
        }
      }
      _clipboard = { ...copy };
    },

    pasteSelection: () => {
      if (!Object.keys(_clipboard).length) return;
      get().commitHistory();
      const { layers, activeLayerId, selection, canvasWidth, canvasHeight } = get();
      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer) return;
      const offsetX = selection ? selection.x : 0;
      const offsetY = selection ? selection.y : 0;
      const newPx = { ...layer.pixels };
      for (const [key, color] of Object.entries(_clipboard)) {
        const [dx, dy] = key.split(',').map(Number);
        const px = offsetX + dx, py = offsetY + dy;
        if (px >= 0 && py >= 0 && px < canvasWidth && py < canvasHeight) {
          newPx[`${px},${py}`] = color;
        }
      }
      const newLayers = layers.map(l => l.id === activeLayerId ? { ...l, pixels: newPx } : l);
      set({ layers: newLayers, pixels: newPx, renderTick: get().renderTick + 1 });
    },

    deleteSelection: () => {
      const { selection, layers, activeLayerId } = get();
      if (!selection) return;
      get().commitHistory();
      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer) return;
      const newPx = { ...layer.pixels };
      for (let dy = 0; dy < selection.h; dy++) {
        for (let dx = 0; dx < selection.w; dx++) {
          delete newPx[`${selection.x + dx},${selection.y + dy}`];
        }
      }
      const newLayers = layers.map(l => l.id === activeLayerId ? { ...l, pixels: newPx } : l);
      set({ layers: newLayers, pixels: newPx, selection: null, renderTick: get().renderTick + 1 });
    },

    moveSelection: (dx, dy) => {
      const { selection } = get();
      if (!selection) return;
      set({ selection: { ...selection, x: selection.x + dx, y: selection.y + dy } });
    },

    // -------- Color & Tool --------
    setPrimaryColor: (color) => set({ primaryColor: color }),
    setSecondaryColor: (color) => set({ secondaryColor: color }),
    setActivePalette: (name) => set({ activePalette: name }),

    createCustomPalette: (name, colors) => {
      const { customPalettes } = get();
      set({ customPalettes: { ...customPalettes, [name]: colors }, activePalette: name });
    },
    deleteCustomPalette: (name) => {
      const { customPalettes } = get();
      const next = { ...customPalettes };
      delete next[name];
      set({ customPalettes: next, activePalette: 'Pico-8' });
    },
    addColorToPalette: (paletteName, color) => {
      const { customPalettes } = get();
      const curr = customPalettes[paletteName] ?? [];
      if (curr.includes(color)) return;
      set({ customPalettes: { ...customPalettes, [paletteName]: [...curr, color] } });
    },
    removeColorFromPalette: (paletteName, colorIndex) => {
      const { customPalettes } = get();
      const curr = [...(customPalettes[paletteName] ?? [])];
      curr.splice(colorIndex, 1);
      set({ customPalettes: { ...customPalettes, [paletteName]: curr } });
    },

    setActiveTool: (tool) => set({ activeTool: tool }),
    setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(64, zoom)) }),
    setPan: (x, y) => set({ panX: x, panY: y }),
    toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
    setSymmetryMode: (mode) => set({ symmetryMode: mode }),

    setCanvasSize: (w, h) => {
      const newLayer = makeLayer('Layer 1');
      set({ canvasWidth: w, canvasHeight: h, layers: [newLayer], activeLayerId: newLayer.id, pixels: newLayer.pixels, history: [{ layers: [newLayer], activeLayerId: newLayer.id }], historyIndex: 0 });
    },

    clearCanvas: () => {
      get().commitHistory();
      const { layers, activeLayerId } = get();
      const newLayers = layers.map(l => l.id === activeLayerId ? { ...l, pixels: {} } : l);
      set({ layers: newLayers, pixels: {}, renderTick: get().renderTick + 1 });
    },

    importPixels: (newPixels, w, h) => {
      get().commitHistory();
      const newLayer = makeLayer('Imported', newPixels);
      const newSnap = { layers: [newLayer], activeLayerId: newLayer.id };
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newSnap);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      set({
        canvasWidth: w,
        canvasHeight: h,
        layers: [newLayer],
        activeLayerId: newLayer.id,
        pixels: newPixels,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        renderTick: get().renderTick + 1,
      });
    },
  };
});
