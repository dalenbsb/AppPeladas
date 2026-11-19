/** Chave local YYYY-MM-DD a partir de ISO (ou Date). */
export function toLocalDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayLocalDayKey(): string {
  return toLocalDayKey(new Date());
}

/** Formata YYYY-MM-DD → DD/MM/YYYY. */
export function formatDayKeyBr(dayKey: string): string {
  const [y, m, d] = dayKey.split('-');
  if (!y || !m || !d) return dayKey;
  return `${d}/${m}/${y}`;
}

/** Aceita DD/MM/YYYY ou YYYY-MM-DD → YYYY-MM-DD ou null. */
export function parseDayInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const key = `${iso[1]}-${iso[2]}-${iso[3]}`;
    return isValidDayKey(key) ? key : null;
  }
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!br) return null;
  const d = br[1]!.padStart(2, '0');
  const m = br[2]!.padStart(2, '0');
  const y = br[3]!;
  const key = `${y}-${m}-${d}`;
  return isValidDayKey(key) ? key : null;
}

function isValidDayKey(key: string): boolean {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  );
}

/** Inclusivo em YYYY-MM-DD (compara lexicograficamente). */
export function dayKeyInRange(
  dayKey: string,
  inicio: string | null | undefined,
  fim: string | null | undefined,
): boolean {
  if (inicio && dayKey < inicio) return false;
  if (fim && dayKey > fim) return false;
  return true;
}
