import type { Data } from "@/shared/types/domain";

/** Everything the server keeps. Data plus per-school settings that the client never sees as a whole. */
export interface Database {
  data: Data;
  /** School settings keyed by school id. */
  profiles: Record<number, Data["schoolProfile"]>;
}

/**
 * A driver knows how to load and save the Database.
 * To use a real database (Postgres, Supabase, MongoDB), write a new driver with these two methods.
 */
export interface DbDriver {
  /** Reads everything. Return null if nothing has been saved yet. */
  load(): Promise<Database | null>;
  /** Writes everything (a driver may skip parts that did not change). */
  save(db: Database): Promise<void>;
  /**
   * Optional. Called before every request.
   * Drivers whose data can change outside this server process (a shared Postgres database)
   * use it to pull in changes made by other server instances.
   */
  refresh?(db: Database): Promise<void>;
}
