import './src/i18n'; // i18n must initialize first

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppFonts } from './src/theme/fonts';
import { ThemeProvider } from './src/theme/ThemeContext';
import { Colors } from './src/theme/tokens';
import { getDB } from './src/db/index';
import { useAppStore, loadSavedLocale } from './src/store/useAppStore';
import AppNavigator from './src/navigation';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setDbReady: storeSetDbReady } = useAppStore();

  useEffect(() => {
    async function boot() {
      try {
        await getDB();           // Initialize SQLite + run migrations
        await loadSavedLocale(); // Restore user's language preference
        setDbReady(true);
        storeSetDbReady(true);
      } catch (e: any) {
        setError(e?.message ?? 'DB init failed');
      }
    }
    boot();
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={styles.splash}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ActivityIndicator size="large" color={Colors.primaryFixed} />
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark" backgroundColor={Colors.surface} />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
