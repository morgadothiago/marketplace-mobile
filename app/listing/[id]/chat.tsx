import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Thread de contato mock por anúncio (US5, Fase 5). Placeholder funcional —
 * mensagens locais e botão de contato externo entram em T026-T028.
 */
export default function ListingChatScreen() {
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
        Conversa sobre o anúncio {id}
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.md,
          marginTop: 8,
        }}
      >
        Em breve: thread de mensagens mock.
      </Text>
    </ScreenContainer>
  );
}
