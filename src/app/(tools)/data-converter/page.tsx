'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/Dropzone';
import {
  FILE_SIZE_LIMITS,
} from '@/utils/fileValidation';

type ConversionMode = 'json2csv' | 'csv2json';

export default function DataConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('json2csv');
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Helper: JSON String to CSV Converter
  const jsonToCsv = (jsonString: string): string => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Sintaks JSON tidak valid. Pastikan format JSON sesuai standar.');
    }

    let dataArray: Record<string, unknown>[] = [];

    if (Array.isArray(parsed)) {
      dataArray = parsed as Record<string, unknown>[];
    } else if (typeof parsed === 'object' && parsed !== null) {
      dataArray = [parsed as Record<string, unknown>];
    } else {
      throw new Error('Input JSON harus berupa Array of Objects atau Objek tunggal.');
    }

    if (dataArray.length === 0) {
      throw new Error('Array JSON kosong, tidak ada data untuk dikonversi.');
    }

    const headers = Array.from(
      new Set(
        dataArray.flatMap((item) =>
          typeof item === 'object' && item !== null ? Object.keys(item) : []
        )
      )
    );

    if (headers.length === 0) {
      throw new Error('Tidak ditemukan atribut (keys) dalam objek JSON.');
    }

    const csvRows: string[] = [];
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

    for (const row of dataArray) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  // Helper: CSV String to JSON Converter
  const csvToJson = (csvString: string): string => {
    const lines = csvString
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error('Data CSV kosong.');
    }

    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCsvLine(lines[0]);
    if (headers.length === 0) {
      throw new Error('Header CSV tidak dapat diparse.');
    }

    const resultObjects: Record<string, string | number | boolean | null>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length === headers.length) {
        const obj: Record<string, string | number | boolean | null> = {};
        headers.forEach((header, index) => {
          const rawVal = values[index];
          if (rawVal === '' || rawVal === null) {
            obj[header] = null;
          } else if (!isNaN(Number(rawVal)) && rawVal !== '') {
            obj[header] = Number(rawVal);
          } else if (rawVal.toLowerCase() === 'true') {
            obj[header] = true;
          } else if (rawVal.toLowerCase() === 'false') {
            obj[header] = false;
          } else {
            obj[header] = rawVal;
          }
        });
        resultObjects.push(obj);
      }
    }

    if (resultObjects.length === 0 && lines.length > 1) {
      throw new Error('Jumlah kolom pada baris data tidak sesuai dengan header CSV.');
    }

    return JSON.stringify(resultObjects, null, 2);
  };

  const handleConvert = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Masukkan teks data atau unggah berkas terlebih dahulu.');
      return;
    }

    try {
      if (mode === 'json2csv') {
        const result = jsonToCsv(inputText);
        setOutputText(result);
      } else {
        const result = csvToJson(inputText);
        setOutputText(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat konversi data.');
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text || '');
    };
    reader.onerror = () => {
      setError('Gagal membaca isi berkas.');
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Gagal menyalin data ke clipboard.');
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const ext = mode === 'json2csv' ? 'csv' : 'json';
    const mime = mode === 'json2csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([outputText], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_data_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setFileName(null);
    setCopied(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          JSON ↔ CSV Data Converter
        </h1>
        <p className="mt-2 text-slate-600">
          Konversi struktur data antara format JSON dan CSV secara instan, presisi, dan 100% aman di memori lokal.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Mode Switcher */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => {
                setMode('json2csv');
                handleClear();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'json2csv'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON ke CSV
            </button>
            <button
              onClick={() => {
                setMode('csv2json');
                handleClear();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'csv2json'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CSV ke JSON
            </button>
          </div>
        </div>

        {/* Dropzone Upload */}
        <Dropzone
          onFilesSelected={handleFileSelect}
          accept={mode === 'json2csv' ? ['application/json', 'text/plain'] : ['text/csv', 'text/plain']}
          allowedExtensions={mode === 'json2csv' ? ['.json', '.txt'] : ['.csv', '.txt']}
          maxSizeMB={FILE_SIZE_LIMITS.DATA_CONVERTER}
          title={`Unggah Berkas ${mode === 'json2csv' ? 'JSON' : 'CSV'}`}
          description={`Pilih berkas ${mode === 'json2csv' ? '.json' : '.csv'} atau tempelkan teks langsung di bawah ini.`}
        />

        {fileName && (
          <div className="flex items-center justify-between text-xs p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium">
            <span>Berkas Terisi: <strong>{fileName}</strong></span>
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-red-600 font-bold"
            >
              Hapus Berkas
            </button>
          </div>
        )}

        {/* Text Areas Input & Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Input Data ({mode === 'json2csv' ? 'JSON' : 'CSV'})</span>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-red-600 hover:text-red-700 font-normal"
                >
                  Bersihkan
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'json2csv'
                  ? '[\n  { "nama": "Budi", "umur": 25, "kota": "Jakarta" },\n  { "nama": "Siti", "umur": 22, "kota": "Bandung" }\n]'
                  : '"nama","umur","kota"\n"Budi",25,"Jakarta"\n"Siti",22,"Bandung"'
              }
              className="w-full h-64 p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Hasil Konversi ({mode === 'json2csv' ? 'CSV' : 'JSON'})</span>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {copied ? 'Terpublikasi/Tersalin!' : 'Salin Teks'}
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Hasil konversi akan tampil di sini secara otomatis setelah tombol diklik..."
              className="w-full h-64 p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-100 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleConvert}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
          >
            Konversi Data ({mode === 'json2csv' ? 'JSON → CSV' : 'CSV → JSON'})
          </button>

          {outputText && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Hasil (.{mode === 'json2csv' ? 'csv' : 'json'})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}