import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from '@/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type TabIconPair = { active: IoniconName; inactive: IoniconName };

const DEFAULT_TAB_ICONS: TabIconPair = { active: 'home', inactive: 'home-outline' };

const TAB_ICONS: Record<string, TabIconPair> = {
  index: DEFAULT_TAB_ICONS,
  search: { active: 'search', inactive: 'search-outline' },
  'new-listing': { active: 'add-circle', inactive: 'add-circle-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

function getTabIcons(routeName: string): TabIconPair {
  return TAB_ICONS[routeName] ?? DEFAULT_TAB_ICONS;
}

/**
 * Gate de onboarding (T011): enquanto o perfil local ainda está carregando,
 * mostra um spinner; se não existir perfil, redireciona para `/onboarding`
 * antes de expor qualquer tab. Isso garante que nenhuma tela do app seja
 * alcançável sem um perfil criado.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { status, hasProfile } = useProfile();

  if (status === 'loading') {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background, gap: theme.spacing.md },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
          Carregando...
        </Text>
      </View>
    );
  }

  if (!hasProfile) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + theme.spacing.xs,
          paddingTop: theme.spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weight.medium,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const icons = getTabIcons(route.name);
          return (
            <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="new-listing" options={{ title: 'Anunciar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
