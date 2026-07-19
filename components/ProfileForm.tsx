import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { AppTextField } from '@/components/AppTextField';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useTheme } from '@/theme';

type ProfileFormProps = {
  title: string;
  subtitle?: string;
  /** Rota para navegar automaticamente após salvar com sucesso (ex: onboarding). */
  redirectOnSuccessHref?: string;
  /** Callback opcional exibido como botão "Cancelar" (edição de perfil existente). */
  onCancel?: () => void;
  /** Chamado após salvar com sucesso, além do redirect (ex: fechar modo edição). */
  onSaveSuccess?: () => void;
};

/**
 * Formulário de criação/edição de perfil (foto, nome, bairro, contato
 * externo opcional). Componente puro de UI — toda a lógica de estado e
 * persistência vem de `useProfileForm`. Reaproveitado pelo onboarding
 * (`app/onboarding.tsx`) e pela tela de perfil (`app/(tabs)/profile.tsx`).
 */
export function ProfileForm({
  title,
  subtitle,
  redirectOnSuccessHref,
  onCancel,
  onSaveSuccess,
}: ProfileFormProps) {
  const theme = useTheme();
  const {
    values,
    setField,
    choosePhoto,
    save,
    saveStatus,
    saveError,
    validationError,
    pickerLoading,
    pickerError,
  } = useProfileForm();

  useEffect(() => {
    if (saveStatus !== 'success') {
      return;
    }
    onSaveSuccess?.();
    if (redirectOnSuccessHref) {
      router.replace(redirectOnSuccessHref as Parameters<typeof router.replace>[0]);
    }
  }, [saveStatus, redirectOnSuccessHref, onSaveSuccess]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.typography.size.xl },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      <View style={styles.avatarRow}>
        <ProfileAvatar
          photoUri={values.photoUri}
          name={values.name}
          onPress={choosePhoto}
        />
        <AppButton
          label="Alterar foto"
          onPress={choosePhoto}
          variant="secondary"
          loading={pickerLoading}
          style={styles.avatarButton}
        />
      </View>
      {pickerError ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>{pickerError}</Text>
      ) : null}

      <AppTextField
        label="Nome"
        placeholder="Como você quer ser chamado(a)"
        value={values.name}
        onChangeText={(text) => setField('name', text)}
        autoCapitalize="words"
      />

      <AppTextField
        label="Bairro"
        placeholder="Ex: Vila Madalena"
        value={values.neighborhood}
        onChangeText={(text) => setField('neighborhood', text)}
        autoCapitalize="words"
      />

      <AppTextField
        label="Contato externo (opcional)"
        placeholder="WhatsApp ou telefone"
        value={values.externalContact}
        onChangeText={(text) => setField('externalContact', text)}
        keyboardType="phone-pad"
      />

      {validationError ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>
          {validationError}
        </Text>
      ) : null}
      {saveStatus === 'error' && saveError ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>{saveError}</Text>
      ) : null}
      {saveStatus === 'success' && !redirectOnSuccessHref ? (
        <Text style={[styles.hint, { color: theme.colors.success }]}>
          Perfil salvo com sucesso.
        </Text>
      ) : null}

      <AppButton
        label="Salvar"
        onPress={save}
        loading={saveStatus === 'saving'}
        style={styles.saveButton}
      />
      {onCancel ? (
        <AppButton label="Cancelar" onPress={onCancel} variant="secondary" />
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
  subtitle: {
    marginTop: -8,
  },
  avatarRow: {
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    alignSelf: 'center',
  },
  hint: {
    fontSize: 13,
  },
  saveButton: {
    marginTop: 8,
  },
});
