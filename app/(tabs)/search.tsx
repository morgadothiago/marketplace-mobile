import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AsyncStateView } from '@/components/AsyncStateView';
import { EmptyState } from '@/components/EmptyState';
import { ListingCard } from '@/components/ListingCard';
import { MultiChipSelector } from '@/components/MultiChipSelector';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SortSelector, type SortOption } from '@/components/SortSelector';
import { useListings } from '@/contexts/ListingsContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useTheme } from '@/theme';
import { distanceBetweenKm } from '@/utils/distance';
import { LISTING_CATEGORIES, type ListingCategory } from '@/types/category';
import type { Listing } from '@/types/listing';

type SortValue = 'recent' | 'price_asc' | 'nearest';
type RadiusValue = 'none' | '1' | '5' | '10' | '25';

const RADIUS_KM_BY_VALUE: Record<Exclude<RadiusValue, 'none'>, number> = {
  '1': 1,
  '5': 5,
  '10': 10,
  '25': 25,
};

const RADIUS_OPTIONS: readonly SortOption<RadiusValue>[] = [
  { value: 'none', label: 'Sem limite' },
  { value: '1', label: '1 km' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
];

/**
 * Busca + filtros (US3/T020) e ordenação (US3/T021), sobre a mesma lista
 * de anúncios ativos do `ListingsContext` (mesma fonte que o feed) — filtra
 * e ordena em memória, sem nova consulta ao repositório.
 *
 * Filtro por raio e ordenação "Mais próximo" (Fase 4/T024) dependem da
 * localização do usuário (`useUserLocation`) para calcular a distância até
 * cada anúncio (`utils/distance.ts`). Sem coordenadas (permissão negada ou
 * indisponível), ambos ficam desabilitados — busca por texto e categoria
 * continuam funcionando normalmente, nunca bloqueando o uso do app.
 */
export default function SearchScreen() {
  const theme = useTheme();
  const { status, listings, error, refresh } = useListings();
  const { coordinates: userCoordinates, neighborhoodFallback } = useUserLocation();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [sort, setSort] = useState<SortValue>('recent');
  const [radius, setRadius] = useState<RadiusValue>('none');

  const hasLocation = userCoordinates !== null;

  const sortOptions: readonly SortOption<SortValue>[] = useMemo(
    () => [
      { value: 'recent', label: 'Mais recente' },
      { value: 'price_asc', label: 'Menor preço' },
      { value: 'nearest', label: 'Mais próximo', disabled: !hasLocation },
    ],
    [hasLocation],
  );

  const radiusOptions: readonly SortOption<RadiusValue>[] = useMemo(
    () => RADIUS_OPTIONS.map((option) => ({ ...option, disabled: !hasLocation })),
    [hasLocation],
  );

  const toggleCategory = useCallback((category: ListingCategory) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }, []);

  // Se a localização deixar de estar disponível (ex: permissão revogada),
  // volta os controles dependentes dela para o estado neutro em vez de
  // manter uma ordenação/filtro que não pode mais ser calculado.
  useEffect(() => {
    if (!hasLocation) {
      setRadius('none');
      setSort((current) => (current === 'nearest' ? 'recent' : current));
    }
  }, [hasLocation]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const radiusKm = hasLocation && radius !== 'none' ? RADIUS_KM_BY_VALUE[radius] : null;

    const withDistance = listings.map((listing) => ({
      listing,
      distanceKm: userCoordinates
        ? distanceBetweenKm(userCoordinates, { lat: listing.lat, lng: listing.lng })
        : null,
    }));

    const filtered = withDistance.filter(({ listing, distanceKm }) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        categories.length === 0 || categories.includes(listing.category);
      const matchesRadius =
        radiusKm === null || (distanceKm !== null && distanceKm <= radiusKm);
      return matchesQuery && matchesCategory && matchesRadius;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'nearest') {
        const distanceA = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const distanceB = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      }
      if (sort === 'price_asc') {
        const priceA = a.listing.price ?? Number.POSITIVE_INFINITY;
        const priceB = b.listing.price ?? Number.POSITIVE_INFINITY;
        return priceA - priceB;
      }
      // 'recent' (default) — created_at ISO string, mais novo primeiro.
      return b.listing.createdAt.localeCompare(a.listing.createdAt);
    });

    return sorted.map(({ listing }) => listing);
  }, [listings, query, categories, sort, radius, hasLocation, userCoordinates]);

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
        Buscar
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por título ou descrição"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.typography.size.md,
              paddingVertical: theme.spacing.sm,
            },
          ]}
        />
      </View>

      <MultiChipSelector
        label="Categoria"
        options={LISTING_CATEGORIES}
        values={categories}
        onToggle={toggleCategory}
      />

      <SortSelector label="Ordenar por" options={sortOptions} value={sort} onChange={setSort} />

      <SortSelector
        label="Distância máxima"
        options={radiusOptions}
        value={radius}
        onChange={setRadius}
      />

      {!hasLocation && (
        <Text
          style={[
            styles.locationHint,
            { color: theme.colors.textMuted, fontSize: theme.typography.size.xs },
          ]}
        >
          {neighborhoodFallback
            ? `Sem acesso à localização. Busque manualmente pelo bairro, ex: "${neighborhoodFallback}".`
            : 'Sem acesso à localização. Ative a permissão para filtrar e ordenar por proximidade.'}
        </Text>
      )}

      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
        loadingMessage="Carregando anúncios..."
      >
        {results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            message="Nenhum anúncio encontrado com esses filtros."
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(listing) => listing.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
          />
        )}
      </AsyncStateView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  locationHint: {
    marginTop: 8,
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  list: {
    gap: 12,
    marginTop: 12,
  },
});
