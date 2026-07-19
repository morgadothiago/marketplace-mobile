import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { AppButton } from '@/components/AppButton';

type AsyncStateViewProps = {
  loading: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  /** Texto exibido junto ao spinner. Default cobre a maioria dos casos. */
  loadingMessage?: string;
  children: React.ReactNode;
};

/**
 * Componente único para os três estados de qualquer operação assíncrona
 * (loading/error/success). Telas passam `children` como o conteúdo de
 * sucesso e delegam loading/erro aqui, evitando duplicar spinners e
 * mensagens de erro em cada tela — sempre com a mesma identidade visual
 * (cores do tema, ícone de erro, espaçamento consistente).
 */
function AsyncStateViewComponent({
  loading,
  errorMessage,
  onRetry,
  loadingMessage = 'Carregando...',
  children,
}: AsyncStateViewProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.centered, { gap: theme.spacing.md }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
          {loadingMessage}
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={[styles.centered, { gap: theme.spacing.md }]}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.danger} />
        <Text
          style={[
            styles.message,
            { color: theme.colors.danger, fontSize: theme.typography.size.md },
          ]}
        >
          {errorMessage}
        </Text>
        {onRetry ? (
          <AppButton
            label="Tentar novamente"
            onPress={onRetry}
            variant="secondary"
            icon="refresh-outline"
          />
        ) : null}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
  },
});

export const AsyncStateView = memo(AsyncStateViewComponent);
