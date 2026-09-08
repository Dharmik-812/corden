/**
 * SQLite singleton for Corden backend.
 * The database file lives at <project-root>/data/corden.db and is
 * created automatically on first run.
 *
 * We use `better-sqlite3` (synchronous) which is safe inside
 * Next.js Route Handlers (Node.js runtime, never called from the
 * Edge runtime or React Server Components that might be parallelised).
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ─── resolve DB path ───────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "corden.db");

// ─── schema ───────────────────────────────────────────────────────────────
const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  display_name     TEXT NOT NULL,
  password_hash    TEXT NOT NULL,
  membership_tier  TEXT NOT NULL DEFAULT 'free',
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,
  starred     INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL,
  data        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
`;

// ─── singleton ────────────────────────────────────────────────────────────
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure the data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.exec(SCHEMA);
  return _db;
}

// ─── typed row shapes ─────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  membership_tier: "free" | "pro";
  created_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  type: "2d" | "3d";
  starred: 0 | 1;
  updated_at: string;
  data: string; // JSON
}
