import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/index';
import { useProStore } from '@store/useProStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useAppStore } from '@store/useAppStore';
import { useAuthStore } from '@store/useAuthStore';
import { LANGUAGES } from '@i18n/index';
import { fadeInDown } from '@utils/animations';
import { themeMeta, ThemeId } from '@theme/themes';
import ThemePreviewModal from '@components/ThemePreviewModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { locale, setLocale, themeId, setTheme } = useAppStore();
  const { signOut, isGuest, guestName, user } = useAuthStore();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const { isPro, proEnabled, canUseTheme, canAccess } = useProStore();

  function handleSignOut() {
    Alert.alert(
      isGuest ? 'Guest session khatam karo?' : 'Logout karo?',
      isGuest
        ? 'Guest data permanently delete ho jaayega. Kya aap sure hain?'
        : 'Aap logout ho jaoge. Cloud data safe rahega.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isGuest ? 'Haan, delete karo' : 'Logout',
          style: isGuest ? 'destructive' : 'default',
          onPress: () => signOut(),
        },
      ]
    );
  }

  const displayName = isGuest ? guestName : (user?.email ?? user?.phone ?? 'User');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Animated.View entering={fadeInDown(0)}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </Animated.View>

        {/* Pro Banner */}
        {proEnabled && !isPro && (
          <Animated.View entering={fadeInDown(30)} style={styles.section}>
            <TouchableOpacity style={styles.proBanner} onPress={() => navigation.navigate('Upgrade')}>
              <Text style={styles.proBannerEmoji}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.proBannerTitle}>UdharBook Pro</Text>
                <Text style={styles.proBannerSub}>Unlimited contacts, themes & more</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Language */}
        <Animated.View entering={fadeInDown(60)} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLocale(lang.code as 'hi' | 'en')}
                style={[styles.langBtn, locale === lang.code && styles.langBtnActive]}
              >
                <Text style={[styles.langText, locale === lang.code && styles.langTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={fadeInDown(120)} style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>
                  {(displayName ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardText}>{displayName}</Text>
                <Text style={styles.cardSub}>
                  {isGuest ? '👤 Guest mode' : '☁️ Cloud sync on'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Theme */}
        <Animated.View entering={fadeInDown(180)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Theme</Text>
            <Text style={styles.activeThemeBadge}>
              {themeMeta[themeId].emoji} {themeMeta[themeId].label}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeScroll}
          >
            {(Object.keys(themeMeta) as ThemeId[]).map((id) => {
              const meta = themeMeta[id];
              const active = themeId === id;
              const locked = !canUseTheme(id);
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => locked ? navigation.navigate('Upgrade') : setTheme(id)}
                  style={[
                    styles.themeCard,
                    { backgroundColor: meta.previewBg },
                    active && styles.themeCardActive,
                  ]}
                >
                  <View style={styles.themeDotsRow}>
                    <View style={[styles.themeDot, { backgroundColor: meta.preview, width: 22, height: 22 }]} />
                    <View style={[styles.themeDot, { backgroundColor: meta.preview, opacity: 0.5 }]} />
                    <View style={[styles.themeDot, { backgroundColor: meta.preview, opacity: 0.25 }]} />
                  </View>

                  <View style={[styles.fakeLine, { backgroundColor: meta.preview, opacity: 0.7, width: '80%' }]} />
                  <View style={[styles.fakeLine, { backgroundColor: meta.preview, opacity: 0.35, width: '55%' }]} />

                  <View style={styles.themeCardFooter}>
                    <Text style={styles.themeCardEmoji}>{meta.emoji}</Text>
                    <Text style={[styles.themeCardLabel, active && styles.themeCardLabelActive]}>
                      {meta.label}
                    </Text>
                    {active && (
                      <MaterialIcons name="check-circle" size={14} color={meta.preview} />
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.previewBtn, { borderColor: meta.preview }]}
                    onPress={() => setPreviewTheme(id)}
                  >
                    <MaterialIcons name="visibility" size={11} color={meta.preview} />
                    <Text style={[styles.previewBtnText, { color: meta.preview }]}>Preview</Text>
                  </TouchableOpacity>

                  {locked && (
                    <View style={styles.themeLockOverlay}>
                      <MaterialIcons name="lock" size={18} color="#fff" />
                      <Text style={styles.themeLockText}>PRO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Tools */}
        <Animated.View entering={fadeInDown(240)} style={styles.section}>
          <Text style={styles.sectionLabel}>Tools</Text>
          <TouchableOpacity style={styles.toolRow} onPress={() => canAccess('emiCalculator') ? navigation.navigate('EMICalculator') : navigation.navigate('Upgrade')}>
            <View style={[styles.toolIcon, { backgroundColor: colors.primaryFixed }]}>
              <Text style={{ fontSize: 18 }}>🧮</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>EMI Calculator</Text>
              <Text style={styles.cardSub}>Loan ki monthly EMI calculate karo</Text>
            </View>
            {canAccess('emiCalculator')
              ? <MaterialIcons name="chevron-right" size={20} color={colors.mutedLight} />
              : <MaterialIcons name="lock" size={18} color={colors.primary} />
            }
          </TouchableOpacity>
        </Animated.View>

        {/* About */}
        <Animated.View entering={fadeInDown(300)} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>UdharBook</Text>
            <Text style={styles.cardSub}>{t('settings.version')} 1.0.0</Text>
          </View>
        </Animated.View>

        {/* Sign out */}
        <Animated.View entering={fadeInDown(360)} style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={18} color={colors.red} />
            <Text style={styles.signOutText}>
              {isGuest ? 'Guest session khatam karo' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {previewTheme && (
        <ThemePreviewModal
          visible={!!previewTheme}
          themeId={previewTheme}
          onClose={() => setPreviewTheme(null)}
          onSelect={(id) => { setTheme(id); setPreviewTheme(null); }}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    scroll: { padding: Spacing.xl, paddingBottom: 40 },
    title: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.xxl,
      color: colors.ink,
      marginBottom: Spacing.xxxl,
    },
    section: { marginBottom: Spacing.xxl },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    sectionLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    activeThemeBadge: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.primary,
    },
    langRow: { flexDirection: 'row', gap: Spacing.sm },
    langBtn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      backgroundColor: colors.surfaceLow,
      alignItems: 'center',
    },
    langBtnActive: { backgroundColor: colors.primary },
    langText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.muted },
    langTextActive: { color: colors.onPrimary, fontFamily: FontFamily.bodySemiBold },
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: Radius.md,
      padding: Spacing.lg,
      ...shadows.sm,
    },
    cardText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.ink },
    cardSub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.muted, marginTop: 4 },
    accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    accountAvatar: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      backgroundColor: colors.primaryFixed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountAvatarText: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.lg,
      color: colors.primary,
    },
    themeScroll: { gap: Spacing.md, paddingBottom: 4 },
    themeCard: {
      width: 110,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: 6,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeCardActive: { borderWidth: 2, borderColor: colors.primary },
    themeDotsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
    themeDot: { width: 14, height: 14, borderRadius: Radius.full },
    fakeLine: { height: 5, borderRadius: 3 },
    themeCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    themeCardEmoji: { fontSize: 13 },
    themeCardLabel: {
      flex: 1,
      fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    themeCardLabelActive: { fontFamily: FontFamily.bodySemiBold, color: colors.ink },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      marginTop: 4,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    previewBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, letterSpacing: 0.3 },
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      padding: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: colors.redContainer,
    },
    signOutText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.red,
    },
    toolRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: colors.cardBg, borderRadius: Radius.md,
      padding: Spacing.lg, ...shadows.sm,
    },
    toolIcon: {
      width: 44, height: 44, borderRadius: Radius.md,
      alignItems: 'center', justifyContent: 'center',
    },
    proBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: colors.primary,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      ...shadows.md,
    },
    proBannerEmoji: { fontSize: 24 },
    proBannerTitle: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.md,
      color: '#fff',
    },
    proBannerSub: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: 'rgba(255,255,255,0.75)',
      marginTop: 2,
    },
    themeLockOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    themeLockText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 9,
      color: '#fff',
      letterSpacing: 1,
    },
  });
}
