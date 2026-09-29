'use client';

import React, { useState, useEffect } from 'react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

// Fungsi penolong di luar komponen
function generateInvoiceNumber(): string {
  return `INV-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDueDateString(daysAhead: number = 14): string {
  const today = new Date();
  const due = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return due.toISOString().split('T')[0];
}

export default function InvoiceGeneratorPage() {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-100000');
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('IDR');

  // Jalankan pembaruan state secara asinkron saat client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoiceNumber(generateInvoiceNumber());
      setIssueDate(getTodayDateString());
      setDueDate(getDueDateString(14));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sender & Client Details
  const [senderName, setSenderName] = useState<string>('PT Tech Solusindo');
  const [senderEmail, setSenderEmail] = useState<string>('billing@techsolusindo.id');
  const [senderAddress, setSenderAddress] = useState<string>('Bekasi, Jawa Barat');

  const [clientName, setClientName] = useState<string>('Klien Mitra Mandiri');
  const [clientEmail, setClientEmail] = useState<string>('contact@mitramandiri.com');
  const [clientAddress, setClientAddress] = useState<string>('Jakarta Selatan, DKI Jakarta');

  // Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Pengembangan Aplikasi Web Utility Client-Side', quantity: 1, price: 5000000 },
    { id: '2', description: 'Optimasi Kinerja & Desain Responsif UI/UX', quantity: 1, price: 1500000 },
  ]);

  // Adjustments
  const [taxPercent, setTaxPercent] = useState<number>(11); // PPN 11%
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState<string>(
    'Pembayaran dilakukan via transfer bank dalam kurun waktu 14 hari kerja.'
  );

  // Dynamic Item Actions
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header (Hidden on Print) */}
      <div className="mb-8 text-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800">
          Smart Invoice Generator (Client-Side)
        </h1>
        <p className="mt-2 text-slate-600">
          Buat dan unduh faktur tagihan profesional secara instan tanpa melalui server backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Hidden on Print) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 print:hidden">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
            Formulir Data Faktur
          </h2>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Nomor Invoice
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Mata Uang
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Jatuh Tempo
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Sender & Client Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-700">Penerbit (Pengirim)</h3>
              <input
                type="text"
                placeholder="Nama Usaha / Penyedia"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <textarea
                placeholder="Alamat Singkat"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg h-16 resize-none"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-700">Ditujukan Kepada</h3>
              <input
                type="text"
                placeholder="Nama Klien / Perusahaan"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Email Klien"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <textarea
                placeholder="Alamat Klien"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg h-16 resize-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-700">Daftar Layanan / Produk</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                + Tambah Baris
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center text-xs">
                  <input
                    type="text"
                    placeholder="Deskripsi layanan"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-14 p-2 border border-slate-300 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Harga"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-24 p-2 border border-slate-300 rounded-lg text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discounts */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Pajak (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Diskon (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg h-16 resize-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / Unduh PDF Faktur
          </button>
        </div>

        {/* Invoice Live Preview Container */}
        <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-md print:shadow-none print:border-none print:p-0 print:m-0">
          <div id="printable-invoice" className="space-y-6 text-slate-800">
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="text-xl font-bold text-blue-600 uppercase tracking-wide">
                  FAKTUR / INVOICE
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  #{invoiceNumber}
                </p>
              </div>
              <div className="text-right text-xs space-y-1">
                <p className="font-semibold text-slate-800">{senderName}</p>
                <p className="text-slate-500">{senderEmail}</p>
                <p className="text-slate-500 max-w-[180px]">{senderAddress}</p>
              </div>
            </div>

            {/* Dates & Client Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Tagihan Kepada:</p>
                <p className="font-bold text-slate-800 mt-1">{clientName}</p>
                <p className="text-slate-500">{clientEmail}</p>
                <p className="text-slate-500">{clientAddress}</p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Tgl Terbit: </span>
                  <span className="font-medium">{issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Jatuh Tempo: </span>
                  <span className="font-medium text-red-600">{dueDate}</span>
                </div>
              </div>
            </div>

            {/* Table Items */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="p-2.5 font-semibold">Deskripsi</th>
                    <th className="p-2.5 font-semibold text-center w-12">Qty</th>
                    <th className="p-2.5 font-semibold text-right w-24">Harga</th>
                    <th className="p-2.5 font-semibold text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.description || '-'}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2.5 text-right font-semibold">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-56 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Pajak ({taxPercent}%):</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon ({discountPercent}%):</span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-800 border-t pt-2">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="pt-4 border-t text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Catatan / Ketentuan:</p>
                <p className="whitespace-pre-line leading-relaxed">{notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}