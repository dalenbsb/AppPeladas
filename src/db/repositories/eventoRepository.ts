import type { EventoPartida, EventoPartidaMeta, NewEventoPartida } from '@/domain/types';

import { createId, nowIso } from '../ids';
import { mapEvento, type EventoRow } from '../mappers';
import type { SqlExecutor } from '../sqlExecutor';

export class EventoRepository {
  constructor(private readonly db: SqlExecutor) {}

  async listByPartida(partidaId: string): Promise<EventoPartida[]> {
    const rows = await this.db.getAll<EventoRow>(
      'SELECT * FROM eventos_partida WHERE partida_id = ? ORDER BY created_at ASC',
      [partidaId],
    );
    return rows.map(mapEvento);
  }

  async updateMeta(id: string, meta: EventoPartidaMeta | null): Promise<EventoPartida> {
    await this.db.run('UPDATE eventos_partida SET meta_json = ? WHERE id = ?', [
      meta ? JSON.stringify(meta) : null,
      id,
    ]);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Evento não encontrado: ${id}`);
    }
    return updated;
  }

  /**
   * Remove `retornaEm` / `retornaEmRestanteMs` dos amarelos ainda em suspensão
   * (ex.: liberação por gol). Mantém o registro do cartão para estatísticas/histórico.
   */
  async clearAmareloSuspensaoAtiva(partidaId: string, agoraIso = nowIso()): Promise<number> {
    const eventos = await this.listByPartida(partidaId);
    const agora = new Date(agoraIso).getTime();
    let cleared = 0;
    for (const ev of eventos) {
      if (ev.tipo !== 'amarelo' || !ev.meta) continue;
      const restante = ev.meta.retornaEmRestanteMs;
      const retornaEm = ev.meta.retornaEm;
      const ativoPorRestante =
        typeof restante === 'number' && Number.isFinite(restante) && restante > 0;
      const ativoPorRetorno =
        Boolean(retornaEm) && new Date(retornaEm!).getTime() > agora;
      if (!ativoPorRestante && !ativoPorRetorno) continue;
      const {
        retornaEm: _r,
        retornaEmRestanteMs: _rest,
        ...rest
      } = ev.meta;
      const nextMeta: EventoPartidaMeta = {
        ...rest,
        observacao: rest.observacao
          ? `${rest.observacao}; liberado por gol`
          : 'liberado por gol',
      };
      await this.updateMeta(ev.id, nextMeta);
      cleared += 1;
    }
    return cleared;
  }

  /**
   * Congela timers de retorno de amarelo ao pausar a partida:
   * troca `retornaEm` por `retornaEmRestanteMs`.
   */
  async pausarAmareloSuspensaoAtiva(
    partidaId: string,
    agoraMs = Date.now(),
  ): Promise<number> {
    const eventos = await this.listByPartida(partidaId);
    let updated = 0;
    for (const ev of eventos) {
      if (ev.tipo !== 'amarelo' || !ev.meta?.retornaEm) continue;
      const restante = new Date(ev.meta.retornaEm).getTime() - agoraMs;
      if (restante <= 0) continue;
      const { retornaEm: _r, ...rest } = ev.meta;
      await this.updateMeta(ev.id, {
        ...rest,
        retornaEmRestanteMs: restante,
      });
      updated += 1;
    }
    return updated;
  }

  /**
   * Retoma timers de retorno de amarelo ao despausar a partida:
   * troca `retornaEmRestanteMs` por novo `retornaEm`.
   */
  async retomarAmareloSuspensaoAtiva(
    partidaId: string,
    agoraMs = Date.now(),
  ): Promise<number> {
    const eventos = await this.listByPartida(partidaId);
    let updated = 0;
    for (const ev of eventos) {
      if (ev.tipo !== 'amarelo' || !ev.meta) continue;
      const restante = ev.meta.retornaEmRestanteMs;
      if (typeof restante !== 'number' || !Number.isFinite(restante) || restante <= 0) {
        continue;
      }
      const { retornaEmRestanteMs: _rest, ...rest } = ev.meta;
      await this.updateMeta(ev.id, {
        ...rest,
        retornaEm: new Date(agoraMs + restante).toISOString(),
      });
      updated += 1;
    }
    return updated;
  }

  /** Eventos de todas as partidas de uma pelada (para agregações). */
  async listByPelada(peladaId: string): Promise<EventoPartida[]> {
    const rows = await this.db.getAll<EventoRow>(
      `SELECT e.*
       FROM eventos_partida e
       INNER JOIN partidas p ON p.id = e.partida_id
       WHERE p.pelada_id = ?
       ORDER BY e.created_at ASC`,
      [peladaId],
    );
    return rows.map(mapEvento);
  }

  async listAll(): Promise<EventoPartida[]> {
    const rows = await this.db.getAll<EventoRow>(
      'SELECT * FROM eventos_partida ORDER BY created_at ASC',
    );
    return rows.map(mapEvento);
  }

  async getById(id: string): Promise<EventoPartida | null> {
    const row = await this.db.getFirst<EventoRow>('SELECT * FROM eventos_partida WHERE id = ?', [
      id,
    ]);
    return row ? mapEvento(row) : null;
  }

  async create(input: NewEventoPartida): Promise<EventoPartida> {
    const id = input.id ?? createId();
    const createdAt = input.createdAt ?? nowIso();
    await this.db.run(
      `INSERT INTO eventos_partida (
        id, partida_id, tipo, atleta_id, meta_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.partidaId,
        input.tipo,
        input.atletaId,
        input.meta ? JSON.stringify(input.meta) : null,
        createdAt,
      ],
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error('Falha ao criar evento');
    }
    return created;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM eventos_partida WHERE id = ?', [id]);
  }
}
