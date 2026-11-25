/** Facts about an uploaded file. The file's bytes are kept next to them. */
export interface StoredFileMeta {
  id: string;
  name: string;
  size: number;
  mime: string;
  schoolId: number;
  /** The student who uploaded it. */
  studentId: number;
  createdAt: number;
}

export interface StoredFile {
  meta: StoredFileMeta;
  bytes: Buffer;
}

/**
 * A file store keeps uploaded files (homework PDFs).
 * To keep files somewhere else (S3, Vercel Blob, Cloudinary), write a new class with these three methods.
 */
export interface FileStore {
  save(file: StoredFile): Promise<void>;
  find(id: string): Promise<StoredFile | null>;
  findMeta(id: string): Promise<StoredFileMeta | null>;
}
