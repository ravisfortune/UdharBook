import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useAppStore } from '@store/useAppStore';
import { LANGUAGES } from '@i18n/index';
import { fadeInDown, staggerDelay } from '@utils/animations';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={fadeInDown(0)}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </Animated.View>

      {/* Language */}
      <Animated.View entering={fadeInDown(60)} style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLocale(lang.code as 'hi' | 'en')}
              style={[
                styles.langBtn,
                locale === lang.code && styles.langBtnActive,
              ]}
            >
              <Text style={[
                styles.langText,
                locale === lang.code && styles.langTextActive,
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* About */}
      <Animated.View entering={fadeInDown(120)} style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.about')}</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>UdharBook</Text>
          <Text style={styles.cardSub}>{t('settings.version')} 1.0.0</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.xl },
  title: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.ink,
    marginBottom: Spacing.xxxl,
  },
  section: { marginBottom: Spacing.xxl },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
  },
  langBtnActive: { backgroundColor: Colors.primary },
  langText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  langTextActive: { color: Colors.onPrimary, fontFamily: FontFamily.bodySemiBold },
  card: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  cardText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.ink },
  cardSub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.muted, marginTop: 4 },
});
