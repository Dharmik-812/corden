import { getDb } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const db = getDb();

    // Check if email already taken
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(
      "INSERT INTO users (id, email, display_name, password_hash, membership_tier, created_at) VALUES (?, ?, ?, ?, 'free', ?)"
    ).run(id, email, displayName, passwordHash, createdAt);

    await setSessionCookie({
      userId: id,
      email,
      display_name: displayName,
      membership_tier: "free",
    });

    return Response.json({
      id,
      email,
      display_name: displayName,
      membership_tier: "free",
      created_at: createdAt,
    });
  } catch (err) {
    console.error("[auth/signup]", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
