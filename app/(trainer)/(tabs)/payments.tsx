import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon, AppIconName } from '../../../components/ui/AppIcon';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip, StatusChipTone } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES, getLocalISODate, splitCommission } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';
import { PaymentStatus, TrainerAvailabilitySlot } from '../../../types/fitlink';

const HOUR_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

function buildNextDays() {
  const list: Array<{ iso: string; label: string }> = [];
  for (let i = 0; i < 7; i += 1) {
    const iso = getLocalISODate(i);
    list.push({ iso, label: formatShortDateES(iso) });
  }
  return list;
}

function getPaymentBadge(status: PaymentStatus): { tone: StatusChipTone; icon: AppIconName } {
  switch (status) {
    case 'Pagado':
      return { tone: 'success', icon: 'checkCircle' };
    case 'Pendiente':
      return { tone: 'warning', icon: 'clock' };
    case 'Reembolsado':
      return { tone: 'info', icon: 'rotateCcw' };
    default:
      return { tone: 'error', icon: 'alertCircle' };
  }
}

export default function TrainerPaymentsScreen() {
  const router = useRouter();
  const {
    currentUser,
    trainers,
    payments,
    addTrainerAvailability,
    removeTrainerAvailability,
    showToast,
  } = useFitLink();

  const trainer = useMemo(() => {
    return trainers.find((t) => t.id === currentUser?.trainerId) ?? trainers[0];
  }, [trainers, currentUser?.trainerId]);

  const trainerId = trainer?.id ?? 'tr-01';
  const stripeReady = Boolean(trainer?.stripeConnected);

  const trainerPayments = useMemo(() => {
    return payments.filter((p) => p.trainerId === trainerId);
  }, [payments, trainerId]);

  const totals = useMemo(() => {
    let gross = 0;
    let net = 0;
    let gymFee = 0;
    let paidCount = 0;

    trainerPayments.forEach((p) => {
      if (p.status === 'Pagado') {
        const split = splitCommission(p.amountMxn);
        gross += p.amountMxn;
        net += p.trainerNetMxn ?? split.netTrainerMxn;
        gymFee += p.gymFeeMxn ?? split.gymFeeMxn;
        paidCount += 1;
      }
    });

    return { gross, net, gymFee, paidCount };
  }, [trainerPayments]);

  const dayOptions = useMemo(() => buildNextDays(), []);
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(getLocalISODate(1));
  const [selectedHour, setSelectedHour] = useState<string>('17:00');
  const [deleteTarget, setDeleteTarget] = useState<TrainerAvailabilitySlot | null>(null);

  const handleOpenPublishModal = () => {
    if (!stripeReady) {
      showToast({
        title: 'Vincula tu cuenta de cobros',
        description: 'Debes activar Stripe Connect antes de publicar horarios.',
        tone: 'warning',
      });
      router.push('/(trainer)/profile');
      return;
    }
    setSlotModalVisible(true);
  };

  const handleAddSlot = () => {
    const result = addTrainerAvailability(selectedDay, selectedHour);
    if (result.ok) {
      setSlotModalVisible(false);
      showToast({
        title: 'Horario publicado',
        description: result.message,
        tone: 'success',
      });
    } else {
      showToast({
        title: 'No se pudo publicar',
        description: result.message,
        tone: 'error',
      });
    }
  };

  const confirmDeleteSlot = () => {
    if (!deleteTarget) return;
    const result = removeTrainerAvailability(deleteTarget.id);
    setDeleteTarget(null);
    showToast({
      title: result.ok ? 'Horario bloqueado' : 'Error',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  const availability = trainer?.availability ?? [];

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cobros y disponibilidad</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroHeading}>Ingreso neto mensual (90%)</Text>
          <View style={styles.heroBadge}>
            <AppIcon name="wallet" size={14} color={Colors.surfaceWhite} />
            <Text style={styles.heroBadgeText}>
              {totals.paidCount} sesiones
            </Text>
          </View>
        </View>

        <Text style={styles.heroAmount}>
          ${totals.net.toLocaleString('es-MX')} MXN
        </Text>

        <View style={styles.splitRow}>
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel} numberOfLines={1}>
              Bruto cobrado
            </Text>
            <Text style={styles.splitValue}>
              ${totals.gross.toLocaleString('es-MX')} MXN
            </Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel} numberOfLines={1}>
              Comisión (10%)
            </Text>
            <Text style={styles.splitValue}>
              ${totals.gymFee.toLocaleString('es-MX')} MXN
            </Text>
          </View>
        </View>
      </View>

      {!stripeReady ? (
        <View style={styles.gateCard}>
          <View style={styles.gateRow}>
            <AppIcon name="lock" size={18} color={Colors.warningText} />
            <Text style={styles.gateText}>
              Publicación bloqueada: vincula primero tu cuenta Stripe Connect Express para ofrecer sesiones 1-a-1.
            </Text>
          </View>
          <PrimaryButton
            label="Vincular Stripe Connect"
            icon="link"
            onPress={() => router.push('/(trainer)/profile')}
          />
        </View>
      ) : null}

      <SectionHeader
        title={`Horarios disponibles (${availability.length})`}
        style={styles.sectionMargin}
      />

      {availability.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Sin horarios publicados"
          description={
            stripeReady
              ? 'Publica tus bloques libres para que los socios puedan solicitar sesiones 1-a-1.'
              : 'Una vez vinculada tu cuenta de cobros podrás publicar horarios aquí.'
          }
        />
      ) : (
        <View style={styles.listGap}>
          {availability.map((item) => (
            <View key={item.id} style={styles.slotCard}>
              <View style={styles.slotIconBox}>
                <AppIcon name="calendar" size={20} color={Colors.brandBlue} />
              </View>
              <View style={styles.slotBody}>
                <Text style={styles.slotDay}>
                  {formatShortDateES(item.day)} ({item.day})
                </Text>
                <Text style={styles.slotTime}>{item.slot} hrs · Sesión 1-a-1</Text>
              </View>
              <Pressable
                onPress={() => setDeleteTarget(item)}
                accessibilityRole="button"
                accessibilityLabel={`Bloquear horario ${item.day} ${item.slot}`}
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
              >
                <AppIcon name="trash" size={18} color={Colors.errorText} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {stripeReady ? (
        <PrimaryButton
          label="Publicar horario disponible"
          icon="plus"
          onPress={handleOpenPublishModal}
        />
      ) : null}

      <SectionHeader
        title="Liquidaciones de sesiones"
        style={styles.sectionMargin}
      />

      {trainerPayments.length === 0 ? (
        <EmptyState
          icon="creditCard"
          title="Sin liquidaciones registradas"
          description="Cuando los socios paguen sus sesiones confirmadas verás aquí cada transferencia."
        />
      ) : (
        <View style={styles.listGap}>
          {trainerPayments.map((pay) => {
            const split = splitCommission(pay.amountMxn);
            const net = pay.trainerNetMxn ?? split.netTrainerMxn;
            const fee = pay.gymFeeMxn ?? split.gymFeeMxn;
            const badge = getPaymentBadge(pay.status);

            return (
              <View key={pay.id} style={styles.paymentCard}>
                <View style={styles.paymentTop}>
                  <Text style={styles.paymentConcept} numberOfLines={1}>
                    {pay.concept}
                  </Text>
                  <StatusChip label={pay.status} tone={badge.tone} icon={badge.icon} />
                </View>
                <Text style={styles.paymentMeta}>
                  {pay.dateLabel} · Folio {pay.folio}
                </Text>
                <View style={styles.paymentFooter}>
                  <Text
                    style={[
                      styles.paymentNet,
                      pay.status === 'Reembolsado' && styles.paymentRefunded,
                    ]}
                  >
                    {pay.status === 'Reembolsado'
                      ? `Revertido: $${net} MXN`
                      : `Neto: $${net} MXN (90%)`}
                  </Text>
                  <Text style={styles.paymentFee}>Gimnasio: ${fee} MXN (10%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={slotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSlotModalVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publicar horario 1-a-1</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Selecciona el día</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.modalDaysRow}
              >
                {dayOptions.map((opt) => {
                  const active = selectedDay === opt.iso;
                  return (
                    <Pressable
                      key={opt.iso}
                      onPress={() => setSelectedDay(opt.iso)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.dayOption,
                        active ? styles.dayOptionActive : styles.dayOptionInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayOptionTitle,
                          active ? styles.optionTextActive : styles.optionTextInactive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={[
                          styles.dayOptionIso,
                          tabularNums,
                          active ? styles.optionSubActive : styles.optionSubInactive,
                        ]}
                      >
                        {opt.iso}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bloque horario</Text>
              <View style={styles.hoursGrid}>
                {HOUR_SLOTS.map((hh) => {
                  const active = selectedHour === hh;
                  return (
                    <Pressable
                      key={hh}
                      onPress={() => setSelectedHour(hh)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.hourChip,
                        active ? styles.dayOptionActive : styles.dayOptionInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hourChipText,
                          tabularNums,
                          active ? styles.optionTextActive : styles.optionTextInactive,
                        ]}
                      >
                        {hh}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancelar"
                variant="outline"
                onPress={() => setSlotModalVisible(false)}
                style={styles.modalBtn}
              />
              <SecondaryButton
                label="Publicar"
                variant="solid"
                icon="check"
                onPress={handleAddSlot}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={deleteTarget !== null}
        title="¿Bloquear este horario?"
        description={
          deleteTarget
            ? `El bloque ${deleteTarget.day} a las ${deleteTarget.slot} dejará de aparecer disponible para los socios.`
            : ''
        }
        confirmLabel="Sí, bloquear"
        cancelLabel="Cancelar"
        destructive
        tone="error"
        onConfirm={confirmDeleteSlot}
        onCancel={() => setDeleteTarget(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    ...Typography.title,
    color: Colors.night,
  },
  heroCard: {
    backgroundColor: Colors.brandBlue,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroHeading: {
    ...Typography.bodyMedium,
    color: Colors.surfaceWhite,
    flex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
    ...tabularNums,
  },
  heroAmount: {
    ...Typography.display,
    color: Colors.surfaceWhite,
    ...tabularNums,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white18,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  splitItem: {
    flex: 1,
    gap: 2,
  },
  splitDivider: {
    width: 1,
    height: 34,
    backgroundColor: Colors.white18,
  },
  splitLabel: {
    ...Typography.label,
    color: Colors.white75,
  },
  splitValue: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
    ...tabularNums,
  },
  gateCard: {
    backgroundColor: Colors.warningSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: 16,
    gap: 12,
  },
  gateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  gateText: {
    ...Typography.body,
    color: Colors.night,
    flex: 1,
  },
  sectionMargin: {
    marginTop: 4,
  },
  listGap: {
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 14,
  },
  slotIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBody: {
    flex: 1,
    gap: 2,
  },
  slotDay: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    ...tabularNums,
  },
  slotTime: {
    ...Typography.label,
    color: Colors.night70,
    ...tabularNums,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 8,
  },
  paymentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentConcept: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    flex: 1,
  },
  paymentMeta: {
    ...Typography.label,
    color: Colors.night70,
    ...tabularNums,
  },
  paymentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCrisp,
  },
  paymentNet: {
    ...Typography.labelSemiBold,
    color: Colors.successText,
    ...tabularNums,
  },
  paymentRefunded: {
    color: Colors.infoText,
  },
  paymentFee: {
    ...Typography.label,
    color: Colors.night70,
    ...tabularNums,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,38,0.56)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  horizontalScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  modalDaysRow: {
    gap: 8,
    alignItems: 'center',
  },
  dayOption: {
    height: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayOptionActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  dayOptionInactive: {
    backgroundColor: Colors.ice,
    borderColor: Colors.borderCrisp,
  },
  dayOptionTitle: {
    ...Typography.bodySemiBold,
  },
  dayOptionIso: {
    ...Typography.label,
  },
  optionTextActive: {
    color: Colors.surfaceWhite,
  },
  optionTextInactive: {
    color: Colors.night,
  },
  optionSubActive: {
    color: Colors.white75,
  },
  optionSubInactive: {
    color: Colors.night65,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    minWidth: 74,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourChipText: {
    ...Typography.bodySemiBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
