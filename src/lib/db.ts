/**
 * Universal Database Layer for Corden.
 * 
 * Supports:
 * 1. Node 22+ built-in zero-dependency 'node:sqlite' (synchronous)
 * 2. 'better-sqlite3' if available in the environment
 * 3. Universal Zero-Dependency JSON/Memory Database fallback:
 *    Guaranteed to run anywhere (Vercel Serverless, AWS Lambda, Node 18/20/22, Docker)
 *    without crashing on read-only filesystems or missing native C++ binary bindings.
 */

import path from "path";
import fs from "fs";

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

export interface ISqliteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface ISqliteDb {
  exec(sql: string): void;
  prepare(sql: string): ISqliteStatement;
}

// ─── Schema for SQLite drivers ───────────────────────────────────────────
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

// ─── Resolve writable data directory ─────────────────────────────────────
function getStorageDirectory(): string {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    return "/tmp";
  }

  const localDataDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    return localDataDir;
  } catch {
    // If local directory creation fails (e.g. read-only container), fall back to /tmp
    return "/tmp";
  }
}

// ─── Universal Zero-Dependency JSON/Memory Database ───────────────────────
class UniversalJsonDb implements ISqliteDb {
  private users = new Map<string, DbUser>();
  private projects = new Map<string, DbProject>();
  private filePath: string;
  private isWritable = true;

  constructor(storageDir: string) {
    this.filePath = path.join(storageDir, "corden_store.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const data = JSON.parse(raw) as { users?: DbUser[]; projects?: DbProject[] };
        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            this.users.set(u.id, u);
          }
        }
        if (Array.isArray(data.projects)) {
          for (const p of data.projects) {
            this.projects.set(p.id, p);
          }
        }
      }
    } catch (err) {
      console.warn("[UniversalJsonDb] Could not read from storage, using in-memory store:", err);
    }
  }

  private persistToDisk(): void {
    if (!this.isWritable) return;
    try {
      const data = {
        users: Array.from(this.users.values()),
        projects: Array.from(this.projects.values()),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      this.isWritable = false;
      console.warn("[UniversalJsonDb] Storage not writable; persisting in-memory only:", err);
    }
  }

  exec(_sql: string): void {
    // No-op for CREATE TABLE / PRAGMA in JSON database
  }

  prepare(sql: string): ISqliteStatement {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // ── USERS QUERIES ──────────────────────────────────────────────────
    if (upper.includes("FROM USERS")) {
      // 1. SELECT * FROM users WHERE LOWER(TRIM(email)) = ?
      if (upper.startsWith("SELECT * FROM USERS") && upper.includes("LOWER(TRIM(EMAIL)) = ?")) {
        return {
          get: (emailParam: unknown) => {
            const clean = String(emailParam ?? "").trim().toLowerCase();
            for (const user of this.users.values()) {
              if (user.email.trim().toLowerCase() === clean) {
                return { ...user };
              }
            }
            return undefined;
          },
          all: () => [],
          run: () => ({ changes: 0, lastInsertRowid: 0 }),
        };
      }

      // 2. SELECT id FROM users WHERE LOWER(TRIM(email)) = ?
      if (upper.startsWith("SELECT ID FROM USERS") && upper.includes("LOWER(TRIM(EMAIL)) = ?")) {
        return {
          get: (emailParam: unknown) => {
            const clean = String(emailParam ?? "").trim().toLowerCase();
            for (const user of this.users.values()) {
              if (user.email.trim().toLowerCase() === clean) {
                return { id: user.id };
              }
            }
            return undefined;
          },
          all: () => [],
          run: () => ({ changes: 0, lastInsertRowid: 0 }),
        };
      }

      // 3. SELECT id FROM users WHERE email = ? AND id != ?
      if (upper.startsWith("SELECT ID FROM USERS") && upper.includes("EMAIL = ? AND ID != ?")) {
        return {
          get: (emailParam: unknown, idParam: unknown) => {
            const cleanEmail = String(emailParam ?? "").trim().toLowerCase();
            const cleanId = String(idParam ?? "");
            for (const user of this.users.values()) {
              if (user.email.trim().toLowerCase() === cleanEmail && user.id !== cleanId) {
                return { id: user.id };
              }
            }
            return undefined;
          },
          all: () => [],
          run: () => ({ changes: 0, lastInsertRowid: 0 }),
        };
      }

      // 4. SELECT id, email, display_name, membership_tier, created_at FROM users WHERE id = ?
      if (upper.startsWith("SELECT ID, EMAIL") && upper.includes("WHERE ID = ?")) {
        return {
          get: (idParam: unknown) => {
            const id = String(idParam ?? "");
            const user = this.users.get(id);
            if (!user) return undefined;
            return {
              id: user.id,
              email: user.email,
              display_name: user.display_name,
              membership_tier: user.membership_tier,
              created_at: user.created_at,
            };
          },
          all: () => [],
          run: () => ({ changes: 0, lastInsertRowid: 0 }),
        };
      }
    }

    // 5. INSERT INTO users
    if (upper.startsWith("INSERT INTO USERS")) {
      return {
        get: () => undefined,
        all: () => [],
        run: (...params: unknown[]) => {
          let id = "";
          let email = "";
          let display_name = "";
          let password_hash = "";
          let membership_tier: "free" | "pro" = "free";
          let created_at = "";

          if (upper.includes("'FREE'")) {
            // Pattern: (id, email, display_name, password_hash, membership_tier, created_at) VALUES (?, ?, ?, ?, 'free', ?)
            id = String(params[0]);
            email = String(params[1]);
            display_name = String(params[2]);
            password_hash = String(params[3]);
            membership_tier = "free";
            created_at = String(params[4]);
          } else {
            // Pattern: 6 parameters
            id = String(params[0]);
            email = String(params[1]);
            display_name = String(params[2]);
            password_hash = String(params[3]);
            membership_tier = (String(params[4]) as "free" | "pro") || "free";
            created_at = String(params[5]);
          }

          const user: DbUser = {
            id,
            email: email.trim().toLowerCase(),
            display_name,
            password_hash,
            membership_tier,
            created_at,
          };
          this.users.set(id, user);
          this.persistToDisk();
          return { changes: 1, lastInsertRowid: 1 };
        },
      };
    }

    // 6. UPDATE users SET ... WHERE id = ?
    if (upper.startsWith("UPDATE USERS SET")) {
      return {
        get: () => undefined,
        all: () => [],
        run: (...params: unknown[]) => {
          const userId = String(params[params.length - 1]);
          const user = this.users.get(userId);
          if (!user) return { changes: 0, lastInsertRowid: 0 };

          // Extract updated fields
          const setClause = trimmed.substring(trimmed.indexOf("SET") + 3, trimmed.indexOf("WHERE")).trim();
          const assignments = setClause.split(",").map((s) => s.trim().split("=")[0].trim());

          assignments.forEach((col, idx) => {
            const val = params[idx];
            if (col === "display_name") user.display_name = String(val);
            if (col === "email") user.email = String(val).trim().toLowerCase();
            if (col === "membership_tier") user.membership_tier = val as "free" | "pro";
          });

          this.users.set(userId, user);
          this.persistToDisk();
          return { changes: 1, lastInsertRowid: 0 };
        },
      };
    }

    // ── PROJECTS QUERIES ───────────────────────────────────────────────
    // 7. SELECT ... FROM projects WHERE user_id = ? ORDER BY updated_at DESC
    if (upper.includes("FROM PROJECTS") && upper.includes("WHERE USER_ID = ?") && upper.includes("ORDER BY UPDATED_AT DESC")) {
      return {
        get: () => undefined,
        all: (userIdParam: unknown) => {
          const userId = String(userIdParam ?? "");
          const matching: Omit<DbProject, "data">[] = [];
          for (const p of this.projects.values()) {
            if (p.user_id === userId) {
              matching.push({
                id: p.id,
                user_id: p.user_id,
                title: p.title,
                type: p.type,
                starred: p.starred,
                updated_at: p.updated_at,
              });
            }
          }
          matching.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          return matching;
        },
        run: () => ({ changes: 0, lastInsertRowid: 0 }),
      };
    }

    // 8. SELECT * FROM projects WHERE id = ? AND user_id = ?
    if (upper.startsWith("SELECT * FROM PROJECTS") && upper.includes("WHERE ID = ? AND USER_ID = ?")) {
      return {
        get: (idParam: unknown, userIdParam: unknown) => {
          const id = String(idParam ?? "");
          const userId = String(userIdParam ?? "");
          const project = this.projects.get(id);
          if (project && project.user_id === userId) {
            return { ...project };
          }
          return undefined;
        },
        all: () => [],
        run: () => ({ changes: 0, lastInsertRowid: 0 }),
      };
    }

    // 9. SELECT id FROM projects WHERE id = ? AND user_id = ?
    if (upper.startsWith("SELECT ID FROM PROJECTS") && upper.includes("WHERE ID = ? AND USER_ID = ?")) {
      return {
        get: (idParam: unknown, userIdParam: unknown) => {
          const id = String(idParam ?? "");
          const userId = String(userIdParam ?? "");
          const project = this.projects.get(id);
          if (project && project.user_id === userId) {
            return { id: project.id };
          }
          return undefined;
        },
        all: () => [],
        run: () => ({ changes: 0, lastInsertRowid: 0 }),
      };
    }

    // 10. INSERT OR REPLACE INTO projects / INSERT INTO projects
    if (upper.startsWith("INSERT")) {
      return {
        get: () => undefined,
        all: () => [],
        run: (...params: unknown[]) => {
          let id = "";
          let user_id = "";
          let title = "";
          let type: "2d" | "3d" = "2d";
          let starred: 0 | 1 = 0;
          let updated_at = "";
          let data = "{}";

          if (params.length === 6) {
            // (id, user_id, title, type, 0, updated_at, data) with 0 hardcoded
            id = String(params[0]);
            user_id = String(params[1]);
            title = String(params[2]);
            type = String(params[3]) as "2d" | "3d";
            starred = 0;
            updated_at = String(params[4]);
            data = String(params[5]);
          } else {
            // 7 params: id, user_id, title, type, starred, updated_at, data
            id = String(params[0]);
            user_id = String(params[1]);
            title = String(params[2]);
            type = String(params[3]) as "2d" | "3d";
            starred = Number(params[4]) === 1 ? 1 : 0;
            updated_at = String(params[5]);
            data = String(params[6]);
          }

          const proj: DbProject = {
            id,
            user_id,
            title,
            type,
            starred,
            updated_at,
            data,
          };
          this.projects.set(id, proj);
          this.persistToDisk();
          return { changes: 1, lastInsertRowid: 1 };
        },
      };
    }

    // 11. UPDATE projects SET ... WHERE id = ?
    if (upper.startsWith("UPDATE PROJECTS SET")) {
      return {
        get: () => undefined,
        all: () => [],
        run: (...params: unknown[]) => {
          const id = String(params[params.length - 1]);
          const project = this.projects.get(id);
          if (!project) return { changes: 0, lastInsertRowid: 0 };

          const setClause = trimmed.substring(trimmed.indexOf("SET") + 3, trimmed.indexOf("WHERE")).trim();
          const assignments = setClause.split(",").map((s) => s.trim().split("=")[0].trim());

          assignments.forEach((col, idx) => {
            const val = params[idx];
            if (col === "title") project.title = String(val);
            if (col === "starred") project.starred = Number(val) === 1 ? 1 : 0;
            if (col === "data") project.data = String(val);
            if (col === "updated_at") project.updated_at = String(val);
          });

          this.projects.set(id, project);
          this.persistToDisk();
          return { changes: 1, lastInsertRowid: 0 };
        },
      };
    }

    // 12. DELETE FROM projects WHERE id = ? AND user_id = ?
    if (upper.startsWith("DELETE FROM PROJECTS")) {
      return {
        get: () => undefined,
        all: () => [],
        run: (idParam: unknown, userIdParam: unknown) => {
          const id = String(idParam ?? "");
          const userId = String(userIdParam ?? "");
          const project = this.projects.get(id);
          if (project && project.user_id === userId) {
            this.projects.delete(id);
            this.persistToDisk();
            return { changes: 1, lastInsertRowid: 0 };
          }
          return { changes: 0, lastInsertRowid: 0 };
        },
      };
    }

    // Fallback statement handler for unexpected queries
    console.warn("[UniversalJsonDb] Unhandled SQL query pattern:", trimmed);
    return {
      get: () => undefined,
      all: () => [],
      run: () => ({ changes: 0, lastInsertRowid: 0 }),
    };
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────
const globalForDb = globalThis as unknown as { _cordenDb?: ISqliteDb };

export function getDb(): ISqliteDb {
  if (globalForDb._cordenDb) return globalForDb._cordenDb;

  const storageDir = getStorageDirectory();
  const dbPath = path.join(storageDir, "corden.db");

  // Strategy 1: Built-in node:sqlite (Node 22.5+)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(dbPath);
    db.exec(SCHEMA);
    globalForDb._cordenDb = db;
    return globalForDb._cordenDb;
  } catch (errNodeSqlite) {
    // Strategy 2: better-sqlite3 (if native bindings are compiled and available)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const BetterSqlite3 = require("better-sqlite3");
      const db = new BetterSqlite3(dbPath);
      db.exec(SCHEMA);
      globalForDb._cordenDb = db;
      return globalForDb._cordenDb;
    } catch {
      // Strategy 3: Universal Zero-Dependency Serverless Database
      // Guaranteed to never throw EROFS on Vercel and requires 0 native C++ dependencies.
      const universalDb = new UniversalJsonDb(storageDir);
      globalForDb._cordenDb = universalDb;
      return globalForDb._cordenDb;
    }
  }
}
