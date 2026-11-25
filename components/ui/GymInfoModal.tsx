import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useReducedMotionPref } from '../../app/_layout';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { AppIcon } from './AppIcon';
import { SecondaryButton } from './SecondaryButton';

export interface GymInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function GymInfoModal({ visible, onClose }: GymInfoModalProps) {
  const { gymProfile } = useFitLink();
  const reduceMotion = useReducedMotionPref();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar ficha del gimnasio"
        />

        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <AppIcon name="building" size={20} color={Colors.brandBlue} />
              </View>
              <View style={styles.titleTextWrap}>
                <Text style={styles.title}>{gymProfile.name}</Text>
                <Text style={styles.tzNote}>{gymProfile.timezoneLabel}</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <AppIcon name="x" size={20} color={Colors.night} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            <View style={styles.sectionBox}>
              <View style={styles.infoRow}>
                <AppIcon name="mapPin" size={18} color={Colors.brandBlue} />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Ubicación</Text>
                  <Text style={styles.infoValue}>{gymProfile.address}</Text>
                  <Text style={styles.infoSub}>{gymProfile.city}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <AppIcon name="phone" size={18} color={Colors.brandBlue} />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Recepción</Text>
                  <Text style={[styles.infoValue, tabularNums]}>{gymProfile.phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Horarios de atención</Text>
              {gymProfile.schedules.map((item) => (
                <View key={item.label} style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{item.label}</Text>
                  <Text style={[styles.scheduleHours, tabularNums]}>{item.hours}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Reglas operativas</Text>
              {gymProfile.policies.map((rule) => (
                <View key={rule} style={styles.policyRow}>
                  <AppIcon name="info" size={16} color={Colors.infoText} />
                  <Text style={styles.policyText}>{rule}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <SecondaryButton label="Entendido" variant="solid" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,38,0.56)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '86%',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextWrap: {
    flex: 1,
  },
  title: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  tzNote: {
    ...Typography.label,
    color: Colors.night65,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  scrollBody: {
    gap: 12,
  },
  sectionBox: {
    backgroundColor: Colors.ice,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...Typography.labelSemiBold,
    color: Colors.night65,
  },
  infoValue: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  infoSub: {
    ...Typography.body,
    color: Colors.night70,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderCrisp,
  },
  sectionHeading: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  scheduleDay: {
    ...Typography.body,
    color: Colors.night70,
  },
  scheduleHours: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  policyText: {
    ...Typography.label,
    color: Colors.night70,
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
