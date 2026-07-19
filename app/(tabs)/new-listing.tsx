import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AsyncStateView } from '@/components/AsyncStateView';
import { EmptyState } from '@/components/EmptyState';
import { ListingForm } from '@/components/ListingForm';
import { OwnListingItem } from '@/components/OwnListingItem';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useOwnListings } from '@/hooks/useOwnListings';
import { useTheme } from '@/theme';
import type { Listing } from '@/types/listing';

/**
 * Publicar anúncio (US2/US7, Fase 2): formulário de criação/edição
 * (`ListingForm`, T014-T016) seguido da lista "Meus anúncios" com ações de
 * pausar/reativar/excluir (T017). Esta tela só compõe UI — toda a lógica
 * vive em `useListingForm`/`useOwnListings`.
 */
export default function NewListingScreen() {
  const theme = useTheme();
  const { status, listings, error, refresh, pause, reactivate, remove } =
    useOwnListings();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  return (
    <ScreenContainer scrollable edges={['top']}>
      <ListingForm
        key={editingListing?.id ?? 'new'}
        listing={editingListing}
        onCancel={editingListing ? () => setEditingListing(null) : undefined}
        onSaved={() => {
          setEditingListing(null);
          refresh();
        }}
      />

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontSize: theme.typography.size.lg },
          ]}
        >
          Meus anúncios
        </Text>

        <AsyncStateView
          loading={status === 'loading'}
          errorMessage={error}
          onRetry={refresh}
          loadingMessage="Carregando seus anúncios..."
        >
          {listings.length === 0 ? (
            <EmptyState
              icon="pricetag-outline"
              message="Você ainda não publicou nenhum anúncio."
            />
          ) : (
            <View style={styles.list}>
              {listings.map((listing) => (
                <OwnListingItem
                  key={listing.id}
                  listing={listing}
                  onEdit={setEditingListing}
                  onPause={pause}
                  onReactivate={reactivate}
                  onDelete={remove}
                />
              ))}
            </View>
          )}
        </AsyncStateView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
});
