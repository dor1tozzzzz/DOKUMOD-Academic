import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import {
  validateSingleFile,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from '../utils/fileValidation';
import { PdfCompressorOptions, PdfCompressorResult } from '../types';

// Set PDF.js Global Worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface CompressProgressCallback {
  (percentage: number, stepMessage: string): void;
}

/**
 * Compresses a PDF file entirely on the client side.
 * Supports dynamic iterative quality adjustment to hit target file sizes (e.g., CPNS 200KB/500KB).
 */
export async function compressPdfFile(
  file: File,
  options: PdfCompressorOptions = {},
  onProgress?: CompressProgressCallback
): Promise<PdfCompressorResult> {
  // 1. Single File Validation
  const validation = validateSingleFile(file, {
    maxSizeMB: FILE_SIZE_LIMITS.PDF_COMPRESSOR,
    allowedMimeTypes: ALLOWED_MIME_TYPES.PDF,
    allowedExtensions: ['.pdf'],
  });

  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Validasi berkas PDF gagal.');
  }

  onProgress?.(5, 'Membaca struktur berkas PDF...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (numPages === 0) {
    throw new Error('Dokumen PDF tidak memiliki halaman.');
  }

  // 2. Determine initial parameters
  const targetBytes = options.targetSizeKB ? options.targetSizeKB * 1024 : null;
  let quality = options.qualityRatio || 0.65;
  let renderScale = options.renderDpi ? options.renderDpi / 96 : 1.25;

  onProgress?.(15, `Menyiapkan re-rendering untuk ${numPages} halaman...`);

  /**
   * Renders PDF pages onto canvas and exports as JPEG byte arrays
   */
  const renderPagesToJpegs = async (
    targetQuality: number,
    scale: number
  ): Promise<Uint8Array[]> => {
    const jpegs: Uint8Array[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (!context) {
        throw new Error('Gagal menginisialisasi HTML5 Canvas Context.');
      }

        await page.render({ canvasContext: context, viewport } as unknown as Parameters<typeof page.render>[0]).promise;

      // Convert canvas to JPEG Base64 and then Uint8Array
      const dataUrl = canvas.toDataURL('image/jpeg', targetQuality);
      const base64Data = dataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      jpegs.push(bytes);
      
      // Clean up canvas memory
      canvas.width = 0;
      canvas.height = 0;
    }

    return jpegs;
  };

  /**
   * Reconstructs a clean pdf-lib PDF document from processed JPEG pages
   */
  const buildPdfFromJpegs = async (jpegs: Uint8Array[]): Promise<Blob> => {
    const newPdf = await PDFDocument.create();

    for (const jpegBytes of jpegs) {
      const image = await newPdf.embedJpg(jpegBytes);
      const page = newPdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  };

  let finalBlob: Blob;
  let attempts = 0;
  const maxAttempts = targetBytes ? 3 : 1;

  // 3. Iterative compression loop
  do {
    attempts++;
    const stepMessage = targetBytes
      ? `Mengoptimasi kompresi (Iterasi ${attempts}/${maxAttempts}, Kualitas: ${Math.round(
          quality * 100
        )}%)...`
      : `Mengompresi halaman PDF...`;

    onProgress?.(20 + attempts * 20, stepMessage);

    const jpegs = await renderPagesToJpegs(quality, renderScale);
    finalBlob = await buildPdfFromJpegs(jpegs);

    // If target size is specified and output exceeds target, dynamically decrease quality/scale
    if (targetBytes && finalBlob.size > targetBytes && attempts < maxAttempts) {
      const sizeRatio = targetBytes / finalBlob.size;
      quality = Math.max(0.15, quality * sizeRatio * 0.9);
      if (quality < 0.3) {
        renderScale = Math.max(0.8, renderScale * 0.85);
      }
    } else {
      break;
    }
  } while (attempts < maxAttempts);

  onProgress?.(95, 'Finalisasi berkas PDF terkompresi...');

  const originalSize = file.size;
  const compressedSize = finalBlob.size;
  const compressionRatio = Math.round(
    ((originalSize - compressedSize) / originalSize) * 100
  );

  onProgress?.(100, `Kompresi selesai! Menghemat ${Math.max(0, compressionRatio)}%`);

  return {
    compressedBlob: finalBlob,
    originalSize,
    compressedSize,
    compressionRatio: Math.max(0, compressionRatio),
    pageCount: numPages,
  };
}