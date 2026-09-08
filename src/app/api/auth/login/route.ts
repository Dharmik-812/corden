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
    const user = db
      .prepare("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?")
      .get(cleanEmail) as DbUser | undefined;

    if (!user) {
      return Response.json({ error: "No account found with this email." }, { status: 401 });
    }

    const valid = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Invalid password." }, { status: 401 });
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
