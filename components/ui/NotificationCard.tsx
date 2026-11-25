import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AppNotification, NotificationTone } from '../../types/fitlink';
import { AppIcon, AppIconName } from './AppIcon';

export interface NotificationCardProps {
  notification: AppNotification;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const TONE_STYLE: Record<
  NotificationTone,
  { accent: string; iconColor: string; icon: AppIconName }
> = {
  success: {
    accent: Colors.success,
    iconColor: Colors.surfaceWhite,
    icon: 'check',
  },
  warning: {
    accent: Colors.warning,
    iconColor: Colors.night,
    icon: 'alertTriangle',
  },
  error: {
    accent: Colors.error,
    iconColor: Colors.surfaceWhite,
    icon: 'alertCircle',
  },
  info: {
    accent: Colors.info,
    iconColor: Colors.surfaceWhite,
    icon: 'info',
  },
};

export function NotificationCard({ notification, onPress, style }: NotificationCardProps) {
  const toneCfg = TONE_STYLE[notification.tone];

  const inner = (
    <View style={[styles.card, { borderLeftColor: toneCfg.accent }, style]}>
      <View style={[styles.iconCircle, { backgroundColor: toneCfg.accent }]}>
        <AppIcon name={toneCfg.icon} size={18} color={toneCfg.iconColor} strokeWidth={2.4} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <View style={styles.timeWrap}>
            {!notification.read ? <View style={styles.unreadDot} /> : null}
            <Text style={styles.time}>{notification.createdAtLabel}</Text>
          </View>
        </View>
        <Text style={styles.description}>{notification.description}</Text>
      </View>
    </View>
  );

  if (!onPress) {
    return inner;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.description}. ${notification.createdAtLabel}`}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    borderLeftWidth: 4,
    padding: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    flex: 1,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brandMagenta,
  },
  time: {
    ...Typography.label,
    color: Colors.night65,
  },
  description: {
    ...Typography.body,
    color: Colors.night70,
  },
  pressed: {
    opacity: 0.85,
  },
});
