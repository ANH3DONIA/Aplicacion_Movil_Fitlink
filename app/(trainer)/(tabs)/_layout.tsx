import { Tabs } from 'expo-router';
import React from 'react';
import { AppTabBar } from '../../../components/layout/AppTabBar';

export default function TrainerTabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const nav = (props as unknown as {
          navigation?: {
            emit: (event: {
              type: 'tabPress';
              target: string;
              canPreventDefault: boolean;
            }) => { defaultPrevented?: boolean };
            navigate: (name: string, params?: object) => void;
          };
        }).navigation ?? {
          emit: (event: {
            type: 'tabPress';
            target: string;
            canPreventDefault: boolean;
          }) =>
            props.emitter.emit({
              type: 'tabPress',
              target: event.target,
              canPreventDefault: true,
            }),
          navigate: (name: string) => {
            const targetRoute = props.state.routes.find((r) => r.name === name);
            if (targetRoute) {
              props.navigateToTab(targetRoute.key);
            }
          },
        };
        return <AppTabBar state={props.state} navigation={nav} role="entrenador" />;
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Asistencia' }} />
      <Tabs.Screen name="requests" options={{ title: 'Solicitudes' }} />
      <Tabs.Screen name="payments" options={{ title: 'Cobros' }} />
    </Tabs>
  );
}
