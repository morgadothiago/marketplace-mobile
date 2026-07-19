import React from 'react';
import { Redirect } from 'expo-router';

import { useProfile } from '@/contexts/ProfileContext';
import { ProfileForm } from '@/components/ProfileForm';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AsyncStateView } from '@/components/AsyncStateView';

/**
 * Onboarding (US1 / T011): primeira tela vista quando não existe perfil
 * local ainda. Reaproveita o mesmo formulário da tela de perfil — a única
 * diferença é o texto de apresentação e o redirecionamento ao concluir.
 */
export default function OnboardingScreen() {
  const { status, hasProfile, error, refresh } = useProfile();

  if (status === 'ready' && hasProfile) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <ScreenContainer scrollable>
      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
      >
        <ProfileForm
          title="Bem-vindo(a) ao MarketPlace Mobile"
          subtitle="Crie seu perfil para começar a comprar e vender na sua região."
          redirectOnSuccessHref="/(tabs)/profile"
        />
      </AsyncStateView>
    </ScreenContainer>
  );
}
