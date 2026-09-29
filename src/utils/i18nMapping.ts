export interface RoutePair {
  en: string;
  id: string;
  labelEn: string;
  labelId: string;
}

export const ROUTE_MAPPINGS: RoutePair[] = [
  { en: '/', id: '/id', labelEn: 'Home', labelId: 'Beranda' },
  { en: '/compress-pdf', id: '/id/kompres-pdf', labelEn: 'PDF Compressor', labelId: 'Kompres PDF' },
  { en: '/merge-pdf', id: '/id/gabung-pdf', labelEn: 'PDF Merger', labelId: 'Gabung PDF' },
  { en: '/image-converter', id: '/id/konversi-gambar', labelEn: 'Image Converter', labelId: 'Konversi Gambar' },
  { en: '/invoice-generator', id: '/id/buat-invoice', labelEn: 'Invoice Generator', labelId: 'Buat Invoice' },
  { en: '/data-converter', id: '/id/konversi-data', labelEn: 'JSON/CSV Converter', labelId: 'Konversi Data' },
  { en: '/text-cleaner', id: '/id/pembersih-teks', labelEn: 'Text Cleaner', labelId: 'Pembersih Teks' },
];

export function getEquivalentPath(currentPath: string, targetLang: 'en' | 'id'): string {
  const match = ROUTE_MAPPINGS.find(
    (route) => route.en === currentPath || route.id === currentPath
  );

  if (match) {
    return targetLang === 'id' ? match.id : match.en;
  }

  // Fallback default jika path tidak ditemukan
  return targetLang === 'id' ? '/id' : '/';
}