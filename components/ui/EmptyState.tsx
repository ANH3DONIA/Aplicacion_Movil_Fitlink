import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontFamilies, Typography } from '../../constants/Typography';
import { AppIcon, AppIconName } from './AppIcon';
import { SecondaryButton } from './SecondaryButton';

export interface EmptyStateProps {
  icon?: AppIconName;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'calendar',
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AppIcon name={icon} size={28} color={Colors.brandBlue} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onActionPress ? (
        <SecondaryButton
          label={actionLabel}
          variant="outline"
          onPress={onActionPress}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamilies.soraSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.night,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.night70,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});
