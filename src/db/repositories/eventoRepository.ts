import type { EventoPartida, NewEventoPartida } from '@/domain/types';

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
