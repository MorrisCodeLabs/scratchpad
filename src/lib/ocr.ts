import { createWorker } from "tesseract.js";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Bounded so a huge PDF doesn't stall an upload for minutes — the first few
// pages cover the common case (a scanned letter, a short report) without
// making every attachment upload wait on a full-document OCR pass.
const MAX_PDF_PAGES = 3;

async function ocrImageSource(source: File | HTMLCanvasElement): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(source as any);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}

async function pdfPagesToText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const texts: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    texts.push(await ocrImageSource(canvas));
  }
  return texts.join("\n").trim();
}

/**
 * Extracts searchable text from an uploaded image or PDF via client-side
 * OCR (Tesseract.js) — there's no server-side scanning pipeline here, so
 * this all runs in the browser at upload time. Never throws: a failed or
 * unsupported scan just means no OCR text gets attached, not a broken
 * upload.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === "application/pdf") return await pdfPagesToText(file);
    if (file.type.startsWith("image/")) return await ocrImageSource(file);
    return "";
  } catch (err) {
    console.error("OCR failed:", err);
    return "";
  }
}
