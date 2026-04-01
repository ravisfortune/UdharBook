import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { getPackages, purchasePackage, restorePurchases } from '@services/purchases';
import { useProStore } from '@store/useProStore';

const FREE_FEATURES = [
  { label: 'Up to 50 contacts', included: true },
  { label: 'Up to 200 transactions', included: true },
  { label: 'Bill, Loan & Group splits', included: true },
  { label: 'WhatsApp reminders', included: true },
  { label: 'Cloud backup', included: true },
  { label: '2 themes', included: true },
  { label: '3 months reports', included: true },
  { label: 'All 7 themes', included: false },
  { label: 'Unlimited contacts & transactions', included: false },
  { label: '12 months reports', included: false },
  { label: 'PDF / Excel export', included: false },
  { label: 'EMI calculator', included: false },
];

const PRO_FEATURES = [
  { icon: '♾️', label: 'Unlimited contacts & transactions' },
  { icon: '🎨', label: 'Sabhi 7 themes unlock' },
  { icon: '📊', label: '12 months full reports' },
  { icon: '📄', label: 'PDF & Excel export' },
  { icon: '🧮', label: 'EMI calculator' },
  { icon: '☁️', label: 'Priority cloud sync' },
  { icon: '🔔', label: 'Advanced notifications' },
];

export default function UpgradeScreen() {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const { activatePro } = useProStore();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    getPackages().then(setPackages).catch(() => {});
  }, []);

  const monthlyPkg = packages.find((p) => p.identifier.includes('monthly'));
  const yearlyPkg  = packages.find((p) => p.identifier.includes('yearly'));
  const activePkg  = selected === 'monthly' ? monthlyPkg : yearlyPkg;

  async function handlePurchase() {
    if (!activePkg) {
      // RevenueCat not configured yet — show coming soon
      Alert.alert('Coming Soon', 'Pro abhi launch nahi hua hai. Launch hone pe notify karenge! 🚀');
      return;
    }
    try {
      setLoading(true);
      const isPro = await purchasePackage(activePkg);
      if (isPro) {
        await activatePro();
        Alert.alert('Welcome to Pro! ⚡', 'Sab features unlock ho gaye hain.', [
          { text: 'Let\'s go!', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Error', 'Purchase complete nahi ho saka. Dobara try karo.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    try {
      setLoading(true);
      const isPro = await restorePurchases();
      if (isPro) {
        await activatePro();
        Alert.alert('Restored! ✅', 'Aapka Pro subscription restore ho gaya.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('No Purchase Found', 'Koi active Pro subscription nahi mila.');
      }
    } catch {
      Alert.alert('Error', 'Restore nahi ho saka. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color={colors.ink} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Animated.View entering={ZoomIn.springify().delay(100)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEmoji}>⚡</Text>
            <Text style={styles.heroTitle}>UdharBook Pro</Text>
            <Text style={styles.heroSub}>Sab kuch unlock karo — koi limit nahi</Text>

            {/* Plan toggle */}
            <View style={styles.planToggle}>
              <TouchableOpacity
                style={[styles.planBtn, selected === 'monthly' && styles.planBtnActive]}
                onPress={() => setSelected('monthly')}
              >
                <Text style={[styles.planBtnText, selected === 'monthly' && styles.planBtnTextActive]}>Monthly</Text>
                <Text style={[styles.planBtnPrice, selected === 'monthly' && styles.planBtnTextActive]}>₹99/mo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.planBtn, selected === 'yearly' && styles.planBtnActive]}
                onPress={() => setSelected('yearly')}
              >
                <View style={styles.saveBadge}><Text style={styles.saveBadgeTxt}>SAVE 33%</Text></View>
                <Text style={[styles.planBtnText, selected === 'yearly' && styles.planBtnTextActive]}>Yearly</Text>
                <Text style={[styles.planBtnPrice, selected === 'yearly' && styles.planBtnTextActive]}>₹799/yr</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Pro features */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Pro mein kya milega</Text>
          {PRO_FEATURES.map((f, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(200 + i * 50)} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Free vs Pro comparison */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Free vs Pro</Text>
          {FREE_FEATURES.map((f, i) => (
            <View key={i} style={styles.compareRow}>
              <MaterialIcons
                name={f.included ? 'check-circle' : 'cancel'}
                size={20}
                color={f.included ? colors.green : colors.mutedLight}
              />
              <Text style={[
                styles.compareLabel,
                !f.included && { color: colors.mutedLight },
              ]}>{f.label}</Text>
              {!f.included && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeTxt}>PRO</Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handlePurchase} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.onPrimary} />
            : <Text style={styles.ctaBtnTxt}>
                {selected === 'yearly' ? 'Get Pro — ₹799/year' : 'Get Pro — ₹99/month'}
              </Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={loading}>
          <Text style={styles.ctaNote}>Pehle kharida hai? Restore karo</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
      alignItems: 'flex-end',
    },
    closeBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
    },
    scroll: { paddingHorizontal: Spacing.xl },
    hero: {
      borderRadius: Radius.xl, padding: Spacing.xxl,
      alignItems: 'center', marginBottom: Spacing.xl, ...shadows.lg,
    },
    heroEmoji: { fontSize: 48, marginBottom: Spacing.sm },
    heroTitle: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl,
      color: '#fff', letterSpacing: -0.5,
    },
    heroSub: {
      fontFamily: FontFamily.body, fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: Spacing.xl,
    },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    price: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 48,
      color: '#fff', letterSpacing: -2,
    },
    pricePer: {
      fontFamily: FontFamily.body, fontSize: FontSize.md,
      color: 'rgba(255,255,255,0.7)', marginBottom: 8,
    },
    priceYear: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs,
      color: 'rgba(255,255,255,0.6)', marginTop: 4,
    },
    planToggle: {
      flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, width: '100%',
    },
    planBtn: {
      flex: 1, borderRadius: Radius.lg, padding: Spacing.md,
      alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1.5, borderColor: 'transparent',
    },
    planBtnActive: {
      backgroundColor: 'rgba(255,255,255,0.25)', borderColor: '#fff',
    },
    planBtnText: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)',
    },
    planBtnPrice: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', marginTop: 2,
    },
    planBtnTextActive: { color: '#fff' },
    saveBadge: {
      backgroundColor: '#fbbf24', borderRadius: Radius.full,
      paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4,
    },
    saveBadgeTxt: { fontFamily: FontFamily.bodyBold, fontSize: 9, color: '#78350f' },
    section: { marginBottom: Spacing.xl },
    sectionTitle: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg,
      color: colors.ink, marginBottom: Spacing.md,
    },
    featureRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: colors.cardBg, borderRadius: Radius.md,
      padding: Spacing.md, marginBottom: Spacing.sm, ...shadows.sm,
    },
    featureEmoji: { fontSize: 22 },
    featureLabel: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.ink,
    },
    compareRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1, borderBottomColor: colors.surfaceHigh,
    },
    compareLabel: {
      flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.ink,
    },
    proBadge: {
      backgroundColor: colors.primary, borderRadius: Radius.full,
      paddingHorizontal: 8, paddingVertical: 2,
    },
    proBadgeTxt: {
      fontFamily: FontFamily.bodyBold, fontSize: 10, color: colors.onPrimary,
    },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: Spacing.xl, backgroundColor: colors.surfaceLowest,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, ...shadows.lg,
    },
    ctaBtn: {
      backgroundColor: colors.primary, borderRadius: Radius.full,
      padding: Spacing.lg, alignItems: 'center', ...shadows.md,
    },
    ctaBtnTxt: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.onPrimary,
    },
    ctaNote: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs,
      color: colors.muted, textAlign: 'center', marginTop: Spacing.sm,
    },
  });
}
