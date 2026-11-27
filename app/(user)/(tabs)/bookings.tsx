import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES, getLocalISODate, getMinutesUntilEvent } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';
import { GymClass, SessionRequest } from '../../../types/fitlink';

type SegmentKey = 'upcoming' | 'history';

export default function UserBookingsScreen() {
  const router = useRouter();
  const {
    currentUser,
    classes,
    sessions,
    cancelClass,
    leaveWaitlist,
    cancelSessionByUser,
    showToast,
  } = useFitLink();

  const [segment, setSegment] = useState<SegmentKey>('upcoming');
  const [cancelClassTarget, setCancelClassTarget] = useState<{
    gymClass: GymClass;
    isWaitlist: boolean;
  } | null>(null);
  const [cancelSessionTarget, setCancelSessionTarget] = useState<SessionRequest | null>(null);

  const memberId = currentUser?.id ?? '';
  const todayISO = getLocalISODate(0);

  const { upcomingClasses, historyClasses } = useMemo(() => {
    const mine = classes.filter(
      (c) =>
        c.enrolledMemberIds.includes(memberId) ||
        c.waitlistMemberIds.includes(memberId)
    );
    return {
      upcomingClasses: mine.filter((c) => c.day >= todayISO),
      historyClasses: mine.filter((c) => c.day < todayISO),
    };
  }, [classes, memberId, todayISO]);

  const { upcomingSessions, historySessions } = useMemo(() => {
    const mine = sessions.filter((s) => s.memberId === memberId);
    return {
      upcomingSessions: mine.filter(
        (s) => s.status === 'Pendiente' || s.status === 'Aceptada' || s.status === 'Confirmada'
      ),
      historySessions: mine.filter(
        (s) => s.status === 'Rechazada' || s.status === 'Cancelada' || s.status === 'Expirada'
      ),
    };
  }, [sessions, memberId]);

  const firstAcceptedSession = useMemo(
    () => upcomingSessions.find((s) => s.status === 'Aceptada') ?? null,
    [upcomingSessions]
  );

  const handleConfirmClassCancel = () => {
    if (!cancelClassTarget) return;
    const result = cancelClassTarget.isWaitlist
      ? leaveWaitlist(cancelClassTarget.gymClass.id)
      : cancelClass(cancelClassTarget.gymClass.id);
    setCancelClassTarget(null);
    showToast({
      title: result.ok ? 'Reserva actualizada' : 'Cancelación bloqueada',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  const handleConfirmSessionCancel = () => {
    if (!cancelSessionTarget) return;
    const result = cancelSessionByUser(cancelSessionTarget.id);
    setCancelSessionTarget(null);
    showToast({
      title: result.ok ? 'Sesión cancelada' : 'No se pudo cancelar',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  const renderSessionStatus = (status: SessionRequest['status']) => {
    switch (status) {
      case 'Pendiente':
        return <StatusChip label="Pendiente de respuesta" tone="warning" icon="clock" />;
      case 'Aceptada':
        return <StatusChip label="Aceptada · Falta pago" tone="info" icon="creditCard" />;
      case 'Confirmada':
        return <StatusChip label="Confirmada" tone="success" icon="checkCircle" />;
      case 'Rechazada':
        return <StatusChip label="Rechazada" tone="error" icon="xCircle" />;
      case 'Cancelada':
        return <StatusChip label="Cancelada" tone="neutral" icon="ban" />;
      case 'Expirada':
        return <StatusChip label="Expirada" tone="error" icon="clock" />;
    }
  };

  const activeClasses = segment === 'upcoming' ? upcomingClasses : historyClasses;
  const activeSessions = segment === 'upcoming' ? upcomingSessions : historySessions;
  const isEmpty = activeClasses.length === 0 && activeSessions.length === 0;

  const sessionCancelMinutes = cancelSessionTarget
    ? getMinutesUntilEvent(cancelSessionTarget.day, cancelSessionTarget.slot)
    : 0;
  const sessionHasFullRefund =
    cancelSessionTarget?.status === 'Confirmada' && sessionCancelMinutes >= 720;

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis reservas</Text>

      <View style={styles.segmentContainer} accessibilityRole="tablist">
        <Pressable
          onPress={() => setSegment('upcoming')}
          accessibilityRole="tab"
          accessibilityState={{ selected: segment === 'upcoming' }}
          style={[
            styles.segmentButton,
            segment === 'upcoming' && styles.segmentButtonActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              tabularNums,
              segment === 'upcoming' && styles.segmentTextActive,
            ]}
          >
            Próximas ({upcomingClasses.length + upcomingSessions.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('history')}
          accessibilityRole="tab"
          accessibilityState={{ selected: segment === 'history' }}
          style={[
            styles.segmentButton,
            segment === 'history' && styles.segmentButtonActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              tabularNums,
              segment === 'history' && styles.segmentTextActive,
            ]}
          >
            Historial ({historyClasses.length + historySessions.length})
          </Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <EmptyState
          icon="calendarCheck"
          title={
            segment === 'upcoming'
              ? 'Aún no tienes reservas'
              : 'Sin historial todavía'
          }
          description={
            segment === 'upcoming'
              ? 'Explora el calendario de clases o agenda una sesión personal 1-a-1.'
              : 'Aquí verás tus clases pasadas y sesiones finalizadas o canceladas.'
          }
          actionLabel={segment === 'upcoming' ? 'Explorar clases' : undefined}
          onActionPress={
            segment === 'upcoming'
              ? () => router.push('/(user)/(tabs)')
              : undefined
          }
        />
      ) : (
        <View style={styles.sectionsGap}>
          {activeClasses.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Clases grupales" />
              <View style={styles.cardsGap}>
                {activeClasses.map((item) => {
                  const isWaitlist = item.waitlistMemberIds.includes(memberId);
                  const minsLeft = getMinutesUntilEvent(item.day, item.startTime);
                  const lockedBy2h = !isWaitlist && minsLeft < 120;

                  return (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardTitleWrap}>
                          <Text style={styles.cardTitle}>{item.name}</Text>
                          <Text style={[styles.cardMeta, tabularNums]}>
                            {formatShortDateES(item.day)} · {item.startTime} – {item.endTime} · {item.room}
                          </Text>
                        </View>
                        <StatusChip
                          label={isWaitlist ? 'Lista de espera' : 'Confirmada'}
                          tone={isWaitlist ? 'info' : 'success'}
                          icon={isWaitlist ? 'clock' : 'checkCircle'}
                        />
                      </View>

                      <View style={styles.detailRow}>
                        <AppIcon name="user" size={16} color={Colors.night65} />
                        <Text style={styles.detailText}>Coach {item.trainerName}</Text>
                      </View>

                      {segment === 'upcoming' && lockedBy2h ? (
                        <Text style={styles.lockNote}>
                          Inicia en menos de 2 h: ya no es posible cancelar.
                        </Text>
                      ) : null}

                      {segment === 'upcoming' ? (
                        <View style={styles.cardActions}>
                          <SecondaryButton
                            label="Ver detalle"
                            variant="outline"
                            onPress={() =>
                              router.push(`/(user)/class-detail?id=${item.id}`)
                            }
                            style={styles.flexButton}
                          />
                          <SecondaryButton
                            label={isWaitlist ? 'Salir de lista' : 'Cancelar'}
                            variant="destructive"
                            onPress={() =>
                              setCancelClassTarget({ gymClass: item, isWaitlist })
                            }
                            style={styles.flexButton}
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {activeSessions.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Sesiones personales 1-a-1" />
              <View style={styles.cardsGap}>
                {activeSessions.map((session) => {
                  const isPrimaryPay =
                    segment === 'upcoming' &&
                    firstAcceptedSession?.id === session.id;
                  return (
                    <View key={session.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardTitleWrap}>
                          <Text style={styles.cardTitle}>{session.service}</Text>
                          <Text style={[styles.cardMeta, tabularNums]}>
                            {session.trainerName} · {formatShortDateES(session.day)} · {session.slot}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.sessionStatusRow}>
                        {renderSessionStatus(session.status)}
                        <Text style={[styles.priceText, tabularNums]}>
                          ${session.grossMxn.toLocaleString('es-MX')} MXN
                        </Text>
                      </View>

                      {session.cancelReason ? (
                        <Text style={styles.lockNote}>{session.cancelReason}</Text>
                      ) : null}

                      {segment === 'upcoming' ? (
                        <View style={styles.sessionActionsStack}>
                          {session.status === 'Aceptada' ? (
                            isPrimaryPay ? (
                              <PrimaryButton
                                label="Completar pago"
                                icon="creditCard"
                                onPress={() =>
                                  router.push(`/(user)/checkout?sessionId=${session.id}`)
                                }
                              />
                            ) : (
                              <SecondaryButton
                                label="Completar pago"
                                variant="solid"
                                icon="creditCard"
                                onPress={() =>
                                  router.push(`/(user)/checkout?sessionId=${session.id}`)
                                }
                              />
                            )
                          ) : null}

                          <SecondaryButton
                            label="Cancelar sesión"
                            variant="outline"
                            onPress={() => setCancelSessionTarget(session)}
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      )}

      <ConfirmModal
        visible={cancelClassTarget !== null}
        title={
          cancelClassTarget?.isWaitlist
            ? '¿Salir de la lista de espera?'
            : '¿Cancelar reserva de clase?'
        }
        description={
          cancelClassTarget?.isWaitlist
            ? `Dejarás tu turno en la lista de espera para ${cancelClassTarget.gymClass.name}.`
            : `Solo es posible cancelar hasta 2 horas antes del inicio de ${cancelClassTarget?.gymClass.name ?? 'la clase'}.`
        }
        confirmLabel={cancelClassTarget?.isWaitlist ? 'Sí, salir' : 'Confirmar cancelación'}
        cancelLabel="Volver"
        destructive
        onConfirm={handleConfirmClassCancel}
        onCancel={() => setCancelClassTarget(null)}
      />

      <ConfirmModal
        visible={cancelSessionTarget !== null}
        title="¿Cancelar sesión 1-a-1?"
        description={
          cancelSessionTarget?.status === 'Confirmada'
            ? sessionHasFullRefund
              ? `Faltan 12 horas o más para tu sesión con ${cancelSessionTarget.trainerName}. Recibirás el reembolso total de $${cancelSessionTarget.grossMxn} MXN en tu tarjeta.`
              : `Faltan menos de 12 horas para la sesión. Si cancelas ahora no aplica reembolso y el entrenador conserva su parte.`
            : `Se cancelará tu solicitud de horario con ${cancelSessionTarget?.trainerName ?? 'el entrenador'} sin cargo.`
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantener"
        destructive
        onConfirm={handleConfirmSessionCancel}
        onCancel={() => setCancelSessionTarget(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    ...Typography.title,
    color: Colors.night,
    marginBottom: 14,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  segmentButtonActive: {
    backgroundColor: Colors.brandBlue,
  },
  segmentText: {
    ...Typography.bodySemiBold,
    color: Colors.night70,
  },
  segmentTextActive: {
    color: Colors.surfaceWhite,
  },
  sectionsGap: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  cardsGap: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  cardMeta: {
    ...Typography.label,
    color: Colors.night65,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...Typography.body,
    color: Colors.night70,
    flex: 1,
  },
  lockNote: {
    ...Typography.labelSemiBold,
    color: Colors.warningText,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  sessionActionsStack: {
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  sessionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceText: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
});
