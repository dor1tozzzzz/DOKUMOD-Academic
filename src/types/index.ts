/**
 * Global Type Definitions for Web All-in-One Utility System
 */

// ==========================================
// 1. MODULE & TOOL CATEGORIES
// ==========================================

export type ToolCategory = 'media-document' | 'text-data';

export type ToolId =
  | 'pdf-compressor'
  | 'pdf-merger'
  | 'image-converter'
  | 'invoice-generator'
  | 'json-csv-converter'
  | 'text-cleaner';

export interface ToolMetadata {
  id: ToolId;
  title: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  isPopular?: boolean;
}

// ==========================================
// 2. PROCESSING STATE & PROGRESS
// ==========================================

export type ProcessingStatus = 'idle' | 'validating' | 'processing' | 'success' | 'error';

export interface ProcessingProgress {
  percentage: number; // 0 to 100
  currentStepMessage: string;
  filesProcessed?: number;
  totalFiles?: number;
}

export interface ProcessingResult<T = Blob | string> {
  status: ProcessingStatus;
  data?: T;
  fileName?: string;
  fileSizeBytes?: number;
  originalSizeBytes?: number;
  errorMessage?: string;
}

// ==========================================
// 3. MEDIA & DOCUMENT TOOLS TYPES
// ==========================================

// PDF Compressor
export interface PdfCompressorOptions {
  targetSizeKB?: number; // Target size in KB (e.g., 200, 300, 500 for CPNS)
  qualityRatio?: number; // Manual quality ratio 0.1 to 1.0 if not using target preset
  renderDpi?: number; // DPI rendering target (default: 150)
}

export interface PdfCompressorResult {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // Percentage saved
  pageCount: number;
}

// PDF Merger
export interface PdfMergerFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

// Image Converter
export type ImageOutputFormat = 'jpeg' | 'png' | 'webp';

export interface ImageConverterOptions {
  outputFormat: ImageOutputFormat;
  quality: number; // 0.1 to 1.0 (for JPEG/WebP)
  maxWidthOrHeight?: number; // Optional resize boundary
}

export interface ImageConvertedItem {
  id: string;
  originalName: string;
  originalSize: number;
  convertedBlob: Blob;
  convertedSize: number;
  convertedName: string;
  format: ImageOutputFormat;
}

// ==========================================
// 4. TEXT & DATA TOOLS TYPES
// ==========================================

// Invoice Generator
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  currencySymbol: string;
  
  // Sender Details
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  senderPhone?: string;
  senderLogoUrl?: string;

  // Client Details
  clientName: string;
  clientEmail: string;
  clientAddress: string;

  // Line Items & Totals
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;

  notes?: string;
  paymentTerms?: string;
}

// Data Converter (JSON <-> CSV)
export type DataConversionDirection = 'json2csv' | 'csv2json';

export interface DataConverterOptions {
  direction: DataConversionDirection;
  delimiter?: string; // default ','
  prettyJson?: boolean;
}

// Text Cleaner
export interface TextCleanerOptions {
  removeExtraSpaces: boolean;
  removeHtmlTags: boolean;
  removeSpecialChars: boolean;
  convertCase?: 'none' | 'uppercase' | 'lowercase' | 'titlecase' | 'slugify';
  removeDuplicateLines: boolean;
  trimLines: boolean;
}

// ==========================================
// 5. SYSTEM TOAST & NOTIFICATION TYPES
// ==========================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}