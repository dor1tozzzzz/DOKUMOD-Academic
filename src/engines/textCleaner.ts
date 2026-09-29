export type CaseTransform =
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'kebabcase'
  | 'snakecase';

export interface TextCleanerOptions {
  trimLines?: boolean;
  removeEmptyLines?: boolean;
  removeDuplicateLines?: boolean;
  sortLines?: 'none' | 'asc' | 'desc';
  removeExtraSpaces?: boolean;
  removeHtmlTags?: boolean;
  removeNumbers?: boolean;
  removeSpecialChars?: boolean;
  removeEmojis?: boolean;
  changeCase?: CaseTransform;
}

export interface TextStats {
  charCount: number;
  charCountNoSpaces: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
}

/**
 * Menghitung statistik teks (jumlah karakter, kata, baris, paragraf, dan estimasi waktu baca).
 */
export const getTextStats = (input: string): TextStats => {
  if (!input) {
    return {
      charCount: 0,
      charCountNoSpaces: 0,
      wordCount: 0,
      lineCount: 0,
      paragraphCount: 0,
      readingTimeMinutes: 0,
    };
  }

  const charCount = input.length;
  const charCountNoSpaces = input.replace(/\s/g, '').length;
  const words = input.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = input.split('\n').length;
  const paragraphCount = input.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  
  // Asumsi kecepatan membaca rata-rata 200 kata per menit (WPM)
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  return {
    charCount,
    charCountNoSpaces,
    wordCount,
    lineCount,
    paragraphCount,
    readingTimeMinutes,
  };
};

/**
 * Mengubah casing pada string.
 */
const transformCase = (str: string, targetCase: CaseTransform): string => {
  switch (targetCase) {
    case 'uppercase':
      return str.toUpperCase();

    case 'lowercase':
      return str.toLowerCase();

    case 'titlecase':
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );

    case 'sentencecase':
      return str
        .toLowerCase()
        .replace(/(^\s*|\.\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

    case 'camelcase':
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

    case 'kebabcase':
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();

    case 'snakecase':
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();

    case 'none':
    default:
      return str;
  }
};

/**
 * Membersihkan dan memanipulasi teks berdasarkan konfigurasi opsi yang dipilih.
 */
export const cleanText = (input: string, options: TextCleanerOptions): string => {
  if (!input) return '';

  let result = input;

  // 1. Hapus Tag HTML
  if (options.removeHtmlTags) {
    result = result.replace(/<[^>]*>/g, '');
  }

  // 2. Hapus Emoji
  if (options.removeEmojis) {
    result = result.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    );
  }

  // 3. Hapus Angka
  if (options.removeNumbers) {
    result = result.replace(/[0-9]/g, '');
  }

  // 4. Hapus Karakter Khusus (Menyisakan huruf, angka, spasi, dan newlines)
  if (options.removeSpecialChars) {
    result = result.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  // 5. Hapus Spasi Berlebihan
  if (options.removeExtraSpaces) {
    result = result.replace(/[ \t]+/g, ' ');
  }

  // 6. Pemrosesan Per Baris (Lines Processing)
  let lines = result.split('\n');

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }

  if (options.removeDuplicateLines) {
    lines = Array.from(new Set(lines));
  }

  if (options.sortLines === 'asc') {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (options.sortLines === 'desc') {
    lines.sort((a, b) => b.localeCompare(a));
  }

  result = lines.join('\n');

  // 7. Ubah Format Huruf (Casing)
  if (options.changeCase && options.changeCase !== 'none') {
    result = transformCase(result, options.changeCase);
  }

  return result;
};