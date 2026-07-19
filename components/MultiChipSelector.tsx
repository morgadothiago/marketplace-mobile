import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

type MultiChipSelectorProps<T extends string> = {
  label: string;
  options: readonly T[];
  values: readonly T[];
  onToggle: (value: T) => void;
};

/**
 * Variante multi-seleção do `ChipSelector` (que é single-select e já é
 * usado no formulário de anúncio). Usado no filtro de categoria da busca
 * (T020) — o usuário pode combinar várias categorias ao mesmo tempo.
 */
function MultiChipSelectorComponent<T extends string>({
  label,
  options,
  values,
  onToggle,
}: MultiChipSelectorProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
        ]}
      >
        {label}
      </Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onToggle(option)}
              style={[
                styles.chip,
                {
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? theme.colors.onPrimary : theme.colors.text,
                  fontSize: theme.typography.size.sm,
                  fontWeight: selected ? '600' : '400',
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
  },
});

export const MultiChipSelector = memo(
  MultiChipSelectorComponent,
) as typeof MultiChipSelectorComponent;
