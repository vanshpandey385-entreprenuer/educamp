/** The biggest PDF the server accepts (the server checks this too). */
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export interface UploadedPdf {
  id: string;
  name: string;
  size: number;
}

/** Looks at a chosen file before uploading it. Returns an error message, or null if it is fine. */
export function checkPdf(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please choose a PDF file.";
  if (file.size > MAX_PDF_BYTES) return "That file is bigger than 4 MB. Try a smaller PDF.";
  return null;
}

/** Sends the PDF to the server. Returns the id the server gave it. */
export async function uploadPdf(file: File): Promise<UploadedPdf> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/files", { method: "POST", body: form });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Upload failed. Please try again.");
  return json.file as UploadedPdf;
}

/** The address that opens a stored PDF in a new tab. */
export const pdfUrl = (fileId: string) => `/api/files/${fileId}`;

/** 1536 becomes "1.5 KB". */
export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
