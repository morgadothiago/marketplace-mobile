import React from 'react';
import { Text } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Busca + filtros (US3/US4, Fase 3-4). Placeholder funcional — texto,
 * categoria e raio de distância entram em T020/T024.
 */
export default function SearchScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.size.xl,
          fontWeight: '700',
        }}
      >
        Buscar
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.md,
          marginTop: 8,
        }}
      >
        Em breve: busca por palavra-chave, categoria e proximidade.
      </Text>
    </ScreenContainer>
  );
}
