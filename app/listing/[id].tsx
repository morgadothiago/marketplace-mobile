import React from 'react';
import { Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Detalhe do anúncio (Fase 3+). Placeholder funcional — navega corretamente
 * a partir do feed e permite ir até a thread de chat mock.
 */
export default function ListingDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.size.xl,
          fontWeight: '700',
        }}
      >
        Anúncio {id}
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.md,
          marginTop: 8,
        }}
      >
        Em breve: detalhes completos do anúncio.
      </Text>
      <Link
        href={`/listing/${id}/chat`}
        style={{ color: theme.colors.primary, marginTop: 16 }}
      >
        Falar com o vendedor
      </Link>
    </ScreenContainer>
  );
}
