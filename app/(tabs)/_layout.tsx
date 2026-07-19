import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';

import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from '@/theme';

/**
 * Gate de onboarding (T011): enquanto o perfil local ainda está carregando,
 * mostra um spinner; se não existir perfil, redireciona para `/onboarding`
 * antes de expor qualquer tab. Isso garante que nenhuma tela do app seja
 * alcançável sem um perfil criado.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { status, hasProfile } = useProfile();

  if (status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!hasProfile) {
    return <Redirect href="/onboarding" />;
  }

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
