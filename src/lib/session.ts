/**
 * Session management for Corden.
 * Uses HTTP-only cookies containing a signed JWT (via `jose`).
 *
 * The JWT payload holds just enough data to identify the user so we
 * avoid a database round-trip on every request. Sensitive fields like
 * password_hash are never included.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// ─── secret ───────────────────────────────────────────────────────────────
// Fall back to a hard-coded dev secret so the app works out-of-the-box
// without any .env file. Set JWT_SECRET in production.
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "corden-dev-secret-change-in-production-32chars"
);

const COOKIE_NAME = "corden_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ─── types ────────────────────────────────────────────────────────────────
export interface SessionPayload {
  userId: string;
  email: string;
  display_name: string;
  membership_tier: "free" | "pro";
}

// ─── create ───────────────────────────────────────────────────────────────
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(SECRET);
}

// ─── set cookie (call from Route Handlers) ────────────────────────────────
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

// ─── clear cookie ─────────────────────────────────────────────────────────
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── verify from cookie store (inside Route Handlers / Server Actions) ────
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── verify from NextRequest (inside middleware) ───────────────────────────
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
