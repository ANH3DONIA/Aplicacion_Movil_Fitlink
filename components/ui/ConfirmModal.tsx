import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotionPref } from '../../app/_layout';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { NotificationTone } from '../../types/fitlink';
import { AppIcon, AppIconName } from './AppIcon';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  tone?: NotificationTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const MODAL_TONE: Record<NotificationTone, { bg: string; fg: string; icon: AppIconName }> = {
  success: { bg: Colors.success, fg: Colors.surfaceWhite, icon: 'checkCircle' },
  warning: { bg: Colors.warning, fg: Colors.night, icon: 'alertTriangle' },
  error: { bg: Colors.error, fg: Colors.surfaceWhite, icon: 'alertCircle' },
  info: { bg: Colors.brandBlue, fg: Colors.surfaceWhite, icon: 'info' },
};

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  tone,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const reduceMotion = useReducedMotionPref();
  const effectiveTone: NotificationTone = tone ?? (destructive ? 'error' : 'info');
  const iconCfg = MODAL_TONE[effectiveTone];

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cerrar diálogo"
        />

        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.headerRow}>
            <View style={[styles.iconBadge, { backgroundColor: iconCfg.bg }]}>
              <AppIcon name={iconCfg.icon} size={20} color={iconCfg.fg} strokeWidth={2.2} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            <SecondaryButton
              label={cancelLabel}
              variant="outline"
              onPress={onCancel}
              style={styles.actionBtn}
            />
            {destructive ? (
              <SecondaryButton
                label={confirmLabel}
                variant="destructive"
                onPress={onConfirm}
                style={styles.actionBtn}
              />
            ) : (
              <PrimaryButton
                label={confirmLabel}
                onPress={onConfirm}
                style={styles.actionBtn}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,38,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 20,
    gap: 12,
    zIndex: 2,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.subtitleSora,
    color: Colors.night,
    flex: 1,
  },
  description: {
    ...Typography.body,
    color: Colors.night70,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
  },
});
