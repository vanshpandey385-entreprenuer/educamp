import { promises as fs } from "fs";
import path from "path";
import type { FileStore, StoredFile, StoredFileMeta } from "./types";

/** Saves each file in a folder, with a small .json file next to it holding its details. */
export class DiskFileStore implements FileStore {
  constructor(private folder: string) {}

  private pdfPath(id: string) {
    return path.join(this.folder, `${id}.pdf`);
  }

  private metaPath(id: string) {
    return path.join(this.folder, `${id}.json`);
  }

  async save(file: StoredFile) {
    await fs.mkdir(this.folder, { recursive: true });
    await fs.writeFile(this.pdfPath(file.meta.id), file.bytes);
    await fs.writeFile(this.metaPath(file.meta.id), JSON.stringify(file.meta));
  }

  async findMeta(id: string): Promise<StoredFileMeta | null> {
    try {
      return JSON.parse(await fs.readFile(this.metaPath(id), "utf8")) as StoredFileMeta;
    } catch {
      return null;
    }
  }

  async find(id: string): Promise<StoredFile | null> {
    const meta = await this.findMeta(id);
    if (!meta) return null;
    try {
      return { meta, bytes: await fs.readFile(this.pdfPath(id)) };
    } catch {
      return null;
    }
  }
}
