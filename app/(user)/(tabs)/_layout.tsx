import { Tabs } from 'expo-router';
import React from 'react';
import { AppTabBar } from '../../../components/layout/AppTabBar';

export default function UserTabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <AppTabBar
          state={props.state}
          navigation={{
            emit: (event) =>
              props.emitter.emit({
                type: 'tabPress',
                target: event.target,
                canPreventDefault: true,
              }),
            navigate: (name) => {
              const route = props.state.routes.find((r) => r.name === name);
              if (route) {
                props.navigateToTab(route.key);
              }
            },
          }}
          role="usuario"
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Reservas' }} />
      <Tabs.Screen name="coaches" options={{ title: 'Coaches' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
