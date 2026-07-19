import React, { useCallback, useMemo, useState } from 'react';
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
import { useTheme } from '@/theme';
import { LISTING_CATEGORIES, type ListingCategory } from '@/types/category';
import type { Listing } from '@/types/listing';

type SortValue = 'recent' | 'price_asc' | 'nearest';

const SORT_OPTIONS: readonly SortOption<SortValue>[] = [
  { value: 'recent', label: 'Mais recente' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'nearest', label: 'Mais próximo', disabled: true },
];

/**
 * Busca + filtros (US3/T020) e ordenação (US3/T021), sobre a mesma lista
 * de anúncios ativos do `ListingsContext` (mesma fonte que o feed) — filtra
 * e ordena em memória, sem nova consulta ao repositório.
 *
 * "Mais próximo" fica visível mas desabilitado até a Fase 4 (T022), que
 * introduz o cálculo de distância em `utils/distance.ts`.
 */
export default function SearchScreen() {
  const theme = useTheme();
  const { status, listings, error, refresh } = useListings();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [sort, setSort] = useState<SortValue>('recent');

  const toggleCategory = useCallback((category: ListingCategory) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = listings.filter((listing) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        categories.length === 0 || categories.includes(listing.category);
      return matchesQuery && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'price_asc') {
        const priceA = a.price ?? Number.POSITIVE_INFINITY;
        const priceB = b.price ?? Number.POSITIVE_INFINITY;
        return priceA - priceB;
      }
      // 'recent' (default) — created_at ISO string, mais novo primeiro.
      return b.createdAt.localeCompare(a.createdAt);
    });

    return sorted;
  }, [listings, query, categories, sort]);

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

      <SortSelector label="Ordenar por" options={SORT_OPTIONS} value={sort} onChange={setSort} />

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
