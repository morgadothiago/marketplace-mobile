import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { AppButton } from '@/components/AppButton';
import { AsyncStateView } from '@/components/AsyncStateView';
import { RatingStars } from '@/components/RatingStars';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useListingDetail } from '@/hooks/useListingDetail';
import { useListingReview } from '@/hooks/useListingReview';
import { useRatingSummary } from '@/hooks/useRatingSummary';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useTheme } from '@/theme';
import { resolveExternalContactAction } from '@/utils/contact';
import { distanceBetweenKm, formatDistanceKm } from '@/utils/distance';
import { LISTING_TYPE_LABELS } from '@/types/listing';

function formatPrice(price: number | null): string {
  return price != null ? `R$ ${price.toFixed(2)}` : 'A combinar';
}

/**
 * Detalhe do anúncio (bugfix pós-MVP): esta tela ficou como stub funcional
 * desde o scaffold inicial (só navegava para o chat). Reaproveita os mesmos
 * hooks/utilitários já usados no feed (`ListingCard`, distância/localização)
 * e no chat (`useListingChat`/`useListingReview`/`utils/contact.ts`) em vez
 * de duplicar essas heurísticas aqui. O header nativo (`headerShown: true`
 * em `app/_layout.tsx`) já reserva a área segura superior, por isso usa
 * `edges={['bottom']}` aqui.
 *
 * Dono do próprio anúncio (`isOwnListing`): não vê botões de contato/chat
 * nem de avaliação (mesma regra `canReview` de `useListingReview`, que já
 * impede auto-avaliação) — em vez disso, um atalho para "Meus anúncios"
 * (onde editar/pausar/excluir já existem via `useOwnListings`).
 */
export default function ListingDetailScreen() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, error, listing, ownerProfile, isOwnListing, refresh } = useListingDetail(id);

  const { coordinates: userCoordinates, neighborhoodFallback } = useUserLocation();
  const { average: ownerRatingAverage, count: ownerRatingCount } = useRatingSummary(
    ownerProfile?.id,
  );
  const { canReview } = useListingReview(id, ownerProfile?.id);

  const distanceLabel = useMemo(() => {
    if (!listing) {
      return null;
    }
    if (userCoordinates) {
      const distanceKm = distanceBetweenKm(userCoordinates, {
        lat: listing.lat,
        lng: listing.lng,
      });
      return formatDistanceKm(distanceKm);
    }
    return neighborhoodFallback ?? 'Distância indisponível';
  }, [listing, userCoordinates, neighborhoodFallback]);

  const contactAction = resolveExternalContactAction(ownerProfile?.externalContact);
  const handleOpenExternalContact = useCallback(async () => {
    if (!contactAction) {
      return;
    }
    const canOpen = await Linking.canOpenURL(contactAction.url);
    if (canOpen) {
      await Linking.openURL(contactAction.url);
    }
  }, [contactAction]);

  const handleGoToChat = useCallback(() => {
    router.push(`/listing/${id}/chat`);
  }, [id]);

  const handleManageListing = useCallback(() => {
    router.push('/(tabs)/new-listing');
  }, []);

  const photoWidth = windowWidth - theme.spacing.lg * 2;

  return (
    <ScreenContainer edges={['bottom']} scrollable>
      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
        loadingMessage="Carregando anúncio..."
      >
        {listing ? (
          <View style={{ gap: theme.spacing.lg }}>
            {listing.photos.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={[styles.gallery, { height: photoWidth * 0.75 }]}
              >
                {listing.photos.map((photoUri) => (
                  <Image
                    key={photoUri}
                    source={{ uri: photoUri }}
                    style={[
                      styles.photo,
                      {
                        width: photoWidth,
                        height: photoWidth * 0.75,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.photo,
                  styles.photoPlaceholder,
                  {
                    width: photoWidth,
                    height: photoWidth * 0.75,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.surface,
                    gap: theme.spacing.xs,
                  },
                ]}
              >
                <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
                <Text
                  style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}
                >
                  Sem fotos
                </Text>
              </View>
            )}

            <View style={{ gap: theme.spacing.xxs }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.size.xl,
                  fontWeight: '700',
                }}
              >
                {listing.title}
              </Text>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.typography.size.lg,
                  fontWeight: '600',
                }}
              >
                {formatPrice(listing.price)}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
                {listing.category} · {LISTING_TYPE_LABELS[listing.type]}
              </Text>
              {distanceLabel ? (
                <View
                  style={[styles.row, { gap: theme.spacing.xxs, marginTop: theme.spacing.xxs }]}
                >
                  <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                  <Text
                    style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}
                  >
                    {distanceLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={{ color: theme.colors.text, fontSize: theme.typography.size.md }}>
              {listing.description}
            </Text>

            <View
              style={[
                styles.sellerCard,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  gap: theme.spacing.xxs,
                },
              ]}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
                Vendedor
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.size.md,
                  fontWeight: '600',
                }}
              >
                {ownerProfile?.name ?? 'Vendedor'}
              </Text>
              <RatingStars
                rating={ownerRatingAverage}
                count={ownerRatingCount}
                showValue
                size={16}
              />
            </View>

            {isOwnListing ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Text
                  style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}
                >
                  Este é o seu anúncio.
                </Text>
                <AppButton
                  label="Editar / gerenciar anúncio"
                  icon="create-outline"
                  variant="secondary"
                  onPress={handleManageListing}
                />
              </View>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                <AppButton
                  label="Falar com o vendedor"
                  icon="chatbubble-outline"
                  onPress={handleGoToChat}
                />
                {contactAction ? (
                  <AppButton
                    label={contactAction.label}
                    icon={contactAction.icon}
                    variant="secondary"
                    onPress={handleOpenExternalContact}
                  />
                ) : null}
                {canReview ? (
                  <AppButton
                    label="Avaliar vendedor"
                    icon="star-outline"
                    variant="secondary"
                    onPress={handleGoToChat}
                  />
                ) : null}
              </View>
            )}
          </View>
        ) : null}
      </AsyncStateView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  gallery: {
    flexGrow: 0,
  },
  photo: {
    marginRight: 8,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerCard: {
    borderWidth: 1,
  },
});
