import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastContainer } from '../components/ui/ToastContainer';
import { Colors } from '../constants/Colors';
import { FitLinkMobileProvider } from '../store/FitLinkMobileContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

const ReducedMotionContext = createContext(false);

export function useReducedMotionPref(): boolean {
  return useContext(ReducedMotionContext);
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackdrop}>
        <View style={styles.webPhoneFrame}>{children}</View>
      </View>
    );
  }

  if (width >= 600) {
    return (
      <View style={styles.tabletBackdrop}>
        <View style={styles.tabletColumn}>{children}</View>
      </View>
    );
  }

  return <View style={styles.nativeRoot}>{children}</View>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      setReduceMotion(Boolean(enabled));
    });
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ReducedMotionContext.Provider value={reduceMotion}>
        <FitLinkMobileProvider>
          <StatusBar style="dark" />
          <AppShell>
            <Stack screenOptions={{ headerShown: false }} />
            <ToastContainer />
          </AppShell>
        </FitLinkMobileProvider>
      </ReducedMotionContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
    backgroundColor: Colors.ice,
  },
  tabletBackdrop: {
    flex: 1,
    backgroundColor: Colors.desktopBackdrop,
    alignItems: 'center',
  },
  tabletColumn: {
    width: '100%',
    maxWidth: 560,
    flex: 1,
    backgroundColor: Colors.ice,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  webBackdrop: {
    flex: 1,
    minHeight: '100%' as unknown as number,
    backgroundColor: Colors.desktopBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  webPhoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    maxHeight: 900,
    backgroundColor: Colors.ice,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    overflow: 'hidden',
  },
});
