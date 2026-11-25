import React from 'react';
import { AppTabBar, TabBarNavigationProps } from './AppTabBar';

export function UserTabBar(props: TabBarNavigationProps) {
  return <AppTabBar {...props} role="usuario" />;
}
