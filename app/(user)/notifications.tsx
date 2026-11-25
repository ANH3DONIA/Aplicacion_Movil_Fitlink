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

export default function UserNotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    showToast,
  } = useFitLink();

  const userNotifications = useMemo(
    () => notifications.filter((n) => n.role === 'usuario'),
    [notifications]
  );

  const unreadCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications]
  );

  const handleMarkAll = () => {
    markAllNotificationsRead('usuario');
    showToast({
      title: 'Notificaciones al día',
      description: 'Se marcaron todas como leídas.',
      tone: 'info',
    });
  };

  const handlePressNotification = (item: AppNotification) => {
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
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>

        <Text style={styles.title}>Notificaciones</Text>

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

      {userNotifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Sin notificaciones"
          description="Aquí recibirás avisos de tus clases, lista de espera, sesiones 1-a-1 y pagos."
        />
      ) : (
        <View style={styles.groupsGap}>
          {GROUPS.map((group) => {
            const items = userNotifications.filter((n) => n.group === group);
            if (items.length === 0) return null;
            return (
              <View key={group} style={styles.groupSection}>
                <SectionHeader title={group} />
                <View style={styles.cardsGap}>
                  {items.map((item) => (
                    <NotificationCard
                      key={item.id}
                      notification={item}
                      onPress={() => handlePressNotification(item)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.title,
    color: Colors.night,
    flex: 1,
  },
  markAllBtn: {
    minHeight: 48,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  markAllText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
  groupsGap: {
    gap: 20,
  },
  groupSection: {
    gap: 12,
  },
  cardsGap: {
    gap: 10,
  },
  pressed: {
    opacity: 0.8,
  },
});
