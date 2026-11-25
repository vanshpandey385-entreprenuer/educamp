import type { FileStore, StoredFile, StoredFileMeta } from "./types";

/** Keeps files in memory. They are lost when the server restarts. */
export class MemoryFileStore implements FileStore {
  private files = new Map<string, StoredFile>();

  async save(file: StoredFile) {
    this.files.set(file.meta.id, file);
  }

  async find(id: string) {
    return this.files.get(id) ?? null;
  }

  async findMeta(id: string): Promise<StoredFileMeta | null> {
    return this.files.get(id)?.meta ?? null;
  }
}
