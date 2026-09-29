'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/Dropzone';
import {
  convertBatchImages,
  ImageConverterOptions,
  ImageConvertedItem,
  ImageOutputFormat,
} from '@/engines/imageConverter';
import {
  formatBytes,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from '@/utils/fileValidation';

export default function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageOutputFormat>('webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [results, setResults] = useState<ImageConvertedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResults(null);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setProgressPercent(0);
  };

  const handleStartConversion = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgressPercent(0);
    setProgressStatus('Menyiapkan pemrosesan gambar...');
    setError(null);

    const options: ImageConverterOptions = {
      outputFormat: targetFormat,
      quality,
    };

    try {
      const res = await convertBatchImages(files, options, (percentage, stepMessage) => {
        setProgressPercent(percentage);
        setProgressStatus(stepMessage);
      });
      setResults(res);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan tidak terduga saat mengonversi gambar.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadSingle = (result: ImageConvertedItem) => {
    const url = URL.createObjectURL(result.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!results) return;
    results.forEach((res) => {
      handleDownloadSingle(res);
    });
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Image Converter (Client-Side)
        </h1>
        <p className="mt-2 text-slate-600">
          Ubah format gambar (JPG, PNG, WebP) secara kolektif di memori peramban secara cepat dan 100% privat.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <Dropzone
          onFilesSelected={handleFilesSelected}
          accept={ALLOWED_MIME_TYPES.IMAGES}
          allowedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']}
          maxSizeMB={FILE_SIZE_LIMITS.IMAGE_CONVERTER_SINGLE}
          multiple={true}
          maxFileCount={20}
          disabled={isConverting}
          title="Tarik & Lepas Gambar di Sini"
          description="Mendukung format JPG, PNG, WebP, dan HEIC hingga 20 berkas sekaligus."
        />

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h3 className="font-semibold text-sm text-slate-800">
                Pengaturan Konversi Format
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Format Tujuan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['webp', 'png', 'jpeg'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        disabled={isConverting}
                        onClick={() => {
                          setTargetFormat(fmt);
                          setResults(null);
                        }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border uppercase transition-all ${
                          targetFormat === fmt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {fmt === 'jpeg' ? 'JPG' : fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Kualitas Output:
                    </label>
                    <span className="text-xs font-bold text-blue-600">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    disabled={isConverting || targetFormat === 'png'}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setResults(null);
                    }}
                    className="w-full accent-blue-600 disabled:opacity-40 cursor-pointer"
                  />
                  {targetFormat === 'png' && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      *PNG menggunakan kompresi lossless (tanpa penurunan kualitas).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-sm text-slate-800">
                  Daftar Gambar ({files.length} Berkas)
                </h3>
                <p className="text-xs text-slate-500">
                  Total Ukuran: {formatBytes(totalSize)}
                </p>
              </div>
              {!isConverting && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0 uppercase">
                      {file.name.split('.').pop() || 'IMG'}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-xs text-slate-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>

                  {!isConverting && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded shrink-0 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!results && !isConverting && (
              <button
                onClick={handleStartConversion}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
              >
                Konversi {files.length} Gambar ke {targetFormat.toUpperCase()}
              </button>
            )}

            {isConverting && (
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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {results && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Konversi selesai ({results.length} Gambar)</span>
                  </div>

                  <button
                    onClick={handleDownloadAll}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Unduh Semua
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {results.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100 text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-800 truncate">
                          {res.originalName} → {res.convertedName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatBytes(res.originalSize)} →{' '}
                          <span className="font-bold text-emerald-700">
                            {formatBytes(res.convertedSize)}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadSingle(res)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold rounded-lg border border-slate-200 hover:border-emerald-200 transition-all shrink-0 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Konversi Gambar Lain
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