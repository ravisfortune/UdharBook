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
import { useAuthStore } from './src/store/useAuthStore';
import { useProStore } from './src/store/useProStore';
import AppNavigator from './src/navigation';
import { requestNotificationPermission, setupNotificationChannel } from './src/services/notifications';
import { initPurchases } from './src/services/purchases';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setDbReady: storeSetDbReady, themeId } = useAppStore();
  const initializeAuth = useAuthStore((s) => s.initialize);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const initializePro = useProStore((s) => s.initialize);

  useEffect(() => {
    async function boot() {
      try {
        await getDB();           // Initialize SQLite + run migrations
        await loadSavedLocale(); // Restore user's language preference
        await initializeAuth();  // Restore Supabase session
        await initializePro();   // Load Pro status from AsyncStorage
        await initPurchases();   // RevenueCat init
        await setupNotificationChannel();
        await requestNotificationPermission();
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
      <ThemeProvider themeId={themeId}>
        <StatusBar style="dark" backgroundColor={Colors.surface} />
        <AppNavigator />
        {isRestoring && (
          <View style={styles.restoreOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.restoreText}>Syncing your data...</Text>
          </View>
        )}
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
  restoreOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  restoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
