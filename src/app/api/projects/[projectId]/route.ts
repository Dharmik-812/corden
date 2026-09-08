import { getDb, type DbProject } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ projectId: string }> };

// ─── GET /api/projects/:projectId ─────────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { projectId } = await params;

  const db = getDb();
  const row = db
    .prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?")
    .get(projectId, session.userId) as DbProject | undefined;

  if (!row) {
    // 404 — the client falls back to local preset data for preset-2d / preset-3d
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  return Response.json({
    project: {
      id: row.id,
      title: row.title,
      type: row.type,
      starred: row.starred === 1,
      updated_at: row.updated_at,
      isPreset: false,
      data: JSON.parse(row.data),
    },
  });
}

// ─── PUT /api/projects/:projectId ─────────────────────────────────────────
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { projectId } = await params;
  const db = getDb();

  // Ensure this project belongs to the user
  const existing = db
    .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
    .get(projectId, session.userId);
  if (!existing) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const { title, data, starred } = await request.json();
    const now = new Date().toISOString();

    const updates: string[] = ["updated_at = ?"];
    const values: unknown[] = [now];

    if (title !== undefined)   { updates.push("title = ?");   values.push(title); }
    if (data !== undefined)    { updates.push("data = ?");    values.push(JSON.stringify(data)); }
    if (starred !== undefined) { updates.push("starred = ?"); values.push(starred ? 1 : 0); }

    values.push(projectId);
    db.prepare(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    return Response.json({ ok: true, updated_at: now });
  } catch (err) {
    console.error("[projects PUT]", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── DELETE /api/projects/:projectId ──────────────────────────────────────
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { projectId } = await params;
  const db = getDb();

  const result = db
    .prepare("DELETE FROM projects WHERE id = ? AND user_id = ?")
    .run(projectId, session.userId);

  if (result.changes === 0) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
