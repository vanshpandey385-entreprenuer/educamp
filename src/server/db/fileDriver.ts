import { promises as fs } from "fs";
import path from "path";
import type { Database, DbDriver } from "./types";

/** Saves the database as one JSON file. Good for local development. */
export class FileDriver implements DbDriver {
  constructor(private filePath: string) {}

  async load() {
    try {
      const text = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(text) as Database;
    } catch {
      // File missing or unreadable: the caller will create a fresh database.
      return null;
    }
  }

  async save(db: Database) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(db));
  }
}
