import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useImagePicker } from '@/hooks/useImagePicker';
import { useProfile } from '@/contexts/ProfileContext';
import type { Profile } from '@/types/profile';

type SaveStatus = 'idle' | 'saving' | 'error' | 'success';

type ProfileFormValues = {
  name: string;
  neighborhood: string;
  externalContact: string;
  photoUri: string | null;
};

function toFormValues(profile: Profile | null): ProfileFormValues {
  return {
    name: profile?.name ?? '',
    neighborhood: profile?.neighborhood ?? '',
    externalContact: profile?.externalContact ?? '',
    photoUri: profile?.photoUri ?? null,
  };
}

/**
 * Lógica de negócio da tela/formulário de perfil: mantém os campos em
 * edição, valida o mínimo necessário, integra com o `ProfileContext` para
 * persistir e expõe os três estados (loading/error/success) da operação
 * de salvar — a tela (`profile.tsx`) só faz composição de UI.
 */
export function useProfileForm() {
  const { profile, createProfile, updateProfile } = useProfile();
  const {
    pickFromCamera,
    pickFromLibrary,
    loading: pickerLoading,
    error: pickerError,
  } = useImagePicker();

  const [values, setValues] = useState<ProfileFormValues>(() => toFormValues(profile));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const choosePhoto = useCallback(() => {
    Alert.alert('Foto de perfil', 'Escolha a origem da foto', [
      {
        text: 'Câmera',
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) {
            setField('photoUri', uri);
          }
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) {
            setField('photoUri', uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [pickFromCamera, pickFromLibrary, setField]);

  const save = useCallback(async () => {
    const name = values.name.trim();
    const neighborhood = values.neighborhood.trim();

    if (!name || !neighborhood) {
      setValidationError('Nome e bairro são obrigatórios.');
      return;
    }

    setValidationError(null);
    setSaveStatus('saving');
    setSaveError(null);

    try {
      const input = {
        name,
        neighborhood,
        photoUri: values.photoUri,
        externalContact: values.externalContact.trim() || null,
      };

      if (profile) {
        await updateProfile(input);
      } else {
        await createProfile(input);
      }

      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o perfil. Tente novamente.',
      );
    }
  }, [values, profile, createProfile, updateProfile]);

  return {
    values,
    isNewProfile: profile === null,
    setField,
    choosePhoto,
    save,
    saveStatus,
    saveError,
    validationError,
    pickerLoading,
    pickerError,
  };
}
