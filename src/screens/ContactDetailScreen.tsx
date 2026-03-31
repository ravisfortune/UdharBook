import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useTransactionStore } from '@store/useTransactionStore';
import { useContactStore } from '@store/useContactStore';
import { getNetBalance } from '@db/transactions';
import { RootStackParamList } from '@/navigation';
import { formatCurrency } from '@utils/currency';
import { relativeDate, fullDate, groupLabel } from '@utils/date';
import { useAppStore } from '@store/useAppStore';
import { fadeInDown, staggerDelay } from '@utils/animations';
import { Transaction } from '@db/transactions';

type RouteT = RouteProp<RootStackParamList, 'ContactDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ContactDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { locale } = useAppStore();
  const lang = locale as 'hi' | 'en';

  const contactId = route.params?.contactId;
  const contactName = route.params?.contactName;

  const { transactions, loading, loadForContact } = useTransactionStore();
  const { contacts, removeContact } = useContactStore();

  const [netBalance, setNetBalance] = useState(0);

  const contact = contacts.find((c) => c.id === contactId);

  useFocusEffect(
    useCallback(() => {
      if (contactId) {
        loadForContact(contactId);
        getNetBalance(contactId).then(setNetBalance);
      }
    }, [contactId])
  );

  if (!contactId) {
    // Contacts tab — show contacts list
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>{t('contact.title')}</Text>
        <Text style={styles.muted}>{t('contact.noContacts')}</Text>
      </SafeAreaView>
    );
  }

  const totalGave = transactions
    .filter((t) => t.type === 'gave')
    .reduce((s, t) => s + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'received')
    .reduce((s, t) => s + t.amount, 0);

  const isSettled = netBalance === 0;
  const isMilna = netBalance > 0;

  function handleWhatsApp() {
    if (!contact?.phone) return;
    const name = contact.name;
    const amount = Math.abs(netBalance);
    const message = isMilna
      ? `Bhai ${name}, mere paas tumhara ₹${amount.toLocaleString('en-IN')} dena baaki hai. Convenient ho toh bata dena 🙏`
      : `${name}, mujhe tumhara ₹${amount.toLocaleString('en-IN')} dena hai. Payment kar deta hoon 🙏`;
    const phone = contact.phone.replace(/\D/g, '');
    const phoneCC = phone.startsWith('91') ? phone : `91${phone}`;
    Linking.openURL(`whatsapp://send?phone=${phoneCC}&text=${encodeURIComponent(message)}`);
  }

  function handleDelete() {
    Alert.alert(
      t('contact.deleteContact'),
      t('contact.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await removeContact(contactId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  // Group transactions by date label
  const grouped: { label: string; items: Transaction[] }[] = [];
  transactions.forEach((txn) => {
    const label = groupLabel(txn.date, lang);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) {
      last.items.push(txn);
    } else {
      grouped.push({ label, items: [txn] });
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color={Colors.red} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={styles.hero}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {contactName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.heroName}>{contactName}</Text>
            {contact?.phone ? (
              <Text style={styles.heroPhone}>{contact.phone}</Text>
            ) : null}

            <Text style={[
              styles.heroBalance,
              { color: isSettled ? '#86efac' : isMilna ? '#86efac' : '#fca5a5' }
            ]}>
              {isSettled
                ? t('contact.settled')
                : `${isMilna ? '↑' : '↓'} ${formatCurrency(Math.abs(netBalance))}`}
            </Text>

            {/* 3-stat strip */}
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.totalGave')}</Text>
                <Text style={[styles.statValue, { color: '#fca5a5' }]}>
                  {formatCurrency(totalGave)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.netBalance')}</Text>
                <Text style={[
                  styles.statValue,
                  { color: isMilna ? '#86efac' : '#fca5a5' }
                ]}>
                  {formatCurrency(Math.abs(netBalance))}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.totalReceived')}</Text>
                <Text style={[styles.statValue, { color: '#86efac' }]}>
                  {formatCurrency(totalReceived)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={fadeInDown(120)} style={styles.actionRow}>
          {contact?.phone && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.actionBtnText}>{t('contact.whatsappRemind')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => navigation.navigate('AddTransaction', {
              contactId,
              contactName: contactName ?? '',
            })}
          >
            <MaterialIcons name="add" size={20} color={Colors.onPrimary} />
            <Text style={[styles.actionBtnText, { color: Colors.onPrimary }]}>
              {t('contact.addTransaction')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transaction history */}
        <View style={styles.txnSection}>
          <Text style={styles.txnSectionTitle}>{t('contact.transactions')}</Text>

          {transactions.length === 0 ? (
            <Animated.View entering={fadeInDown(160)} style={styles.emptyTxn}>
              <Text style={styles.emptyTxnText}>{t('common.noData')}</Text>
            </Animated.View>
          ) : (
            grouped.map(({ label, items }, gi) => (
              <View key={label}>
                <Animated.Text
                  entering={fadeInDown(staggerDelay(gi, 80))}
                  style={styles.groupLabel}
                >
                  {label}
                </Animated.Text>
                {items.map((txn, ti) => (
                  <Animated.View
                    key={txn.id}
                    entering={fadeInDown(staggerDelay(gi + ti, 60))}
                    style={styles.txnRow}
                  >
                    <View style={[
                      styles.txnIcon,
                      { backgroundColor: txn.type === 'gave'
                        ? Colors.redContainer : Colors.greenContainer }
                    ]}>
                      <MaterialIcons
                        name={txn.type === 'gave' ? 'arrow-upward' : 'arrow-downward'}
                        size={16}
                        color={txn.type === 'gave' ? Colors.red : Colors.green}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txnNote}>
                        {txn.note || (txn.type === 'gave'
                          ? t('transaction.gave') : t('transaction.received'))}
                      </Text>
                      <Text style={styles.txnDate}>
                        {fullDate(txn.date, lang)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.txnAmount,
                      { color: txn.type === 'gave' ? Colors.red : Colors.green }
                    ]}>
                      {txn.type === 'gave' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  pageTitle: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl, color: Colors.ink,
    padding: Spacing.xl,
  },
  muted: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md, color: Colors.muted,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  deleteBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.redContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { marginHorizontal: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.lg },
  heroGradient: { padding: Spacing.xxl, alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarLetter: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: 32, color: '#fff',
  },
  heroName: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl, color: '#fff', marginBottom: 4,
  },
  heroPhone: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.lg,
  },
  heroBalance: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: 36, letterSpacing: -1, marginBottom: Spacing.xl,
  },
  statRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: Radius.lg, padding: Spacing.lg, width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)', marginBottom: 4,
  },
  statValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  actionRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginTop: Spacing.xl,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.lg, ...Shadows.sm,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.ink,
  },
  txnSection: { padding: Spacing.xl },
  txnSectionTitle: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.lg, color: Colors.ink, marginBottom: Spacing.lg,
  },
  groupLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs,
    color: Colors.muted, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, ...Shadows.sm,
  },
  txnIcon: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  txnNote: {
    fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.ink,
  },
  txnDate: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.mutedLight, marginTop: 2,
  },
  txnAmount: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md },
  emptyTxn: {
    padding: Spacing.xxl, alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: Radius.lg,
  },
  emptyTxnText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.muted },
});
