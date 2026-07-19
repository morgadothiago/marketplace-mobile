import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type ScreenEdge = 'top' | 'bottom';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  /**
   * Quais bordas devem reservar espaço para as áreas seguras do dispositivo
   * (notch/status bar no topo, home indicator/gesture bar no Android
   * embaixo). Telas dentro das tabs já ganham o inset inferior da própria
   * tab bar, então usam apenas `['top']`; telas com header nativo
   * (`headerShown: true`) já ganham o inset superior do header, então usam
   * apenas `['bottom']`. O default cobre telas sem header e sem tab bar
   * (ex: onboarding).
   */
  edges?: readonly ScreenEdge[];
};

/**
 * Wrapper padrão de tela: aplica cor de fundo do tema, respeita as áreas
 * seguras (notch, status bar, gesture bar do Android) via
 * `react-native-safe-area-context`, respeita o teclado em iOS/Android e
 * opcionalmente torna o conteúdo rolável. Usado por todas as telas para
 * evitar repetir esse boilerplate e para que nenhum conteúdo fique atrás de
 * elementos nativos do sistema.
 */
export function ScreenContainer({
  children,
  scrollable = false,
  style,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = edges.includes('top') ? insets.top + theme.spacing.lg : theme.spacing.lg;
  const paddingBottom = edges.includes('bottom')
    ? insets.bottom + theme.spacing.lg
    : theme.spacing.lg;

  const paddingStyle: ViewStyle = {
    paddingTop,
    paddingBottom,
    paddingHorizontal: theme.spacing.lg,
  };

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, paddingStyle, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, paddingStyle, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
