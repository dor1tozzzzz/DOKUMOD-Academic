'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  validateSingleFile,
  validateBatchFiles,
  ValidationResult,
} from '@/utils/fileValidation';

export interface DropzoneProps {
  /** Callback yang dipanggil saat berkas berhasil divalidasi */
  onFilesSelected: (files: File[]) => void;
  /** Daftar MIME type yang diizinkan (misal: ['application/pdf']) */
  accept?: readonly string[];
  /** Daftar ekstensi berkas yang diizinkan (misal: ['.pdf', '.jpg']) */
  allowedExtensions?: readonly string[];
  /** Ukuran maksimal berkas dalam Megabytes */
  maxSizeMB: number;
  /** Batas jumlah berkas untuk mode batch upload */
  maxFileCount?: number;
  /** Mengizinkan unggahan banyak berkas sekaligus */
  multiple?: boolean;
  /** Status nonaktifkan komponen */
  disabled?: boolean;
  /** Judul utama pada area Dropzone */
  title?: string;
  /** Deskripsi pendukung di bawah judul */
  description?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  accept,
  allowedExtensions,
  maxSizeMB,
  maxFileCount = 1,
  multiple = false,
  disabled = false,
  title = 'Tarik & lepas berkas di sini',
  description,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProcessFiles = (incomingFiles: FileList | File[] | null) => {
    if (!incomingFiles || incomingFiles.length === 0 || disabled) return;

    setErrorMessage(null);
    const fileArray = Array.from(incomingFiles);

    let validation: ValidationResult;

    if (multiple || fileArray.length > 1) {
      validation = validateBatchFiles(fileArray, {
        maxSizeMB,
        maxFileCount: maxFileCount || 10,
        allowedMimeTypes: accept,
        allowedExtensions,
      });
    } else {
      validation = validateSingleFile(fileArray[0], {
        maxSizeMB,
        allowedMimeTypes: accept,
        allowedExtensions,
      });
    }

    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Validasi berkas gagal.');
      return;
    }

    onFilesSelected(fileArray);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[200px] p-6 
          border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
          ${
            disabled
              ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-60'
              : isDragging
              ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-100/60'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept ? accept.join(',') : undefined}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {/* Cloud Upload Icon */}
        <div
          className={`p-3 mb-3 rounded-full ${
            isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="mb-1 text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-500 text-center">
          {description ||
            `Atau klik untuk memilih berkas (${multiple ? `Maks. ${maxFileCount} berkas` : '1 berkas'}, maks. ${maxSizeMB} MB)`}
        </p>

        {allowedExtensions && allowedExtensions.length > 0 && (
          <p className="mt-2 text-[11px] font-mono text-slate-400">
            Format: {allowedExtensions.join(', ')}
          </p>
        )}
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 mt-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};