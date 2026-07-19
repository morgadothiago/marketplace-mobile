import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AsyncStateView } from '@/components/AsyncStateView';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfileForm } from '@/components/ProfileForm';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from '@/theme';

/**
 * Tela de perfil (T009): exibe os dados do perfil local em modo leitura e
 * alterna para o formulário de edição sob demanda. `isEditing` é estado de
 * UI puro desta tela; a lógica de negócio do formulário vive em
 * `useProfileForm` (consumida por `ProfileForm`).
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, status, error, refresh } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ScreenContainer scrollable>
      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
      >
        {isEditing || !profile ? (
          <ProfileForm
            title={profile ? 'Editar perfil' : 'Criar perfil'}
            onCancel={profile ? () => setIsEditing(false) : undefined}
            onSaveSuccess={() => setIsEditing(false)}
          />
        ) : (
          <View style={styles.section}>
            <View style={styles.header}>
              <ProfileAvatar photoUri={profile.photoUri} name={profile.name} size={112} />
              <Text
                style={[
                  styles.name,
                  { color: theme.colors.text, fontSize: theme.typography.size.xl },
                ]}
              >
                {profile.name}
              </Text>
              <Text
                style={[
                  styles.neighborhood,
                  { color: theme.colors.textMuted, fontSize: theme.typography.size.md },
                ]}
              >
                {profile.neighborhood}
              </Text>
              {profile.externalContact ? (
                <Text
                  style={[
                    styles.contact,
                    { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
                  ]}
                >
                  Contato: {profile.externalContact}
                </Text>
              ) : null}
            </View>
            <AppButton label="Editar perfil" onPress={() => setIsEditing(true)} />
          </View>
        )}
      </AsyncStateView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontWeight: '700',
  },
  neighborhood: {},
  contact: {},
});
