import Link from 'next/link';

interface ToolCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  category: 'PDF & Dokumen' | 'Gambar' | 'Teks & Data';
  badge?: string;
}

const TOOLS: ToolCard[] = [
  {
    title: 'PDF Compressor',
    description: 'Kompres berkas PDF ke target ukuran spesifik (200KB SSCASN/CPNS) secara instan di browser.',
    href: '/pdf-compressor',
    icon: '📄',
    category: 'PDF & Dokumen',
    badge: 'Populer',
  },
  {
    title: 'PDF Merger',
    description: 'Gabungkan beberapa berkas PDF menjadi satu dokumen utuh dengan fitur urutan fleksibel.',
    href: '/pdf-merger',
    icon: '📑',
    category: 'PDF & Dokumen',
  },
  {
    title: 'Image Converter',
    description: 'Konversi format gambar masal (JPG, PNG, WebP, HEIC) dengan optimasi kualitas piksel.',
    href: '/image-converter',
    icon: '🖼️',
    category: 'Gambar',
  },
  {
    title: 'Smart Invoice Generator',
    description: 'Buat dan unduh faktur tagihan profesional format PDF tanpa melalui server backend.',
    href: '/invoice-generator',
    icon: '🧾',
    category: 'Teks & Data',
  },
  {
    title: 'Smart Text Cleaner',
    description: 'Format ulang teks, hapus spasi berlebih, tag HTML, emoji, dan analisis statistik kata.',
    href: '/text-cleaner',
    icon: '📝',
    category: 'Teks & Data',
  },
  {
    title: 'Data Format Converter',
    description: 'Konversi struktur data terisolasi antara JSON, CSV, dan spreadsheet Excel (.xlsx).',
    href: '/data-converter',
    icon: '📊',
    category: 'Teks & Data',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
          <span>🔒 100% Client-Side Processing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Olah Berkas & Dokumen <br />
          <span className="text-blue-600">Tanpa Risiko Kebocoran Data</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Seluruh pemrosesan berkas PDF, gambar, dan data dilakukan murni di dalam RAM peramban Anda.
          Berkas sensitif tidak pernah diunggah ke server mana pun.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3">
          Pilih Alat Utilitas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-3xl">{tool.icon}</span>
                  {tool.badge && (
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] uppercase rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-lg">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Gunakan Alat</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Educational Privacy Proof Section */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold">Uji Keamanan & Privasi Secara Mandiri</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Aplikasi ini dibangun menggunakan arsitektur WebAssembly dan HTML5 Canvas lokal. 
            Anda dapat mematikan seluruh koneksi internet (Mode Pesawat) setelah halaman terbuka, 
            dan seluruh fungsi alat akan tetap bekerja 100%.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
            <p className="font-bold text-blue-400 mb-1">0 KB Ditransmisikan</p>
            <p className="text-slate-400">Dokumen KTP, Ijazah, dan KK tidak pernah terkirim ke internet.</p>
          </div>
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
            <p className="font-bold text-emerald-400 mb-1">Tanpa Batas Kuota</p>
            <p className="text-slate-400">Proses puluhan berkas gratis tanpa perlu mendaftar atau login.</p>
          </div>
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
            <p className="font-bold text-purple-400 mb-1">Kecepatan Lokal</p>
            <p className="text-slate-400">Kecepatan pemrosesan tergantung pada spesifikasi memori RAM perangkat Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}