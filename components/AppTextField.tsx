import React, { memo } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

type AppTextFieldProps = TextInputProps & {
  label: string;
  errorMessage?: string | null;
};

function AppTextFieldComponent({
  label,
  errorMessage,
  style,
  ...inputProps
}: AppTextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: errorMessage ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: theme.typography.size.md,
          },
          style,
        ]}
        {...inputProps}
      />
      {errorMessage ? (
        <Text
          style={[
            styles.error,
            { color: theme.colors.danger, fontSize: theme.typography.size.xs },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
  },
  error: {
    marginTop: 2,
  },
});

export const AppTextField = memo(AppTextFieldComponent);
