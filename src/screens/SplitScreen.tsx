import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, FontFamily, FontSize, Spacing } from '@theme/tokens';

export default function SplitScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('split.title')}</Text>
      <Text style={styles.sub}>Coming soon — Phase 2</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.xl },
  title: { fontFamily: FontFamily.display, fontSize: FontSize.xxl, color: Colors.ink },
  sub: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.muted, marginTop: Spacing.sm },
});
