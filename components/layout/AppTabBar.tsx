import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { UserRole } from '../../types/fitlink';
import { AppIcon, AppIconName } from '../ui/AppIcon';

export interface TabRouteItem {
  key: string;
  name: string;
  params?: object;
}

export interface TabBarNavigationProps {
  state: {
    index: number;
    routes: TabRouteItem[];
  };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

export interface AppTabBarProps extends TabBarNavigationProps {
  role: UserRole;
}

interface TabMeta {
  label: string;
  icon: AppIconName;
}

const USER_TABS: Record<string, TabMeta> = {
  index: { label: 'Inicio', icon: 'home' },
  bookings: { label: 'Reservas', icon: 'calendar' },
  coaches: { label: 'Coaches', icon: 'users' },
  profile: { label: 'Perfil', icon: 'user' },
};

const TRAINER_TABS: Record<string, TabMeta> = {
  index: { label: 'Agenda', icon: 'calendar' },
  attendance: { label: 'Asistencia', icon: 'userCheck' },
  requests: { label: 'Solicitudes', icon: 'sparkles' },
  payments: { label: 'Cobros', icon: 'wallet' },
};

export function AppTabBar({ state, navigation, role }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { sessions, currentUser } = useFitLink();

  const tabMap = role === 'usuario' ? USER_TABS : TRAINER_TABS;

  const pendingBadgeCount =
    role === 'entrenador'
      ? sessions.filter(
          (s) =>
            s.status === 'Pendiente' &&
            (!currentUser?.trainerId || s.trainerId === currentUser.trainerId)
        ).length
      : sessions.filter(
          (s) => s.status === 'Aceptada' && s.memberId === currentUser?.id
        ).length;

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const meta = tabMap[route.name];
        if (!meta) return null;

        const isFocused = state.index === index;
        const showBadge =
          pendingBadgeCount > 0 &&
          ((role === 'entrenador' && route.name === 'requests') ||
            (role === 'usuario' && route.name === 'bookings'));

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync().catch(() => {});
            }
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={
              showBadge ? `${meta.label}, ${pendingBadgeCount} pendientes` : meta.label
            }
            accessibilityState={{ selected: isFocused }}
            style={({ pressed }) => [styles.tabItem, pressed && styles.tabPressed]}
          >
            <View style={[styles.topIndicator, isFocused && styles.topIndicatorActive]} />

            <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
              <AppIcon
                name={meta.icon}
                size={20}
                color={isFocused ? Colors.brandBlue : Colors.night65}
                strokeWidth={isFocused ? 2.3 : 1.9}
              />
              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, tabularNums]}>
                    {pendingBadgeCount > 9 ? '9+' : String(pendingBadgeCount)}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.label,
                isFocused ? styles.labelActive : styles.labelInactive,
              ]}
              numberOfLines={1}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCrisp,
    minHeight: 64,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 56,
    minWidth: 48,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.78,
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: 'transparent',
  },
  topIndicatorActive: {
    backgroundColor: Colors.brandBlue,
  },
  iconPill: {
    minWidth: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconPillActive: {
    backgroundColor: Colors.blueSoft,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.magentaSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceWhite,
  },
  badgeText: {
    ...Typography.labelSemiBold,
    color: Colors.magentaDark,
  },
  label: {
    ...Typography.label,
  },
  labelActive: {
    ...Typography.labelSemiBold,
    color: Colors.brandBlue,
  },
  labelInactive: {
    color: Colors.night65,
  },
});
