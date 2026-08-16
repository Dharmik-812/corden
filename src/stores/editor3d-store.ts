import { create } from 'zustand';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type PrimitiveType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane';

export interface SceneObject {
  id: string;
  name: string;
  type: PrimitiveType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
  // For CSG operations
  isBoolean?: boolean;
  booleanOperation?: 'union' | 'subtract' | 'intersect';
  booleanChildren?: SceneObject[];
}

export interface Editor3DState {
  objects: SceneObject[];
  setObjects: (objs: SceneObject[]) => void;
  addObject: (type: PrimitiveType) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  transformMode: TransformMode;
  setTransformMode: (mode: TransformMode) => void;

  showLeftPanel: boolean;
  setShowLeftPanel: (show: boolean) => void;

  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;

  addMenuPosition: { x: number, y: number } | null;
  setAddMenuPosition: (pos: { x: number, y: number } | null) => void;
}

export const useEditor3DStore = create<Editor3DState>((set, get) => ({
  objects: [],
  setObjects: (objs) => set({ objects: objs }),
  
  addObject: (type) => {
    const newObj: SceneObject = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${get().objects.length + 1}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#E7EEF5', // Chalk white default
      roughness: 0.5,
      metalness: 0.1,
    };
    set((state) => ({ 
      objects: [...state.objects, newObj],
      selectedId: newObj.id 
    }));
  },

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    )
  })),

  removeObject: (id) => set((state) => ({
    objects: state.objects.filter(obj => obj.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  transformMode: 'translate',
  setTransformMode: (mode) => set({ transformMode: mode }),

  showLeftPanel: true,
  setShowLeftPanel: (show) => set({ showLeftPanel: show }),

  showRightPanel: true,
  setShowRightPanel: (show) => set({ showRightPanel: show }),

  addMenuPosition: null,
  setAddMenuPosition: (pos) => set({ addMenuPosition: pos }),
}));
