import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { FontFamily, FontSize, Radius, Spacing } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { formatCurrency } from '@utils/currency';

interface Props {
  totalMilna: number;
  totalDena: number;
}

export default function BalanceHeroCard({ totalMilna, totalDena }: Props) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(shadows), [colors]);
  const net = totalMilna - totalDena;
  const isSettled = net === 0 && totalMilna === 0;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.wrapper}>
      <LinearGradient
        colors={[colors.heroBg[0], colors.heroBg[1] ?? colors.heroBg[0], colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{t('home.netBalance')}</Text>

        <Text style={styles.netAmount}>
          {isSettled ? t('home.settled') : formatCurrency(Math.abs(net))}
        </Text>
        {!isSettled && (
          <Text style={[styles.netLabel, { color: net >= 0 ? '#86efac' : '#fca5a5' }]}>
            {net >= 0 ? `↑ ${t('home.milnaHai')}` : `↓ ${t('home.denaHai')}`}
          </Text>
        )}

        <View style={styles.subRow}>
          <View style={styles.glassCard}>
            <Text style={styles.glassLabel}>{t('home.milnaHai')}</Text>
            <Text style={[styles.glassAmount, { color: '#86efac' }]}>
              {formatCurrency(totalMilna)}
            </Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.glassLabel}>{t('home.denaHai')}</Text>
            <Text style={[styles.glassAmount, { color: '#fca5a5' }]}>
              {formatCurrency(totalDena)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function makeStyles(shadows: any) {
  return StyleSheet.create({
    wrapper: {
      borderRadius: Radius.xl,
      overflow: 'hidden',
      ...shadows.lg,
      marginBottom: Spacing.xl,
    },
    gradient: {
      padding: Spacing.xxl,
      paddingBottom: Spacing.xl,
      borderRadius: Radius.xl,
    },
    label: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.6)',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: Spacing.sm,
    },
    netAmount: {
      fontFamily: FontFamily.displayExtraBold,
      fontSize: 44,
      color: '#ffffff',
      letterSpacing: -1,
      lineHeight: 52,
    },
    netLabel: {
      fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.sm,
      marginTop: 4,
      marginBottom: Spacing.xl,
    },
    subRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
    glassCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: Radius.md,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    glassLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: 'rgba(255,255,255,0.55)',
      marginBottom: 6,
    },
    glassAmount: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.xl,
      letterSpacing: -0.5,
    },
  });
}
