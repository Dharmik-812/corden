import { getDb, type DbUser } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getDb();
  db.prepare("UPDATE users SET membership_tier = 'pro' WHERE id = ?").run(session.userId);

  const updated = db
    .prepare("SELECT id, email, display_name, membership_tier, created_at FROM users WHERE id = ?")
    .get(session.userId) as Omit<DbUser, "password_hash">;

  // Refresh session cookie so client reads the new tier immediately
  await setSessionCookie({
    userId: updated.id,
    email: updated.email,
    display_name: updated.display_name,
    membership_tier: "pro",
  });

  return Response.json({ user: updated });
}
