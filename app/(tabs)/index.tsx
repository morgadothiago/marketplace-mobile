import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { AsyncStateView } from '@/components/AsyncStateView';
import { EmptyState } from '@/components/EmptyState';
import { ListingCard } from '@/components/ListingCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useListings } from '@/contexts/ListingsContext';
import { useTheme } from '@/theme';
import type { Listing } from '@/types/listing';

/**
 * Feed principal (US3, T019): lista virtualizada (`FlatList`) de todos os
 * anúncios ativos (não só os do usuário), via `ListingsContext` — o mesmo
 * estado global consumido pela busca (`search.tsx`), evitando duas
 * consultas independentes ao repositório.
 */
export default function FeedScreen() {
  const theme = useTheme();
  const { status, listings, error, refresh } = useListings();

  // Recarrega ao voltar para a aba (ex: após publicar um anúncio novo).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const goToListing = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard listing={item} onPress={() => goToListing(item.id)} />
    ),
    [goToListing],
  );

  return (
    <ScreenContainer edges={['top']}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.typography.size.xl },
        ]}
      >
        Feed
      </Text>

      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
        loadingMessage="Carregando anúncios..."
      >
        {listings.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            message={
              'Nenhum anúncio por aqui ainda. Publique o primeiro na aba "Anunciar".'
            }
          />
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(listing) => listing.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            onRefresh={refresh}
            refreshing={status === 'loading'}
          />
        )}
      </AsyncStateView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
});
