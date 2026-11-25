import type { Database, DbDriver } from "./types";

/** Keeps data in memory only. Everything is lost when the server restarts. */
export class MemoryDriver implements DbDriver {
  private stored: Database | null = null;

  async load() {
    return this.stored;
  }

  async save(db: Database) {
    this.stored = db;
  }
}
