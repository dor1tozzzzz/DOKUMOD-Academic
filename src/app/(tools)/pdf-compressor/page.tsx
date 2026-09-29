'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/Dropzone';
import { compressPdfFile } from '@/engines/pdfCompressor';
import {
  CPNS_TARGET_PRESETS,
  formatBytes,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from '@/utils/fileValidation';
import { PdfCompressorResult } from '@/types';

export default function PdfCompressorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetSizeKB, setTargetSizeKB] = useState<number>(200); // Default 200KB (Target CPNS)
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [result, setResult] = useState<PdfCompressorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleStartCompression = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    setProgressPercent(0);
    setProgressStatus('Inisialisasi engine kompresi...');
    setError(null);

    try {
      const res = await compressPdfFile(
        selectedFile,
        { targetSizeKB },
        (percentage, stepMessage) => {
          setProgressPercent(percentage);
          setProgressStatus(stepMessage);
        }
      );
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan tidak terduga saat mengompresi berkas PDF.'
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    const nameWithoutExt =
      selectedFile?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${nameWithoutExt}_compressed_${targetSizeKB}KB.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgressPercent(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          PDF Compressor (Client-Side)
        </h1>
        <p className="mt-2 text-slate-600">
          Kompres dokumen PDF ke target ukuran spesifik (CPNS/Beasiswa) tanpa
          mengunggah berkas ke server eksternal.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!selectedFile ? (
          <Dropzone
            onFilesSelected={handleFileSelect}
            accept={ALLOWED_MIME_TYPES.PDF}
            allowedExtensions={['.pdf']}
            maxSizeMB={FILE_SIZE_LIMITS.PDF_COMPRESSOR}
            title="Pilih atau Tarik Berkas PDF di Sini"
            description="Proses 100% aman dan berjalan penuh di memori browser Anda."
          />
        ) : (
          <div className="space-y-6">
            {/* File Information Card */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Ukuran Asli: {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!isCompressing && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors shrink-0"
                >
                  Ganti Berkas
                </button>
              )}
            </div>

            {/* Target Size Preset Selector */}
            {!result && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Target Ukuran Maksimal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CPNS_TARGET_PRESETS.map((preset) => (
                    <button
                      key={preset.sizeKB}
                      type="button"
                      disabled={isCompressing}
                      onClick={() => setTargetSizeKB(preset.sizeKB)}
                      className={`p-3 text-left border rounded-xl text-xs transition-all ${
                        targetSizeKB === preset.sizeKB
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 font-semibold text-blue-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{preset.sizeKB} KB</div>
                      <div className="text-[11px] text-slate-500">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!result && !isCompressing && (
              <button
                onClick={handleStartCompression}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
              >
                Mulai Kompresi PDF ({targetSizeKB} KB)
              </button>
            )}

            {/* Progress Bar */}
            {isCompressing && (
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{progressStatus}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Result Card */}
            {result && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Kompresi Berhasil!</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <p className="text-slate-500">Ukuran Awal</p>
                    <p className="font-bold text-slate-800">
                      {formatBytes(result.originalSize)}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <p className="text-slate-500">Ukuran Akhir</p>
                    <p className="font-bold text-emerald-600">
                      {formatBytes(result.compressedSize)}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <p className="text-slate-500">Hemat</p>
                    <p className="font-bold text-blue-600">
                      {result.compressionRatio}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Unduh Berkas PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-all"
                  >
                    Kompres Berkas Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}