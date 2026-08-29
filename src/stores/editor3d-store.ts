import { create } from 'zustand';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type PrimitiveType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'icosphere' | 'suzanne';
export type LightType = 'point' | 'sun' | 'spot' | 'area';
export type ShadingMode = 'solid' | 'wireframe' | 'material' | 'rendered';
export type SelectionMode = 'object' | 'edit';
export type EditSubMode = 'vertex' | 'edge' | 'face';
export type PivotPoint = 'individual' | 'median' | 'cursor' | 'active';
export type ObjectType = 'mesh' | 'light' | 'camera';
export type EnvironmentPreset = 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'city';
export type InteractionMode = 'select' | 'cursor' | 'measure' | 'annotate';

export interface PostFXSettings {
  enabled: boolean;
  bloom: { enabled: boolean; intensity: number; luminanceThreshold: number };
  ssao: { enabled: boolean; intensity: number; radius: number };
  dof: { enabled: boolean; focusDistance: number; focalLength: number; bokehScale: number };
  chromaticAberration: { enabled: boolean; offset: [number, number] };
}

export interface Modifier {
  id: string;
  type: 'subdivision' | 'mirror' | 'solidify' | 'array' | 'wireframe';
  enabled: boolean;
  // subdivision
  levels?: number;
  // mirror
  mirrorX?: boolean; mirrorY?: boolean; mirrorZ?: boolean;
  // solidify
  thickness?: number;
  // array
  count?: number; offsetX?: number; offsetY?: number; offsetZ?: number;
}

export interface Keyframe {
  frame: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface Annotation {
  id: string;
  points: [number, number, number][];
}

export interface Measurement {
  id: string;
  start: [number, number, number];
  end: [number, number, number] | null;
}

export interface SceneObject {
  id: string;
  name: string;
  type: PrimitiveType;
  objectType: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  // Mesh properties
  color: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  wireframe?: boolean;
  smoothShading?: boolean;
  // Light properties (when objectType === 'light')
  lightType?: LightType;
  lightColor?: string;
  lightIntensity?: number;
  lightDistance?: number;
  lightAngle?: number;  // for spot
  lightPenumbra?: number; // for spot
  // Visibility
  visible: boolean;
  hidden: boolean;
  renderVisible: boolean;
  locked: boolean;
  // Camera properties
  fov?: number;
  // Texture properties
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  // Modifiers
  modifiers: Modifier[];
  // Animation
  keyframes: Keyframe[];
  // CSG (legacy)
  isBoolean?: boolean;
  booleanOperation?: 'union' | 'subtract' | 'intersect';
  booleanChildren?: SceneObject[];
}

export interface HistoryEntry {
  objects: SceneObject[];
  selectedId: string | null;
}

export interface Editor3DState {
  objects: SceneObject[];
  setObjects: (objs: SceneObject[]) => void;
  addObject: (type: PrimitiveType, extra?: Partial<SceneObject>) => void;
  addLight: (lightType: LightType) => void;
  addCamera: () => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  hideObject: (id: string) => void;
  unhideAll: () => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  transformMode: TransformMode;
  setTransformMode: (mode: TransformMode) => void;

  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;

  annotations: Annotation[];
  setAnnotations: (ann: Annotation[]) => void;
  
  measurements: Measurement[];
  setMeasurements: (meas: Measurement[]) => void;

  shadingMode: ShadingMode;
  setShadingMode: (mode: ShadingMode) => void;

  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;

  editSubMode: EditSubMode;
  setEditSubMode: (mode: EditSubMode) => void;

  pivotPoint: PivotPoint;
  setPivotPoint: (p: PivotPoint) => void;

  cursor3D: [number, number, number];
  setCursor3D: (pos: [number, number, number]) => void;

  showLeftPanel: boolean;
  setShowLeftPanel: (show: boolean) => void;

  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;

  showNPanel: boolean;
  setShowNPanel: (show: boolean) => void;

  showTimeline: boolean;
  setShowTimeline: (show: boolean) => void;

  showShaderPie: boolean;
  setShowShaderPie: (show: boolean) => void;

  addMenuPosition: { x: number, y: number } | null;
  setAddMenuPosition: (pos: { x: number, y: number } | null) => void;

  environmentPreset: EnvironmentPreset;
  setEnvironmentPreset: (preset: EnvironmentPreset) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  showAxes: boolean;
  toggleAxes: () => void;

  // Camera
  viewPreset: 'perspective' | 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom' | 'camera';
  setViewPreset: (p: Editor3DState['viewPreset']) => void;
  isOrtho: boolean;
  setIsOrtho: (v: boolean) => void;

  // Animation
  currentFrame: number;
  setCurrentFrame: (f: number) => void;
  totalFrames: number;
  setTotalFrames: (f: number) => void;
  fps: number;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  addKeyframe: (objectId: string) => void;
  removeKeyframe: (objectId: string, frame: number) => void;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Modifiers
  addModifier: (objectId: string, type: Modifier['type'], extra?: Partial<Modifier>) => void;
  removeModifier: (objectId: string, modifierId: string) => void;
  updateModifier: (objectId: string, modifierId: string, updates: Partial<Modifier>) => void;
  toggleModifier: (objectId: string, modifierId: string) => void;
  applyModifier: (objectId: string, modifierId: string) => void;
  // Post-Processing
  postFX: PostFXSettings;
  setPostFX: (fx: Partial<PostFXSettings>) => void;
  updatePostFX: <K extends keyof PostFXSettings>(key: K, updates: Partial<PostFXSettings[K]>) => void;

  // Physics
  physicsEnabled: boolean;
  setPhysicsEnabled: (v: boolean) => void;
}

const defaultCube: SceneObject = {
  id: 'obj_default_cube',
  name: 'Cube',
  type: 'cube',
  objectType: 'mesh',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#E7EEF5',
  roughness: 0.5,
  metalness: 0.1,
  visible: true,
  hidden: false,
  renderVisible: true,
  locked: false,
  smoothShading: false,
  modifiers: [],
  keyframes: [],
};

export const useEditor3DStore = create<Editor3DState>((set, get) => ({
  // Physics
  physicsEnabled: false,
  setPhysicsEnabled: (v) => set({ physicsEnabled: v }),

  // Post-Processing
  postFX: {
    enabled: false,
    bloom: { enabled: true, intensity: 1.5, luminanceThreshold: 0.8 },
    ssao: { enabled: false, intensity: 1.0, radius: 0.1 },
    dof: { enabled: false, focusDistance: 0.5, focalLength: 0.05, bokehScale: 2.0 },
    chromaticAberration: { enabled: false, offset: [0.002, 0.002] },
  },
  setPostFX: (fx) => set((state) => ({ postFX: { ...state.postFX, ...fx } })),
  updatePostFX: (key, updates) => set((state) => {
    if (key === 'enabled') {
      return { postFX: { ...state.postFX, enabled: updates as unknown as boolean } };
    }
    return {
      postFX: {
        ...state.postFX,
        [key]: { ...(state.postFX[key] as Record<string, unknown>), ...updates }
      }
    };
  }),

  objects: [defaultCube],
  setObjects: (objs) => set({ objects: objs }),

  addObject: (type, extra = {}) => {
    get().commitHistory();
    const count = get().objects.filter(o => o.type === type).length;
    const newObj: SceneObject = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}${count > 0 ? ` ${count + 1}` : ''}`,
      type,
      objectType: 'mesh',
      position: [get().cursor3D[0], get().cursor3D[1], get().cursor3D[2]],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#E7EEF5',
      roughness: 0.5,
      metalness: 0.1,
      visible: true,
      hidden: false,
      renderVisible: true,
      locked: false,
      smoothShading: type !== 'cube',
      modifiers: [],
      keyframes: [],
      ...extra,
    };
    set((state) => ({ objects: [...state.objects, newObj], selectedId: newObj.id }));
  },

  addLight: (lightType) => {
    get().commitHistory();
    const lightNames: Record<LightType, string> = {
      point: 'Point Light', sun: 'Sun', spot: 'Spot Light', area: 'Area Light'
    };
    const newLight: SceneObject = {
      id: `light_${Date.now()}`,
      name: lightNames[lightType],
      type: 'cube',
      objectType: 'light',
      lightType,
      lightColor: '#ffffff',
      lightIntensity: lightType === 'sun' ? 1 : 3,
      lightDistance: lightType === 'point' ? 10 : 0,
      lightAngle: Math.PI / 6,
      lightPenumbra: 0.15,
      position: [0, 3, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0,
      visible: true,
      hidden: false,
      renderVisible: true,
      locked: false,
      smoothShading: false,
      modifiers: [],
      keyframes: [],
    };
    set((state) => ({ objects: [...state.objects, newLight], selectedId: newLight.id }));
  },

  addCamera: () => {
    get().commitHistory();
    const count = get().objects.filter(o => o.objectType === 'camera').length;
    const newCamera: SceneObject = {
      id: `camera_${Date.now()}`,
      name: `Camera${count > 0 ? ` ${count + 1}` : ''}`,
      type: 'cube', // dummy type for base
      objectType: 'camera',
      fov: 50,
      position: [get().cursor3D[0] + 5, get().cursor3D[1] + 5, get().cursor3D[2] + 5],
      rotation: [-Math.PI / 4, Math.PI / 4, 0], // point towards origin roughly
      scale: [1, 1, 1],
      color: '#ffffff',
      roughness: 0,
      metalness: 0,
      visible: true,
      hidden: false,
      renderVisible: true,
      locked: false,
      smoothShading: false,
      modifiers: [],
      keyframes: [],
    };
    set((state) => ({ objects: [...state.objects, newCamera], selectedId: newCamera.id }));
  },

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
  })),

  removeObject: (id) => {
    get().commitHistory();
    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  duplicateObject: (id) => {
    get().commitHistory();
    const obj = get().objects.find(o => o.id === id);
    if (!obj) return;
    const dup: SceneObject = {
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${obj.name} Copy`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]],
      modifiers: obj.modifiers.map(m => ({ ...m, id: `mod_${Date.now()}_${Math.random()}` })),
      keyframes: [],
    };
    set((state) => ({ objects: [...state.objects, dup], selectedId: dup.id }));
  },

  hideObject: (id) => set((state) => ({
    objects: state.objects.map(o => o.id === id ? { ...o, hidden: !o.hidden } : o)
  })),

  unhideAll: () => set((state) => ({
    objects: state.objects.map(o => ({ ...o, hidden: false }))
  })),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  transformMode: 'translate',
  setTransformMode: (mode) => set({ transformMode: mode }),

  interactionMode: 'select',
  setInteractionMode: (mode) => set({ interactionMode: mode }),

  annotations: [],
  setAnnotations: (ann) => set({ annotations: ann }),

  measurements: [],
  setMeasurements: (meas) => set({ measurements: meas }),

  shadingMode: 'solid',
  setShadingMode: (mode) => set({ shadingMode: mode }),

  selectionMode: 'object',
  setSelectionMode: (mode) => set({ selectionMode: mode }),

  editSubMode: 'vertex',
  setEditSubMode: (mode) => set({ editSubMode: mode }),

  pivotPoint: 'median',
  setPivotPoint: (p) => set({ pivotPoint: p }),

  cursor3D: [0, 0, 0],
  setCursor3D: (pos) => set({ cursor3D: pos }),

  showLeftPanel: true,
  setShowLeftPanel: (show) => set({ showLeftPanel: show }),
  showRightPanel: true,
  setShowRightPanel: (show) => set({ showRightPanel: show }),
  showNPanel: false,
  setShowNPanel: (show) => set({ showNPanel: show }),
  showTimeline: true,
  setShowTimeline: (show) => set({ showTimeline: show }),
  showShaderPie: false,
  setShowShaderPie: (show) => set({ showShaderPie: show }),

  addMenuPosition: null,
  setAddMenuPosition: (pos) => set({ addMenuPosition: pos }),

  environmentPreset: 'studio',
  setEnvironmentPreset: (preset) => set({ environmentPreset: preset }),

  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  showAxes: true,
  toggleAxes: () => set((s) => ({ showAxes: !s.showAxes })),

  viewPreset: 'perspective',
  setViewPreset: (p) => set({ viewPreset: p }),
  isOrtho: false,
  setIsOrtho: (v) => set({ isOrtho: v }),

  currentFrame: 1,
  setCurrentFrame: (f) => set({ currentFrame: f }),
  totalFrames: 250,
  setTotalFrames: (f) => set({ totalFrames: f }),
  fps: 24,
  isPlaying: false,
  setIsPlaying: (v) => set({ isPlaying: v }),

  addKeyframe: (objectId) => {
    const { currentFrame, objects } = get();
    const obj = objects.find(o => o.id === objectId);
    if (!obj) return;
    const kf: Keyframe = {
      frame: currentFrame,
      position: [...obj.position],
      rotation: [...obj.rotation],
      scale: [...obj.scale],
    };
    set((state) => ({
      objects: state.objects.map(o => {
        if (o.id !== objectId) return o;
        const filtered = o.keyframes.filter(k => k.frame !== currentFrame);
        return { ...o, keyframes: [...filtered, kf].sort((a, b) => a.frame - b.frame) };
      })
    }));
  },

  removeKeyframe: (objectId, frame) => set((state) => ({
    objects: state.objects.map(o => o.id === objectId
      ? { ...o, keyframes: o.keyframes.filter(k => k.frame !== frame) }
      : o
    )
  })),

  history: [{ objects: [defaultCube], selectedId: null }],
  historyIndex: 0,

  commitHistory: () => {
    const { objects, selectedId, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ objects: JSON.parse(JSON.stringify(objects)), selectedId });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    const entry = history[idx];
    set({ objects: entry.objects, selectedId: entry.selectedId, historyIndex: idx });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    const entry = history[idx];
    set({ objects: entry.objects, selectedId: entry.selectedId, historyIndex: idx });
  },

  addModifier: (objectId, type, extra) => {
    const mod: Modifier = {
      id: `mod_${Date.now()}`,
      type,
      enabled: true,
      levels: 1,
      mirrorX: true, mirrorY: false, mirrorZ: false,
      thickness: 0.1,
      count: 3, offsetX: 2, offsetY: 0, offsetZ: 0,
      ...extra
    };
    set((state) => ({
      objects: state.objects.map(o => o.id === objectId
        ? { ...o, modifiers: [...o.modifiers, mod] }
        : o
      )
    }));
  },

  removeModifier: (objectId, modifierId) => set((state) => ({
    objects: state.objects.map(o => o.id === objectId
      ? { ...o, modifiers: o.modifiers.filter(m => m.id !== modifierId) }
      : o
    )
  })),

  updateModifier: (objectId, modifierId, updates) => set((state) => ({
    objects: state.objects.map(o => o.id === objectId
      ? { ...o, modifiers: o.modifiers.map(m => m.id === modifierId ? { ...m, ...updates } : m) }
      : o
    )
  })),

  toggleModifier: (objectId, modifierId) => set((state) => ({
    objects: state.objects.map(o => o.id === objectId
      ? { ...o, modifiers: o.modifiers.map(m => m.id === modifierId ? { ...m, enabled: !m.enabled } : m) }
      : o
    )
  })),

  applyModifier: (objectId, modifierId) => {
    // For now just remove it (destructive apply would need geometry manipulation)
    get().removeModifier(objectId, modifierId);
  },
}));
