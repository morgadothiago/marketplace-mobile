import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProfileProvider } from '@/contexts/ProfileContext';
import { ListingsProvider } from '@/contexts/ListingsContext';
import { useTheme } from '@/theme';

/**
 * Layout raiz: monta `SafeAreaProvider` (necessário para
 * `useSafeAreaInsets`/`ScreenContainer` em todo o app), `ProfileProvider`
 * (estado global do perfil) e `ListingsProvider` (Fase 3 — estado global dos
 * anúncios ativos, compartilhado entre feed e busca) antes da pilha de
 * rotas do `expo-router`. O gate de onboarding vive em
 * `app/(tabs)/_layout.tsx`, que decide entre mostrar as tabs ou redirecionar
 * para `/onboarding` — mantém este arquivo simples e sem lógica de negócio.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <ListingsProvider>
          <RootNavigator />
        </ListingsProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

/**
 * Isolado do `RootLayout` só para poder chamar `useTheme` (que depende do
 * color scheme) e aplicar a `StatusBar`/headers nativos de forma consistente
 * com o tema atual, em vez de deixar cor/estilo "crus" por conta do sistema.
 */
function RootNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar
        style={theme.mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="listing/[id]"
          options={{
            headerShown: true,
            title: 'Anúncio',
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="listing/[id]/chat"
          options={{
            headerShown: true,
            title: 'Conversa',
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
