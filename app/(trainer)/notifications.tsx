import { Href, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { NotificationCard } from '../../components/ui/NotificationCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { AppNotification, NotificationGroup } from '../../types/fitlink';

const GROUPS: NotificationGroup[] = ['Hoy', 'Esta semana', 'Anteriores'];

export default function TrainerNotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead, showToast } = useFitLink();

  const trainerNotifications = useMemo(() => {
    return notifications.filter((n) => n.role === 'entrenador');
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return trainerNotifications.filter((n) => !n.read).length;
  }, [trainerNotifications]);

  const grouped = useMemo(() => {
    return GROUPS.map((group) => ({
      group,
      items: trainerNotifications.filter((n) => n.group === group),
    })).filter((section) => section.items.length > 0);
  }, [trainerNotifications]);

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    markAllNotificationsRead('entrenador');
    showToast({
      title: 'Notificaciones al día',
      description: 'Se marcaron todas como leídas.',
      tone: 'success',
    });
  };

  const handleNotificationPress = (item: AppNotification) => {
    if (!item.read) {
      markNotificationRead(item.id);
    }
    if (item.targetRoute) {
      router.push(item.targetRoute as Href);
    }
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>

        <Text style={styles.topTitle}>Notificaciones</Text>

        {unreadCount > 0 ? (
          <Pressable
            onPress={handleMarkAll}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como leídas"
            style={({ pressed }) => [styles.markAllBtn, pressed && styles.pressed]}
          >
            <Text style={styles.markAllText}>Leer todas</Text>
          </Pressable>
        ) : null}
      </View>

      {grouped.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Sin notificaciones"
          description="Aquí verás nuevas solicitudes 1-a-1, pagos confirmados y avisos de tus clases."
        />
      ) : (
        grouped.map((section) => (
          <View key={section.group} style={styles.groupWrap}>
            <SectionHeader title={section.group} />
            <View style={styles.listGap}>
              {section.items.map((item) => (
                <NotificationCard
                  key={item.id}
                  notification={item}
                  onPress={() => handleNotificationPress(item)}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...Typography.title,
    color: Colors.night,
    flex: 1,
  },
  markAllBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  markAllText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
  groupWrap: {
    gap: 12,
  },
  listGap: {
    gap: 10,
  },
  pressed: {
    opacity: 0.85,
  },
});
