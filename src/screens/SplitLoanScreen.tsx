import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useSplitStore } from '@store/useSplitStore';
import ContactPicker from '@components/ContactPicker';
import { formatCurrency } from '@utils/currency';
import { fullDate } from '@utils/date';
import { fadeInDown } from '@utils/animations';

const MIN_EMI = 2;
const MAX_EMI = 24;

export default function SplitLoanScreen() {
  const navigation = useNavigation();
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
      await store.saveSplit();
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
          <MaterialIcons name="arrow-back" size={22} color={Colors.ink} />
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
                    store.totalAmount === v && { color: Colors.onPrimary },
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
                <MaterialIcons name="remove" size={20} color={Colors.ink} />
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
                <MaterialIcons name="add" size={20} color={Colors.ink} />
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
                  <Text style={[styles.presetTxt, installments === n && { color: Colors.onPrimary }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: Colors.ink },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  amountCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center', ...Shadows.lg,
  },
  amountDisplay: {
    fontFamily: FontFamily.displayExtraBold, fontSize: 40,
    color: '#fff', letterSpacing: -1, marginBottom: Spacing.lg,
  },
  amountBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  quickAmt: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
  },
  quickAmtActive: { backgroundColor: '#fff' },
  quickAmtTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },
  sliderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
  },
  emiBadge: {
    backgroundColor: Colors.primaryFixed, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  emiBadgeTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: Colors.primary },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  sliderBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  sliderBtnDisabled: { opacity: 0.3 },
  sliderTrack: {
    flex: 1, height: 8, backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.full, overflow: 'hidden', position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  sliderValue: {
    fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm, color: Colors.onPrimary, zIndex: 1,
  },
  presets: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  preset: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: Radius.full,
  },
  presetActive: { backgroundColor: Colors.primary },
  presetTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: Colors.muted },
  emiCard: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.md,
  },
  emiStat: { flex: 1, alignItems: 'center' },
  emiStatLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.muted, marginBottom: 4 },
  emiStatValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: Colors.ink },
  emiDivider: { width: 1, backgroundColor: Colors.surfaceLow, marginHorizontal: Spacing.sm },
  scheduleRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceLowest, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  emiIndex: {
    width: 28, height: 28, borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center',
  },
  emiIndexTxt: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: Colors.primary },
  scheduleDate: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.muted },
  scheduleAmt: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md, color: Colors.ink },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl, backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, ...Shadows.lg,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.md,
  },
  saveBtnTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.onPrimary },
  successScreen: {
    flex: 1, backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
  },
  successContent: { alignItems: 'center' },
  successEmoji: { fontSize: 60, marginBottom: Spacing.lg },
  successTitle: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: Colors.ink },
  successSub: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.muted, marginTop: Spacing.sm },
});
