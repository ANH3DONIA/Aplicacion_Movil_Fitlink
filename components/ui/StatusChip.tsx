import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AppIcon, AppIconName } from './AppIcon';

export type StatusChipTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'magenta';

export interface StatusChipProps {
  label: string;
  tone?: StatusChipTone;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
}

const TONE_CONFIG: Record<
  StatusChipTone,
  { bg: string; fg: string; defaultIcon: AppIconName }
> = {
  success: {
    bg: Colors.successSoft,
    fg: Colors.successText,
    defaultIcon: 'checkCircle',
  },
  warning: {
    bg: Colors.warningSoft,
    fg: Colors.warningText,
    defaultIcon: 'alertTriangle',
  },
  error: {
    bg: Colors.errorSoft,
    fg: Colors.errorText,
    defaultIcon: 'xCircle',
  },
  info: {
    bg: Colors.infoSoft,
    fg: Colors.infoText,
    defaultIcon: 'info',
  },
  neutral: {
    bg: Colors.blueSoft,
    fg: Colors.night,
    defaultIcon: 'clock',
  },
  magenta: {
    bg: Colors.magentaSoft,
    fg: Colors.magentaDark,
    defaultIcon: 'flame',
  },
};

export function StatusChip({ label, tone = 'neutral', icon, style }: StatusChipProps) {
  const cfg = TONE_CONFIG[tone];
  const iconName = icon ?? cfg.defaultIcon;

  return (
    <View
      style={[styles.chip, { backgroundColor: cfg.bg }, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <AppIcon name={iconName} size={14} color={cfg.fg} strokeWidth={2.2} />
      <Text style={[styles.label, { color: cfg.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  label: {
    ...Typography.labelSemiBold,
  },
});
