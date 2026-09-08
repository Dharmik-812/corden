/**
 * SQLite singleton for Corden backend.
 * The database file lives at <project-root>/data/corden.db and is
 * created automatically on first run.
 *
 * We use `better-sqlite3` (synchronous) which is safe inside
 * Next.js Route Handlers (Node.js runtime, never called from the
 * Edge runtime or React Server Components that might be parallelised).
 */

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

export interface ISqliteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface ISqliteDb {
  exec(sql: string): void;
  prepare(sql: string): ISqliteStatement;
}

// ─── singleton ────────────────────────────────────────────────────────────
const globalForDb = globalThis as unknown as { _cordenDb?: ISqliteDb };

export function getDb(): ISqliteDb {
  if (globalForDb._cordenDb) return globalForDb._cordenDb;

  // Ensure the data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Node 22.5+ and Node 24+ include built-in zero-dependency 'node:sqlite'
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(DB_PATH);
    db.exec(SCHEMA);
    globalForDb._cordenDb = db;
    return globalForDb._cordenDb;
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const BetterSqlite3 = require("better-sqlite3");
      const db = new BetterSqlite3(DB_PATH);
      db.exec(SCHEMA);
      globalForDb._cordenDb = db;
      return globalForDb._cordenDb;
    } catch (err) {
      console.error("Failed to initialize SQLite database:", err);
      throw new Error(
        "Could not initialize SQLite. Use Node.js 22.5+ or Node 24+ (built-in node:sqlite) or install better-sqlite3 with C++ build tools."
      );
    }
  }
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
