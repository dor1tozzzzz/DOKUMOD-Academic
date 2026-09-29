/**
 * File Validation Utility for Client-Side Processing
 * Handles validation for single and batch file uploads with specific presets
 * (e.g., CPNS/Beasiswa document limits).
 */

// Global File Size Limits in Megabytes
export const FILE_SIZE_LIMITS = {
  PDF_COMPRESSOR: 25, // Max 25MB
  PDF_MERGER_SINGLE: 10, // Max 10MB per file
  PDF_MERGER_TOTAL: 50, // Max 50MB combined
  IMAGE_CONVERTER_SINGLE: 15, // Max 15MB per file
  DATA_CONVERTER: 10, // Max 10MB for JSON/CSV/Text
} as const;

// Batch Upload Count Limits
export const BATCH_LIMITS = {
  PDF_MERGER_FILES: 10,
  IMAGE_CONVERTER_FILES: 20,
} as const;

// Common Target Size Presets for PDF Compression (in KB)
export const CPNS_TARGET_PRESETS = [
  { label: '200 KB (Pasfoto / Sertifikat)', sizeKB: 200 },
  { label: '300 KB (Ijazah / Transkrip)', sizeKB: 300 },
  { label: '500 KB (Dokumen Gabungan)', sizeKB: 500 },
  { label: '800 KB (Surat Lamaran)', sizeKB: 800 },
  { label: '1000 KB / 1 MB (Batas Umum Portal)', sizeKB: 1000 },
] as const;

// Allowed MIME Types
export const ALLOWED_MIME_TYPES = {
  PDF: ['application/pdf'],
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  DATA: ['application/json', 'text/csv', 'text/plain'],
  DOCUMENTS: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ],
} as const;

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  code?: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'EXCEEDS_BATCH_LIMIT' | 'UNKNOWN_ERROR';
}

export interface SingleValidationOptions {
  maxSizeMB: number;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
}

export interface BatchValidationOptions extends SingleValidationOptions {
  maxFileCount: number;
  maxTotalSizeMB?: number;
}

/**
 * Converts bytes to human-readable string (e.g., "1.5 MB", "200 KB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Converts Megabytes to Bytes
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Converts Bytes to Megabytes
 */
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Validates a single file against size and MIME type criteria
 */
export function validateSingleFile(
  file: File,
  options: SingleValidationOptions
): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      errorMessage: 'Berkas tidak ditemukan.',
      code: 'UNKNOWN_ERROR',
    };
  }

  // 1. Check File Size
  const maxSizeBytes = mbToBytes(options.maxSizeMB);
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      errorMessage: `Ukuran berkas (${formatBytes(file.size)}) melebihi batas maksimal yang diizinkan (${options.maxSizeMB} MB).`,
      code: 'FILE_TOO_LARGE',
    };
  }

  // 2. Check File MIME Type / Extension
  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    const isMimeAllowed = options.allowedMimeTypes.includes(file.type);
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isExtensionAllowed = options.allowedExtensions?.includes(fileExtension);

    if (!isMimeAllowed && !isExtensionAllowed) {
      return {
        isValid: false,
        errorMessage: `Format berkas "${file.name}" tidak didukung.`,
        code: 'INVALID_TYPE',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates an array of files for batch operations
 */
export function validateBatchFiles(
  files: File[],
  options: BatchValidationOptions
): ValidationResult {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Pilih minimal satu berkas.',
      code: 'UNKNOWN_ERROR',
    };
  }

  // 1. Check Batch Count Limit
  if (files.length > options.maxFileCount) {
    return {
      isValid: false,
      errorMessage: `Jumlah berkas (${files.length}) melebihi batas maksimal ${options.maxFileCount} berkas sekaligus.`,
      code: 'EXCEEDS_BATCH_LIMIT',
    };
  }

  // 2. Check Total Batch Size Limit (optional)
  if (options.maxTotalSizeMB) {
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    const maxTotalBytes = mbToBytes(options.maxTotalSizeMB);

    if (totalBytes > maxTotalBytes) {
      return {
        isValid: false,
        errorMessage: `Total ukuran seluruh berkas (${formatBytes(totalBytes)}) melebihi batas maksimal (${options.maxTotalSizeMB} MB).`,
        code: 'FILE_TOO_LARGE',
      };
    }
  }

  // 3. Check Each File Individually
  for (const file of files) {
    const singleResult = validateSingleFile(file, {
      maxSizeMB: options.maxSizeMB,
      allowedMimeTypes: options.allowedMimeTypes,
      allowedExtensions: options.allowedExtensions,
    });

    if (!singleResult.isValid) {
      return singleResult;
    }
  }

  return { isValid: true };
}