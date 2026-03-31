import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useContactStore } from '@store/useContactStore';
import { RootStackParamList } from '@/navigation';
import BalanceHeroCard from '@components/BalanceHeroCard';
import ContactRow from '@components/ContactRow';
import SplitKaroBanner from '@components/SplitKaroBanner';
import { usePulseAnimation } from '@utils/animations';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { contacts, totalMilna, totalDena, loading, loadContacts } = useContactStore();
  const { animStyle: fabStyle, pulse } = usePulseAnimation();

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  // Pulse FAB on first mount
  useEffect(() => {
    const t = setTimeout(pulse, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={styles.header}
      >
        <View>
          <Text style={styles.appName}>UdharBook</Text>
          <Text style={styles.tagline}>Hisaab saaf, dosti saaf</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
        >
          <MaterialIcons name="settings" size={20} color={Colors.muted} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadContacts}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Balance Hero */}
        <BalanceHeroCard totalMilna={totalMilna} totalDena={totalDena} />

        {/* Split Karo Banner */}
        <SplitKaroBanner onPress={() => navigation.navigate('Split')} />

        {/* Contacts List */}
        <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
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
              onPress={() =>
                navigation.navigate('ContactDetail', {
                  contactId: contact.id,
                  contactName: contact.name,
                })
              }
            />
          ))
        )}

        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fabWrapper, fabStyle]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddTransaction', {})}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400).springify()}
      style={styles.emptyState}
    >
      <Text style={styles.emptyEmoji}>📒</Text>
      <Text style={styles.emptyTitle}>{t('home.noContacts')}</Text>
      <Text style={styles.emptyHint}>{t('home.noContactsHint')}</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Text style={styles.emptyBtnText}>+ {t('contact.addNew')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
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
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.mutedLight,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  addContactLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.xl,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyTitle: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  emptyHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  emptyBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.onPrimary,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.xl,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
