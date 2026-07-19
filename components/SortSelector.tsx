import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type SortOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SortSelectorProps<T extends string> = {
  label: string;
  options: readonly SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Seletor de ordenação (T021). Suporta opções desabilitadas com um selo
 * "em breve" — usado para "Mais próximo", que depende do cálculo de
 * distância (`utils/distance.ts`, Fase 4/T022) e ainda não existe. Mantém
 * a opção visível na UI para comunicar o roadmap sem bloquear o fluxo de
 * busca atual.
 */
function SortSelectorComponent<T extends string>({
  label,
  options,
  value,
  onChange,
}: SortSelectorProps<T>) {
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
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: option.disabled }}
              disabled={option.disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  opacity: option.disabled ? 0.5 : 1,
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
                {option.label}
                {option.disabled ? ' (em breve)' : ''}
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

export const SortSelector = memo(SortSelectorComponent) as typeof SortSelectorComponent;
