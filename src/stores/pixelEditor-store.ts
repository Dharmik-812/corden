import { create } from 'zustand';

export type PixelTool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rectangle';
export type CanvasSize = 8 | 16 | 32 | 48 | 64 | 128;

const MAX_HISTORY = 60;

// Built-in palettes
export const PALETTES: Record<string, string[]> = {
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

export interface PixelEditorState {
  pixels: Record<string, string>;
  canvasWidth: CanvasSize;
  canvasHeight: CanvasSize;
  activeTool: PixelTool;
  primaryColor: string;
  secondaryColor: string;
  zoom: number;
  panX: number;
  panY: number;
  gridVisible: boolean;
  symmetryMode: 'none' | 'horizontal' | 'vertical' | 'both';
  activePalette: string;
  history: Record<string, string>[];
  historyIndex: number;

  setPixel: (x: number, y: number, color: string) => void;
  erasePixel: (x: number, y: number) => void;
  floodFill: (x: number, y: number, color: string) => void;
  commitHistory: () => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setActiveTool: (tool: PixelTool) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleGrid: () => void;
  setCanvasSize: (w: CanvasSize, h: CanvasSize) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  setSymmetryMode: (mode: 'none' | 'horizontal' | 'vertical' | 'both') => void;
  setActivePalette: (name: string) => void;
}

export const usePixelEditorStore = create<PixelEditorState>((set, get) => ({
  pixels: {},
  canvasWidth: 32,
  canvasHeight: 32,
  activeTool: 'pencil',
  primaryColor: '#ffffff',
  secondaryColor: '#000000',
  zoom: 16,
  panX: 0,
  panY: 0,
  gridVisible: true,
  symmetryMode: 'none',
  activePalette: 'Pico-8',
  history: [{}],
  historyIndex: 0,

  setPixel: (x, y, color) => {
    const { canvasWidth, canvasHeight, pixels, symmetryMode } = get();
    if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;
    
    const next = { ...pixels, [`${x},${y}`]: color };
    
    if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
      const sx = canvasWidth - 1 - x;
      if (sx !== x) next[`${sx},${y}`] = color;
    }
    if (symmetryMode === 'vertical' || symmetryMode === 'both') {
      const sy = canvasHeight - 1 - y;
      if (sy !== y) next[`${x},${sy}`] = color;
    }
    if (symmetryMode === 'both') {
      const sx = canvasWidth - 1 - x;
      const sy = canvasHeight - 1 - y;
      if (sx !== x && sy !== y) next[`${sx},${sy}`] = color;
    }
    
    set({ pixels: next });
  },

  erasePixel: (x, y) => {
    const { canvasWidth, canvasHeight, pixels, symmetryMode } = get();
    if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;
    const next = { ...pixels };
    delete next[`${x},${y}`];

    if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
      const sx = canvasWidth - 1 - x;
      if (sx !== x) delete next[`${sx},${y}`];
    }
    if (symmetryMode === 'vertical' || symmetryMode === 'both') {
      const sy = canvasHeight - 1 - y;
      if (sy !== y) delete next[`${x},${sy}`];
    }
    if (symmetryMode === 'both') {
      const sx = canvasWidth - 1 - x;
      const sy = canvasHeight - 1 - y;
      if (sx !== x && sy !== y) delete next[`${sx},${sy}`];
    }

    set({ pixels: next });
  },

  floodFill: (x, y, fillColor) => {
    const { pixels, canvasWidth, canvasHeight } = get();
    const key = `${x},${y}`;
    const targetColor = pixels[key] || null;

    if (targetColor === fillColor) return;

    const visited = new Set<string>();
    const queue: [number, number][] = [[x, y]];
    const next = { ...pixels };

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const ck = `${cx},${cy}`;
      if (visited.has(ck)) continue;
      if (cx < 0 || cy < 0 || cx >= canvasWidth || cy >= canvasHeight) continue;
      const currentColor = next[ck] || null;
      if (currentColor !== targetColor) continue;
      visited.add(ck);
      next[ck] = fillColor;
      queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    set({ pixels: next });
  },

  commitHistory: () => {
    const { pixels, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...pixels });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  setPrimaryColor: (color) => set({ primaryColor: color }),
  setSecondaryColor: (color) => set({ secondaryColor: color }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(2, Math.min(64, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setSymmetryMode: (mode) => set({ symmetryMode: mode }),
  setActivePalette: (name) => set({ activePalette: name }),

  setCanvasSize: (w, h) => {
    set({ canvasWidth: w, canvasHeight: h, pixels: {}, history: [{}], historyIndex: 0 });
  },

  clearCanvas: () => {
    get().commitHistory();
    set({ pixels: {} });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = historyIndex - 1;
    set({ pixels: { ...history[prev] }, historyIndex: prev });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = historyIndex + 1;
    set({ pixels: { ...history[next] }, historyIndex: next });
  },
}));
