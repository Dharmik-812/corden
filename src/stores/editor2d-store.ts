import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolType = 'select' | 'rect' | 'ellipse' | 'line' | 'freehand' | 'text' | 'connector';

export interface Editor2DState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;

  // We keep a reference to the active Fabric canvas here for easy access from outside React
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
}

export const useEditor2DStore = create<Editor2DState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  snapToGrid: true,
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  gridSize: 20,
  setGridSize: (size) => set({ gridSize: size }),

  canvas: null,
  setCanvas: (canvas) => set({ canvas }),

  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
}));
