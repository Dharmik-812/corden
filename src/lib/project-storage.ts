/**
 * project-storage.ts — API-backed project persistence.
 *
 * All functions now call the backend REST API instead of localStorage.
 * The exported types and function signatures are preserved exactly so
 * all components and hooks that import from this file continue to work.
 *
 * Preset projects (preset-2d, preset-3d) are still served from local
 * default data — the API returns 404 for them and we fall back gracefully.
 */

import type { SceneObject, EnvironmentPreset, ShadingMode } from "@/stores/editor3d-store";
import type { Layer } from "@/stores/pixelEditor-store";

export type ProjectType = "2d" | "3d";

export interface ProjectMeta {
  id: string;
  title: string;
  type: ProjectType;
  updated_at: string;
  isPreset?: boolean;
  starred?: boolean;
}

export interface Project2DData {
  layers: Layer[];
  activeLayerId: string;
  canvasWidth: number;
  canvasHeight: number;
  primaryColor: string;
  secondaryColor: string;
  activePalette: string;
}

export interface Project3DData {
  objects: SceneObject[];
  environmentPreset: EnvironmentPreset;
  shadingMode: ShadingMode;
  selectedId: string | null;
}

// ─── Preset IDs ────────────────────────────────────────────────────────────
export const PRESET_2D_ID = "preset-2d";
export const PRESET_3D_ID = "preset-3d";

const PRESET_PROJECTS: ProjectMeta[] = [
  {
    id: PRESET_2D_ID,
    title: "Pixel Art Starter",
    type: "2d",
    updated_at: new Date().toISOString(),
    isPreset: true,
    starred: true,
  },
  {
    id: PRESET_3D_ID,
    title: "3D Scene Starter",
    type: "3d",
    updated_at: new Date().toISOString(),
    isPreset: true,
    starred: false,
  },
];

// ─── Preset default data (unchanged from original) ─────────────────────────
function default2DPresetData(): Project2DData {
  const pixels: Record<string, string> = {};
  const colors = ["#FFEC27", "#FF004D", "#000000", "#29ADFF"];
  const pattern = [
    "....XXXX....",
    "...XXXXXX...",
    "..XXXXXXXX..",
    ".XX.XXXX.XX.",
    ".XX.XXXX.XX.",
    ".XXXX..XXXX.",
    "..XXXXXXXX..",
    "...XXXXXX...",
    "....XXXX....",
  ];
  const offsetX = 12;
  const offsetY = 12;
  pattern.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "X") {
        let color = colors[0];
        if (y === 3 && (x === 2 || x === 9)) color = colors[2];
        if (y === 5 && x >= 4 && x <= 7) color = colors[1];
        pixels[`${offsetX + x},${offsetY + y}`] = color;
      }
    });
  });
  const layerId = "layer-preset";
  return {
    layers: [{ id: layerId, name: "Background", pixels, visible: true, opacity: 1, locked: false }],
    activeLayerId: layerId,
    canvasWidth: 32,
    canvasHeight: 32,
    primaryColor: "#FFEC27",
    secondaryColor: "#000000",
    activePalette: "Pico-8",
  };
}

function default3DPresetData(): Project3DData {
  return {
    objects: [
      {
        id: "obj_preset_cube",
        name: "Cube",
        type: "cube",
        objectType: "mesh",
        position: [0, 0.5, 0],
        rotation: [0, 0.4, 0],
        scale: [1, 1, 1],
        color: "#4772b3",
        roughness: 0.4,
        metalness: 0.2,
        visible: true,
        hidden: false,
        renderVisible: true,
        locked: false,
        modifiers: [],
        keyframes: [],
      },
      {
        id: "obj_preset_sphere",
        name: "Sphere",
        type: "sphere",
        objectType: "mesh",
        position: [-1.8, 0.6, 0.5],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
        color: "#8e54e9",
        roughness: 0.3,
        metalness: 0.5,
        visible: true,
        hidden: false,
        renderVisible: true,
        locked: false,
        modifiers: [],
        keyframes: [],
      },
      {
        id: "obj_preset_plane",
        name: "Ground",
        type: "plane",
        objectType: "mesh",
        position: [0, 0, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [6, 6, 1],
        color: "#1a1f2e",
        roughness: 0.9,
        metalness: 0,
        visible: true,
        hidden: false,
        renderVisible: true,
        locked: false,
        modifiers: [],
        keyframes: [],
      },
    ],
    environmentPreset: "studio",
    shadingMode: "material",
    selectedId: null,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
export function isPresetProject(id: string): boolean {
  return id === PRESET_2D_ID || id === PRESET_3D_ID;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Project list ──────────────────────────────────────────────────────────
export async function getAllProjects(): Promise<ProjectMeta[]> {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) return PRESET_PROJECTS; // not logged in → show only presets
    const json = await res.json();
    const userProjects: ProjectMeta[] = json.projects ?? [];
    return [
      ...PRESET_PROJECTS.map((p) => ({ ...p, updated_at: new Date().toISOString() })),
      ...userProjects,
    ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch {
    return PRESET_PROJECTS;
  }
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | undefined> {
  if (isPresetProject(id)) return PRESET_PROJECTS.find((p) => p.id === id);
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.project as ProjectMeta;
  } catch {
    return undefined;
  }
}

// ─── Load ──────────────────────────────────────────────────────────────────
export async function loadProject2D(id: string): Promise<Project2DData | null> {
  if (id === PRESET_2D_ID) return default2DPresetData();
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.project?.data as Project2DData | undefined;
    if (!data) return null;
    // Back-compat: old data may have flat `pixels` instead of layers
    if (!data.layers && (data as unknown as Record<string, unknown>).pixels) {
      data.layers = [
        {
          id: "layer-1",
          name: "Layer 1",
          pixels: (data as unknown as Record<string, unknown>).pixels as Record<string, string>,
          visible: true,
          opacity: 1,
          locked: false,
        },
      ];
      data.activeLayerId = "layer-1";
    }
    return data;
  } catch {
    return null;
  }
}

export async function loadProject3D(id: string): Promise<Project3DData | null> {
  if (id === PRESET_3D_ID) return default3DPresetData();
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.project?.data as Project3DData) ?? null;
  } catch {
    return null;
  }
}

// ─── Save ──────────────────────────────────────────────────────────────────
export async function saveProject2D(id: string, data: Project2DData, title?: string): Promise<void> {
  if (isPresetProject(id)) return; // never persist presets
  try {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, ...(title ? { title } : {}) }),
    });
  } catch {
    // autosave failure is non-fatal
  }
}

export async function saveProject3D(id: string, data: Project3DData, title?: string): Promise<void> {
  if (isPresetProject(id)) return;
  try {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, ...(title ? { title } : {}) }),
    });
  } catch {
    // autosave failure is non-fatal
  }
}

// ─── Create ────────────────────────────────────────────────────────────────
export async function createProject(type: ProjectType, title?: string): Promise<ProjectMeta> {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project as ProjectMeta;
    }
  } catch {
    // fall through to local fallback
  }

  // Fallback for guest / offline use — generate a local ID
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    title: title ?? (type === "2d" ? "Untitled 2D Draft" : "Untitled 3D Scene"),
    type,
    updated_at: new Date().toISOString(),
  };
}

// ─── Delete ────────────────────────────────────────────────────────────────
export async function deleteProject(id: string): Promise<void> {
  if (isPresetProject(id)) return;
  try {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  } catch {
    // non-fatal
  }
}
