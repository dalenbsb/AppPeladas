import type { NewPelada, Pelada } from '@/domain/types';

import { createId, nowIso } from '../ids';
import { mapPelada, type PeladaRow } from '../mappers';
import type { SqlExecutor } from '../sqlExecutor';

export class PeladaRepository {
  constructor(private readonly db: SqlExecutor) {}

  async list(): Promise<Pelada[]> {
    const rows = await this.db.getAll<PeladaRow>('SELECT * FROM peladas ORDER BY created_at ASC');
    return rows.map(mapPelada);
  }

  async getById(id: string): Promise<Pelada | null> {
    const row = await this.db.getFirst<PeladaRow>('SELECT * FROM peladas WHERE id = ?', [id]);
    return row ? mapPelada(row) : null;
  }

  async create(input: NewPelada): Promise<Pelada> {
    const id = input.id ?? createId();
    const now = nowIso();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    await this.db.run(
      `INSERT INTO peladas (
        id, nome, descricao, duracao_min, limite_gols, jogadores_por_equipe,
        criterios_sorteio_json, regra_empate, tela_sempre_ligada, amarelo_dois_minutos,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.nome,
        input.descricao,
        input.duracaoMin,
        input.limiteGols,
        input.jogadoresPorEquipe,
        JSON.stringify(input.criteriosSorteio),
        input.regraEmpate,
        input.telaSempreLigada ? 1 : 0,
        input.amareloDoisMinutos ? 1 : 0,
        createdAt,
        updatedAt,
      ],
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error('Falha ao criar pelada');
    }
    return created;
  }

  async update(id: string, patch: Partial<NewPelada>): Promise<Pelada> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Pelada não encontrada: ${id}`);
    }
    const next: Pelada = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    };
    await this.db.run(
      `UPDATE peladas SET
        nome = ?, descricao = ?, duracao_min = ?, limite_gols = ?,
        jogadores_por_equipe = ?, criterios_sorteio_json = ?, regra_empate = ?,
        tela_sempre_ligada = ?, amarelo_dois_minutos = ?, updated_at = ?
      WHERE id = ?`,
      [
        next.nome,
        next.descricao,
        next.duracaoMin,
        next.limiteGols,
        next.jogadoresPorEquipe,
        JSON.stringify(next.criteriosSorteio),
        next.regraEmpate,
        next.telaSempreLigada ? 1 : 0,
        next.amareloDoisMinutos ? 1 : 0,
        next.updatedAt,
        id,
      ],
    );
    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM peladas WHERE id = ?', [id]);
  }
}
