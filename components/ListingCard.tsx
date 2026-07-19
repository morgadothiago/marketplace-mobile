import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/theme';
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
 * A distância fica com espaço reservado ("—") em vez de calculada: o
 * cálculo real (haversine + localização do usuário) é escopo da Fase 4
 * (T022/T025). Reservar o espaço agora evita retrabalho de layout quando o
 * badge de distância for ligado.
 */
function ListingCardComponent({ listing, onPress }: ListingCardProps) {
  const theme = useTheme();
  const coverPhoto = listing.photos[0];

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
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.xs,
          }}
        >
          Distância: em breve
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
