import React from 'react';
import { AppTabBar, TabBarNavigationProps } from './AppTabBar';

export function TrainerTabBar(props: TabBarNavigationProps) {
  return <AppTabBar {...props} role="entrenador" />;
}
