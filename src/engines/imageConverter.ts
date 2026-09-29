import {
  validateBatchFiles,
  validateSingleFile,
  FILE_SIZE_LIMITS,
  BATCH_LIMITS,
  ALLOWED_MIME_TYPES,
} from '../utils/fileValidation';
import { ImageConverterOptions, ImageConvertedItem, ImageOutputFormat } from '../types';

export interface ImageProgressCallback {
  (percentage: number, stepMessage: string, currentFileIndex?: number, totalFiles?: number): void;
}

// Re-export tipe agar bisa di-import langsung
export type { ImageConverterOptions, ImageConvertedItem, ImageOutputFormat };

/**
 * Mendapatkan string MIME type berdasarkan format output
 */
export function getMimeTypeForFormat(format: ImageOutputFormat): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Normalisasi ekstensi file output
 */
export function getExtensionForFormat(format: ImageOutputFormat): string {
  switch (format) {
    case 'jpeg':
      return 'jpg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
  }
}

/**
 * Mengonversi satu gambar/blob menggunakan HTML5 Canvas
 */
export async function convertSingleImage(
  file: File,
  options: ImageConverterOptions
): Promise<Blob> {
  // 1. Validasi berkas tunggal
  const validation = validateSingleFile(file, {
    maxSizeMB: FILE_SIZE_LIMITS.IMAGE_CONVERTER_SINGLE,
    allowedMimeTypes: ALLOWED_MIME_TYPES.IMAGES,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],
  });

  if (!validation.isValid) {
    throw new Error(validation.errorMessage || `Validasi berkas ${file.name} gagal.`);
  }

  let sourceBlob: Blob = file;
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 2. Dynamic Import heic2any hanya saat berjalan di browser untuk mencegah error window undefined saat build
  if (extension === 'heic' || extension === 'heif' || file.type.includes('heic')) {
    try {
      const heic2anyModule = (await import('heic2any')).default;
      const convertedHeic = await heic2anyModule({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      sourceBlob = Array.isArray(convertedHeic) ? convertedHeic[0] : convertedHeic;
    } catch (err) {
      throw new Error(`Gagal memproses berkas HEIC "${file.name}": ${(err as Error).message}`);
    }
  }

  // 3. Muat gambar ke objek Image
  const objectUrl = URL.createObjectURL(sourceBlob);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Gagal memuat citra "${file.name}".`));
    img.src = objectUrl;
  });

  // Hapus Object URL dari memori
  URL.revokeObjectURL(objectUrl);

  // 4. Hitung dimensi gambar (dengan downscaling opsional)
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (options.maxWidthOrHeight && (width > options.maxWidthOrHeight || height > options.maxWidthOrHeight)) {
    if (width > height) {
      height = Math.round((height * options.maxWidthOrHeight) / width);
      width = options.maxWidthOrHeight;
    } else {
      width = Math.round((width * options.maxWidthOrHeight) / height);
      height = options.maxWidthOrHeight;
    }
  }

  // 5. Render ke HTML5 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Gagal menginisialisasi Canvas 2D Context.');
  }

  // Isi latar belakang putih untuk output JPEG (menangani PNG transparan)
  if (options.outputFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  // 6. Ekspor Canvas ke Blob
  const mimeType = getMimeTypeForFormat(options.outputFormat);
  const quality = options.outputFormat === 'png' ? undefined : options.quality;

  const resultBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });

  // Bebaskan memori canvas
  canvas.width = 0;
  canvas.height = 0;

  if (!resultBlob) {
    throw new Error(`Gagal mengonversi gambar "${file.name}" ke format ${options.outputFormat.toUpperCase()}.`);
  }

  return resultBlob;
}

/**
 * Memproses konversi gambar masal secara sekuensial
 */
export async function convertBatchImages(
  files: File[],
  options: ImageConverterOptions,
  onProgress?: ImageProgressCallback
): Promise<ImageConvertedItem[]> {
  // 1. Validasi batch
  const batchValidation = validateBatchFiles(files, {
    maxSizeMB: FILE_SIZE_LIMITS.IMAGE_CONVERTER_SINGLE,
    maxFileCount: BATCH_LIMITS.IMAGE_CONVERTER_FILES,
    allowedMimeTypes: ALLOWED_MIME_TYPES.IMAGES,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],
  });

  if (!batchValidation.isValid) {
    throw new Error(batchValidation.errorMessage || 'Validasi kelompok gambar gagal.');
  }

  const results: ImageConvertedItem[] = [];
  const totalFiles = files.length;

  onProgress?.(5, 'Memulai antrean konversi gambar...', 0, totalFiles);

  // 2. Processing loop sekuensial
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const currentPercent = Math.round(((i + 0.2) / totalFiles) * 90);

    onProgress?.(
      currentPercent,
      `Mengonversi gambar (${i + 1}/${totalFiles}): "${file.name}"...`,
      i + 1,
      totalFiles
    );

    try {
      const convertedBlob = await convertSingleImage(file, options);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const targetExt = getExtensionForFormat(options.outputFormat);
      const convertedName = `${nameWithoutExt}.${targetExt}`;

      results.push({
        id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        originalName: file.name,
        originalSize: file.size,
        convertedBlob,
        convertedSize: convertedBlob.size,
        convertedName,
        format: options.outputFormat,
      });
    } catch (err) {
      console.error(`Error converting ${file.name}:`, err);
      throw new Error(`Gagal mengonversi gambar "${file.name}": ${(err as Error).message}`);
    }
  }

  onProgress?.(100, 'Seluruh gambar berhasil dikonversi!', totalFiles, totalFiles);

  return results;
}