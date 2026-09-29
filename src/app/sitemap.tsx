import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dokumod.com'; // Ganti dengan domain akhir Anda

  const routes = [
    '',
    '/pdf-compressor',
    '/pdf-merger',
    '/image-converter',
    '/invoice-generator',
    '/text-cleaner',
    '/data-converter',
    '/privacy-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}