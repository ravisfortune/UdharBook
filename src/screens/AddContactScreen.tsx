import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useContactStore } from '@store/useContactStore';
import { useShakeAnimation, fadeInDown } from '@utils/animations';
import { useProStore } from '@store/useProStore';
import { RootStackParamList } from '@navigation/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddContactScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const { addContact, contacts } = useContactStore();
  const { canAddContact } = useProStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const { animStyle: nameShake, shake } = useShakeAnimation();

  async function handleSave() {
    if (!name.trim()) { shake(); return; }
    if (!canAddContact(contacts.length)) {
      navigation.navigate('Upgrade');
      return;
    }
    setSaving(true);
    await addContact(name.trim(), phone.trim() || undefined);
    setSaving(false);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.handle} />

        <Animated.View entering={fadeInDown(0)} style={styles.header}>
          <Text style={styles.title}>{t('contact.addNew')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={fadeInDown(60)} style={styles.form}>
          <Text style={styles.fieldLabel}>{t('contact.name')}</Text>
          <Animated.View style={nameShake}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={colors.mutedLight}
              autoFocus
              returnKeyType="next"
            />
          </Animated.View>

          <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>{t('contact.phone')}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('contact.phonePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            keyboardType="phone-pad"
            returnKeyType="done"
          />
        </Animated.View>

        <Animated.View entering={fadeInDown(120)} style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.cardBg },
    handle: {
      width: 36, height: 4, borderRadius: 2,
      backgroundColor: colors.surfaceHigh,
      alignSelf: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxxl,
    },
    title: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: colors.ink },
    closeBtn: {
      width: 36, height: 36, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
    },
    form: { paddingHorizontal: Spacing.xl, flex: 1 },
    fieldLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
      color: colors.muted, marginBottom: Spacing.sm,
      textTransform: 'uppercase', letterSpacing: 0.8,
    },
    input: {
      backgroundColor: colors.surfaceLow, borderRadius: Radius.md,
      padding: Spacing.lg, fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.lg, color: colors.ink,
    },
    footer: { padding: Spacing.xl },
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: Radius.full,
      padding: Spacing.lg, alignItems: 'center', ...shadows.md,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: colors.onPrimary },
  });
}
