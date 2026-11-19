import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/theme/colors';

import type {
  ArtilhariaRow,
  AssistenciasRow,
  CartoesRow,
  EstatisticasPelada,
  TotaisRow,
} from './agregarEstatisticas';

function DestaqueCard({
  label,
  row,
  metric,
}: {
  label: string;
  row: TotaisRow | null;
  metric: (r: TotaisRow) => string;
}) {
  return (
    <View style={styles.destaque} accessibilityRole="summary">
      <Text style={styles.destaqueLabel}>{label}</Text>
      {row ? (
        <>
          <Text style={styles.destaqueNome}>{row.nome}</Text>
          <Text style={styles.destaqueMetric}>{metric(row)}</Text>
        </>
      ) : (
        <Text style={styles.destaqueVazio}>Sem dados ainda</Text>
      )}
    </View>
  );
}

function RankRow({
  position,
  nome,
  detail,
}: {
  position: number;
  nome: string;
  detail: string;
}) {
  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankPos}>{position}º</Text>
      <View style={styles.rankInfo}>
        <Text style={styles.rankNome}>{nome}</Text>
        <Text style={styles.rankDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export function TotaisTab({ data }: { data: EstatisticasPelada }) {
  if (data.partidasEncerradas === 0) {
    return (
      <EmptyState
        title="Nenhuma partida encerrada"
        body="Finalize partidas em Jogos para ver quem mais jogou, venceu, perdeu ou empatou."
      />
    );
  }

  const { destaques, totais } = data;
  return (
    <View style={styles.section}>
      <View style={styles.destaquesGrid}>
        <DestaqueCard
          label="Mais jogos"
          row={destaques.maisJogos}
          metric={(r) => `${r.jogos} jogo${r.jogos === 1 ? '' : 's'}`}
        />
        <DestaqueCard
          label="Mais vitórias"
          row={destaques.maisVitorias}
          metric={(r) => `${r.vitorias} vitória${r.vitorias === 1 ? '' : 's'}`}
        />
        <DestaqueCard
          label="Mais derrotas"
          row={destaques.maisDerrotas}
          metric={(r) => `${r.derrotas} derrota${r.derrotas === 1 ? '' : 's'}`}
        />
        <DestaqueCard
          label="Mais empates"
          row={destaques.maisEmpates}
          metric={(r) => `${r.empates} empate${r.empates === 1 ? '' : 's'}`}
        />
      </View>

      <Text style={styles.listTitle}>Ranking geral</Text>
      {totais.length === 0 ? (
        <Text style={styles.hint}>
          Partidas sem elenco gravado não entram nos totais. Novas partidas já salvam o time.
        </Text>
      ) : (
        totais.map((row, index) => (
          <RankRow
            key={row.atletaId}
            position={index + 1}
            nome={row.nome}
            detail={`${row.jogos}J · ${row.vitorias}V · ${row.empates}E · ${row.derrotas}D`}
          />
        ))
      )}
    </View>
  );
}

export function ArtilhariaTab({ rows }: { rows: ArtilhariaRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem gols registrados"
        body="Gols marcados nas partidas encerradas aparecem aqui."
      />
    );
  }
  return (
    <View style={styles.section}>
      {rows.map((row, index) => (
        <RankRow
          key={row.atletaId}
          position={index + 1}
          nome={row.nome}
          detail={`${row.jogos} jogo${row.jogos === 1 ? '' : 's'} · ${row.gols} gol${row.gols === 1 ? '' : 's'}`}
        />
      ))}
    </View>
  );
}

export function AssistenciasTab({ rows }: { rows: AssistenciasRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem assistências"
        body="Assistências registradas nas partidas encerradas aparecem aqui."
      />
    );
  }
  return (
    <View style={styles.section}>
      {rows.map((row, index) => (
        <RankRow
          key={row.atletaId}
          position={index + 1}
          nome={row.nome}
          detail={`${row.jogos} jogo${row.jogos === 1 ? '' : 's'} · ${row.assistencias} assistência${row.assistencias === 1 ? '' : 's'}`}
        />
      ))}
    </View>
  );
}

export function CartoesTab({ rows }: { rows: CartoesRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem cartões"
        body="Amarelos e vermelhos das partidas encerradas aparecem aqui."
      />
    );
  }
  return (
    <View style={styles.section}>
      {rows.map((row, index) => (
        <RankRow
          key={row.atletaId}
          position={index + 1}
          nome={row.nome}
          detail={`${row.amarelos} amarelo${row.amarelos === 1 ? '' : 's'} · ${row.vermelhos} vermelho${row.vermelhos === 1 ? '' : 's'}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
    paddingBottom: 24,
  },
  destaquesGrid: {
    gap: 10,
  },
  destaque: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
  },
  destaqueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  destaqueNome: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  destaqueMetric: {
    fontSize: 14,
    color: colors.brandMuted,
    fontWeight: '600',
  },
  destaqueVazio: {
    fontSize: 14,
    color: colors.textMuted,
  },
  listTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rankPos: {
    width: 36,
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  rankInfo: {
    flex: 1,
    gap: 2,
  },
  rankNome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rankDetail: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
