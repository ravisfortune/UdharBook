import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeContext';
import { Radius, Spacing, FontFamily, FontSize } from '@theme/tokens';
import { fadeInDown } from '@utils/animations';
import {
  getMonthlyStats,
  getTopContacts,
  getOverallStats,
  MonthlyStats,
  TopContact,
} from '@db/transactions';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function formatAmount(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<MonthlyStats[]>([]);
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [overall, setOverall] = useState({ totalGave: 0, totalReceived: 0, totalContacts: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const [m, t, o] = await Promise.all([
      getMonthlyStats(6),
      getTopContacts(5),
      getOverallStats(),
    ]);
    setMonthly(m);
    setTopContacts(t);
    setOverall(o);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxBar = Math.max(...monthly.flatMap((m) => [m.gave, m.received]), 1);

  const netBalance = overall.totalReceived - overall.totalGave;

  return (
    <SafeAreaView style={[s.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Animated.View entering={fadeInDown(0)}>
          <Text style={s.title}>Reports</Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Summary cards */}
            <Animated.View entering={fadeInDown(60)} style={s.cardsRow}>
              <View style={[s.card, s.cardGreen]}>
                <MaterialIcons name="arrow-downward" size={18} color={colors.green} />
                <Text style={s.cardAmount}>{formatAmount(overall.totalReceived)}</Text>
                <Text style={s.cardLabel}>Mila</Text>
              </View>
              <View style={[s.card, s.cardRed]}>
                <MaterialIcons name="arrow-upward" size={18} color={colors.red} />
                <Text style={s.cardAmount}>{formatAmount(overall.totalGave)}</Text>
                <Text style={s.cardLabel}>Diya</Text>
              </View>
              <View style={[s.card, netBalance >= 0 ? s.cardGreen : s.cardRed]}>
                <MaterialIcons
                  name={netBalance >= 0 ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={netBalance >= 0 ? colors.green : colors.red}
                />
                <Text style={[s.cardAmount, { color: netBalance >= 0 ? colors.green : colors.red }]}>
                  {formatAmount(Math.abs(netBalance))}
                </Text>
                <Text style={s.cardLabel}>{netBalance >= 0 ? 'Net Mila' : 'Net Diya'}</Text>
              </View>
            </Animated.View>

            {/* Monthly bar chart */}
            <Animated.View entering={fadeInDown(120)} style={s.section}>
              <Text style={s.sectionTitle}>Last 6 Months</Text>
              {monthly.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>Abhi koi transaction nahi hai</Text>
                </View>
              ) : (
                <View style={s.chartWrap}>
                  {/* Legend */}
                  <View style={s.legend}>
                    <View style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: colors.green }]} />
                      <Text style={s.legendLabel}>Mila</Text>
                    </View>
                    <View style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: colors.red }]} />
                      <Text style={s.legendLabel}>Diya</Text>
                    </View>
                  </View>
                  {/* Bars */}
                  <View style={s.barsRow}>
                    {monthly.map((m) => {
                      const [, mm] = m.month.split('-');
                      const gaveH = Math.max((m.gave / maxBar) * 120, m.gave > 0 ? 4 : 0);
                      const recH = Math.max((m.received / maxBar) * 120, m.received > 0 ? 4 : 0);
                      return (
                        <View key={m.month} style={s.barGroup}>
                          <View style={s.barsContainer}>
                            <View style={[s.bar, { height: gaveH, backgroundColor: colors.red }]} />
                            <View style={[s.bar, { height: recH, backgroundColor: colors.green }]} />
                          </View>
                          <Text style={s.barLabel}>{MONTH_LABELS[mm] ?? mm}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Top contacts */}
            <Animated.View entering={fadeInDown(180)} style={s.section}>
              <Text style={s.sectionTitle}>Top Contacts</Text>
              {topContacts.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>Koi contact nahi mila</Text>
                </View>
              ) : (
                <View style={s.contactList}>
                  {topContacts.map((c, i) => (
                    <View key={c.contact_id} style={s.contactRow}>
                      <View style={[s.avatar, { backgroundColor: c.contact_avatar_color }]}>
                        <Text style={s.avatarText}>{c.contact_avatar_letter}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.contactName}>{c.contact_name}</Text>
                        <Text style={s.contactVol}>
                          Volume: {formatAmount(c.total_volume)}
                        </Text>
                      </View>
                      <Text style={[s.netAmount, { color: c.net >= 0 ? colors.green : colors.red }]}>
                        {c.net >= 0 ? '+' : ''}{formatAmount(c.net)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Refresh button */}
            <Animated.View entering={fadeInDown(240)} style={s.section}>
              <TouchableOpacity style={[s.refreshBtn, { borderColor: colors.border }]} onPress={load}>
                <MaterialIcons name="refresh" size={16} color={colors.muted} />
                <Text style={[s.refreshText, { color: colors.muted }]}>Refresh</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    scroll: { padding: Spacing.xl, paddingBottom: 120 },
    title: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.xxl,
      color: colors.ink,
      marginBottom: Spacing.xxxl,
    },
    cardsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
    card: {
      flex: 1,
      borderRadius: Radius.md,
      padding: Spacing.md,
      alignItems: 'center',
      gap: 4,
    },
    cardGreen: { backgroundColor: colors.greenContainer },
    cardRed: { backgroundColor: colors.redContainer },
    cardAmount: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    cardLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    section: { marginBottom: Spacing.xxl },
    sectionTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: Spacing.md,
    },
    chartWrap: {
      backgroundColor: colors.surfaceLowest,
      borderRadius: Radius.md,
      padding: Spacing.lg,
    },
    legend: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 140,
    },
    barGroup: { alignItems: 'center', gap: 6 },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 3,
      height: 120,
    },
    bar: { width: 12, borderRadius: 4 },
    barLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },
    emptyBox: {
      backgroundColor: colors.surfaceLow,
      borderRadius: Radius.md,
      padding: Spacing.xl,
      alignItems: 'center',
    },
    emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.muted },
    contactList: {
      backgroundColor: colors.surfaceLowest,
      borderRadius: Radius.md,
      overflow: 'hidden',
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      gap: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: FontSize.md,
      color: '#fff',
    },
    contactName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.ink },
    contactVol: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.muted },
    netAmount: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.md },
    refreshBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
    },
    refreshText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm },
  });
}
