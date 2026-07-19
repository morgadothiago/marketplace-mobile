import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/theme';

type ListingPhotoPickerProps = {
  photos: string[];
  maxPhotos: number;
  loading: boolean;
  onAddPhotos: () => void;
  onRemovePhoto: (uri: string) => void;
};

/**
 * Grade de até 5 fotos do anúncio (T015): miniaturas com botão de remover e
 * um slot final para adicionar mais fotos (via seleção múltipla de galeria).
 * Componente de UI puro — toda a lógica de picker vive em `useListingForm`.
 */
function ListingPhotoPickerComponent({
  photos,
  maxPhotos,
  loading,
  onAddPhotos,
  onRemovePhoto,
}: ListingPhotoPickerProps) {
  const theme = useTheme();
  const canAddMore = photos.length < maxPhotos;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
        ]}
      >
        Fotos ({photos.length}/{maxPhotos})
      </Text>
      <View style={styles.grid}>
        {photos.map((uri) => (
          <View key={uri} style={styles.thumbnailWrapper}>
            <Image
              source={{ uri }}
              style={[styles.thumbnail, { borderRadius: theme.radius.sm }]}
              contentFit="cover"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remover foto"
              onPress={() => onRemovePhoto(uri)}
              style={[styles.removeButton, { backgroundColor: theme.colors.danger }]}
            >
              <Text style={{ color: theme.colors.onPrimary, fontSize: 12 }}>X</Text>
            </Pressable>
          </View>
        ))}

        {canAddMore ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAddPhotos}
            disabled={loading}
            style={[
              styles.addButton,
              {
                borderRadius: theme.radius.sm,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                opacity: loading ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={{ color: theme.colors.primary, fontSize: theme.typography.size.sm }}
            >
              {loading ? 'Abrindo...' : '+ Adicionar'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const THUMBNAIL_SIZE = 84;

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ListingPhotoPicker = memo(ListingPhotoPickerComponent);
