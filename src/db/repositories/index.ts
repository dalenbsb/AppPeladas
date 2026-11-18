import type { SqlExecutor } from '../sqlExecutor';
import { AtletaRepository } from './atletaRepository';
import { EventoRepository } from './eventoRepository';
import { PartidaRepository } from './partidaRepository';
import { PeladaRepository } from './peladaRepository';
import { SessaoRepository } from './sessaoRepository';

export function createRepositories(db: SqlExecutor) {
  return {
    peladas: new PeladaRepository(db),
    atletas: new AtletaRepository(db),
    sessoes: new SessaoRepository(db),
    partidas: new PartidaRepository(db),
    eventos: new EventoRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export {
  AtletaRepository,
  EventoRepository,
  PartidaRepository,
  PeladaRepository,
  SessaoRepository,
};
