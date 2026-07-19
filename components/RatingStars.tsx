import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';

type RatingStarsProps = {
  /** Nota atual (1-5 no modo input, média com decimais no modo display). */
  rating: number;
  /** Presente => modo input (toque para escolher 1-5); ausente => display. */
  onChange?: (stars: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  /** Exibe o valor numérico ao lado das estrelas (ex: "4.3"). Só no modo display. */
  showValue?: boolean;
  /** Exibe a contagem de avaliações entre parênteses (ex: "(12)"). */
  count?: number;
  disabled?: boolean;
};

const STAR_INDEXES = [1, 2, 3, 4, 5] as const;

/**
 * Estrelas reutilizáveis do sistema de avaliações (US6, T030). Dois modos
 * controlados pela presença de `onChange`:
 * - Input: usuário toca em uma estrela para escolher 1-5 (sem meia-estrela).
 * - Display: readonly, aceita valores decimais (ex: média 4.3) e desenha
 *   estrela cheia/meia/vazia por posição, igual apps de marketplace reais.
 *
 * Usa Ionicons (`star`/`star-outline`/`star-half`) seguindo o mesmo padrão
 * de ícones do resto do app (`AppButton`, `AsyncStateView`).
 */
function RatingStarsComponent({
  rating,
  onChange,
  size = 20,
  showValue = false,
  count,
  disabled = false,
}: RatingStarsProps) {
  const theme = useTheme();
  const isInput = Boolean(onChange);

  return (
    <View style={[styles.row, { gap: theme.spacing.xxs }]}>
      <View style={[styles.row, { gap: theme.spacing.xxs }]}>
        {STAR_INDEXES.map((index) => {
          const iconName = isInput
            ? index <= rating
              ? 'star'
              : 'star-outline'
            : resolveDisplayIcon(rating, index);

          const star = (
            <Ionicons
              key={index}
              name={iconName}
              size={size}
              color={theme.colors.warning}
            />
          );

          if (!isInput) {
            return star;
          }

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${index} ${index === 1 ? 'estrela' : 'estrelas'}`}
              disabled={disabled}
              onPress={() => onChange?.(index)}
              hitSlop={6}
              style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}
            >
              {star}
            </Pressable>
          );
        })}
      </View>
      {showValue || count !== undefined ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.sm,
          }}
        >
          {showValue ? rating.toFixed(1) : null}
          {showValue && count !== undefined ? ' ' : null}
          {count !== undefined ? `(${count})` : null}
        </Text>
      ) : null}
    </View>
  );
}

function resolveDisplayIcon(
  rating: number,
  index: number,
): React.ComponentProps<typeof Ionicons>['name'] {
  if (rating >= index) {
    return 'star';
  }
  if (rating >= index - 0.5) {
    return 'star-half';
  }
  return 'star-outline';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const RatingStars = memo(RatingStarsComponent);
