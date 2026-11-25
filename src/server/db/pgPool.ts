import { Pool } from "pg";
import { DATABASE_URL } from "../config/env";

/**
 * One connection pool for the whole server process, shared by the database driver and the file store.
 * Stored on `globalThis` so hot reloading does not open a second pool.
 */
const globalPool = globalThis as unknown as { __efichtPool?: Pool };

export function getPgPool(): Pool {
  if (!DATABASE_URL) throw new Error("DATABASE_URL is empty. Add it to .env.local.");

  if (!globalPool.__efichtPool) {
    const pool = new Pool({
      connectionString: DATABASE_URL,
      // Serverless: every server copy opens its own connections, so keep this small.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    });
    // A dropped idle connection must not crash the server.
    pool.on("error", (error) => console.error("[postgres] idle connection error:", error.message));
    globalPool.__efichtPool = pool;
  }
  return globalPool.__efichtPool;
}
