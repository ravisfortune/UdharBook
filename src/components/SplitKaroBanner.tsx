import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, FontFamily, FontSize, Radius, Spacing, Shadows } from '@theme/tokens';
import { usePressAnimation, fadeInDown } from '@utils/animations';

interface Props {
  onPress: () => void;
}

export default function SplitKaroBanner({ onPress }: Props) {
  const { t } = useTranslation();
  const { animStyle, onPressIn, onPressOut } = usePressAnimation();

  return (
    <Animated.View entering={fadeInDown(120)} style={[animStyle, styles.wrapper]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.banner}
      >
        <View style={styles.iconWrap}>
          <MaterialIcons name="call-split" size={22} color={Colors.secondary} />
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
        <MaterialIcons name="chevron-right" size={20} color={Colors.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  banner: {
    backgroundColor: Colors.secondaryFixed,
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
    backgroundColor: 'rgba(126,87,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  title: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.md,
    color: Colors.secondary,
  },
  newBadge: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: Colors.secondary,
    letterSpacing: 0.8,
  },
  hint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.secondary,
    opacity: 0.7,
  },
});
