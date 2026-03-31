import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useContactStore } from '@store/useContactStore';
import { useShakeAnimation, fadeInDown } from '@utils/animations';

export default function AddContactScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addContact } = useContactStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const { animStyle: nameShake, shake } = useShakeAnimation();

  async function handleSave() {
    if (!name.trim()) { shake(); return; }
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
        {/* Handle bar */}
        <View style={styles.handle} />

        <Animated.View entering={fadeInDown(0)} style={styles.header}>
          <Text style={styles.title}>{t('contact.addNew')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color={Colors.muted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={fadeInDown(60)} style={styles.form}>
          {/* Name */}
          <Text style={styles.fieldLabel}>{t('contact.name')}</Text>
          <Animated.View style={nameShake}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={Colors.mutedLight}
              autoFocus
              returnKeyType="next"
            />
          </Animated.View>

          {/* Phone */}
          <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>{t('contact.phone')}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('contact.phonePlaceholder')}
            placeholderTextColor={Colors.mutedLight}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceHigh,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.ink,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: Spacing.xl, flex: 1 },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  footer: { padding: Spacing.xl },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
  },
});
