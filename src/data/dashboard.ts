export const DASHBOARD_DATA = {
  eyebrow: "ATELIER WORKSPACE",
  title: "Your Projects",
  subtitleSuffix: "presets + saved projects",
  searchPlaceholder: "Search projects by title...",
  filters: [
    { key: "all", label: "All" },
    { key: "2d", label: "2D Drafts" },
    { key: "3d", label: "3D Scenes" },
  ],
  stats: {
    twoDLabel: "2D Drafts",
    threeDLabel: "3D Spatial",
    presetsLabel: "Presets",
  },
  createButtons: {
    twoD: "New 2D Draft",
    threeD: "New 3D Scene",
  },
  empty: {
    title: "No projects located",
    desc: "Refine your search criteria or create a new spatial draft.",
    createTwoD: "New 2D Draft",
    createThreeD: "New 3D Scene",
  },
  actions: {
    open: "Open Studio",
    delete: "Delete Project",
    confirmDelete: "Delete this project? This action cannot be reversed.",
  },
} as const;
