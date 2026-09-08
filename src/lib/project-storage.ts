/**
 * project-storage.ts — Dual-Tier Resilient Project Persistence.
 *
 * Combines backend API persistence with browser localStorage synchronization.
 * - Always preserves changes to both preset starters and user drafts.
 * - Works seamlessly whether authenticated or guest.
 * - Automatically falls back to offline/local storage if API returns 401/404.
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

// ─── Local Storage Keys ────────────────────────────────────────────────────
const LOCAL_PROJECTS_KEY = "corden_local_projects_v2";

function getLocalProjectsMeta(): ProjectMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProjectsMeta(list: ProjectMeta[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list));
  } catch {
    // quota exceeded or private mode
  }
}

function updateLocalMeta(meta: ProjectMeta): void {
  const current = getLocalProjectsMeta();
  const idx = current.findIndex((p) => p.id === meta.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...meta };
  } else {
    current.unshift(meta);
  }
  saveLocalProjectsMeta(current);
}

// ─── Preset default data ───────────────────────────────────────────────────
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

// ─── Project List ──────────────────────────────────────────────────────────
export async function getAllProjects(): Promise<ProjectMeta[]> {
  const presetMap = new Map<string, ProjectMeta>();
  PRESET_PROJECTS.forEach((p) => {
    let title = p.title;
    let updated_at = p.updated_at;
    if (typeof window !== "undefined") {
      const customTitle = localStorage.getItem(`corden_preset_title_${p.id}`);
      const customTime = localStorage.getItem(`corden_preset_time_${p.id}`);
      if (customTitle) title = customTitle;
      if (customTime) updated_at = customTime;
    }
    presetMap.set(p.id, { ...p, title, updated_at });
  });

  let serverProjects: ProjectMeta[] = [];
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const json = await res.json();
      serverProjects = json.projects ?? [];
    }
  } catch {
    // offline or guest
  }

  const localProjects = getLocalProjectsMeta();
  const mergedMap = new Map<string, ProjectMeta>();

  // Add presets
  presetMap.forEach((p, id) => mergedMap.set(id, p));

  // Add local projects
  localProjects.forEach((p) => mergedMap.set(p.id, p));

  // Overwrite or add server projects
  serverProjects.forEach((p) => mergedMap.set(p.id, p));

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | undefined> {
  if (isPresetProject(id)) {
    const p = PRESET_PROJECTS.find((item) => item.id === id);
    if (!p) return undefined;
    let title = p.title;
    let updated_at = p.updated_at;
    if (typeof window !== "undefined") {
      const customTitle = localStorage.getItem(`corden_preset_title_${id}`);
      const customTime = localStorage.getItem(`corden_preset_time_${id}`);
      if (customTitle) title = customTitle;
      if (customTime) updated_at = customTime;
    }
    return { ...p, title, updated_at };
  }

  try {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.project as ProjectMeta;
    }
  } catch {
    // fallback to local
  }

  const locals = getLocalProjectsMeta();
  return locals.find((p) => p.id === id);
}

// ─── Load ──────────────────────────────────────────────────────────────────
export async function loadProject2D(id: string): Promise<Project2DData | null> {
  if (id === PRESET_2D_ID) {
    if (typeof window !== "undefined") {
      const custom = localStorage.getItem(`corden_preset_data_${PRESET_2D_ID}`);
      if (custom) {
        try {
          return JSON.parse(custom);
        } catch {
          // fall through
        }
      }
    }
    return default2DPresetData();
  }

  // 1. Try server
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const json = await res.json();
      const data = json.project?.data as Project2DData | undefined;
      if (data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`corden_data_${id}`, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch {
    // fall through to local
  }

  // 2. Fallback to local storage
  if (typeof window !== "undefined") {
    const localRaw = localStorage.getItem(`corden_data_${id}`);
    if (localRaw) {
      try {
        return JSON.parse(localRaw);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function loadProject3D(id: string): Promise<Project3DData | null> {
  if (id === PRESET_3D_ID) {
    if (typeof window !== "undefined") {
      const custom = localStorage.getItem(`corden_preset_data_${PRESET_3D_ID}`);
      if (custom) {
        try {
          return JSON.parse(custom);
        } catch {
          // fall through
        }
      }
    }
    return default3DPresetData();
  }

  // 1. Try server
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const json = await res.json();
      const data = json.project?.data as Project3DData | undefined;
      if (data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`corden_data_${id}`, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch {
    // fall through to local
  }

  // 2. Fallback to local storage
  if (typeof window !== "undefined") {
    const localRaw = localStorage.getItem(`corden_data_${id}`);
    if (localRaw) {
      try {
        return JSON.parse(localRaw);
      } catch {
        return null;
      }
    }
  }

  return null;
}

// ─── Save ──────────────────────────────────────────────────────────────────
export async function saveProject2D(id: string, data: Project2DData, title?: string): Promise<void> {
  const now = new Date().toISOString();

  // If saving preset, persist user's custom design locally so it's never lost
  if (isPresetProject(id)) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`corden_preset_data_${id}`, JSON.stringify(data));
        localStorage.setItem(`corden_preset_time_${id}`, now);
        if (title) localStorage.setItem(`corden_preset_title_${id}`, title);
      } catch {
        // storage quota
      }
    }
    return;
  }

  // Save regular projects to localStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`corden_data_${id}`, JSON.stringify(data));
      updateLocalMeta({
        id,
        title: title || "Untitled 2D Draft",
        type: "2d",
        updated_at: now,
      });
    } catch {
      // storage quota
    }
  }

  // Sync with server if logged in
  try {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, ...(title ? { title } : {}) }),
    });
  } catch {
    // offline / non-fatal
  }
}

export async function saveProject3D(id: string, data: Project3DData, title?: string): Promise<void> {
  const now = new Date().toISOString();

  // If saving preset, persist user's custom design locally so it's never lost
  if (isPresetProject(id)) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`corden_preset_data_${id}`, JSON.stringify(data));
        localStorage.setItem(`corden_preset_time_${id}`, now);
        if (title) localStorage.setItem(`corden_preset_title_${id}`, title);
      } catch {
        // storage quota
      }
    }
    return;
  }

  // Save regular projects to localStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`corden_data_${id}`, JSON.stringify(data));
      updateLocalMeta({
        id,
        title: title || "Untitled 3D Scene",
        type: "3d",
        updated_at: now,
      });
    } catch {
      // storage quota
    }
  }

  // Sync with server if logged in
  try {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, ...(title ? { title } : {}) }),
    });
  } catch {
    // offline / non-fatal
  }
}

// ─── Create ────────────────────────────────────────────────────────────────
export async function createProject(type: ProjectType, title?: string): Promise<ProjectMeta> {
  const defaultTitle = title ?? (type === "2d" ? "Untitled 2D Draft" : "Untitled 3D Scene");

  // 1. Try server
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: defaultTitle }),
    });
    if (res.ok) {
      const json = await res.json();
      const meta = json.project as ProjectMeta;
      updateLocalMeta(meta);
      return meta;
    }
  } catch {
    // fall through to local
  }

  // 2. Fallback for guest / offline use — generate local ID
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const localMeta: ProjectMeta = {
    id,
    title: defaultTitle,
    type,
    updated_at: new Date().toISOString(),
  };
  updateLocalMeta(localMeta);
  return localMeta;
}

// ─── Delete ────────────────────────────────────────────────────────────────
export async function deleteProject(id: string): Promise<void> {
  if (isPresetProject(id)) {
    // Reset preset to original default
    if (typeof window !== "undefined") {
      localStorage.removeItem(`corden_preset_data_${id}`);
      localStorage.removeItem(`corden_preset_time_${id}`);
      localStorage.removeItem(`corden_preset_title_${id}`);
    }
    return;
  }

  // Remove locally
  if (typeof window !== "undefined") {
    localStorage.removeItem(`corden_data_${id}`);
    const current = getLocalProjectsMeta();
    saveLocalProjectsMeta(current.filter((p) => p.id !== id));
  }

  // Remove from server
  try {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  } catch {
    // non-fatal
  }
}
