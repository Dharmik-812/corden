import { getDb, type DbUser } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null });
  }

  // Re-fetch from DB so we always return the latest data
  const db = getDb();
  const user = db
    .prepare("SELECT id, email, display_name, membership_tier, created_at FROM users WHERE id = ?")
    .get(session.userId) as Omit<DbUser, "password_hash"> | undefined;

  if (!user) {
    return Response.json({ user: null });
  }

  return Response.json({ user });
}
