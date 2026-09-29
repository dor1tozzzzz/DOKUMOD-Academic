import { PDFDocument } from 'pdf-lib';
import {
  validateBatchFiles,
  FILE_SIZE_LIMITS,
  BATCH_LIMITS,
  ALLOWED_MIME_TYPES,
} from '../utils/fileValidation';

export interface MergePdfProgressCallback {
  (percentage: number, stepMessage: string): void;
}

/**
 * Helper to get page count of a PDF file without full rendering
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error(`Gagal menghitung halaman untuk file ${file.name}:`, error);
    return 0;
  }
}

/**
 * Merges multiple PDF files into a single PDF Blob purely on the client side
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: MergePdfProgressCallback
): Promise<Blob> {
  // 1. Batch validation against limits
  const validation = validateBatchFiles(files, {
    maxSizeMB: FILE_SIZE_LIMITS.PDF_MERGER_SINGLE,
    maxTotalSizeMB: FILE_SIZE_LIMITS.PDF_MERGER_TOTAL,
    maxFileCount: BATCH_LIMITS.PDF_MERGER_FILES,
    allowedMimeTypes: ALLOWED_MIME_TYPES.PDF,
    allowedExtensions: ['.pdf'],
  });

  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Validasi berkas PDF gagal.');
  }

  onProgress?.(5, 'Memulai penggabungan dokumen PDF...');

  try {
    // 2. Create target PDF document
    const mergedPdf = await PDFDocument.create();
    const totalFiles = files.length;

    // 3. Iterate and copy pages from each source PDF
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const stepPercentage = 10 + Math.floor((i / totalFiles) * 75);
      
      onProgress?.(
        stepPercentage,
        `Membaca berkas (${i + 1}/${totalFiles}): "${file.name}"...`
      );

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageIndices = pdfDoc.getPageIndices();

      const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    onProgress?.(90, 'Menyusun dan mengompresi struktur PDF akhir...');

    // 4. Save merged PDF to Uint8Array
    const mergedPdfBytes = await mergedPdf.save();

    onProgress?.(100, 'Penggabungan PDF berhasil diselesaikan!');

    // 5. Convert to Blob
    return new Blob([mergedPdfBytes.buffer as ArrayBuffer ], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error during PDF merge:', error);
    throw new Error(
      error instanceof Error
        ? `Gagal menggabungkan PDF: ${error.message}`
        : 'Terjadi kesalahan tidak terduga saat menggabungkan berkas PDF.'
    );
  }
}