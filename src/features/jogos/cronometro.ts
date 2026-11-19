/** Formatação e helpers do cronômetro da partida. */

export function formatCronometro(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/** Contagem regressiva curta (amarelo 2 min). */
export function formatCountdown(msRestante: number): string {
  const totalSec = Math.max(0, Math.ceil(msRestante / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function duracaoLimiteMs(duracaoMin: number | null | undefined): number | null {
  if (duracaoMin == null || duracaoMin <= 0) return null;
  return duracaoMin * 60 * 1000;
}

/**
 * Tempo exibido: acumulado + segmento corrente (se rodando).
 * `segmentStartedAt` é Date.now() do início do segmento atual.
 */
export function tempoExibidoMs(
  tempoDecorridoMs: number,
  rodando: boolean,
  segmentStartedAt: number | null,
  now = Date.now(),
): number {
  if (!rodando || segmentStartedAt == null) return Math.max(0, tempoDecorridoMs);
  return Math.max(0, tempoDecorridoMs + (now - segmentStartedAt));
}
