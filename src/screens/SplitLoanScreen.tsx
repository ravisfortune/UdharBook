import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useSplitStore } from '@store/useSplitStore';
import ContactPicker from '@components/ContactPicker';
import { formatCurrency } from '@utils/currency';
import { fullDate } from '@utils/date';
import { fadeInDown } from '@utils/animations';
import { scheduleEmiReminders } from '@services/notifications';

const MIN_EMI = 2;
const MAX_EMI = 24;

export default function SplitLoanScreen() {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const store = useSplitStore();
  const [installments, setInstallments] = useState(3);
  const [startDate] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const contact = store.members[0];
  const emiAmount = store.totalAmount > 0 && installments > 0
    ? Math.round((store.totalAmount / installments) * 100) / 100
    : 0;

  // EMI schedule
  const schedule = useMemo(() => {
    if (!emiAmount) return [];
    return Array.from({ length: installments }, (_, i) => {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i + 1);
      return { index: i + 1, amount: emiAmount, date: date.getTime() };
    });
  }, [installments, emiAmount, startDate]);

  async function handleSave() {
    if (!contact || store.totalAmount <= 0) return;
    setSaving(true);
    try {
      const splitId = await store.saveSplit();
      // Schedule EMI reminders (1 day before each due date)
      const dueDates = schedule.map(e => new Date(e.date));
      scheduleEmiReminders(splitId ?? 'loan', contact.name, emiAmount, dueDates).catch(() => {});
      setSaved(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch {
      Alert.alert('Error', 'Could not save');
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <View style={styles.successScreen}>
        <Animated.View entering={ZoomIn.springify()} style={styles.successContent}>
          <Text style={styles.successEmoji}>📅</Text>
          <Text style={styles.successTitle}>Loan Schedule Saved!</Text>
          <Text style={styles.successSub}>{installments} EMIs of {formatCurrency(emiAmount)}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan EMI Split</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Total loan amount */}
        <Animated.View entering={FadeInDown.delay(60)}>
          <Text style={styles.fieldLabel}>Total Loan Amount</Text>
          <View style={styles.amountCard}>
            <Text style={styles.amountDisplay}>
              {store.totalAmount > 0 ? formatCurrency(store.totalAmount) : '₹ —'}
            </Text>
            <View style={styles.amountBtns}>
              {[1000, 5000, 10000, 25000, 50000].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.quickAmt, store.totalAmount === v && styles.quickAmtActive]}
                  onPress={() => store.setTotalAmount(v)}
                >
                  <Text style={[
                    styles.quickAmtTxt,
                    store.totalAmount === v && { color: colors.primary },
                  ]}>
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Contact */}
        <Animated.View entering={FadeInDown.delay(100)} style={{ marginTop: Spacing.xl }}>
          <Text style={styles.fieldLabel}>Who Owes You</Text>
          <ContactPicker
            selected={store.members}
            onAdd={m => {
              store.reset();
              store.setSplitType('loan');
              store.setMethod('equal');
              store.addMember(m);
              if (store.totalAmount > 0) {
                store.updateMemberAmount(m.contactId, store.totalAmount);
              }
            }}
            onRemove={id => store.removeMember(id)}
          />
        </Animated.View>

        {/* Installments slider */}
        {store.totalAmount > 0 && contact && (
          <Animated.View entering={FadeInDown.delay(160)} style={{ marginTop: Spacing.xl }}>
            <View style={styles.sliderHeader}>
              <Text style={styles.fieldLabel}>Installments</Text>
              <View style={styles.emiBadge}>
                <Text style={styles.emiBadgeTxt}>{installments} EMIs</Text>
              </View>
            </View>

            {/* Manual +/- controls */}
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={[styles.sliderBtn, installments <= MIN_EMI && styles.sliderBtnDisabled]}
                onPress={() => setInstallments(Math.max(MIN_EMI, installments - 1))}
                disabled={installments <= MIN_EMI}
              >
                <MaterialIcons name="remove" size={20} color={colors.ink} />
              </TouchableOpacity>

              <View style={styles.sliderTrack}>
                <View style={[
                  styles.sliderFill,
                  { width: `${((installments - MIN_EMI) / (MAX_EMI - MIN_EMI)) * 100}%` }
                ]} />
                <Text style={styles.sliderValue}>{installments}</Text>
              </View>

              <TouchableOpacity
                style={[styles.sliderBtn, installments >= MAX_EMI && styles.sliderBtnDisabled]}
                onPress={() => setInstallments(Math.min(MAX_EMI, installments + 1))}
                disabled={installments >= MAX_EMI}
              >
                <MaterialIcons name="add" size={20} color={colors.ink} />
              </TouchableOpacity>
            </View>

            {/* Quick presets */}
            <View style={styles.presets}>
              {[2, 3, 6, 12, 24].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.preset, installments === n && styles.presetActive]}
                  onPress={() => setInstallments(n)}
                >
                  <Text style={[styles.presetTxt, installments === n && { color: colors.onPrimary }]}>
                    {n}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* EMI summary card */}
            <View style={styles.emiCard}>
              <View style={styles.emiStat}>
                <Text style={styles.emiStatLabel}>Per EMI</Text>
                <Text style={styles.emiStatValue}>{formatCurrency(emiAmount)}</Text>
              </View>
              <View style={styles.emiDivider} />
              <View style={styles.emiStat}>
                <Text style={styles.emiStatLabel}>Total</Text>
                <Text style={styles.emiStatValue}>{formatCurrency(store.totalAmount)}</Text>
              </View>
              <View style={styles.emiDivider} />
              <View style={styles.emiStat}>
                <Text style={styles.emiStatLabel}>Months</Text>
                <Text style={styles.emiStatValue}>{installments}</Text>
              </View>
            </View>

            {/* Schedule */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
              Payment Schedule
            </Text>
            {schedule.map((emi, i) => (
              <Animated.View
                key={i}
                entering={fadeInDown(i * 40)}
                style={styles.scheduleRow}
              >
                <View style={styles.emiIndex}>
                  <Text style={styles.emiIndexTxt}>{emi.index}</Text>
                </View>
                <Text style={styles.scheduleDate}>{fullDate(emi.date, 'en')}</Text>
                <Text style={styles.scheduleAmt}>{formatCurrency(emi.amount)}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!contact || store.totalAmount <= 0) && { opacity: 0.4 },
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={!contact || store.totalAmount <= 0 || saving}
        >
          <Text style={styles.saveBtnTxt}>
            {saving ? 'Saving...' : `Save ${installments} EMI Schedule`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    headerTitle: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: colors.ink },
    content: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
    fieldLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: colors.muted,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
    },
    amountCard: {
      backgroundColor: colors.primary, borderRadius: Radius.xl,
      padding: Spacing.xxl, alignItems: 'center', ...shadows.lg,
    },
    amountDisplay: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 40,
      color: colors.onPrimary, letterSpacing: -1, marginBottom: Spacing.lg,
    },
    amountBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
    quickAmt: {
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
      backgroundColor: colors.onPrimary + '26', borderRadius: Radius.full,
    },
    quickAmtActive: { backgroundColor: colors.onPrimary },
    quickAmtTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.onPrimary + 'E5' },
    sliderHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
    },
    emiBadge: {
      backgroundColor: colors.primaryFixed, borderRadius: Radius.full,
      paddingHorizontal: 12, paddingVertical: 4,
    },
    emiBadgeTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: colors.primary },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    sliderBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    sliderBtnDisabled: { opacity: 0.3 },
    sliderTrack: {
      flex: 1, height: 8, backgroundColor: colors.surfaceHigh,
      borderRadius: Radius.full, overflow: 'hidden', position: 'relative',
      alignItems: 'center', justifyContent: 'center',
    },
    sliderFill: {
      position: 'absolute', left: 0, top: 0, bottom: 0,
      backgroundColor: colors.primary, borderRadius: Radius.full,
    },
    sliderValue: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm, color: colors.onPrimary, zIndex: 1,
    },
    presets: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    preset: {
      flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
      backgroundColor: colors.surfaceLow, borderRadius: Radius.full,
    },
    presetActive: { backgroundColor: colors.primary },
    presetTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: colors.muted },
    emiCard: {
      flexDirection: 'row', backgroundColor: colors.surfaceLowest,
      borderRadius: Radius.lg, padding: Spacing.lg, ...shadows.md,
    },
    emiStat: { flex: 1, alignItems: 'center' },
    emiStatLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted, marginBottom: 4 },
    emiStatValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: colors.ink },
    emiDivider: { width: 1, backgroundColor: colors.surfaceLow, marginHorizontal: Spacing.sm },
    scheduleRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: colors.surfaceLowest, borderRadius: Radius.md,
      padding: Spacing.md, marginBottom: Spacing.sm, ...shadows.sm,
    },
    emiIndex: {
      width: 28, height: 28, borderRadius: Radius.full,
      backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center',
    },
    emiIndexTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: colors.primary },
    scheduleDate: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.muted },
    scheduleAmt: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md, color: colors.ink },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: Spacing.xl, backgroundColor: colors.surfaceLowest,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, ...shadows.lg,
    },
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: Radius.full,
      padding: Spacing.lg, alignItems: 'center', ...shadows.md,
    },
    saveBtnTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.onPrimary },
    successScreen: {
      flex: 1, backgroundColor: colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    },
    successContent: { alignItems: 'center' },
    successEmoji: { fontSize: 60, marginBottom: Spacing.lg },
    successTitle: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: colors.ink },
    successSub: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: colors.muted, marginTop: Spacing.sm },
  });
}
