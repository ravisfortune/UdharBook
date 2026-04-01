import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';

interface EmiRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcEmi(principal: number, annualRate: number, months: number) {
  if (annualRate === 0) {
    const emi = principal / months;
    return { emi, totalPayable: principal, totalInterest: 0 };
  }
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;
  return { emi, totalPayable, totalInterest };
}

function buildSchedule(principal: number, annualRate: number, months: number, emi: number): EmiRow[] {
  const r = annualRate / 12 / 100;
  const rows: EmiRow[] = [];
  let balance = principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const princ = emi - interest;
    balance = Math.max(0, balance - princ);
    rows.push({ month: i, emi, principal: princ, interest, balance });
  }
  return rows;
}

function fmt(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function EMICalculatorScreen() {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = parseInt(tenure, 10);
    if (!p || !r || !n || p <= 0 || n <= 0 || r < 0) return null;
    return calcEmi(p, r, n);
  }, [principal, rate, tenure]);

  const schedule = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = parseInt(tenure, 10);
    if (!result || !p || !r || !n) return [];
    return buildSchedule(p, r, n, result.emi);
  }, [result, principal, rate, tenure]);

  const hasInput = principal && rate && tenure;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(250)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EMI Calculator</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Inputs */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.card}>
          <InputRow
            label="Loan Amount"
            prefix="₹"
            placeholder="e.g. 500000"
            value={principal}
            onChangeText={setPrincipal}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <InputRow
            label="Annual Interest Rate"
            suffix="%"
            placeholder="e.g. 10.5"
            value={rate}
            onChangeText={setRate}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <InputRow
            label="Tenure"
            suffix="months"
            placeholder="e.g. 24"
            value={tenure}
            onChangeText={setTenure}
            styles={styles}
            colors={colors}
          />
        </Animated.View>

        {/* Result */}
        {result && hasInput && (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.resultCard}>
            <View style={styles.emiRow}>
              <Text style={styles.emiLabel}>Monthly EMI</Text>
              <Text style={styles.emiValue}>{fmt(result.emi)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <SummaryItem label="Principal" value={fmt(parseFloat(principal))} color={colors.primary} styles={styles} />
              <SummaryItem label="Total Interest" value={fmt(result.totalInterest)} color={colors.red} styles={styles} />
              <SummaryItem label="Total Payable" value={fmt(result.totalPayable)} color={colors.ink} styles={styles} />
            </View>

            {/* Interest bar */}
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barPrincipal,
                  { flex: parseFloat(principal) },
                  { backgroundColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.barInterest,
                  { flex: result.totalInterest },
                  { backgroundColor: colors.red },
                ]}
              />
            </View>
            <View style={styles.barLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Principal</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                <Text style={styles.legendText}>Interest</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Amortization Schedule toggle */}
        {result && hasInput && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity
              style={styles.scheduleToggle}
              onPress={() => setShowSchedule(s => !s)}
            >
              <Text style={styles.scheduleToggleText}>
                {showSchedule ? 'Hide' : 'Show'} Payment Schedule
              </Text>
              <MaterialIcons
                name={showSchedule ? 'expand-less' : 'expand-more'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {showSchedule && (
              <View style={styles.tableCard}>
                {/* Table header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>EMI</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Principal</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Interest</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>Balance</Text>
                </View>
                {schedule.map((row) => (
                  <View
                    key={row.month}
                    style={[styles.tableRow, row.month % 2 === 0 && { backgroundColor: colors.surfaceLow }]}
                  >
                    <Text style={[styles.tableCell, styles.tableCellMono, { flex: 0.5 }]}>{row.month}</Text>
                    <Text style={[styles.tableCell, styles.tableCellMono]}>{fmt(row.emi)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellMono, { color: colors.primary }]}>{fmt(row.principal)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellMono, { color: colors.red }]}>{fmt(row.interest)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellMono]}>{fmt(row.balance)}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputRow({ label, prefix, suffix, placeholder, value, onChangeText, styles, colors }: any) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRight}>
        {prefix && <Text style={styles.inputAffix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
        />
        {suffix && <Text style={styles.inputAffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function SummaryItem({ label, value, color, styles }: any) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
      justifyContent: 'space-between',
    },
    backBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: colors.ink,
    },
    scroll: { padding: Spacing.xl },

    card: {
      backgroundColor: colors.cardBg, borderRadius: Radius.lg,
      ...shadows.sm, marginBottom: Spacing.lg,
    },
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
      justifyContent: 'space-between',
    },
    inputLabel: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.ink, flex: 1,
    },
    inputRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    inputAffix: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.muted,
    },
    input: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md,
      color: colors.ink, textAlign: 'right', minWidth: 100,
    },
    divider: { height: 1, backgroundColor: colors.surfaceHigh, marginHorizontal: Spacing.lg },

    resultCard: {
      backgroundColor: colors.cardBg, borderRadius: Radius.lg,
      ...shadows.md, marginBottom: Spacing.lg, overflow: 'hidden',
    },
    emiRow: {
      backgroundColor: colors.primary, padding: Spacing.xl, alignItems: 'center',
    },
    emiLabel: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)',
    },
    emiValue: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 40,
      color: '#fff', letterSpacing: -1, marginTop: 4,
    },
    summaryRow: {
      flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm,
    },
    summaryLabel: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted, marginTop: 2,
    },
    barContainer: {
      flexDirection: 'row', height: 8, marginHorizontal: Spacing.lg, borderRadius: 4, overflow: 'hidden',
    },
    barPrincipal: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
    barInterest: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
    barLegend: {
      flexDirection: 'row', gap: Spacing.lg, padding: Spacing.lg, paddingTop: Spacing.sm,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },

    scheduleToggle: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.xs, paddingVertical: Spacing.md, marginBottom: Spacing.sm,
    },
    scheduleToggleText: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.primary,
    },

    tableCard: {
      backgroundColor: colors.cardBg, borderRadius: Radius.lg,
      ...shadows.sm, overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row', paddingVertical: 10, paddingHorizontal: Spacing.md,
    },
    tableHeader: { backgroundColor: colors.surfaceLow },
    tableHeaderText: {
      fontFamily: FontFamily.bodySemiBold, fontSize: 10,
      color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    tableCell: { flex: 1, fontFamily: FontFamily.body, fontSize: 11, color: colors.ink },
    tableCellMono: { fontFamily: FontFamily.displaySemiBold, fontSize: 11 },
  });
}
