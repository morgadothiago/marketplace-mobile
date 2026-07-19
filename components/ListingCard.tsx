import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/theme';
import { useUserLocation } from '@/hooks/useUserLocation';
import { distanceBetweenKm, formatDistanceKm } from '@/utils/distance';
import type { Listing } from '@/types/listing';

type ListingCardProps = {
  listing: Listing;
  onPress: () => void;
};

function formatPrice(price: number | null): string {
  return price != null ? `R$ ${price.toFixed(2)}` : 'A combinar';
}

/**
 * Card de anúncio reutilizável (T018) — usado pelo feed (`index.tsx`) e pela
 * busca (`search.tsx`) para não duplicar o layout de item da lista.
 *
 * Badge de distância (T025): calculado em runtime via `useUserLocation` +
 * `utils/distance.ts` (haversine), nunca persistido. Sem coordenadas do
 * usuário (permissão negada/indisponível), mostra o bairro do perfil como
 * fallback textual em vez de bloquear o card.
 */
function ListingCardComponent({ listing, onPress }: ListingCardProps) {
  const theme = useTheme();
  const coverPhoto = listing.photos[0];
  const { coordinates: userCoordinates, neighborhoodFallback } = useUserLocation();

  const distanceLabel = useMemo(() => {
    if (userCoordinates) {
      const distanceKm = distanceBetweenKm(userCoordinates, {
        lat: listing.lat,
        lng: listing.lng,
      });
      return formatDistanceKm(distanceKm);
    }
    return neighborhoodFallback ?? 'Distância indisponível';
  }, [userCoordinates, neighborhoodFallback, listing.lat, listing.lng]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {coverPhoto ? (
        <Image
          source={{ uri: coverPhoto }}
          style={[styles.thumbnail, { borderRadius: theme.radius.sm }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.thumbnail,
            styles.thumbnailPlaceholder,
            {
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.border,
            },
          ]}
        >
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.xs }}>
            Sem foto
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.size.md,
            fontWeight: '600',
          }}
        >
          {listing.title}
        </Text>

        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.sm,
          }}
        >
          {formatPrice(listing.price)} · {listing.category}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.xs,
          }}
        >
          {distanceLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});

export const ListingCard = memo(ListingCardComponent);
