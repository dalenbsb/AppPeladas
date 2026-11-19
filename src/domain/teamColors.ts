/** Cores padrão das camisas (Time 1 / Time 2). */
export const DEFAULT_COR_TIME1 = '#FFFFFF';
export const DEFAULT_COR_TIME2 = '#111111';

/** Presets de camisa (sem lib de color picker). */
export const SHIRT_COLOR_PRESETS = [
  '#FFFFFF',
  '#111111',
  '#C1121F',
  '#1D3557',
  '#2A9D8F',
  '#E9C46A',
  '#457B9D',
  '#E76F51',
  '#6D597A',
  '#264653',
] as const;

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

export function coresIguais(a: string, b: string): boolean {
  return normalizeHexColor(a) === normalizeHexColor(b);
}

/** Contraste simples para texto/borda sobre a swatch. */
export function isLightColor(hex: string): boolean {
  const n = normalizeHexColor(hex).replace('#', '');
  if (n.length !== 6) return true;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
