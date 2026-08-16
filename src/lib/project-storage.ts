import type { SceneObject, EnvironmentPreset, ShadingMode } from "@/stores/editor3d-store";

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
  pixels: Record<string, string>;
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

const INDEX_KEY = "corden-projects-index";
const DATA_PREFIX = "corden-project-data-";

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

function default2DPresetData(): Project2DData {
  const pixels: Record<string, string> = {};
  // Simple smiley face starter
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
  return {
    pixels,
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

function readIndex(): ProjectMeta[] {
  if (typeof window === "undefined") return PRESET_PROJECTS;
  try {
    const stored = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]") as ProjectMeta[];
    const userProjects = stored.filter((p) => !p.isPreset);
    return [...PRESET_PROJECTS, ...userProjects];
  } catch {
    return PRESET_PROJECTS;
  }
}

function writeIndex(projects: ProjectMeta[]) {
  const userProjects = projects.filter((p) => !p.isPreset);
  localStorage.setItem(INDEX_KEY, JSON.stringify(userProjects));
}

function dataKey(id: string) {
  return `${DATA_PREFIX}${id}`;
}

export function getAllProjects(): ProjectMeta[] {
  return readIndex().sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getProjectMeta(id: string): ProjectMeta | undefined {
  return readIndex().find((p) => p.id === id);
}

export function isPresetProject(id: string): boolean {
  return id === PRESET_2D_ID || id === PRESET_3D_ID;
}

export function loadProject2D(id: string): Project2DData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(dataKey(id));
    if (raw) return JSON.parse(raw) as Project2DData;
    if (id === PRESET_2D_ID) return default2DPresetData();
    return null;
  } catch {
    return id === PRESET_2D_ID ? default2DPresetData() : null;
  }
}

export function loadProject3D(id: string): Project3DData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(dataKey(id));
    if (raw) return JSON.parse(raw) as Project3DData;
    if (id === PRESET_3D_ID) return default3DPresetData();
    return null;
  } catch {
    return id === PRESET_3D_ID ? default3DPresetData() : null;
  }
}

export function saveProject2D(id: string, data: Project2DData, title?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(dataKey(id), JSON.stringify(data));
  const now = new Date().toISOString();
  const projects = readIndex();
  const idx = projects.findIndex((p) => p.id === id);
  const meta: ProjectMeta = {
    id,
    title: title ?? projects[idx]?.title ?? "Untitled 2D Draft",
    type: "2d",
    updated_at: now,
    isPreset: isPresetProject(id) || undefined,
    starred: projects[idx]?.starred,
  };
  if (idx >= 0) projects[idx] = meta;
  else projects.push(meta);
  writeIndex(projects);
}

export function saveProject3D(id: string, data: Project3DData, title?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(dataKey(id), JSON.stringify(data));
  const now = new Date().toISOString();
  const projects = readIndex();
  const idx = projects.findIndex((p) => p.id === id);
  const meta: ProjectMeta = {
    id,
    title: title ?? projects[idx]?.title ?? "Untitled 3D Scene",
    type: "3d",
    updated_at: now,
    isPreset: isPresetProject(id) || undefined,
    starred: projects[idx]?.starred,
  };
  if (idx >= 0) projects[idx] = meta;
  else projects.push(meta);
  writeIndex(projects);
}

export function createProject(type: ProjectType, title?: string): ProjectMeta {
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const meta: ProjectMeta = {
    id,
    title: title ?? (type === "2d" ? "Untitled 2D Draft" : "Untitled 3D Scene"),
    type,
    updated_at: new Date().toISOString(),
  };
  const projects = readIndex();
  projects.push(meta);
  writeIndex(projects);

  if (type === "2d") {
    saveProject2D(id, {
      pixels: {},
      canvasWidth: 32,
      canvasHeight: 32,
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      activePalette: "Pico-8",
    }, meta.title);
  } else {
    saveProject3D(
      id,
      {
        objects: [
          {
            id: "obj_default_cube",
            name: "Cube",
            type: "cube",
            objectType: "mesh",
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: "#E7EEF5",
            roughness: 0.5,
            metalness: 0.1,
            visible: true,
            hidden: false,
            renderVisible: true,
            locked: false,
            modifiers: [],
            keyframes: [],
          },
        ],
        environmentPreset: "studio",
        shadingMode: "solid",
        selectedId: null,
      },
      meta.title
    );
  }

  return meta;
}

export function deleteProject(id: string) {
  if (isPresetProject(id) || typeof window === "undefined") return;
  localStorage.removeItem(dataKey(id));
  writeIndex(readIndex().filter((p) => p.id !== id));
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
