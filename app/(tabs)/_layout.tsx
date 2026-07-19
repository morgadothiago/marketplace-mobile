import React from 'react';
import { Tabs } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Navegação por tabs (T002). O gate de onboarding (redirecionar para
 * `/onboarding` quando não houver perfil local) é adicionado na Fase 1,
 * quando o `ProfileContext` passa a existir.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="new-listing" options={{ title: 'Anunciar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
