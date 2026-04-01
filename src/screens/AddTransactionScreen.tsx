import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useTransactionStore } from '@store/useTransactionStore';
import { useContactStore } from '@store/useContactStore';
import { RootStackParamList } from '@/navigation';
import { useShakeAnimation, fadeInDown } from '@utils/animations';
import { formatCurrency } from '@utils/currency';

type RouteT = RouteProp<RootStackParamList, 'AddTransaction'>;
type TxnType = 'gave' | 'received';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteT>();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);

  const { addTransaction } = useTransactionStore();
  const { contacts } = useContactStore();

  const [txnType, setTxnType] = useState<TxnType>(route.params?.defaultType ?? 'gave');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(route.params?.contactId ?? '');
  const [selectedContactName, setSelectedContactName] = useState(route.params?.contactName ?? '');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { animStyle: amountShake, shake } = useShakeAnimation();
  const parsedAmount = parseFloat(amount.replace(/,/g, ''));

  async function handleSave() {
    if (!parsedAmount || parsedAmount <= 0) { shake(); return; }
    if (!selectedContactId) { shake(); return; }
    setSaving(true);
    await addTransaction({
      contact_id: selectedContactId,
      type: txnType,
      amount: parsedAmount,
      note: note.trim() || undefined,
      date: Date.now(),
    });
    setSaved(true);
    setTimeout(() => navigation.goBack(), 900);
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  if (saved) {
    return (
      <View style={styles.successOverlay}>
        <Animated.View entering={ZoomIn.springify()} style={styles.successContent}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check" size={40} color={colors.green} />
          </View>
          <Text style={styles.successText}>{t('transaction.success')}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.handle} />

        <Animated.View entering={fadeInDown(0)} style={styles.header}>
          <Text style={styles.title}>{t('transaction.title')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Type Toggle */}
          <Animated.View entering={fadeInDown(40)} style={styles.section}>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, txnType === 'gave' && styles.typeBtnActive]}
                onPress={() => setTxnType('gave')}
              >
                <Text style={[styles.typeBtnText, txnType === 'gave' && styles.typeBtnTextActive]}>
                  {t('transaction.maineDiya')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, txnType === 'received' && styles.typeBtnActiveGreen]}
                onPress={() => setTxnType('received')}
              >
                <Text style={[styles.typeBtnText, txnType === 'received' && styles.typeBtnTextActiveGreen]}>
                  {t('transaction.maineLiya')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={fadeInDown(80)} style={styles.section}>
            <Text style={styles.amountLabel}>₹</Text>
            <Animated.View style={amountShake}>
              <TextInput
                style={[styles.amountInput, { color: txnType === 'gave' ? colors.red : colors.green }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.surfaceHigh}
                keyboardType="numeric"
                autoFocus={!route.params?.contactId}
              />
            </Animated.View>
          </Animated.View>

          {/* Contact Picker */}
          <Animated.View entering={fadeInDown(120)} style={styles.section}>
            <Text style={styles.fieldLabel}>{t('transaction.selectContact')}</Text>
            <TouchableOpacity
              style={styles.contactPickerBtn}
              onPress={() => setShowContactPicker(!showContactPicker)}
            >
              <View style={styles.contactPickerLeft}>
                {selectedContactName ? (
                  <>
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>{selectedContactName[0].toUpperCase()}</Text>
                    </View>
                    <Text style={styles.contactPickerName}>{selectedContactName}</Text>
                  </>
                ) : (
                  <Text style={styles.contactPickerPlaceholder}>{t('transaction.searchContact')}</Text>
                )}
              </View>
              <MaterialIcons
                name={showContactPicker ? 'expand-less' : 'expand-more'}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>

            {showContactPicker && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.contactDropdown}>
                <TextInput
                  style={styles.contactSearch}
                  placeholder={t('transaction.searchContact')}
                  placeholderTextColor={colors.mutedLight}
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  autoFocus
                />
                <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                  {filteredContacts.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.contactOption}
                      onPress={() => {
                        setSelectedContactId(c.id);
                        setSelectedContactName(c.name);
                        setShowContactPicker(false);
                        setContactSearch('');
                      }}
                    >
                      <View style={[styles.miniAvatar, { backgroundColor: c.avatar_color + '22' }]}>
                        <Text style={[styles.miniAvatarText, { color: c.avatar_color }]}>{c.avatar_letter}</Text>
                      </View>
                      <Text style={styles.contactOptionName}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredContacts.length === 0 && (
                    <Text style={styles.noContactsText}>{t('common.noData')}</Text>
                  )}
                </ScrollView>
              </Animated.View>
            )}
          </Animated.View>

          {/* Note */}
          <Animated.View entering={fadeInDown(160)} style={styles.section}>
            <Text style={styles.fieldLabel}>{t('transaction.note')}</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder={t('transaction.notePlaceholder')}
              placeholderTextColor={colors.mutedLight}
              multiline
              returnKeyType="done"
            />
          </Animated.View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Save */}
        <Animated.View entering={fadeInDown(200)} style={styles.footer}>
          {parsedAmount > 0 && selectedContactName ? (
            <Text style={styles.previewText}>
              {selectedContactName} {txnType === 'gave'
                ? '← ' + t('transaction.gave')
                : '→ ' + t('transaction.received')}{' '}
              {formatCurrency(parsedAmount)}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: txnType === 'gave' ? colors.primary : colors.greenBg },
              saving && { opacity: 0.6 },
            ]}
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
      paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl,
    },
    title: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: colors.ink },
    closeBtn: {
      width: 36, height: 36, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
    },
    section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
    typeToggle: {
      flexDirection: 'row', gap: Spacing.sm,
      backgroundColor: colors.surfaceLow, borderRadius: Radius.lg, padding: 4,
    },
    typeBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
    typeBtnActive: { backgroundColor: colors.primary, ...shadows.sm },
    typeBtnActiveGreen: { backgroundColor: colors.greenBg, ...shadows.sm },
    typeBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.muted },
    typeBtnTextActive: { color: colors.onPrimary, fontFamily: FontFamily.bodySemiBold },
    typeBtnTextActiveGreen: { color: '#fff', fontFamily: FontFamily.bodySemiBold },
    amountLabel: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 48,
      color: colors.surfaceHigh, position: 'absolute', top: 8, left: Spacing.xl + 4,
    },
    amountInput: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 56,
      letterSpacing: -2, paddingLeft: 48, minHeight: 80,
    },
    fieldLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs,
      color: colors.muted, textTransform: 'uppercase',
      letterSpacing: 0.8, marginBottom: Spacing.sm,
    },
    contactPickerBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surfaceLow, borderRadius: Radius.md, padding: Spacing.lg,
    },
    contactPickerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    contactPickerName: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.ink },
    contactPickerPlaceholder: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: colors.mutedLight },
    contactDropdown: {
      marginTop: Spacing.sm, backgroundColor: colors.cardBg,
      borderRadius: Radius.md, overflow: 'hidden', ...shadows.md,
    },
    contactSearch: {
      padding: Spacing.md, fontFamily: FontFamily.body,
      fontSize: FontSize.md, color: colors.ink,
      borderBottomWidth: 1, borderBottomColor: colors.surfaceLow,
    },
    contactOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
    contactOptionName: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.ink },
    noContactsText: {
      fontFamily: FontFamily.body, fontSize: FontSize.sm,
      color: colors.muted, padding: Spacing.md, textAlign: 'center',
    },
    miniAvatar: {
      width: 32, height: 32, borderRadius: Radius.full,
      backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center',
    },
    miniAvatarText: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm, color: colors.primary },
    noteInput: {
      backgroundColor: colors.surfaceLow, borderRadius: Radius.md,
      padding: Spacing.lg, fontFamily: FontFamily.body,
      fontSize: FontSize.md, color: colors.ink, minHeight: 60,
    },
    footer: { padding: Spacing.xl, paddingTop: 0 },
    previewText: {
      fontFamily: FontFamily.body, fontSize: FontSize.sm,
      color: colors.muted, textAlign: 'center', marginBottom: Spacing.md,
    },
    saveBtn: { borderRadius: Radius.full, padding: Spacing.lg, alignItems: 'center', ...shadows.md },
    saveBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: '#fff' },
    successOverlay: {
      flex: 1, backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center',
    },
    successContent: { alignItems: 'center' },
    successIcon: {
      width: 80, height: 80, borderRadius: Radius.full,
      backgroundColor: colors.greenContainer,
      alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    },
    successText: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.xl, color: colors.greenBg },
  });
}
