import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Atleta } from '@/domain/types';
import { POSICAO_LABELS } from '@/features/atletas/labels';
import { colors } from '@/theme/colors';

export type CartaoMarker = 'amarelo' | 'vermelho' | null;

type Props = {
  atleta: Atleta;
  index?: number;
  /** Texto extra (ex.: contagem do amarelo). */
  badge?: string;
  /** Destaque visual do tempo de retorno (amarelo 2 min). */
  retornoDestaque?: boolean;
  /** Marcador de cartão na partida atual. */
  cartao?: CartaoMarker;
  /** Botões para reordenar a fila (substitui drag incompatível com RN atual). */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function AtletaFilaRow({
  atleta,
  index,
  badge,
  retornoDestaque,
  cartao,
  onMoveUp,
  onMoveDown,
}: Props) {
  const showReorder = onMoveUp != null || onMoveDown != null;

  return (
    <View style={[styles.row, retornoDestaque && styles.rowRetorno]}>
      {index != null ? <Text style={styles.index}>{index + 1}</Text> : null}
      <View style={styles.avatarWrap}>
        {atleta.fotoUri ? (
          <Image source={{ uri: atleta.fotoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {atleta.nome.trim().charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        {cartao ? (
          <View
            style={[
              styles.cartaoDot,
              cartao === 'amarelo' ? styles.cartaoAmarelo : styles.cartaoVermelho,
            ]}
            accessibilityLabel={cartao === 'amarelo' ? 'Cartão amarelo' : 'Cartão vermelho'}
          />
        ) : null}
      </View>
      <View style={styles.text}>
        <Text style={styles.nome} numberOfLines={1}>
          {atleta.nome}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {POSICAO_LABELS[atleta.posicao]}
          {atleta.numeroCamisa != null ? ` · #${atleta.numeroCamisa}` : ''}
          {atleta.mensalista ? ' · Mensalista' : ''}
        </Text>
        {badge ? (
          <View style={[styles.badgeWrap, retornoDestaque && styles.badgeWrapRetorno]}>
            <Text
              style={[styles.badge, retornoDestaque && styles.badgeRetorno]}
              numberOfLines={2}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {showReorder ? (
        <View style={styles.reorder}>
          <Pressable
            onPress={onMoveUp}
            disabled={!onMoveUp}
            style={({ pressed }) => [
              styles.reorderBtn,
              !onMoveUp && styles.reorderBtnDisabled,
              pressed && onMoveUp != null && styles.reorderBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Mover ${atleta.nome} para cima`}
          >
            <Text style={[styles.reorderLabel, !onMoveUp && styles.reorderLabelDisabled]}>↑</Text>
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={!onMoveDown}
            style={({ pressed }) => [
              styles.reorderBtn,
              !onMoveDown && styles.reorderBtnDisabled,
              pressed && onMoveDown != null && styles.reorderBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Mover ${atleta.nome} para baixo`}
          >
            <Text style={[styles.reorderLabel, !onMoveDown && styles.reorderLabelDisabled]}>↓</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
  },
  rowRetorno: {
    borderColor: '#e9c46a',
    backgroundColor: '#fffbeb',
  },
  index: {
    width: 22,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandMuted,
    textAlign: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chip,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  cartaoDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cartaoAmarelo: {
    backgroundColor: '#f4d35e',
  },
  cartaoVermelho: {
    backgroundColor: colors.danger,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badgeWrap: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.chip,
  },
  badgeWrapRetorno: {
    backgroundColor: '#f4d35e',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },
  badgeRetorno: {
    color: '#5c4a00',
    fontVariant: ['tabular-nums'],
  },
  reorder: {
    flexDirection: 'column',
    gap: 4,
  },
  reorderBtn: {
    minWidth: 36,
    minHeight: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  reorderBtnPressed: {
    opacity: 0.85,
  },
  reorderBtnDisabled: {
    opacity: 0.35,
  },
  reorderLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand,
    lineHeight: 18,
  },
  reorderLabelDisabled: {
    color: colors.textMuted,
  },
});
