import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/theme';

type ProfileAvatarProps = {
  photoUri: string | null;
  name: string;
  size?: number;
  onPress?: () => void;
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  const parts = trimmed.split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

function ProfileAvatarComponent({
  photoUri,
  name,
  size = 96,
  onPress,
}: ProfileAvatarProps) {
  const theme = useTheme();

  const content = photoUri ? (
    <Image
      source={{ uri: photoUri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      transition={150}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <Text
        style={[styles.initials, { fontSize: size / 2.6, color: theme.colors.onPrimary }]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});

export const ProfileAvatar = memo(ProfileAvatarComponent);
