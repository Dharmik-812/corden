import { getDb, type DbProject } from "@/lib/db";
import { getSession } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

// ─── Preset project IDs (served client-side only, never stored in DB) ─────
const PRESET_IDS = new Set(["preset-2d", "preset-3d"]);

// ─── GET /api/projects ─────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, user_id, title, type, starred, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .all(session.userId) as Omit<DbProject, "data">[];

  // Shape rows into the ProjectMeta format the client expects
  const projects = rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    starred: r.starred === 1,
    updated_at: r.updated_at,
    isPreset: false,
  }));

  return Response.json({ projects });
}

// ─── POST /api/projects ────────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { type, title } = await request.json();
    if (type !== "2d" && type !== "3d") {
      return Response.json({ error: "type must be '2d' or '3d'." }, { status: 400 });
    }

    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const defaultTitle = title ?? (type === "2d" ? "Untitled 2D Draft" : "Untitled 3D Scene");

    const defaultData =
      type === "2d"
        ? JSON.stringify({
            layers: [
              { id: "layer-1", name: "Layer 1", pixels: {}, visible: true, opacity: 1, locked: false },
            ],
            activeLayerId: "layer-1",
            canvasWidth: 32,
            canvasHeight: 32,
            primaryColor: "#ffffff",
            secondaryColor: "#000000",
            activePalette: "Pico-8",
          })
        : JSON.stringify({
            objects: [
              {
                id: uuidv4(),
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
          });

    const db = getDb();
    db.prepare(
      "INSERT INTO projects (id, user_id, title, type, starred, updated_at, data) VALUES (?, ?, ?, ?, 0, ?, ?)"
    ).run(id, session.userId, defaultTitle, type, now, defaultData);

    return Response.json({
      project: { id, title: defaultTitle, type, starred: false, updated_at: now, isPreset: false },
    });
  } catch (err) {
    console.error("[projects POST]", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
