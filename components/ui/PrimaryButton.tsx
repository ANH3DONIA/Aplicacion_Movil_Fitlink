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

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
  testID,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const reduceMotion = useReducedMotionPref();

  const handlePress = () => {
    if (isDisabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

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
        pressed && !isDisabled && (reduceMotion ? styles.pressedFlat : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.night} />
      ) : (
        <View style={styles.content}>
          {icon ? <AppIcon name={icon} size={18} color={Colors.night} strokeWidth={2.2} /> : null}
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.brandYellow,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  pressedFlat: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
});
