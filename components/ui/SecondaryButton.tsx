import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useReducedMotionPref } from '../../app/_layout';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AppIcon, AppIconName } from './AppIcon';

export type SecondaryButtonVariant = 'solid' | 'outline' | 'destructive';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: SecondaryButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function SecondaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
  testID,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;
  const reduceMotion = useReducedMotionPref();

  const handlePress = () => {
    if (isDisabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        variant === 'destructive'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {});
    }
    onPress();
  };

  const textColor = variant === 'outline' ? Colors.brandBlue : Colors.surfaceWhite;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        variant === 'solid' && styles.solid,
        variant === 'outline' && styles.outline,
        variant === 'destructive' && styles.destructive,
        pressed && !isDisabled && (reduceMotion ? styles.pressedFlat : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <AppIcon name={icon} size={18} color={textColor} strokeWidth={2.2} /> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    backgroundColor: Colors.brandBlue,
  },
  outline: {
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: Colors.brandBlue,
  },
  destructive: {
    backgroundColor: Colors.error,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    ...Typography.bodySemiBold,
    textAlign: 'center',
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  pressedFlat: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
});
