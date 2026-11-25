import { DATABASE_URL, DB_DRIVER, DB_FILE_PATH } from "../config/env";
import { FileDriver } from "./fileDriver";
import { MemoryDriver } from "./memoryDriver";
import { getPgPool } from "./pgPool";
import { PostgresDriver } from "./postgresDriver";
import { seed } from "./seed";
import type { Database, DbDriver } from "./types";

interface DbState {
  db: Database;
  driver: DbDriver;
}

/**
 * One shared database per server process.
 * It is stored on `globalThis` so hot reloading in development does not create a second copy.
 * We keep the PROMISE, so two requests arriving at the same moment share one start-up.
 */
const globalStore = globalThis as unknown as { __efficht?: Promise<DbState> };

function createDriver(): DbDriver {
  if (DB_DRIVER === "postgres") {
    if (!DATABASE_URL)
      throw new Error("DB_DRIVER is postgres but DATABASE_URL is empty. Add it to .env.local.");
    return new PostgresDriver(getPgPool());
  }
  if (DB_DRIVER === "memory") return new MemoryDriver();
  // Serverless hosts (Vercel) have a read-only disk, so fall back to memory there.
  if (process.env.VERCEL) return new MemoryDriver();
  return new FileDriver(DB_FILE_PATH);
}

function freshDatabase(): Database {
  return { data: structuredClone(seed), profiles: {} };
}

/**
 * Older saved databases do not know about collections added later (for example "classes").
 * This adds each missing one as an empty list. Returns true if anything was added.
 */
function addMissingCollections(db: Database): boolean {
  const defaults = freshDatabase().data as unknown as Record<string, unknown>;
  const current = db.data as unknown as Record<string, unknown>;
  let added = false;
  for (const key of Object.keys(defaults)) {
    if (current[key] === undefined) {
      current[key] = defaults[key];
      added = true;
    }
  }
  return added;
}

/** Starts the database: loads saved data, or stores the demo data the very first time. */
async function start(): Promise<DbState> {
  const driver = createDriver();
  const saved = await driver.load();
  const db = saved ?? freshDatabase();
  if (!saved || addMissingCollections(db)) await driver.save(db);
  return { db, driver };
}

function state(): Promise<DbState> {
  if (!globalStore.__efficht) {
    globalStore.__efficht = start().catch((error) => {
      // Do not remember a failed start, so the next request tries again.
      globalStore.__efficht = undefined;
      throw error;
    });
  }
  return globalStore.__efficht;
}

/**
 * Returns the database.
 * Before returning it, the driver picks up changes made by other server copies (PostgreSQL only).
 */
export async function getDb(): Promise<Database> {
  const { db, driver } = await state();
  await driver.refresh?.(db);
  return db;
}

/** Writes the current database through the driver. Call after every change. */
export async function saveDb(): Promise<void> {
  const { db, driver } = await state();
  await driver.save(db);
}

/** Replaces everything with the demo data. */
export async function resetDb(): Promise<void> {
  const current = await state();
  current.db = freshDatabase();
  await current.driver.save(current.db);
}
