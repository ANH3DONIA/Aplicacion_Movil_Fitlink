import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { InitialsAvatar } from '../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { formatShortDateES, getMinutesUntilEvent } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function ClassDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const classId = typeof params.id === 'string' ? params.id : '';

  const {
    currentUser,
    classes,
    bookClass,
    joinWaitlist,
    leaveWaitlist,
    cancelClass,
    showToast,
  } = useFitLink();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    setCancelModalVisible(false);
  }, [classId]);

  const gymClass = useMemo(
    () => classes.find((c) => c.id === classId) ?? null,
    [classes, classId]
  );

  if (!gymClass) {
    return (
      <ScreenWrapper contentContainerStyle={styles.emptyWrap}>
        <EmptyState
          icon="calendar"
          title="Clase no encontrada"
          description="Es posible que esta clase haya sido actualizada o ya no esté disponible."
          actionLabel="Volver a clases"
          onActionPress={() => router.back()}
        />
      </ScreenWrapper>
    );
  }

  const memberId = currentUser?.id ?? '';
  const isEnrolled = gymClass.enrolledMemberIds.includes(memberId);
  const isWaitlisted = gymClass.waitlistMemberIds.includes(memberId);
  const enrolledCount = gymClass.enrolledMemberIds.length;
  const spotsLeft = Math.max(0, gymClass.capacity - enrolledCount);
  const isFull = spotsLeft === 0;
  const isLowSpots = spotsLeft > 0 && spotsLeft <= 2;
  const fillPercent = Math.min(100, Math.round((enrolledCount / gymClass.capacity) * 100));

  const hasValidMembership =
    currentUser?.membershipStatus === 'Activa' ||
    currentUser?.membershipStatus === 'Por vencer';
  const minutesRemaining = getMinutesUntilEvent(gymClass.day, gymClass.startTime);
  const lockedWithin2h = isEnrolled && minutesRemaining < 120;

  const handleBookOrWaitlist = () => {
    const result = isFull ? joinWaitlist(gymClass.id) : bookClass(gymClass.id);
    showToast({
      title: result.ok
        ? isFull
          ? 'En lista de espera'
          : 'Lugar reservado'
        : 'Reserva bloqueada',
      description: result.message,
      tone: result.ok ? 'success' : 'error',
    });
  };

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    const result = isWaitlisted
      ? leaveWaitlist(gymClass.id)
      : cancelClass(gymClass.id);
    showToast({
      title: result.ok ? 'Reserva actualizada' : 'Cancelación bloqueada',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  return (
    <ScreenWrapper scroll noPadding statusBarStyle="light" edges={['bottom']}>
      <View style={styles.heroHeader}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver al calendario de clases"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={18} color={Colors.surfaceWhite} />
          <Text style={styles.backText}>Clases</Text>
        </Pressable>

        <View style={styles.disciplineBadge}>
          <Text style={styles.disciplineText}>{gymClass.discipline}</Text>
        </View>

        <Text style={styles.heroTitle}>{gymClass.name}</Text>
        <Text style={[styles.heroSubtitle, tabularNums]}>
          {gymClass.room} · {gymClass.durationMinutes} min · {gymClass.calories} kcal est.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.availabilityTop}>
            <Text style={styles.cardHeading}>Cupo de la sala</Text>
            <StatusChip
              label={
                isFull
                  ? 'Cupo lleno'
                  : isLowSpots
                  ? spotsLeft === 1
                    ? 'Último lugar'
                    : `Quedan ${spotsLeft} lugares`
                  : `${spotsLeft} lugares libres`
              }
              tone={isFull ? 'error' : isLowSpots ? 'magenta' : 'success'}
              icon={isFull ? 'xCircle' : isLowSpots ? 'flame' : 'checkCircle'}
            />
          </View>

          <Text style={[styles.capacityMeta, tabularNums]}>
            {enrolledCount} de {gymClass.capacity} lugares ocupados
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${fillPercent}%`,
                  backgroundColor:
                    isFull || isLowSpots ? Colors.brandMagenta : Colors.brandBlue,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.trainerRow}>
            <InitialsAvatar name={gymClass.trainerName} size="md" tone="blue" />
            <View style={styles.trainerTextWrap}>
              <Text style={styles.detailLabel}>Entrenador asignado</Text>
              <Text style={styles.detailValue}>{gymClass.trainerName}</Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>{gymClass.description}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <AppIcon name="clock" size={20} color={Colors.brandBlue} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.detailLabel}>Fecha y horario</Text>
              <Text style={[styles.detailValue, tabularNums]}>
                {formatShortDateES(gymClass.day)} · {gymClass.startTime} – {gymClass.endTime}
              </Text>
              <Text style={[styles.detailSubNote, tabularNums]}>
                Duración: {gymClass.durationMinutes} minutos
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <AppIcon name="mapPin" size={20} color={Colors.brandBlue} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.detailLabel}>Sala</Text>
              <Text style={styles.detailValue}>{gymClass.room}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.infoSoft }]}>
              <AppIcon name="info" size={20} color={Colors.infoText} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.detailLabel}>Política de cancelación</Text>
              <Text style={styles.detailValue}>
                Hasta 2 horas antes del inicio sin penalización
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          {isEnrolled || isWaitlisted ? (
            <>
              <StatusChip
                label={
                  isEnrolled
                    ? 'Lugar reservado en esta clase'
                    : 'Anotado en lista de espera'
                }
                tone={isEnrolled ? 'success' : 'info'}
                icon={isEnrolled ? 'checkCircle' : 'clock'}
                style={styles.enrolledChip}
              />
              {lockedWithin2h ? (
                <Text style={styles.lockedWarning}>
                  Faltan menos de 2 horas para iniciar: el sistema ya no permite cancelar esta reserva.
                </Text>
              ) : null}
              <SecondaryButton
                label={isWaitlisted ? 'Salir de lista de espera' : 'Cancelar reserva'}
                variant="destructive"
                icon="xCircle"
                onPress={() => setCancelModalVisible(true)}
              />
            </>
          ) : !hasValidMembership ? (
            <>
              <View style={styles.membershipAlert}>
                <AppIcon name="alertTriangle" size={18} color={Colors.warningText} />
                <Text style={styles.membershipAlertText}>
                  Tu membresía está en estado «{currentUser?.membershipStatus ?? 'Vencida'}». Activa un plan o Pase de Día para reservar.
                </Text>
              </View>
              <PrimaryButton
                label="Activar membresía o pase"
                icon="award"
                onPress={() => router.push('/(user)/memberships')}
              />
            </>
          ) : (
            <PrimaryButton
              label={isFull ? 'Unirme a lista de espera' : 'Reservar clase'}
              icon={isFull ? 'clock' : 'calendarCheck'}
              onPress={handleBookOrWaitlist}
            />
          )}
        </View>
      </View>

      <ConfirmModal
        visible={cancelModalVisible}
        title={
          isWaitlisted ? '¿Salir de la lista de espera?' : '¿Cancelar tu reserva?'
        }
        description={
          isWaitlisted
            ? `Dejarás tu turno en la lista de espera para ${gymClass.name}.`
            : `Puedes cancelar hasta 2 horas antes del inicio de ${gymClass.name}.`
        }
        confirmLabel={isWaitlisted ? 'Sí, salir' : 'Confirmar cancelación'}
        cancelLabel="Mantener lugar"
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  heroHeader: {
    backgroundColor: Colors.night,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white18,
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: 12,
    gap: 8,
    marginBottom: 4,
  },
  backText: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  disciplineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brandBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  disciplineText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
  },
  heroTitle: {
    ...Typography.title,
    color: Colors.surfaceWhite,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.white75,
  },
  body: {
    padding: 24,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 12,
  },
  availabilityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardHeading: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  capacityMeta: {
    ...Typography.body,
    color: Colors.night70,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.blueSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trainerTextWrap: {
    flex: 1,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.night70,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    ...Typography.labelSemiBold,
    color: Colors.night65,
  },
  detailValue: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  detailSubNote: {
    ...Typography.label,
    color: Colors.night70,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderCrisp,
  },
  ctaWrap: {
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  enrolledChip: {
    alignSelf: 'center',
  },
  lockedWarning: {
    ...Typography.labelSemiBold,
    color: Colors.warningText,
    textAlign: 'center',
  },
  membershipAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.warningSoft,
    borderRadius: 12,
    padding: 12,
  },
  membershipAlertText: {
    ...Typography.body,
    color: Colors.warningText,
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
