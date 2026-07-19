import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppButton } from '@/components/AppButton';

type AsyncStateViewProps = {
  loading: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
};

/**
 * Componente único para os três estados de qualquer operação assíncrona
 * (loading/error/success). Telas passam `children` como o conteúdo de
 * sucesso e delegam loading/erro aqui, evitando duplicar spinners e
 * mensagens de erro em cada tela.
 */
function AsyncStateViewComponent({
  loading,
  errorMessage,
  onRetry,
  children,
}: AsyncStateViewProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text
          style={[
            styles.message,
            { color: theme.colors.danger, fontSize: theme.typography.size.md },
          ]}
        >
          {errorMessage}
        </Text>
        {onRetry ? (
          <AppButton label="Tentar novamente" onPress={onRetry} variant="secondary" />
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
    gap: 16,
    padding: 24,
  },
  message: {
    textAlign: 'center',
  },
});

export const AsyncStateView = memo(AsyncStateViewComponent);
