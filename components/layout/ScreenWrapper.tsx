import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  withKeyboardAvoiding?: boolean;
  noPadding?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'dark' | 'light';
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function ScreenWrapper({
  children,
  scroll = true,
  withKeyboardAvoiding = false,
  noPadding = false,
  backgroundColor = Colors.ice,
  statusBarStyle = 'dark',
  edges = ['top', 'left', 'right'],
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  style,
}: ScreenWrapperProps) {
  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        !noPadding && styles.horizontalPadding,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brandBlue}
            colors={[Colors.brandBlue]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        !noPadding && styles.horizontalPadding,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges}>
      <StatusBar style={statusBarStyle} />
      {withKeyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  horizontalPadding: {
    paddingHorizontal: 24,
  },
});
