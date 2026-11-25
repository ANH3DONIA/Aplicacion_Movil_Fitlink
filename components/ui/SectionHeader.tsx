import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AppIcon } from './AppIcon';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <AppIcon name="chevronRight" size={16} color={Colors.brandBlue} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...Typography.subtitleSora,
    color: Colors.night,
    flex: 1,
  },
  actionButton: {
    minHeight: 48,
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
    gap: 2,
  },
  actionPressed: {
    opacity: 0.72,
  },
  actionText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
});
