import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FontFamily, FontSize, Radius, Spacing } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { usePressAnimation, fadeInDown } from '@utils/animations';

interface Props {
  onPress: () => void;
}

export default function SplitKaroBanner({ onPress }: Props) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const { animStyle, onPressIn, onPressOut } = usePressAnimation();

  return (
    <Animated.View entering={fadeInDown(120)} style={styles.wrapper}>
      <Animated.View style={animStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
          style={styles.banner}
        >
          <View style={styles.iconWrap}>
            <MaterialIcons name="call-split" size={22} color={colors.secondary} />
          </View>
          <View style={styles.textWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('home.splitKaro')}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newText}>{t('home.newBadge')}</Text>
              </View>
            </View>
            <Text style={styles.hint}>{t('home.splitKaroHint')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    wrapper: { marginBottom: Spacing.xl, ...shadows.sm },
    banner: {
      backgroundColor: colors.secondaryFixed,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      backgroundColor: colors.secondaryContainer + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 3 },
    title: {
      fontFamily: FontFamily.displaySemiBold,
      fontSize: FontSize.md,
      color: colors.secondary,
    },
    newBadge: {
      backgroundColor: colors.secondaryContainer,
      borderRadius: Radius.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    newText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 9,
      color: colors.secondary,
      letterSpacing: 0.8,
    },
    hint: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.secondary,
      opacity: 0.7,
    },
  });
}
