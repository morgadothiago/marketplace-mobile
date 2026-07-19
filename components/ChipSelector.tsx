import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

type ChipSelectorProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Seletor genérico em chips (usado para categoria e tipo de anúncio).
 * Componente de UI puro e reutilizável — quem chama decide as opções e
 * onde o valor selecionado é persistido (React Hook Form via `Controller`).
 */
function ChipSelectorComponent<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipSelectorProps<T>) {
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
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
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

export const ChipSelector = memo(ChipSelectorComponent) as typeof ChipSelectorComponent;
