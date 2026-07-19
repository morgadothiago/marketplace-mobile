import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';

import { AsyncStateView } from '@/components/AsyncStateView';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useActiveListingsFeed } from '@/hooks/useActiveListingsFeed';
import { useTheme } from '@/theme';

/**
 * Feed principal (US3, Fase 3). Listagem mínima nesta rodada — apenas o
 * suficiente para validar que um anúncio publicado em `new-listing.tsx`
 * (T012-T017) é persistido e recuperável. `FlatList` virtualizada com
 * busca/distância/ordenação completas entra em T018-T021.
 */
export default function FeedScreen() {
  const theme = useTheme();
  const { status, listings, error, refresh } = useActiveListingsFeed();

  // Recarrega ao voltar para a aba (ex: após publicar um anúncio novo).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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

      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
      >
        {listings.length === 0 ? (
          <Text
            style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.md }}
          >
            Nenhum anúncio por aqui ainda. Publique o primeiro na aba
            &quot;Anunciar&quot;.
          </Text>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(listing) => listing.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Link href={`/listing/${item.id}`} asChild>
                <View
                  style={[
                    styles.card,
                    { borderColor: theme.colors.border, borderRadius: theme.radius.md },
                  ]}
                >
                  {item.photos[0] ? (
                    <Image
                      source={{ uri: item.photos[0] }}
                      style={[styles.thumbnail, { borderRadius: theme.radius.sm }]}
                      contentFit="cover"
                    />
                  ) : null}
                  <View style={styles.cardInfo}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: theme.colors.text,
                        fontSize: theme.typography.size.md,
                        fontWeight: '600',
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: theme.typography.size.sm,
                      }}
                    >
                      {item.price != null ? `R$ ${item.price.toFixed(2)}` : 'A combinar'}{' '}
                      · {item.category}
                    </Text>
                  </View>
                </View>
              </Link>
            )}
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
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
});
