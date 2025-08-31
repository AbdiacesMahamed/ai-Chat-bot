export const DEFAULT_MAX_PAGES = 1;

export function getEnvMaxPages(): number {
  const raw = process.env.PLAYWRIGHT_MAX_PAGES;
  if (!raw) return DEFAULT_MAX_PAGES;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_PAGES;
}

// Headless mode: read from PLAYWRIGHT_HEADLESS ("true"/"false") or default to true
export function getEnvHeadless(): boolean {
  const raw = process.env.PLAYWRIGHT_HEADLESS;
  if (raw === undefined) return true;
  return String(raw).toLowerCase() !== 'false';
}


