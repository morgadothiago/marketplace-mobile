import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme';

/**
 * Feed principal (US3, Fase 3). Placeholder funcional nesta rodada — a
 * listagem real com `FlatList` virtualizada, busca e distância entra em
 * T018-T021.
 */
export default function FeedScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.typography.size.xl },
        ]}
      >
        Feed
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.md }}>
        Em breve: anúncios da sua região.
      </Text>
      <Link
        href="/listing/seed-listing-iphone"
        style={[styles.link, { color: theme.colors.primary }]}
      >
        Ver anúncio de exemplo
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  link: {
    marginTop: 16,
  },
});
