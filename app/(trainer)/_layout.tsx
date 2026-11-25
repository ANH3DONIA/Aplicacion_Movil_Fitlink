import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function TrainerStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.ice },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
