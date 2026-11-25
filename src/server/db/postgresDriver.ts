import type { Pool } from "pg";
import type { Data } from "@/shared/types/domain";
import type { Database, DbDriver } from "./types";

/**
 * Saves the database in PostgreSQL (works with Neon, Supabase or any Postgres).
 *
 * How the data is stored
 * ----------------------
 * One table, `app_state`, with one row per collection:
 *
 *   key        | value (jsonb)          | version
 *   -----------+------------------------+--------
 *   students   | [ {...}, {...}, ... ]  | 7
 *   fees       | [ {...}, ... ]         | 3
 *   profiles   | { "1": {...} }         | 1
 *
 * Why one row per collection?
 *  - Saving only writes the collections that changed (marking attendance does not rewrite students).
 *  - `version` goes up on every change. Hosting like Vercel runs several server copies at once;
 *    before each request `refresh()` compares versions and downloads only what another copy changed.
 *
 * Limit: if two people change the SAME collection at the same moment, the last save wins.
 * That is fine for a school demo. A bigger product would use one table per kind of record.
 */

const TABLE = "app_state";

/** The special row that holds per-school settings. The other keys are the names of `Data` fields. */
const PROFILES_KEY = "profiles";

interface Known {
  version: number;
  /** The JSON text we last read or wrote. Used to see whether a collection changed. */
  json: string;
}

export class PostgresDriver implements DbDriver {
  private tableReady = false;
  private known = new Map<string, Known>();

  constructor(private pool: Pool) {}

  /** Creates the table the first time. Safe to run again. */
  private async ensureTable() {
    if (this.tableReady) return;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        key        text PRIMARY KEY,
        value      jsonb NOT NULL,
        version    bigint NOT NULL DEFAULT 1,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    this.tableReady = true;
  }

  async load(): Promise<Database | null> {
    await this.ensureTable();
    const { rows } = await this.pool.query(`SELECT key, value, version FROM ${TABLE}`);
    if (rows.length === 0) return null;

    const values: Record<string, unknown> = {};
    for (const row of rows) {
      values[row.key] = row.value;
      this.known.set(row.key, { version: Number(row.version), json: JSON.stringify(row.value) });
    }

    const profiles = (values[PROFILES_KEY] ?? {}) as Database["profiles"];
    delete values[PROFILES_KEY];
    return { data: values as unknown as Data, profiles };
  }

  /** Pulls in collections that another server copy has changed since we last looked. */
  async refresh(db: Database): Promise<void> {
    await this.ensureTable();
    const { rows } = await this.pool.query(`SELECT key, version FROM ${TABLE}`);

    const outOfDate = rows
      .filter((row) => this.known.get(row.key)?.version !== Number(row.version))
      .map((row) => row.key as string);
    if (outOfDate.length === 0) return;

    const fresh = await this.pool.query(`SELECT key, value, version FROM ${TABLE} WHERE key = ANY($1)`, [
      outOfDate,
    ]);
    for (const row of fresh.rows) {
      if (row.key === PROFILES_KEY) db.profiles = row.value;
      else (db.data as unknown as Record<string, unknown>)[row.key] = row.value;
      this.known.set(row.key, { version: Number(row.version), json: JSON.stringify(row.value) });
    }
  }

  async save(db: Database): Promise<void> {
    await this.ensureTable();

    // Turn the database into { key: value } rows.
    const rows: Record<string, unknown> = {
      ...(db.data as unknown as Record<string, unknown>),
      [PROFILES_KEY]: db.profiles,
    };

    // Keep only the rows whose JSON text changed.
    const changed: { key: string; json: string }[] = [];
    for (const [key, value] of Object.entries(rows)) {
      const json = JSON.stringify(value);
      if (this.known.get(key)?.json !== json) changed.push({ key, json });
    }
    if (changed.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const { key, json } of changed) {
        const result = await client.query(
          `INSERT INTO ${TABLE} (key, value, version) VALUES ($1, $2::jsonb, 1)
           ON CONFLICT (key) DO UPDATE
             SET value = EXCLUDED.value, version = ${TABLE}.version + 1, updated_at = now()
           RETURNING version`,
          [key, json],
        );
        this.known.set(key, { version: Number(result.rows[0].version), json });
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      // Forget what we know about these rows so the next refresh() re-reads them.
      for (const { key } of changed) this.known.delete(key);
      throw error;
    } finally {
      client.release();
    }
  }
}
