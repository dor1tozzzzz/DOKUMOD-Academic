'use client';

import React, { useState, useMemo } from 'react';
import {
  cleanText,
  getTextStats,
  TextCleanerOptions,
  CaseTransform,
} from '@/engines/textCleaner';

export default function TextCleanerPage() {
  const [inputText, setInputText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Configuration options state
  const [options, setOptions] = useState<TextCleanerOptions>({
    trimLines: true,
    removeEmptyLines: true,
    removeDuplicateLines: false,
    sortLines: 'none',
    removeExtraSpaces: true,
    removeHtmlTags: false,
    removeNumbers: false,
    removeSpecialChars: false,
    removeEmojis: false,
    changeCase: 'none',
  });

  // Calculate cleaned output in real-time
  const outputText = useMemo(() => {
    return cleanText(inputText, options);
  }, [inputText, options]);

  // Calculate statistics for both input and output
  const inputStats = useMemo(() => getTextStats(inputText), [inputText]);
  const outputStats = useMemo(() => getTextStats(outputText), [outputText]);

  const handleOptionChange = <K extends keyof TextCleanerOptions>(
    key: K,
    value: TextCleanerOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Gagal menyalin teks ke clipboard.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch {
      console.error('Gagal membaca clipboard.');
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_text_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setCopied(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Smart Text Cleaner (Client-Side)
        </h1>
        <p className="mt-2 text-slate-600">
          Bersihkan, format ulang, hapus karakter tak diinginkan, dan analisis statistik teks secara instan dan 100% privat.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Real-time Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Karakter</p>
            <p className="text-lg font-bold text-slate-800">{outputStats.charCount}</p>
            <p className="text-[10px] text-slate-400">Awal: {inputStats.charCount}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Tanpa Spasi</p>
            <p className="text-lg font-bold text-slate-800">{outputStats.charCountNoSpaces}</p>
            <p className="text-[10px] text-slate-400">Awal: {inputStats.charCountNoSpaces}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Kata</p>
            <p className="text-lg font-bold text-blue-600">{outputStats.wordCount}</p>
            <p className="text-[10px] text-slate-400">Awal: {inputStats.wordCount}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Baris</p>
            <p className="text-lg font-bold text-slate-800">{outputStats.lineCount}</p>
            <p className="text-[10px] text-slate-400">Awal: {inputStats.lineCount}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Paragraf</p>
            <p className="text-lg font-bold text-slate-800">{outputStats.paragraphCount}</p>
            <p className="text-[10px] text-slate-400">Awal: {inputStats.paragraphCount}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Waktu Baca</p>
            <p className="text-lg font-bold text-emerald-600">~{outputStats.readingTimeMinutes} mnt</p>
            <p className="text-[10px] text-slate-400">200 WPM</p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Opsi Pembersihan & Format
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Checkboxes */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeExtraSpaces}
                onChange={(e) => handleOptionChange('removeExtraSpaces', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Spasi Berlebihan</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.trimLines}
                onChange={(e) => handleOptionChange('trimLines', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Trim Setiap Baris</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeEmptyLines}
                onChange={(e) => handleOptionChange('removeEmptyLines', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Baris Kosong</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeDuplicateLines}
                onChange={(e) => handleOptionChange('removeDuplicateLines', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Baris Duplikat</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeHtmlTags}
                onChange={(e) => handleOptionChange('removeHtmlTags', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Tag HTML</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeEmojis}
                onChange={(e) => handleOptionChange('removeEmojis', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Emoji</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeNumbers}
                onChange={(e) => handleOptionChange('removeNumbers', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Angka</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.removeSpecialChars}
                onChange={(e) => handleOptionChange('removeSpecialChars', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700">Hapus Karakter Khusus</span>
            </label>
          </div>

          {/* Dropdowns for Case & Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Ubah Format Huruf (Casing):
              </label>
              <select
                value={options.changeCase || 'none'}
                onChange={(e) =>
                  handleOptionChange('changeCase', e.target.value as CaseTransform)
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="none">Tidak Mengubah Casing (Default)</option>
                <option value="uppercase">UPPERCASE (HURUF BESAR)</option>
                <option value="lowercase">lowercase (huruf kecil)</option>
                <option value="titlecase">Title Case (Huruf Depan Kapital)</option>
                <option value="sentencecase">Sentence case (Awal kalimat besar)</option>
                <option value="camelcase">camelCase</option>
                <option value="kebabcase">kebab-case</option>
                <option value="snakecase">snake_case</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Pengurutan Baris (Sort Lines):
              </label>
              <select
                value={options.sortLines || 'none'}
                onChange={(e) =>
                  handleOptionChange(
                    'sortLines',
                    e.target.value as 'none' | 'asc' | 'desc'
                  )
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="none">Urutan Asli (Tanpa Sort)</option>
                <option value="asc">Urutkan A ke Z (Ascending)</option>
                <option value="desc">Urutkan Z ke A (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Areas Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Teks Input (Mentah)</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tempel
                </button>
                {inputText && (
                  <button
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-700 font-normal"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik atau tempelkan teks Anda di sini..."
              className="w-full h-72 p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Hasil Pembersihan (Cleaned)</span>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {copied ? 'Tersalin!' : 'Salin Hasil'}
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Hasil teks yang sudah dibersihkan akan tampil secara otomatis di sini..."
              className="w-full h-72 p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-100 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
          >
            Bersihkan Semua
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
            >
              {copied ? 'Tersalin ke Clipboard!' : 'Salin Hasil Teks'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh .TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}