import { getDb, type DbUser } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { display_name, email } = await request.json();
    const db = getDb();

    // If email is changing, make sure it isn't already taken by another user
    if (email && email !== session.email) {
      const conflict = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, session.userId);
      if (conflict) {
        return Response.json({ error: "Email already in use." }, { status: 409 });
      }
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (display_name !== undefined) { updates.push("display_name = ?"); values.push(display_name); }
    if (email !== undefined)        { updates.push("email = ?");        values.push(email); }

    if (updates.length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    values.push(session.userId);
    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const updated = db
      .prepare("SELECT id, email, display_name, membership_tier, created_at FROM users WHERE id = ?")
      .get(session.userId) as Omit<DbUser, "password_hash">;

    // Refresh the session cookie with updated data
    await setSessionCookie({
      userId: updated.id,
      email: updated.email,
      display_name: updated.display_name,
      membership_tier: updated.membership_tier,
    });

    return Response.json({ user: updated });
  } catch (err) {
    console.error("[auth/profile]", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
