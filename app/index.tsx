import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useFitLink } from '../store/FitLinkMobileContext';

export default function IndexRedirect() {
  const { isHydrated, currentUser } = useFitLink();

  if (!isHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.brandBlue} />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (currentUser.role === 'entrenador') {
    return <Redirect href="/(trainer)/(tabs)" />;
  }

  return <Redirect href="/(user)/(tabs)" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
