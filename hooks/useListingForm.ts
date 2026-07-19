import { useCallback, useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useProfile } from '@/contexts/ProfileContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useLocationCapture, type Coordinates } from '@/hooks/useLocationCapture';
import {
  createListing,
  updateListing as updateListingInRepository,
} from '@/repositories/listings.repository';
import { LISTING_CATEGORIES, type ListingCategory } from '@/types/category';
import type { Listing, ListingType } from '@/types/listing';

/**
 * Lógica de negócio do formulário de anúncio (T014-T016): validação via
 * React Hook Form + Zod, upload de até 5 fotos e captura de localização —
 * a tela (`new-listing.tsx`, via `ListingForm`) só faz composição de UI.
 * Reaproveitado tanto para criar quanto para editar um anúncio existente,
 * mesmo padrão de `useProfileForm`/`ProfileForm`.
 */

const MAX_PHOTOS = 5;

const categoryValues = LISTING_CATEGORIES as unknown as [
  ListingCategory,
  ...ListingCategory[],
];
const typeValues: [ListingType, ListingType] = ['product', 'service'];

const listingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Título deve ter ao menos 3 caracteres.')
      .max(80, 'Título muito longo.'),
    description: z
      .string()
      .trim()
      .min(10, 'Descreva melhor o anúncio (mín. 10 caracteres).')
      .max(1000, 'Descrição muito longa.'),
    category: z.enum(categoryValues),
    type: z.enum(typeValues),
    price: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'service') {
      return;
    }
    if (!values.price) {
      ctx.addIssue({
        path: ['price'],
        code: z.ZodIssueCode.custom,
        message: 'Informe um preço ou mude o tipo para serviço.',
      });
      return;
    }
    const parsedPrice = Number(values.price.replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      ctx.addIssue({
        path: ['price'],
        code: z.ZodIssueCode.custom,
        message: 'Preço inválido.',
      });
    }
  });

export type ListingFormValues = z.infer<typeof listingFormSchema>;
type SaveStatus = 'idle' | 'saving' | 'error' | 'success';

function toFormValues(listing: Listing | null): ListingFormValues {
  return {
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    category: listing?.category ?? categoryValues[0],
    type: listing?.type ?? 'product',
    price: listing?.price != null ? String(listing.price) : '',
  };
}

export function useListingForm(listing: Listing | null = null) {
  const { profile } = useProfile();
  const {
    pickMultipleFromLibrary,
    loading: pickerLoading,
    error: pickerError,
  } = useImagePicker();
  const {
    captureCurrentLocation,
    loading: locationLoading,
    error: locationCaptureError,
  } = useLocationCapture();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: toFormValues(listing),
  });

  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    listing ? { lat: listing.lat, lng: listing.lng } : null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    reset(toFormValues(listing));
    setPhotos(listing?.photos ?? []);
    setCoordinates(listing ? { lat: listing.lat, lng: listing.lng } : null);
    setSaveStatus('idle');
    setSaveError(null);
  }, [listing, reset]);

  const remainingPhotoSlots = MAX_PHOTOS - photos.length;

  const addPhotos = useCallback(async () => {
    if (remainingPhotoSlots <= 0) {
      return;
    }
    const uris = await pickMultipleFromLibrary(remainingPhotoSlots);
    if (uris.length > 0) {
      setPhotos((current) => [...current, ...uris].slice(0, MAX_PHOTOS));
    }
  }, [pickMultipleFromLibrary, remainingPhotoSlots]);

  const removePhoto = useCallback((uri: string) => {
    setPhotos((current) => current.filter((photoUri) => photoUri !== uri));
  }, []);

  const captureLocation = useCallback(async () => {
    setLocationError(null);
    const captured = await captureCurrentLocation();
    if (captured) {
      setCoordinates(captured);
      return;
    }

    if (profile?.lat != null && profile.lng != null) {
      setCoordinates({ lat: profile.lat, lng: profile.lng });
      return;
    }

    setLocationError(
      'Não foi possível obter localização e seu perfil ainda não tem uma salva. ' +
        'Habilite a permissão de localização e tente novamente.',
    );
  }, [captureCurrentLocation, profile]);

  const type = watch('type');

  const onValid = useCallback(
    async (values: ListingFormValues) => {
      if (!profile) {
        setSaveStatus('error');
        setSaveError('Nenhum perfil local encontrado.');
        return;
      }
      if (photos.length === 0) {
        setSaveStatus('error');
        setSaveError('Adicione ao menos uma foto do anúncio.');
        return;
      }
      if (!coordinates) {
        setSaveStatus('error');
        setSaveError('Capture a localização do anúncio antes de salvar.');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const price =
          values.type === 'service' ? null : Number(values.price.replace(',', '.'));

        if (listing) {
          await updateListingInRepository(listing.id, {
            title: values.title,
            description: values.description,
            category: values.category,
            type: values.type,
            price,
            photos,
            lat: coordinates.lat,
            lng: coordinates.lng,
          });
        } else {
          await createListing({
            ownerId: profile.id,
            title: values.title,
            description: values.description,
            category: values.category,
            type: values.type,
            price,
            photos,
            lat: coordinates.lat,
            lng: coordinates.lng,
          });
        }

        setSaveStatus('success');
      } catch (error) {
        setSaveStatus('error');
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o anúncio. Tente novamente.',
        );
      }
    },
    [profile, photos, coordinates, listing],
  );

  const submit = useMemo(() => handleSubmit(onValid), [handleSubmit, onValid]);

  return {
    control,
    errors,
    type,
    photos,
    remainingPhotoSlots,
    addPhotos,
    removePhoto,
    coordinates,
    captureLocation,
    locationError: locationError ?? locationCaptureError,
    pickerLoading,
    pickerError,
    locationLoading,
    submit,
    saveStatus,
    saveError,
    isEditing: listing !== null,
  };
}
