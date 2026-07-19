import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

/**
 * Layout raiz do `expo-router`. Nesta fase de scaffold apenas declara a
 * pilha de rotas do app; o `ProfileProvider` e o gate de onboarding
 * (T011) são adicionados na Fase 1 (ver `contexts/ProfileContext.tsx`).
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: 'Anúncio' }} />
        <Stack.Screen
          name="listing/[id]/chat"
          options={{ headerShown: true, title: 'Conversa' }}
        />
      </Stack>
    </>
  );
}
