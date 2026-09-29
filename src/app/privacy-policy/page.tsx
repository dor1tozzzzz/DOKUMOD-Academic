export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-700 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">Kebijakan Privasi & Pelepasan Tanggung Jawab</h1>
      <p className="text-xs text-slate-500">Terakhir Diperbarui: September 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">1. Pemrosesan Berkas Lokal (Client-Side)</h2>
        <p>
          Dokumod beroperasi penuh menggunakan arsitektur <em>client-side processing</em>. Seluruh berkas yang Anda pilih (PDF, Gambar, Teks, dan Spreadsheet) diproses secara lokal di memori RAM peramban Anda. Dokumod tidak menyediakan server penyimpanan, tidak mengunggah, dan tidak merekam isi dokumen pengguna.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">2. Penggunaan Cookie & Iklan Pihak Ketiga</h2>
        <p>
          Situs ini dapat menggunakan cookie pihak ketiga seperti Google AdSense untuk menyajikan iklan yang relevan. Google menggunakan cookie untuk menyajikan iklan berdasarkan kunjungan pengguna ke situs ini atau situs lainnya di internet. Pengguna dapat memilih untuk menolak penggunaan cookie iklan terpersonalisasi melalui Setelan Iklan Google.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">3. Pelepasan Tanggung Jawab Hukum (Disclaimer)</h2>
        <p>
          Seluruh alat utilitas disediakan &quot;sebagaimana adanya&quot; tanpa jaminan dalam bentuk apa pun. Pengguna bertanggung jawab penuh atas keabsahan data, keaslian dokumen, dan penggunaan hasil konversi/invoice yang dibuat melalui platform ini. Dokumod tidak bertanggung jawab atas kerugian atau sengketa hukum yang timbul dari penggunaan platform.
        </p>
      </section>
    </div>
  );
}