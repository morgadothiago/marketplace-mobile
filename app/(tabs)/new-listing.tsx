import React from 'react';
import { Text } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Publicar anúncio (US2/US7, Fase 2). Placeholder funcional — formulário
 * completo com React Hook Form + Zod, fotos e localização entra em T012-T017.
 */
export default function NewListingScreen() {
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
        Anunciar
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.md,
          marginTop: 8,
        }}
      >
        Em breve: formulário de publicação de produto ou serviço.
      </Text>
    </ScreenContainer>
  );
}
