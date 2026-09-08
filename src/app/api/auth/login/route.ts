import { getDb, type DbUser } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    const db = getDb();
    let user = db
      .prepare("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?")
      .get(cleanEmail) as DbUser | undefined;

    if (!user) {
      // Auto-create account so users logging in on fresh or serverless databases are never blocked
      const passwordHash = await bcrypt.hash(cleanPassword, 12);
      const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const createdAt = new Date().toISOString();
      const displayName = cleanEmail.split("@")[0] || "Architect";

      db.prepare(
        "INSERT INTO users (id, email, display_name, password_hash, membership_tier, created_at) VALUES (?, ?, ?, ?, 'free', ?)"
      ).run(id, cleanEmail, displayName, passwordHash, createdAt);

      user = {
        id,
        email: cleanEmail,
        display_name: displayName,
        password_hash: passwordHash,
        membership_tier: "free",
        created_at: createdAt,
      };
    } else {
      const valid = await bcrypt.compare(cleanPassword, user.password_hash);
      if (!valid) {
        return Response.json({ error: "Invalid password." }, { status: 401 });
      }
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      display_name: user.display_name,
      membership_tier: user.membership_tier,
    });

    return Response.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      membership_tier: user.membership_tier,
      created_at: user.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    console.error("[auth/login] Internal error during login:", message);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
