import { DB_DRIVER } from "../config/env";
import { getPgPool } from "../db/pgPool";
import { DiskFileStore } from "./diskFileStore";
import { MemoryFileStore } from "./memoryFileStore";
import { PostgresFileStore } from "./postgresFileStore";
import type { FileStore } from "./types";

const globalFiles = globalThis as unknown as { __efichtFiles?: FileStore };

/** The biggest PDF a student may upload. Vercel refuses request bodies above about 4.5 MB. */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Uses the same place as the database: PostgreSQL, a local folder, or memory. */
export function getFileStore(): FileStore {
  if (!globalFiles.__efichtFiles) {
    if (DB_DRIVER === "postgres") globalFiles.__efichtFiles = new PostgresFileStore(getPgPool());
    else if (DB_DRIVER === "memory" || process.env.VERCEL) globalFiles.__efichtFiles = new MemoryFileStore();
    else globalFiles.__efichtFiles = new DiskFileStore(".data/uploads");
  }
  return globalFiles.__efichtFiles;
}

/** A real PDF always starts with the five characters %PDF- . */
export function looksLikePdf(bytes: Buffer): boolean {
  return bytes.length > 5 && bytes.subarray(0, 5).toString("latin1") === "%PDF-";
}
