'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/Dropzone';
import { mergePdfFiles, getPdfPageCount } from '@/engines/pdfMerger';
import {
  formatBytes,
  FILE_SIZE_LIMITS,
  BATCH_LIMITS,
  ALLOWED_MIME_TYPES,
} from '@/utils/fileValidation';

export default function PdfMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedBlob(null);
    setError(null);

    // Ambil jumlah halaman secara asynchronous untuk berkas baru
    for (const file of newFiles) {
      const key = `${file.name}-${file.size}`;
      if (!pageCounts[key]) {
        const count = await getPdfPageCount(file);
        setPageCounts((prev) => ({ ...prev, [key]: count }));
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
    setMergedBlob(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
    setMergedBlob(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setPageCounts({});
    setMergedBlob(null);
    setError(null);
    setProgressPercent(0);
  };

  const handleStartMerge = async () => {
    if (files.length < 2) {
      setError('Pilih minimal 2 berkas PDF untuk dapat digabungkan.');
      return;
    }

    setIsMerging(true);
    setProgressPercent(0);
    setProgressStatus('Membaca dan memproses berkas PDF...');
    setError(null);

    try {
      const resultBlob = await mergePdfFiles(files, (percentage, stepMessage) => {
        setProgressPercent(percentage);
        setProgressStatus(stepMessage);
      });
      setMergedBlob(resultBlob);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan tidak terduga saat menggabungkan berkas PDF.'
      );
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gabungan_dokumen_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          PDF Merger (Client-Side)
        </h1>
        <p className="mt-2 text-slate-600">
          Gabungkan beberapa berkas PDF menjadi satu dokumen utuh secara fleksibel,
          tanpa unggah ke server eksternal.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Dropzone Component */}
        <Dropzone
          onFilesSelected={handleFilesSelected}
          accept={ALLOWED_MIME_TYPES.PDF}
          allowedExtensions={['.pdf']}
          maxSizeMB={FILE_SIZE_LIMITS.PDF_MERGER_SINGLE}
          multiple={true}
          maxFileCount={BATCH_LIMITS.PDF_MERGER_FILES}
          disabled={isMerging}
          title="Tarik & Lepas Berkas PDF di Sini"
          description="Pilih minimal 2 berkas PDF (maks. 10MB per berkas, total 50MB)."
        />

        {/* Selected Files List & Controls */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-sm text-slate-800">
                  Daftar Berkas Terpilih ({files.length} Berkas)
                </h3>
                <p className="text-xs text-slate-500">
                  Total Ukuran: {formatBytes(totalSize)}
                </p>
              </div>
              {!isMerging && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Reorderable File List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {files.map((file, index) => {
                const fileKey = `${file.name}-${file.size}`;
                const pageCount = pageCounts[fileKey];

                return (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl transition-all hover:bg-slate-100/70"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs rounded-full shrink-0">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-medium text-xs text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatBytes(file.size)} • {pageCount ? `${pageCount} Halaman` : 'Menghitung halaman...'}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Move Up, Move Down, Delete */}
                    {!isMerging && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Geser ke Atas"
                          className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === files.length - 1}
                          title="Geser ke Bawah"
                          className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          title="Hapus Berkas"
                          className="p-1 text-slate-400 hover:text-red-600 rounded ml-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Merge Action Button */}
            {!mergedBlob && !isMerging && (
              <button
                onClick={handleStartMerge}
                disabled={files.length < 2}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
              >
                Gabungkan {files.length} Berkas PDF
              </button>
            )}

            {/* Progress Bar */}
            {isMerging && (
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Merged Result Section */}
            {mergedBlob && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Penggabungan PDF Berhasil!</span>
                </div>

                <div className="flex items-center justify-between text-xs p-3 bg-white rounded-lg border border-emerald-100">
                  <span className="text-slate-600">Ukuran Hasil Gabungan:</span>
                  <span className="font-bold text-emerald-700">
                    {formatBytes(mergedBlob.size)}
                  </span>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Unduh Hasil PDF Gabungan
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-all"
                  >
                    Mulai Baru
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