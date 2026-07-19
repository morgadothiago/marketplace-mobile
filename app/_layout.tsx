import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { ProfileProvider } from '@/contexts/ProfileContext';

/**
 * Layout raiz: só monta o `ProfileProvider` (estado global do perfil) e a
 * pilha de rotas do `expo-router`. O gate de onboarding vive em
 * `app/(tabs)/_layout.tsx`, que decide entre mostrar as tabs ou redirecionar
 * para `/onboarding` — mantém este arquivo simples e sem lógica de negócio.
 */
export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen
          name="listing/[id]"
          options={{ headerShown: true, title: 'Anúncio' }}
        />
        <Stack.Screen
          name="listing/[id]/chat"
          options={{ headerShown: true, title: 'Conversa' }}
        />
      </Stack>
    </ProfileProvider>
  );
}
