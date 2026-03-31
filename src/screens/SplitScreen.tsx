import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useSplitStore } from '@store/useSplitStore';
import { usePressAnimation, fadeInDown } from '@utils/animations';
import { RootStackParamList } from '@/navigation';
import { formatCurrency } from '@utils/currency';
import { relativeDate } from '@utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SPLIT_TYPES = [
  {
    key: 'bill' as const,
    icon: 'receipt-long',
    emoji: '🧾',
    gradient: ['#000666', '#1a237e'] as const,
    title: 'Bill Split',
    desc: 'Restaurant, shopping, travel',
    hint: 'Equal / Custom / Percent / Item-wise',
  },
  {
    key: 'loan' as const,
    icon: 'calendar-today',
    emoji: '📅',
    gradient: ['#7e5700', '#b37a00'] as const,
    title: 'Loan EMI',
    desc: 'Repay in installments',
    hint: '2 to 24 monthly EMIs',
  },
  {
    key: 'group' as const,
    icon: 'group',
    emoji: '👥',
    gradient: ['#003909', '#1b5e20'] as const,
    title: 'Group Udhar',
    desc: 'Multiple people at once',
    hint: 'Individual amounts per person',
  },
] as const;

function SplitTypeCard({
  item,
  onPress,
  index,
}: {
  item: (typeof SPLIT_TYPES)[number];
  onPress: () => void;
  index: number;
}) {
  const { animStyle, onPressIn, onPressOut } = usePressAnimation();

  return (
    <Animated.View entering={fadeInDown(index * 80)} style={[animStyle, styles.cardWrapper]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <View style={styles.cardArrow}>
              <MaterialIcons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
          <View style={styles.cardHintRow}>
            <Text style={styles.cardHint}>{item.hint}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SplitScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { splits, loadSplits, setSplitType, setMethod, reset } = useSplitStore();

  useFocusEffect(
    useCallback(() => {
      loadSplits();
    }, [])
  );

  function goToSplit(type: 'bill' | 'loan' | 'group') {
    reset();
    setSplitType(type);
    if (type === 'bill') {
      setMethod('equal');
      navigation.navigate('SplitBill');
    } else if (type === 'loan') {
      setMethod('equal');
      navigation.navigate('SplitLoan');
    } else {
      setMethod('custom');
      navigation.navigate('SplitGroup');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.title}>{t('split.title')}</Text>
        <Text style={styles.subtitle}>Expenses aasaan se baanto</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Split type cards */}
        {SPLIT_TYPES.map((item, i) => (
          <SplitTypeCard
            key={item.key}
            item={item}
            index={i}
            onPress={() => goToSplit(item.key)}
          />
        ))}

        {/* Recent splits */}
        {splits.length > 0 && (
          <Animated.View entering={fadeInDown(280)}>
            <Text style={styles.sectionTitle}>Recent Splits</Text>
            {splits.slice(0, 5).map((s, i) => (
              <Animated.View
                key={s.id}
                entering={fadeInDown(280 + i * 50)}
                style={styles.recentRow}
              >
                <Text style={styles.recentEmoji}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>{s.title || 'Split'}</Text>
                  <Text style={styles.recentDate}>
                    {relativeDate(s.created_at, 'en')}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>{formatCurrency(s.total_amount)}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: {
    fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl,
    color: Colors.ink, letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: Colors.mutedLight, marginTop: 4,
  },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  cardWrapper: { marginBottom: Spacing.md },
  card: { borderRadius: Radius.xl, padding: Spacing.xxl, ...Shadows.lg },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  cardEmoji: { fontSize: 36 },
  cardArrow: {
    width: 32, height: 32, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xl,
    color: '#fff', marginBottom: 4,
  },
  cardDesc: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  cardHintRow: {
    marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  cardHint: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  sectionTitle: {
    fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg,
    color: Colors.ink, marginTop: Spacing.xl, marginBottom: Spacing.md,
  },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceLowest, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  recentEmoji: { fontSize: 24 },
  recentTitle: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.ink },
  recentDate: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  recentAmount: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md, color: Colors.primary },
});
