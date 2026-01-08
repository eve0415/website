export interface QRDestination {
  url: string;
  label: string;
}

export const QR_DESTINATIONS = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', label: 'youtube.com/watch?v=dQw4w9WgXcQ' },
  { url: 'https://eve0415.net', label: 'eve0415.net' },
  { url: 'https://github.com/eve0415', label: 'github.com/eve0415' },
  { url: 'https://github.com/eve0415/website', label: 'github.com/eve0415/website' },
] as const satisfies readonly QRDestination[];

export const REPO_URL = 'https://github.com/eve0415/website';
export const REPO_LABEL = 'github.com/eve0415/website';
