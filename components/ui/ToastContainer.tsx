import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { NotificationTone } from '../../types/fitlink';
import { AppIcon, AppIconName } from './AppIcon';

const SNACKBAR_TONE: Record<NotificationTone, { badgeBg: string; fg: string; icon: AppIconName }> = {
  success: { badgeBg: Colors.success, fg: Colors.surfaceWhite, icon: 'check' },
  warning: { badgeBg: Colors.warning, fg: Colors.night, icon: 'alertTriangle' },
  error: { badgeBg: Colors.error, fg: Colors.surfaceWhite, icon: 'alertCircle' },
  info: { badgeBg: Colors.info, fg: Colors.surfaceWhite, icon: 'info' },
};

export function ToastContainer() {
  const { toasts, dismissToast, currentUser } = useFitLink();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  const bottomOffset = currentUser
    ? Math.max(insets.bottom, 8) + 72
    : Math.max(insets.bottom, 16) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      {toasts.map((toast) => {
        const cfg = SNACKBAR_TONE[toast.tone];
        return (
          <View
            key={toast.id}
            style={styles.snackbar}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <View style={[styles.iconBadge, { backgroundColor: cfg.badgeBg }]}>
              <AppIcon name={cfg.icon} size={16} color={cfg.fg} strokeWidth={2.4} />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {toast.title}
              </Text>
              {toast.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {toast.description}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => dismissToast(toast.id)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar aviso"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
            >
              <AppIcon name="x" size={18} color={Colors.white75} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    gap: 8,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.night,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.white18,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  description: {
    ...Typography.label,
    color: Colors.white75,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: {
    opacity: 0.7,
  },
});
