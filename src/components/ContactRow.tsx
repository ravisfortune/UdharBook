import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { FontFamily, FontSize, Radius, Spacing } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { ContactWithBalance } from '@db/contacts';
import { formatCurrency } from '@utils/currency';
import { relativeDate } from '@utils/date';
import { usePressAnimation, fadeInDown, staggerDelay, springLayout } from '@utils/animations';
import { useAppStore } from '@store/useAppStore';

interface Props {
  contact: ContactWithBalance;
  onPress: () => void;
  index: number;
}

export default function ContactRow({ contact, onPress, index }: Props) {
  const { locale } = useAppStore();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const { animStyle, onPressIn, onPressOut } = usePressAnimation();
  const isSettled = contact.net_balance === 0;
  const isMilna = contact.net_balance > 0;

  return (
    <Animated.View entering={fadeInDown(staggerDelay(index))} layout={springLayout}>
      <Animated.View style={animStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
          style={styles.row}
        >
          <View style={[styles.avatar, { backgroundColor: contact.avatar_color + '22' }]}>
            <Text style={[styles.avatarLetter, { color: contact.avatar_color }]}>
              {contact.avatar_letter}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{contact.name}</Text>
            {contact.last_txn_date ? (
              <Text style={styles.date}>
                {relativeDate(contact.last_txn_date, locale as 'hi' | 'en')}
              </Text>
            ) : (
              <Text style={styles.date}>—</Text>
            )}
          </View>

          <View style={styles.right}>
            {isSettled ? (
              <View style={styles.settledBadge}>
                <Text style={styles.settledText}>✓</Text>
              </View>
            ) : (
              <Text style={[styles.balance, { color: isMilna ? colors.green : colors.red }]}>
                {formatCurrency(Math.abs(contact.net_balance))}
              </Text>
            )}
            <MaterialIcons name="chevron-right" size={16} color={colors.mutedLight} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      ...shadows.sm,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    avatarLetter: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg },
    info: { flex: 1, marginRight: Spacing.sm },
    name: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
      marginBottom: 3,
    },
    date: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: colors.mutedLight },
    right: { alignItems: 'flex-end', flexDirection: 'row', alignContent: 'center', gap: 4 },
    balance: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.md,
      letterSpacing: -0.3,
    },
    settledBadge: {
      backgroundColor: colors.greenContainer,
      width: 24,
      height: 24,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settledText: {
      fontSize: 12,
      color: colors.greenBg,
      fontFamily: FontFamily.bodyBold,
    },
  });
}
