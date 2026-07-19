import React from 'react';
import { Text } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Perfil do usuário (US1, Fase 1). Placeholder funcional nesta rodada de
 * scaffold — exibir/editar nome, foto e bairro entra em T007-T011.
 */
export default function ProfileScreen() {
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
        Perfil
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.md,
          marginTop: 8,
        }}
      >
        Em breve: dados do seu perfil local.
      </Text>
    </ScreenContainer>
  );
}
