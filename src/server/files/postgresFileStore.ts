import type { Pool } from "pg";
import type { FileStore, StoredFile, StoredFileMeta } from "./types";

const TABLE = "uploaded_files";

/** Saves files in a PostgreSQL table (column type bytea). Fine for small PDFs of a few megabytes. */
export class PostgresFileStore implements FileStore {
  private tableReady = false;

  constructor(private pool: Pool) {}

  private async ensureTable() {
    if (this.tableReady) return;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id         text PRIMARY KEY,
        name       text NOT NULL,
        mime       text NOT NULL,
        size       integer NOT NULL,
        school_id  integer NOT NULL,
        student_id integer NOT NULL,
        created_at bigint NOT NULL,
        data       bytea NOT NULL
      )
    `);
    this.tableReady = true;
  }

  async save(file: StoredFile) {
    await this.ensureTable();
    const m = file.meta;
    await this.pool.query(
      `INSERT INTO ${TABLE} (id, name, mime, size, school_id, student_id, created_at, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [m.id, m.name, m.mime, m.size, m.schoolId, m.studentId, m.createdAt, file.bytes],
    );
  }

  async findMeta(id: string): Promise<StoredFileMeta | null> {
    await this.ensureTable();
    const { rows } = await this.pool.query(
      `SELECT id, name, mime, size, school_id, student_id, created_at FROM ${TABLE} WHERE id = $1`,
      [id],
    );
    return rows[0] ? toMeta(rows[0]) : null;
  }

  async find(id: string): Promise<StoredFile | null> {
    await this.ensureTable();
    const { rows } = await this.pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
    return rows[0] ? { meta: toMeta(rows[0]), bytes: rows[0].data as Buffer } : null;
  }
}

/** Database column names use_underscores; our objects use camelCase. */
function toMeta(row: Record<string, unknown>): StoredFileMeta {
  return {
    id: String(row.id),
    name: String(row.name),
    mime: String(row.mime),
    size: Number(row.size),
    schoolId: Number(row.school_id),
    studentId: Number(row.student_id),
    createdAt: Number(row.created_at),
  };
}
