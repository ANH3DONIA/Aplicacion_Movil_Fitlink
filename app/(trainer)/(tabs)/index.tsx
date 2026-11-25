import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { ClassCard } from '../../../components/ui/ClassCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES, getLocalISODate } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';

type AgendaScope = 'today' | 'week';

function formatTodayHeader(): string {
  const now = new Date();
  const formatted = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function TrainerAgendaScreen() {
  const router = useRouter();
  const { currentUser, trainers, classes, sessions, notifications } = useFitLink();
  const [scope, setScope] = useState<AgendaScope>('today');
  const [refreshing, setRefreshing] = useState(false);

  const todayIso = useMemo(() => getLocalISODate(0), []);
  const todayLabel = useMemo(() => formatTodayHeader(), []);

  const trainer = useMemo(() => {
    return (
      trainers.find((t) => t.id === currentUser?.trainerId) ??
      trainers[0]
    );
  }, [trainers, currentUser?.trainerId]);

  const trainerId = trainer?.id ?? 'tr-01';

  const allTrainerClasses = useMemo(() => {
    return classes
      .filter((c) => c.trainerId === trainerId && c.day >= todayIso)
      .sort((a, b) => `${a.day} ${a.startTime}`.localeCompare(`${b.day} ${b.startTime}`));
  }, [classes, trainerId, todayIso]);

  const todayClasses = useMemo(() => {
    return allTrainerClasses.filter((c) => c.day === todayIso);
  }, [allTrainerClasses, todayIso]);

  const visibleClasses = scope === 'today' ? todayClasses : allTrainerClasses;
  const heroClass = visibleClasses[0] ?? null;
  const remainingClasses = visibleClasses.slice(1);

  const allActiveSessions = useMemo(() => {
    return sessions
      .filter(
        (s) =>
          s.trainerId === trainerId &&
          s.day >= todayIso &&
          (s.status === 'Confirmada' || s.status === 'Aceptada')
      )
      .sort((a, b) => `${a.day} ${a.slot}`.localeCompare(`${b.day} ${b.slot}`));
  }, [sessions, trainerId, todayIso]);

  const visibleSessions = useMemo(() => {
    return scope === 'today'
      ? allActiveSessions.filter((s) => s.day === todayIso)
      : allActiveSessions;
  }, [allActiveSessions, scope, todayIso]);

  const confirmedSessionsCount = useMemo(() => {
    return sessions.filter(
      (s) => s.trainerId === trainerId && s.status === 'Confirmada'
    ).length;
  }, [sessions, trainerId]);

  const pendingRequestsCount = useMemo(() => {
    return sessions.filter(
      (s) => s.trainerId === trainerId && s.status === 'Pendiente'
    ).length;
  }, [sessions, trainerId]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => n.role === 'entrenador' && !n.read).length;
  }, [notifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  };

  const openAttendance = (classId: string) => {
    router.push({
      pathname: '/(trainer)/(tabs)/attendance',
      params: { classId },
    });
  };

  return (
    <ScreenWrapper
      scroll
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.push('/(trainer)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil profesional"
          style={({ pressed }) => [styles.profileTrigger, pressed && styles.pressed]}
        >
          <View style={styles.avatarWrap}>
            <InitialsAvatar
              name={trainer?.name ?? currentUser?.name ?? 'Coach'}
              size="md"
              tone="blue"
            />
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: trainer?.stripeConnected
                    ? Colors.success
                    : Colors.warning,
                },
              ]}
            />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting} numberOfLines={1}>
              {trainer?.name ?? currentUser?.name ?? 'Coach FitLink'}
            </Text>
            <Text style={styles.dateText} numberOfLines={1}>
              {todayLabel} · Perfil y cobros
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(trainer)/notifications')}
          accessibilityRole="button"
          accessibilityLabel={
            unreadNotificationsCount > 0
              ? `Notificaciones, ${unreadNotificationsCount} sin leer`
              : 'Notificaciones'
          }
          style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
        >
          <AppIcon name="bell" size={20} color={Colors.night} />
          {unreadNotificationsCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {!trainer?.stripeConnected ? (
        <View style={styles.connectBanner}>
          <View style={styles.connectBannerRow}>
            <AppIcon name="alertTriangle" size={18} color={Colors.warningText} />
            <Text style={styles.connectBannerText}>
              Vincula tu cuenta Stripe Connect Express para habilitar horarios 1-a-1 (RF-047).
            </Text>
          </View>
          <SecondaryButton
            label="Vincular cuenta de cobros"
            variant="solid"
            icon="link"
            onPress={() => router.push('/(trainer)/profile')}
          />
        </View>
      ) : null}

      <View style={styles.kpiStrip}>
        <View style={styles.kpiCell}>
          <Text style={[styles.kpiValue, { color: Colors.brandBlue }]}>
            {todayClasses.length}
          </Text>
          <Text style={styles.kpiLabel}>Clases hoy</Text>
        </View>

        <View style={styles.kpiDivider} />

        <View style={styles.kpiCell}>
          <Text style={[styles.kpiValue, { color: Colors.night }]}>
            {confirmedSessionsCount}
          </Text>
          <Text style={styles.kpiLabel}>Confirmadas</Text>
        </View>

        <View style={styles.kpiDivider} />

        <Pressable
          onPress={() => router.push('/(trainer)/(tabs)/requests')}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${pendingRequestsCount} solicitudes pendientes`}
          style={({ pressed }) => [styles.kpiCell, pressed && styles.pressed]}
        >
          <Text style={[styles.kpiValue, { color: Colors.brandMagenta }]}>
            {pendingRequestsCount}
          </Text>
          <Text style={styles.kpiLabel}>Solicitudes</Text>
        </Pressable>
      </View>

      <View style={styles.scopeSwitch} accessibilityRole="tablist">
        <Pressable
          onPress={() => setScope('today')}
          accessibilityRole="tab"
          accessibilityState={{ selected: scope === 'today' }}
          style={[styles.scopeBtn, scope === 'today' && styles.scopeBtnActive]}
        >
          <Text style={[styles.scopeText, scope === 'today' && styles.scopeTextActive]}>
            Agenda de hoy
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setScope('week')}
          accessibilityRole="tab"
          accessibilityState={{ selected: scope === 'week' }}
          style={[styles.scopeBtn, scope === 'week' && styles.scopeBtnActive]}
        >
          <Text style={[styles.scopeText, scope === 'week' && styles.scopeTextActive]}>
            Toda la semana
          </Text>
        </Pressable>
      </View>

      <SectionHeader
        title={scope === 'today' ? 'Clases asignadas hoy' : 'Clases de la semana'}
      />

      {heroClass ? (
        <ClassCard
          gymClass={heroClass}
          variant="hero"
          heroBadgeLabel={scope === 'today' ? 'Próxima clase hoy' : 'Próxima clase'}
          actionLabel="Pasar lista"
          onActionPress={() => openAttendance(heroClass.id)}
          onPress={() => openAttendance(heroClass.id)}
        />
      ) : (
        <EmptyState
          icon="calendar"
          title={scope === 'today' ? 'Sin clases grupales hoy' : 'Sin clases esta semana'}
          description="Cambia a la vista semanal o revisa tus solicitudes personales 1-a-1."
        />
      )}

      {remainingClasses.length > 0 && (
        <View style={styles.listGap}>
          {remainingClasses.map((gymClass) => (
            <ClassCard
              key={gymClass.id}
              gymClass={gymClass}
              onPress={() => openAttendance(gymClass.id)}
            />
          ))}
        </View>
      )}

      <SectionHeader
        title={scope === 'today' ? 'Sesiones 1-a-1 de hoy' : 'Sesiones 1-a-1 de la semana'}
        actionLabel="Solicitudes"
        onActionPress={() => router.push('/(trainer)/(tabs)/requests')}
        style={styles.sectionHeader}
      />

      {visibleSessions.length > 0 ? (
        <View style={styles.listGap}>
          {visibleSessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => router.push('/(trainer)/(tabs)/requests')}
              accessibilityRole="button"
              accessibilityLabel={`Sesión con ${session.memberName} a las ${session.slot}`}
              style={({ pressed }) => [styles.sessionCard, pressed && styles.pressed]}
            >
              <InitialsAvatar name={session.memberName} size="md" tone="soft" />
              <View style={styles.sessionBody}>
                <View style={styles.sessionTopRow}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {session.memberName}
                  </Text>
                  <StatusChip
                    label={session.status === 'Confirmada' ? 'Confirmada' : 'Falta pago'}
                    tone={session.status === 'Confirmada' ? 'success' : 'info'}
                    icon={session.status === 'Confirmada' ? 'checkCircle' : 'clock'}
                  />
                </View>
                <Text style={styles.sessionService} numberOfLines={1}>
                  {session.service}
                </Text>
                <View style={styles.sessionBottomRow}>
                  <Text style={[styles.sessionMeta, tabularNums]}>
                    {formatShortDateES(session.day)} · {session.slot}
                  </Text>
                  <Text style={[styles.sessionPayout, tabularNums]}>
                    Neto 90%: ${session.netTrainerMxn} MXN
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="clock"
          title={scope === 'today' ? 'Sin sesiones 1-a-1 hoy' : 'Sin sesiones en la semana'}
          description="Las sesiones aceptadas o confirmadas aparecerán aquí en orden cronológico."
          actionLabel="Ver solicitudes"
          onActionPress={() => router.push('/(trainer)/(tabs)/requests')}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 14,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  avatarWrap: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.ice,
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  dateText: {
    ...Typography.label,
    color: Colors.night70,
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.magentaSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    ...Typography.labelSemiBold,
    color: Colors.magentaDark,
    ...tabularNums,
  },
  connectBanner: {
    backgroundColor: Colors.warningSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: 14,
    gap: 10,
  },
  connectBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  connectBannerText: {
    ...Typography.body,
    color: Colors.night,
    flex: 1,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    overflow: 'hidden',
  },
  kpiCell: {
    flex: 1,
    minHeight: 68,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  kpiDivider: {
    width: 1,
    backgroundColor: Colors.borderCrisp,
  },
  kpiValue: {
    ...Typography.title,
    ...tabularNums,
  },
  kpiLabel: {
    ...Typography.label,
    color: Colors.night70,
  },
  scopeSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 4,
    gap: 4,
  },
  scopeBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeBtnActive: {
    backgroundColor: Colors.brandBlue,
  },
  scopeText: {
    ...Typography.bodySemiBold,
    color: Colors.night70,
  },
  scopeTextActive: {
    color: Colors.surfaceWhite,
  },
  sectionHeader: {
    marginTop: 4,
  },
  listGap: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
  },
  sessionBody: {
    flex: 1,
    gap: 4,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionName: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    flex: 1,
  },
  sessionService: {
    ...Typography.body,
    color: Colors.night70,
  },
  sessionBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionMeta: {
    ...Typography.label,
    color: Colors.night65,
  },
  sessionPayout: {
    ...Typography.labelSemiBold,
    color: Colors.successText,
  },
  pressed: {
    opacity: 0.84,
  },
});
