import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Keyboard, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useContactStore } from '@store/useContactStore';
import { useProStore } from '@store/useProStore';
import { RootStackParamList } from '@/navigation';
import BalanceHeroCard from '@components/BalanceHeroCard';
import ContactRow from '@components/ContactRow';
import SplitKaroBanner from '@components/SplitKaroBanner';
import { usePulseAnimation } from '@utils/animations';
import { exportAllContactsPDF, exportAllContactsCSV } from '@services/exportService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { contacts, totalMilna, totalDena, loading, loadContacts } = useContactStore();
  const { canAccess } = useProStore();
  const { animStyle: fabStyle, pulse } = usePulseAnimation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + (insets.bottom || 8);
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    if (!canAccess('pdfExport')) {
      navigation.navigate('Upgrade');
      return;
    }
    if (contacts.length === 0) {
      Alert.alert('No data', 'Koi contact nahi hai export karne ke liye.');
      return;
    }
    Alert.alert('Export karo', 'Format choose karo', [
      {
        text: 'PDF',
        onPress: async () => {
          setExporting(true);
          await exportAllContactsPDF(contacts, totalMilna, totalDena).catch(() => {});
          setExporting(false);
        },
      },
      {
        text: 'CSV (Excel)',
        onPress: async () => {
          setExporting(true);
          await exportAllContactsCSV(contacts).catch(() => {});
          setExporting(false);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  useFocusEffect(
    useCallback(() => { loadContacts(); }, [])
  );

  useEffect(() => {
    const t = setTimeout(pulse, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={styles.appName}>UdharBook</Text>
          <Text style={styles.tagline}>Hisaab saaf, dosti saaf</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleExport} style={styles.settingsBtn} disabled={exporting}>
            <MaterialIcons name="download" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <MaterialIcons name="settings" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadContacts}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <BalanceHeroCard totalMilna={totalMilna} totalDena={totalDena} />
        <SplitKaroBanner onPress={() => navigation.navigate('Split')} />

        <Animated.View entering={FadeInDown.delay(180).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddContact')}>
              <Text style={styles.addContactLink}>+ {t('contact.addNew')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {contacts.length === 0 ? (
          <EmptyState onAdd={() => navigation.navigate('AddContact')} />
        ) : (
          contacts.map((contact, index) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              index={index}
              onPress={() => navigation.navigate('ContactDetail', {
                contactId: contact.id,
                contactName: contact.name,
              })}
            />
          ))
        )}
        <View style={{ height: tabBarHeight + 72 }} />
      </ScrollView>

      <Animated.View style={[styles.fabWrapper, fabStyle, { bottom: tabBarHeight + 16 }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddTransaction', {})}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📒</Text>
      <Text style={styles.emptyTitle}>{t('home.noContacts')}</Text>
      <Text style={styles.emptyHint}>{t('home.noContactsHint')}</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Text style={styles.emptyBtnText}>+ {t('contact.addNew')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    appName: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.xxl,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    tagline: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.mutedLight,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'center',
    },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.lg,
      color: colors.ink,
    },
    addContactLink: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.section,
      backgroundColor: colors.surfaceLowest,
      borderRadius: Radius.xl,
      marginTop: Spacing.sm,
      ...shadows.sm,
    },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
    emptyTitle: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.lg,
      color: colors.ink,
      marginBottom: Spacing.sm,
    },
    emptyHint: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      textAlign: 'center',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    emptyBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.md,
      borderRadius: Radius.full,
    },
    emptyBtnText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.onPrimary,
    },
    fabWrapper: { position: 'absolute', bottom: 90, right: Spacing.xl },
    fab: {
      width: 58,
      height: 58,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
    },
  });
}
