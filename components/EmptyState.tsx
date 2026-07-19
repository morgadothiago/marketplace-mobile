import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type EmptyStateProps = {
  icon: IoniconName;
  message: string;
};

/**
 * Estado vazio padrão (ícone + mensagem), usado no feed, na busca e em
 * "Meus anúncios" sempre que a lista de sucesso vier vazia. Centraliza esse
 * padrão para não repetir `Text` "cru" sem ícone em cada tela.
 */
function EmptyStateComponent({ icon, message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { gap: theme.spacing.md }]}>
      <Ionicons name={icon} size={40} color={theme.colors.textMuted} />
      <Text
        style={[
          styles.message,
          { color: theme.colors.textMuted, fontSize: theme.typography.size.md },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  message: {
    textAlign: 'center',
  },
});

export const EmptyState = memo(EmptyStateComponent);
