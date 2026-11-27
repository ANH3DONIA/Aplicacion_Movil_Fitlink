import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';
import { SessionRequest } from '../../../types/fitlink';

export default function TrainerRequestsScreen() {
  const {
    currentUser,
    trainers,
    sessions,
    acceptSession,
    rejectSession,
    cancelSessionByTrainer,
    showToast,
  } = useFitLink();

  const [rejectTarget, setRejectTarget] = useState<SessionRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SessionRequest | null>(null);

  const trainer = useMemo(() => {
    return trainers.find((t) => t.id === currentUser?.trainerId) ?? trainers[0];
  }, [trainers, currentUser?.trainerId]);

  const trainerId = trainer?.id ?? 'tr-01';

  const pendingRequests = useMemo(() => {
    return sessions.filter((s) => s.trainerId === trainerId && s.status === 'Pendiente');
  }, [sessions, trainerId]);

  const activeSessions = useMemo(() => {
    return sessions.filter(
      (s) => s.trainerId === trainerId && (s.status === 'Aceptada' || s.status === 'Confirmada')
    );
  }, [sessions, trainerId]);

  const handleAccept = (session: SessionRequest) => {
    const result = acceptSession(session.id);
    showToast({
      title: result.ok ? 'Solicitud aceptada' : 'No se pudo aceptar',
      description: result.ok
        ? `${session.memberName} tiene 12 h para completar su pago.`
        : result.message,
      tone: result.ok ? 'success' : 'error',
    });
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const result = rejectSession(rejectTarget.id);
    setRejectTarget(null);
    showToast({
      title: result.ok ? 'Solicitud rechazada' : 'Error',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  const confirmTrainerCancel = () => {
    if (!cancelTarget) return;
    const result = cancelSessionByTrainer(cancelTarget.id);
    setCancelTarget(null);
    showToast({
      title: result.ok ? 'Sesión cancelada' : 'Error',
      description: result.message,
      tone: result.ok ? 'info' : 'error',
    });
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Solicitudes 1-a-1</Text>

      <SectionHeader title={`Pendientes (${pendingRequests.length})`} />

      {pendingRequests.length === 0 ? (
        <EmptyState
          icon="checkCircle"
          title="Sin solicitudes pendientes"
          description="Cuando un socio solicite un espacio 1-a-1 aparecerá aquí para confirmar."
        />
      ) : (
        <View style={styles.listGap}>
          {pendingRequests.map((req, index) => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardTop}>
                <InitialsAvatar name={req.memberName} size="md" tone="blue" />
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {req.memberName}
                  </Text>
                  <Text style={styles.serviceMeta} numberOfLines={1}>
                    {req.service}
                  </Text>
                </View>
                <StatusChip label="Pendiente" tone="magenta" icon="clock" />
              </View>

              <View style={styles.detailBox}>
                <Text style={[styles.detailText, tabularNums]}>
                  {formatShortDateES(req.day)} ({req.day}) · {req.slot}
                </Text>
                <Text style={[styles.netAmount, tabularNums]}>
                  Tu ganancia neta (90%): ${req.netTrainerMxn} MXN
                </Text>
              </View>

              <View style={styles.actionsRow}>
                {index === 0 ? (
                  <PrimaryButton
                    label="Aceptar"
                    icon="check"
                    onPress={() => handleAccept(req)}
                    style={styles.actionFlex}
                  />
                ) : (
                  <SecondaryButton
                    label="Aceptar"
                    variant="solid"
                    icon="check"
                    onPress={() => handleAccept(req)}
                    style={styles.actionFlex}
                  />
                )}
                <SecondaryButton
                  label="Rechazar"
                  variant="destructive"
                  icon="x"
                  onPress={() => setRejectTarget(req)}
                  style={styles.actionFlex}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <SectionHeader
        title={`Aceptadas y confirmadas (${activeSessions.length})`}
        style={styles.sectionMargin}
      />

      {activeSessions.length === 0 ? (
        <EmptyState
          icon="calendarCheck"
          title="Sin sesiones activas"
          description="Las solicitudes aceptadas y pagadas aparecerán aquí."
        />
      ) : (
        <View style={styles.listGap}>
          {activeSessions.map((session) => {
            const isConfirmed = session.status === 'Confirmada';
            return (
              <View key={session.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <InitialsAvatar name={session.memberName} size="sm" tone="soft" />
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {session.memberName}
                    </Text>
                    <Text style={[styles.serviceMeta, tabularNums]}>
                      {formatShortDateES(session.day)} · {session.slot} · {session.service}
                    </Text>
                  </View>
                  <StatusChip
                    label={isConfirmed ? 'Pagada' : 'Falta pago'}
                    tone={isConfirmed ? 'success' : 'info'}
                    icon={isConfirmed ? 'checkCircle' : 'clock'}
                  />
                </View>

                <View style={styles.confirmedBottom}>
                  <Text style={[styles.netLabel, tabularNums]}>
                    Neto 90%: ${session.netTrainerMxn} MXN
                  </Text>
                  <SecondaryButton
                    label="Cancelar sesión"
                    variant="outline"
                    onPress={() => setCancelTarget(session)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ConfirmModal
        visible={rejectTarget !== null}
        title="¿Rechazar solicitud?"
        description={
          rejectTarget
            ? `Se avisará a ${rejectTarget.memberName} que el horario ${rejectTarget.day} · ${rejectTarget.slot} no está disponible.`
            : ''
        }
        confirmLabel="Sí, rechazar"
        cancelLabel="Volver"
        destructive
        tone="error"
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmModal
        visible={cancelTarget !== null}
        title="¿Cancelar sesión 1-a-1?"
        description={
          cancelTarget?.status === 'Confirmada'
            ? `Cuando el entrenador cancela una sesión confirmada, ${cancelTarget.memberName} recibe el reembolso total del 100% ($${cancelTarget.grossMxn} MXN) en su tarjeta.`
            : `Se cancelará el horario reservado para ${cancelTarget?.memberName ?? 'el socio'} y se enviará notificación.`
        }
        confirmLabel="Confirmar cancelación"
        cancelLabel="Mantener"
        destructive
        tone="error"
        onConfirm={confirmTrainerCancel}
        onCancel={() => setCancelTarget(null)}
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
  sectionMargin: {
    marginTop: 8,
  },
  listGap: {
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  serviceMeta: {
    ...Typography.label,
    color: Colors.night70,
  },
  detailBox: {
    backgroundColor: Colors.ice,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 12,
    gap: 4,
  },
  detailText: {
    ...Typography.bodyMedium,
    color: Colors.night,
  },
  netAmount: {
    ...Typography.labelSemiBold,
    color: Colors.successText,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionFlex: {
    flex: 1,
  },
  confirmedBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCrisp,
  },
  netLabel: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
});
