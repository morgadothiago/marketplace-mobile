import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppTextField } from '@/components/AppTextField';
import { ChipSelector } from '@/components/ChipSelector';
import { ListingPhotoPicker } from '@/components/ListingPhotoPicker';
import { useListingForm } from '@/hooks/useListingForm';
import { useTheme } from '@/theme';
import { LISTING_CATEGORIES } from '@/types/category';
import { LISTING_TYPE_LABELS } from '@/types/listing';
import type { Listing } from '@/types/listing';

const LISTING_TYPES = ['product', 'service'] as const;
const MAX_PHOTOS = 5;

type ListingFormProps = {
  /** Anúncio em edição, ou `null` para criar um novo (T014/T017). */
  listing?: Listing | null;
  onCancel?: () => void;
  onSaved?: () => void;
};

/**
 * Formulário de publicação/edição de anúncio (US2/US7). Componente puro de
 * UI — toda validação (Zod), upload de fotos e captura de localização vêm
 * de `useListingForm`. Reaproveitado para criar (T014-T016) e editar (T017)
 * o mesmo anúncio, mesmo padrão de `ProfileForm`/`useProfileForm`.
 */
export function ListingForm({ listing = null, onCancel, onSaved }: ListingFormProps) {
  const theme = useTheme();
  const {
    control,
    errors,
    type,
    photos,
    remainingPhotoSlots,
    addPhotos,
    removePhoto,
    coordinates,
    captureLocation,
    locationError,
    pickerLoading,
    pickerError,
    locationLoading,
    submit,
    saveStatus,
    saveError,
    isEditing,
  } = useListingForm(listing);

  useEffect(() => {
    if (saveStatus === 'success') {
      onSaved?.();
    }
  }, [saveStatus, onSaved]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.typography.size.xl },
        ]}
      >
        {isEditing ? 'Editar anúncio' : 'Anunciar produto ou serviço'}
      </Text>

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <ChipSelector
            label="Tipo"
            options={LISTING_TYPES}
            value={field.value}
            onChange={field.onChange}
            renderLabel={(option) => LISTING_TYPE_LABELS[option]}
          />
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <ChipSelector
            label="Categoria"
            options={LISTING_CATEGORIES}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <AppTextField
            label="Título"
            placeholder="Ex: iPhone 13 128GB seminovo"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={errors.title?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <AppTextField
            label="Descrição"
            placeholder="Detalhe o estado, motivo da venda, condições de entrega..."
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={errors.description?.message}
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />
        )}
      />

      {type === 'service' ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          Preço: a combinar com o comprador (serviços não exigem preço fixo).
        </Text>
      ) : (
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <AppTextField
              label="Preço (R$)"
              placeholder="Ex: 150,00"
              value={field.value}
              onChangeText={field.onChange}
              errorMessage={errors.price?.message}
              keyboardType="decimal-pad"
            />
          )}
        />
      )}

      <ListingPhotoPicker
        photos={photos}
        maxPhotos={MAX_PHOTOS}
        loading={pickerLoading}
        onAddPhotos={addPhotos}
        onRemovePhoto={removePhoto}
      />
      {pickerError && remainingPhotoSlots >= 0 ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>{pickerError}</Text>
      ) : null}

      <View style={styles.locationSection}>
        <Text
          style={[
            styles.label,
            { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
          ]}
        >
          Localização do anúncio
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.size.sm }}>
          {coordinates
            ? `Capturada (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`
            : 'Ainda não capturada'}
        </Text>
        <AppButton
          label={coordinates ? 'Atualizar localização' : 'Usar minha localização atual'}
          onPress={captureLocation}
          variant="secondary"
          icon={coordinates ? 'navigate' : 'location-outline'}
          loading={locationLoading}
        />
        {locationError ? (
          <Text style={[styles.hint, { color: theme.colors.danger }]}>
            {locationError}
          </Text>
        ) : null}
      </View>

      {saveStatus === 'error' && saveError ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>{saveError}</Text>
      ) : null}
      {saveStatus === 'success' ? (
        <Text style={[styles.hint, { color: theme.colors.success }]}>
          Anúncio salvo com sucesso.
        </Text>
      ) : null}

      <AppButton
        label={isEditing ? 'Salvar alterações' : 'Publicar anúncio'}
        onPress={submit}
        icon={isEditing ? 'checkmark-outline' : 'add-circle-outline'}
        loading={saveStatus === 'saving'}
        style={styles.saveButton}
      />
      {onCancel ? (
        <AppButton
          label="Cancelar"
          onPress={onCancel}
          variant="secondary"
          icon="close-outline"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  locationSection: {
    gap: 8,
  },
  saveButton: {
    marginTop: 8,
  },
});
