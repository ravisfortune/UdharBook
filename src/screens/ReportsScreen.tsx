import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { Radius, Spacing, FontFamily, FontSize } from '@theme/tokens';
import { fadeInDown } from '@utils/animations';
import {
  getMonthlyStats, getTopContacts, getOverallStats,
  MonthlyStats, TopContact,
} from '@db/transactions';
import { useProStore } from '@store/useProStore';
import { useContactStore } from '@store/useContactStore';
import { RootStackParamList } from '@navigation/index';
import { exportAllContactsPDF } from '@services/exportService';

const { width: SCREEN_W } = Dimensions.get('window');

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ReportsScreen() {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors]);
  const navigation = useNavigation<Nav>();
  const { reportMonths, proEnabled, isPro } = useProStore();
  const { contacts, totalMilna, totalDena } = useContactStore();

  const months = reportMonths();
  const isLimited = proEnabled && !isPro;

  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<MonthlyStats[]>([]);
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [overall, setOverall] = useState({ totalGave: 0, totalReceived: 0, totalContacts: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const [m, t, o] = await Promise.all([
      getMonthlyStats(months),
      getTopContacts(5),
      getOverallStats(),
    ]);
    setMonthly(m);
    setTopContacts(t);
    setOverall(o);
    setLoading(false);
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const netBalance = overall.totalReceived - overall.totalGave;
  const maxBar = Math.max(...monthly.flatMap((m) => [m.gave, m.received]), 1);
  const maxVolume = Math.max(...topContacts.map((c) => c.total_volume), 1);

  // Current month stats
  const currentMonth = monthly[monthly.length - 1];

  function handleExport() {
    if (contacts.length === 0) {
      Alert.alert('No data', 'Koi contact nahi hai export karne ke liye.');
      return;
    }
    exportAllContactsPDF(contacts, totalMilna, totalDena).catch(() => {});
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <Animated.View entering={fadeInDown(0)} style={s.header}>
          <Text style={s.title}>Reports</Text>
          <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
            <MaterialIcons name="ios-share" size={16} color={colors.primary} />
            <Text style={s.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
        ) : (
          <>
            {/* Hero net balance */}
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <LinearGradient
                colors={netBalance >= 0
                  ? [colors.primary, colors.primaryContainer]
                  : ['#dc2626', '#ef4444']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.hero}
              >
                <Text style={s.heroLabel}>Net Balance</Text>
                <Text style={s.heroAmount}>
                  {netBalance >= 0 ? '+' : ''}{fmt(netBalance)}
                </Text>
                <Text style={s.heroSub}>
                  {netBalance >= 0 ? 'Overall tumhe milna hai' : 'Overall tumhe dena hai'}
                </Text>

                <View style={s.heroStats}>
                  <View style={s.heroStatItem}>
                    <View style={s.heroStatDot} />
                    <View>
                      <Text style={s.heroStatValue}>{fmt(overall.totalReceived)}</Text>
                      <Text style={s.heroStatLabel}>Total Mila</Text>
                    </View>
                  </View>
                  <View style={s.heroStatDivider} />
                  <View style={s.heroStatItem}>
                    <View style={[s.heroStatDot, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                    <View>
                      <Text style={s.heroStatValue}>{fmt(overall.totalGave)}</Text>
                      <Text style={s.heroStatLabel}>Total Diya</Text>
                    </View>
                  </View>
                  <View style={s.heroStatDivider} />
                  <View style={s.heroStatItem}>
                    <View style={[s.heroStatDot, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                    <View>
                      <Text style={s.heroStatValue}>{overall.totalContacts}</Text>
                      <Text style={s.heroStatLabel}>Contacts</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* This month quick stats */}
            {currentMonth && (
              <Animated.View entering={FadeInDown.delay(120)} style={s.section}>
                <Text style={s.sectionLabel}>This Month</Text>
                <View style={s.thisMonthRow}>
                  <View style={[s.thisMonthCard, { backgroundColor: colors.greenContainer }]}>
                    <MaterialIcons name="arrow-downward" size={20} color={colors.green} />
                    <Text style={[s.thisMonthAmount, { color: colors.green }]}>{fmt(currentMonth.received)}</Text>
                    <Text style={s.thisMonthLabel}>Mila</Text>
                  </View>
                  <View style={[s.thisMonthCard, { backgroundColor: colors.redContainer }]}>
                    <MaterialIcons name="arrow-upward" size={20} color={colors.red} />
                    <Text style={[s.thisMonthAmount, { color: colors.red }]}>{fmt(currentMonth.gave)}</Text>
                    <Text style={s.thisMonthLabel}>Diya</Text>
                  </View>
                  <View style={[s.thisMonthCard, { backgroundColor: colors.surfaceLow }]}>
                    <MaterialIcons name="swap-horiz" size={20} color={colors.muted} />
                    <Text style={[s.thisMonthAmount, { color: colors.ink }]}>{currentMonth.count}</Text>
                    <Text style={s.thisMonthLabel}>Transactions</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Monthly bar chart */}
            <Animated.View entering={FadeInDown.delay(180)} style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>Last {months} Months</Text>
                <View style={s.legend}>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colors.green }]} />
                    <Text style={s.legendText}>Mila</Text>
                  </View>
                  <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colors.red }]} />
                    <Text style={s.legendText}>Diya</Text>
                  </View>
                </View>
              </View>

              {monthly.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={{ fontSize: 32 }}>📊</Text>
                  <Text style={s.emptyText}>Abhi koi transaction nahi hai</Text>
                </View>
              ) : (
                <View style={s.chartCard}>
                  <View style={s.barsRow}>
                    {monthly.map((m, i) => {
                      const [, mm] = m.month.split('-');
                      const gaveH = Math.max((m.gave / maxBar) * 140, m.gave > 0 ? 6 : 0);
                      const recH = Math.max((m.received / maxBar) * 140, m.received > 0 ? 6 : 0);
                      const isCurrent = i === monthly.length - 1;
                      return (
                        <View key={m.month} style={s.barGroup}>
                          {/* Value labels */}
                          <View style={s.barValues}>
                            {m.received > 0 && (
                              <Text style={[s.barValueText, { color: colors.green }]}>{fmt(m.received)}</Text>
                            )}
                            {m.gave > 0 && (
                              <Text style={[s.barValueText, { color: colors.red }]}>{fmt(m.gave)}</Text>
                            )}
                          </View>
                          {/* Bars */}
                          <View style={s.barsContainer}>
                            <View style={[
                              s.bar,
                              { height: recH, backgroundColor: colors.green },
                              isCurrent && s.barCurrent,
                            ]} />
                            <View style={[
                              s.bar,
                              { height: gaveH, backgroundColor: colors.red },
                              isCurrent && s.barCurrent,
                            ]} />
                          </View>
                          <Text style={[s.barLabel, isCurrent && { color: colors.primary, fontFamily: FontFamily.bodySemiBold }]}>
                            {MONTH_LABELS[mm] ?? mm}
                          </Text>
                          {isCurrent && <View style={[s.barCurrentDot, { backgroundColor: colors.primary }]} />}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Pro gate */}
              {isLimited && (
                <TouchableOpacity style={s.proGate} onPress={() => navigation.navigate('Upgrade')}>
                  <MaterialIcons name="lock" size={14} color={colors.primary} />
                  <Text style={s.proGateText}>Pro mein {12 - months} aur months unlock karo</Text>
                  <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Top contacts */}
            <Animated.View entering={FadeInDown.delay(240)} style={s.section}>
              <Text style={s.sectionLabel}>Top Contacts</Text>
              {topContacts.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={{ fontSize: 32 }}>👥</Text>
                  <Text style={s.emptyText}>Koi contact nahi mila</Text>
                </View>
              ) : (
                <View style={s.contactsCard}>
                  {topContacts.map((c, i) => (
                    <Animated.View
                      key={c.contact_id}
                      entering={FadeInRight.delay(240 + i * 60)}
                      style={[s.contactRow, i === topContacts.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <View style={[s.avatar, { backgroundColor: c.contact_avatar_color }]}>
                        <Text style={s.avatarText}>{c.contact_avatar_letter}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={s.contactMeta}>
                          <Text style={s.contactName}>{c.contact_name}</Text>
                          <Text style={[s.netAmount, { color: c.net >= 0 ? colors.green : colors.red }]}>
                            {c.net >= 0 ? '+' : ''}{fmt(c.net)}
                          </Text>
                        </View>
                        {/* Progress bar */}
                        <View style={s.progressBg}>
                          <View style={[
                            s.progressFill,
                            {
                              width: `${(c.total_volume / maxVolume) * 100}%`,
                              backgroundColor: c.net >= 0 ? colors.green : colors.red,
                            },
                          ]} />
                        </View>
                        <Text style={s.contactVol}>Volume: {fmt(c.total_volume)}</Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Refresh */}
            <Animated.View entering={FadeInDown.delay(300)}>
              <TouchableOpacity style={s.refreshBtn} onPress={load}>
                <MaterialIcons name="refresh" size={16} color={colors.muted} />
                <Text style={s.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    scroll: { padding: Spacing.xl },

    header: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: Spacing.xl,
    },
    title: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.xxl, color: colors.ink,
    },
    exportBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.primaryFixed, borderRadius: Radius.full,
      paddingHorizontal: Spacing.md, paddingVertical: 8,
    },
    exportBtnText: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.primary,
    },

    // Hero
    hero: {
      borderRadius: Radius.xl, padding: Spacing.xxl,
      marginBottom: Spacing.xl, ...shadows.lg,
    },
    heroLabel: {
      fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.7)',
    },
    heroAmount: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 44,
      color: '#fff', letterSpacing: -1.5, marginTop: 4,
    },
    heroSub: {
      fontFamily: FontFamily.body, fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.65)', marginTop: 4, marginBottom: Spacing.xl,
    },
    heroStats: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: Radius.md, padding: Spacing.md,
    },
    heroStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    heroStatDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)',
    },
    heroStatValue: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm, color: '#fff',
    },
    heroStatLabel: {
      fontFamily: FontFamily.body, fontSize: 10, color: 'rgba(255,255,255,0.6)',
    },
    heroStatDivider: {
      width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4,
    },

    // This month
    thisMonthRow: { flexDirection: 'row', gap: Spacing.sm },
    thisMonthCard: {
      flex: 1, borderRadius: Radius.lg, padding: Spacing.md,
      alignItems: 'center', gap: 4, ...shadows.sm,
    },
    thisMonthAmount: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.md,
    },
    thisMonthLabel: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted,
    },

    // Section
    section: { marginBottom: Spacing.xl },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: Spacing.md,
    },
    sectionLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs,
      color: colors.muted, textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: Spacing.md,
    },
    legend: { flexDirection: 'row', gap: Spacing.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },

    // Chart
    chartCard: {
      backgroundColor: colors.cardBg, borderRadius: Radius.lg,
      padding: Spacing.lg, ...shadows.sm,
    },
    barsRow: {
      flexDirection: 'row', alignItems: 'flex-end',
      justifyContent: 'space-between', height: 180,
    },
    barGroup: { alignItems: 'center', flex: 1 },
    barValues: { alignItems: 'center', marginBottom: 4, minHeight: 28 },
    barValueText: { fontFamily: FontFamily.body, fontSize: 9 },
    barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 140 },
    bar: { width: 10, borderRadius: 4 },
    barCurrent: { width: 13, borderRadius: 5 },
    barLabel: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs,
      color: colors.muted, marginTop: 6,
    },
    barCurrentDot: {
      width: 5, height: 5, borderRadius: 3, marginTop: 3,
    },

    // Pro gate
    proGate: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.primaryFixed, borderRadius: Radius.md,
      padding: Spacing.md, marginTop: Spacing.md,
    },
    proGateText: {
      flex: 1, fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.xs, color: colors.primary,
    },

    // Top contacts
    contactsCard: {
      backgroundColor: colors.cardBg, borderRadius: Radius.lg,
      overflow: 'hidden', ...shadows.sm,
    },
    contactRow: {
      flexDirection: 'row', alignItems: 'center',
      padding: Spacing.lg, gap: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceHigh,
    },
    avatar: {
      width: 40, height: 40, borderRadius: Radius.full,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.md, color: '#fff',
    },
    contactMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    contactName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.ink },
    contactVol: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },
    netAmount: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm },
    progressBg: {
      height: 4, backgroundColor: colors.surfaceHigh, borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: 4, borderRadius: 2 },

    // Empty
    emptyBox: {
      backgroundColor: colors.surfaceLow, borderRadius: Radius.lg,
      padding: Spacing.xxl, alignItems: 'center', gap: Spacing.sm,
    },
    emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.muted },

    // Refresh
    refreshBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, padding: Spacing.md,
      borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border,
    },
    refreshText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.muted },
  });
}
