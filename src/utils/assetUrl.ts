/**
 * Resolves static asset paths correctly respecting Vite's base URL (e.g. GitHub Pages /MRTECH-AI-CREATED-BY-RAYYAN/)
 */
export function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

export const LOGO_URL = getAssetUrl('/logo.png');
