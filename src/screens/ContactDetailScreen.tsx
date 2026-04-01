import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useTransactionStore } from '@store/useTransactionStore';
import { useContactStore } from '@store/useContactStore';
import { getNetBalance, Transaction } from '@db/transactions';
import { RootStackParamList } from '@/navigation';
import { formatCurrency } from '@utils/currency';
import { relativeDate, fullDate, groupLabel } from '@utils/date';
import { useAppStore } from '@store/useAppStore';
import { fadeInDown, staggerDelay } from '@utils/animations';
import ContactRow from '@components/ContactRow';
import { sendWhatsAppReminder } from '@services/whatsapp';
import { scheduleContactReminder } from '@services/notifications';

type RouteT = RouteProp<RootStackParamList, 'ContactDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ContactDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { locale } = useAppStore();
  const lang = locale as 'hi' | 'en';
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);

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

  // ── Contacts tab (no contactId) ──────────────────────────────────────────
  if (!contactId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>{t('contact.title')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddContact')}
          >
            <MaterialIcons name="person-add" size={18} color={colors.onPrimary} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {contacts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 40 }}>👥</Text>
              <Text style={styles.muted}>{t('contact.noContacts')}</Text>
            </View>
          ) : (
            contacts.map((c, i) => (
              <ContactRow
                key={c.id}
                contact={c}
                index={i}
                onPress={() => navigation.navigate('ContactDetail', {
                  contactId: c.id,
                  contactName: c.name,
                })}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  const totalGave = transactions.filter((t) => t.type === 'gave').reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.filter((t) => t.type === 'received').reduce((s, t) => s + t.amount, 0);
  const isSettled = netBalance === 0;
  const isMilna = netBalance > 0;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  function handleWhatsApp() {
    if (!contact?.phone) return;
    sendWhatsAppReminder(contact.phone, contact.name, Math.abs(netBalance));
  }

  function handleRemind() {
    if (!contact || netBalance <= 0) return;
    setShowDatePicker(true);
  }

  function confirmReminder(finalDate: Date) {
    if (!contact) return;
    scheduleContactReminder(contactId, contact.name, netBalance, finalDate)
      .then(() => Alert.alert(
        'Reminder Set ✅',
        `${finalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ko ${finalDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} baje remind karenge — ${contact.name} se ${formatCurrency(netBalance)} lena hai.`
      ))
      .catch(() => Alert.alert('Error', 'Reminder set nahi ho saka'));
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

  const grouped: { label: string; items: Transaction[] }[] = [];
  transactions.forEach((txn) => {
    const lbl = groupLabel(txn.date, lang);
    const last = grouped[grouped.length - 1];
    if (last && last.label === lbl) last.items.push(txn);
    else grouped.push({ label: lbl, items: [txn] });
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color={colors.red} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero gradient */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.hero}>
          <LinearGradient
            colors={[colors.heroBg[0], colors.heroBg[1] ?? colors.primary, colors.primaryContainer]}
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
            {contact?.phone ? <Text style={styles.heroPhone}>{contact.phone}</Text> : null}

            <Text style={[styles.heroBalance, { color: isSettled ? '#86efac' : isMilna ? '#86efac' : '#fca5a5' }]}>
              {isSettled
                ? t('contact.settled')
                : `${isMilna ? '↑' : '↓'} ${formatCurrency(Math.abs(netBalance))}`}
            </Text>

            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.totalGave')}</Text>
                <Text style={[styles.statValue, { color: '#fca5a5' }]}>{formatCurrency(totalGave)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.netBalance')}</Text>
                <Text style={[styles.statValue, { color: isMilna ? '#86efac' : '#fca5a5' }]}>
                  {formatCurrency(Math.abs(netBalance))}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('contact.totalReceived')}</Text>
                <Text style={[styles.statValue, { color: '#86efac' }]}>{formatCurrency(totalReceived)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={fadeInDown(120)} style={styles.actionRow}>
          {contact?.phone && (
            <TouchableOpacity style={styles.actionIconBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>
          )}
          {netBalance > 0 && (
            <TouchableOpacity style={styles.actionIconBtn} onPress={handleRemind}>
              <MaterialIcons name="notifications" size={22} color={colors.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => navigation.navigate('AddTransaction', { contactId, contactName: contactName ?? '' })}
          >
            <MaterialIcons name="add" size={20} color={colors.onPrimary} />
            <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>
              {t('contact.addTransaction')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Settlement banner */}
        {!isSettled && (
          <Animated.View entering={fadeInDown(160)} style={styles.settleBanner}>
            <View style={styles.settleInfo}>
              <Text style={styles.settleLabel}>
                {isMilna
                  ? `${contactName} ne ${formatCurrency(Math.abs(netBalance))} wapas diya?`
                  : `Tumne ${formatCurrency(Math.abs(netBalance))} de diya?`}
              </Text>
              <Text style={styles.settleHint}>Settlement record karo</Text>
            </View>
            <TouchableOpacity
              style={styles.settleBtn}
              onPress={() => navigation.navigate('AddTransaction', {
                contactId,
                contactName: contactName ?? '',
                defaultType: isMilna ? 'received' : 'gave',
              })}
            >
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.settleBtnText}>{isMilna ? 'Mila ✓' : 'Diya ✓'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

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
                      { backgroundColor: txn.type === 'gave' ? colors.redContainer : colors.greenContainer }
                    ]}>
                      <MaterialIcons
                        name={txn.type === 'gave' ? 'arrow-upward' : 'arrow-downward'}
                        size={16}
                        color={txn.type === 'gave' ? colors.red : colors.green}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txnNote}>
                        {txn.note || (txn.type === 'gave' ? t('transaction.gave') : t('transaction.received'))}
                      </Text>
                      <Text style={styles.txnDate}>{fullDate(txn.date, lang)}</Text>
                    </View>
                    <Text style={[styles.txnAmount, { color: txn.type === 'gave' ? colors.red : colors.green }]}>
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

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, selected) => {
            setShowDatePicker(false);
            if (selected) {
              const updated = new Date(selected);
              updated.setHours(reminderDate.getHours(), reminderDate.getMinutes(), 0, 0);
              setReminderDate(updated);
              setShowTimePicker(true);
            }
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowTimePicker(false);
            if (selected) {
              const finalDate = new Date(reminderDate);
              finalDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
              setReminderDate(finalDate);
              confirmReminder(finalDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    tabHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    },
    pageTitle: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.xxl, color: colors.ink, padding: Spacing.xl,
    },
    muted: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: colors.muted, paddingHorizontal: Spacing.xl },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: colors.primary, borderRadius: Radius.full,
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    addBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.onPrimary },
    emptyWrap: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    deleteBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.redContainer, alignItems: 'center', justifyContent: 'center',
    },
    hero: { marginHorizontal: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden', ...shadows.lg },
    heroGradient: { padding: Spacing.xxl, alignItems: 'center' },
    avatar: {
      width: 72, height: 72, borderRadius: Radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    },
    avatarLetter: { fontFamily: FontFamily.displayExtraBold, fontSize: 32, color: '#fff' },
    heroName: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: '#fff', marginBottom: 4 },
    heroPhone: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.lg },
    heroBalance: { fontFamily: FontFamily.displayExtraBold, fontSize: 36, letterSpacing: -1, marginBottom: Spacing.xl },
    statRow: {
      flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: Radius.lg, padding: Spacing.lg, width: '100%',
    },
    stat: { flex: 1, alignItems: 'center' },
    statLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
    statValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
    actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, alignItems: 'center' },
    actionIconBtn: {
      width: 44, height: 44, borderRadius: Radius.full,
      backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    actionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.md, backgroundColor: colors.cardBg,
      borderRadius: Radius.lg, ...shadows.sm,
    },
    actionBtnPrimary: { backgroundColor: colors.primary },
    actionBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.ink },
    settleBanner: {
      marginHorizontal: Spacing.xl, marginTop: Spacing.md,
      backgroundColor: colors.primaryFixed, borderRadius: Radius.lg, padding: Spacing.lg,
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    },
    settleInfo: { flex: 1 },
    settleLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.primary },
    settleHint: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted, marginTop: 2 },
    settleBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.green, borderRadius: Radius.full,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    settleBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: '#fff' },
    txnSection: { padding: Spacing.xl },
    txnSectionTitle: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: colors.ink, marginBottom: Spacing.lg },
    groupLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs,
      color: colors.muted, textTransform: 'uppercase',
      letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.md,
    },
    txnRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: colors.cardBg, borderRadius: Radius.md,
      padding: Spacing.md, marginBottom: Spacing.sm, ...shadows.sm,
    },
    txnIcon: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
    txnNote: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.ink },
    txnDate: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.mutedLight, marginTop: 2 },
    txnAmount: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md },
    emptyTxn: { padding: Spacing.xxl, alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: Radius.lg },
    emptyTxnText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: colors.muted },
  });
}
