import type { TimeSide } from '@/domain/types';

export {
  DEFAULT_COR_TIME1,
  DEFAULT_COR_TIME2,
  SHIRT_COLOR_PRESETS,
  normalizeHexColor,
  coresIguais,
  isLightColor,
} from '@/domain/teamColors';

/** Rótulos de UI — domínio interno permanece branco/preto. */
export const TIME_UI_LABELS: Record<TimeSide, string> = {
  branco: 'Time 1',
  preto: 'Time 2',
};
