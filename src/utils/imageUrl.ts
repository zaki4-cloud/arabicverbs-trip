/**
 * Helper to resolve static and uploaded image URLs across development and production
 * (e.g. GitHub Pages with repository subpaths, Vercel, Netlify, Firebase Hosting).
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Data URLs (base64 uploads from phone/computer), blob URLs, and external https:// URLs
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Strip leading '/src/' or 'src/'
  let clean = trimmed;
  if (clean.startsWith('/src/')) {
    clean = clean.replace(/^\/src\//, '/');
  } else if (clean.startsWith('src/')) {
    clean = '/' + clean.replace(/^src\//, '');
  }

  // Ensure leading slash
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }

  // Handle base URL for subpath hosting (e.g., GitHub Pages: https://user.github.io/repo-name/)
  const base = import.meta.env.BASE_URL || './';
  if (base === './') {
    return clean.replace(/^\//, './');
  }

  const prefix = base.endsWith('/') ? base : base + '/';
  return prefix + clean.replace(/^\//, '');
}
