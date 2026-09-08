export interface SplashStep {
  label: string;
}

export const SPLASH_CONFIG = {
  durationMs: 2200,
  badgeText: "Corden Atelier",
  versionText: "v0.1 · Precision Spatial Drafting",
  steps: [
    { label: "Initializing spatial engine" },
    { label: "Calibrating drafting canvas" },
    { label: "Syncing project workspace" },
    { label: "Studio ready" },
  ],
} as const;
