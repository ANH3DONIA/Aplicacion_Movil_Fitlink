import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarTone = 'blue' | 'night' | 'soft' | 'info';

export interface InitialsAvatarProps {
  name: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<AvatarSize, { box: number; textStyle: typeof Typography.labelSemiBold }> = {
  sm: { box: 36, textStyle: Typography.labelSemiBold },
  md: { box: 44, textStyle: Typography.bodySemiBold },
  lg: { box: 64, textStyle: Typography.subtitleSora },
};

const TONE_MAP: Record<AvatarTone, { bg: string; fg: string }> = {
  blue: { bg: Colors.brandBlue, fg: Colors.surfaceWhite },
  night: { bg: Colors.night, fg: Colors.surfaceWhite },
  soft: { bg: Colors.blueSoft, fg: Colors.brandBlue },
  info: { bg: Colors.info, fg: Colors.surfaceWhite },
};

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'FL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function InitialsAvatar({
  name,
  size = 'md',
  tone = 'blue',
  style,
}: InitialsAvatarProps) {
  const dims = SIZE_MAP[size];
  const palette = TONE_MAP[tone];
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
          backgroundColor: palette.bg,
        },
        style,
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Iniciales de ${name}`}
    >
      <Text style={[dims.textStyle, { color: palette.fg }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
