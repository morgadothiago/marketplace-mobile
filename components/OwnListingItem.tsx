import React, { memo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { AppButton } from '@/components/AppButton';
import { useTheme } from '@/theme';
import type { Listing } from '@/types/listing';

type OwnListingItemProps = {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onPause: (id: string) => Promise<void>;
  onReactivate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const STATUS_LABEL: Record<Listing['status'], string> = {
  active: 'Ativo',
  paused: 'Pausado',
  deleted: 'Excluído',
};

/**
 * Linha da lista "Meus anúncios" (T017): resumo do anúncio + ações de
 * editar/pausar/reativar/excluir. Componente de UI puro — as ações chamam
 * as funções vindas de `useOwnListings`, que fala com o repositório.
 */
function OwnListingItemComponent({
  listing,
  onEdit,
  onPause,
  onReactivate,
  onDelete,
}: OwnListingItemProps) {
  const theme = useTheme();
  const thumbnail = listing.photos[0];

  const confirmDelete = () => {
    Alert.alert('Excluir anúncio', 'Tem certeza que deseja excluir este anúncio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(listing.id) },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.border, borderRadius: theme.radius.md },
      ]}
    >
      <View style={styles.row}>
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={[styles.thumbnail, { borderRadius: theme.radius.sm }]}
            contentFit="cover"
          />
        ) : null}
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
            style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}
          >
            {listing.price != null ? `R$ ${listing.price.toFixed(2)}` : 'A combinar'} ·{' '}
            {STATUS_LABEL[listing.status]}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Editar"
          onPress={() => onEdit(listing)}
          variant="secondary"
          icon="create-outline"
        />
        {listing.status === 'active' ? (
          <AppButton
            label="Pausar"
            onPress={() => onPause(listing.id)}
            variant="secondary"
            icon="pause-outline"
          />
        ) : (
          <AppButton
            label="Reativar"
            onPress={() => onReactivate(listing.id)}
            variant="secondary"
            icon="play-outline"
          />
        )}
        <AppButton
          label="Excluir"
          onPress={confirmDelete}
          variant="danger"
          icon="trash-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export const OwnListingItem = memo(OwnListingItemComponent);
