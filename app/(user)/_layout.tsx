import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function UserStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.ice },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="class-detail" />
      <Stack.Screen name="memberships" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="session-confirm" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
