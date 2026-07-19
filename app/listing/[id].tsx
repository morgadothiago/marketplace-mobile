import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Detalhe do anúncio (Fase 3+). Placeholder funcional — navega corretamente
 * a partir do feed e permite ir até a thread de chat mock. O header nativo
 * (`headerShown: true` em `app/_layout.tsx`) já reserva a área segura
 * superior, por isso usa `edges={['bottom']}` aqui.
 */
export default function ListingDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer edges={['bottom']}>
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
          marginTop: theme.spacing.sm,
        }}
      >
        Em breve: detalhes completos do anúncio.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/listing/${id}/chat`)}
        style={[styles.chatLink, { marginTop: theme.spacing.lg, gap: theme.spacing.xs }]}
      >
        <Ionicons name="chatbubble-outline" size={18} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontSize: theme.typography.size.md }}>
          Falar com o vendedor
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chatLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
