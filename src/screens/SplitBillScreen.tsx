import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FontFamily, FontSize, Spacing, Radius } from '@theme/tokens';
import { useTheme } from '@theme/ThemeContext';
import { ThemeColors } from '@theme/themes';
import { useSplitStore } from '@store/useSplitStore';
import ContactPicker from '@components/ContactPicker';
import { formatCurrency } from '@utils/currency';
import { usePressAnimation, fadeInDown } from '@utils/animations';
import { sendWhatsAppReminder } from '@services/whatsapp';

const EMOJIS = ['💸', '🍕', '🚕', '✈️', '🏠', '🎉', '🛒', '🍺', '⚡', '🎬'];
const METHODS = [
  { key: 'equal', label: 'Equal', icon: 'grid-on' },
  { key: 'custom', label: 'Custom', icon: 'tune' },
  { key: 'percent', label: 'Percent', icon: 'percent' },
  { key: 'item', label: 'Item-wise', icon: 'list' },
] as const;

export default function SplitBillScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadows), [colors]);
  const store = useSplitStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalAssigned = store.members.reduce((s, m) => s + m.amount, 0);
  const totalPct = store.members.reduce((s, m) => s + m.percentage, 0);
  const isValid = store.totalAmount > 0 && store.members.length >= 2;

  const step2Valid = store.members.length >= 2 && (() => {
    if (store.method === 'percent') return Math.abs(totalPct - 100) < 0.01;
    if (store.method === 'equal') return true;
    return Math.abs(totalAssigned - store.totalAmount) < 1;
  })();

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    try {
      await store.saveSplit();
      setSaved(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (e) {
      Alert.alert('Error', 'Could not save split');
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <View style={styles.successScreen}>
        <Animated.View entering={ZoomIn.springify()} style={styles.successContent}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Split Done!</Text>
          <Text style={styles.successSub}>Transactions created for all members</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Split</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Step indicator */}
      <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.stepRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              store.step >= s && styles.stepDotActive,
              store.step === s && styles.stepDotCurrent,
            ]}>
              <Text style={[
                styles.stepNum,
                store.step >= s && styles.stepNumActive,
              ]}>{s}</Text>
            </View>
            {s < 3 && <View style={[styles.stepLine, store.step > s && styles.stepLineActive]} />}
          </View>
        ))}
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── STEP 1: Setup ── */}
        {store.step === 1 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Bill Details</Text>

            {/* Emoji picker */}
            <Text style={styles.fieldLabel}>Choose Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, store.emoji === e && styles.emojiBtnActive]}
                  onPress={() => store.setEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Bill name */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Bill Name</Text>
            <TextInput
              style={styles.input}
              value={store.title}
              onChangeText={store.setTitle}
              placeholder="e.g. Dinner at Barbeque Nation"
              placeholderTextColor={colors.mutedLight}
            />

            {/* Total amount */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Total Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={store.totalAmount > 0 ? String(store.totalAmount) : ''}
                onChangeText={v => store.setTotalAmount(parseFloat(v) || 0)}
                placeholder="0"
                placeholderTextColor={colors.surfaceHigh}
                keyboardType="numeric"
              />
            </View>

            {/* Split method */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Split Method</Text>
            <View style={styles.methodGrid}>
              {METHODS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.methodCard, store.method === m.key && styles.methodCardActive]}
                  onPress={() => store.setMethod(m.key)}
                >
                  <MaterialIcons
                    name={m.icon as any}
                    size={22}
                    color={store.method === m.key ? colors.onPrimary : colors.muted}
                  />
                  <Text style={[
                    styles.methodLabel,
                    store.method === m.key && styles.methodLabelActive,
                  ]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── STEP 2: Members + Amounts ── */}
        {store.step === 2 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add People</Text>

            <ContactPicker
              selected={store.members}
              onAdd={m => {
                store.addMember(m);
                if (store.method === 'equal') store.equalSplit();
              }}
              onRemove={id => {
                store.removeMember(id);
                if (store.method === 'equal') store.equalSplit();
              }}
            />

            {/* Member amounts */}
            {store.members.length > 0 && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.membersSection}>
                <View style={styles.membersSectionHeader}>
                  <Text style={styles.fieldLabel}>Amounts</Text>
                  {store.method === 'equal' && (
                    <TouchableOpacity onPress={store.equalSplit} style={styles.equalBtn}>
                      <MaterialIcons name="grid-on" size={14} color={colors.primary} />
                      <Text style={styles.equalBtnText}>Re-split equally</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {store.members.map((m, i) => (
                  <Animated.View
                    key={m.contactId}
                    entering={fadeInDown(i * 60)}
                    style={styles.memberRow}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: m.avatarColor + '22' }]}>
                      <Text style={[styles.memberAvatarText, { color: m.avatarColor }]}>
                        {m.avatarLetter}
                      </Text>
                    </View>
                    <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>

                    {store.method === 'percent' ? (
                      <View style={styles.memberInput}>
                        <TextInput
                          style={styles.memberAmountInput}
                          value={m.percentage > 0 ? String(m.percentage) : ''}
                          onChangeText={v => store.updateMemberPercent(m.contactId, parseFloat(v) || 0)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.mutedLight}
                        />
                        <Text style={styles.pctSign}>%</Text>
                      </View>
                    ) : (
                      <View style={styles.memberInput}>
                        <Text style={styles.memberRupee}>₹</Text>
                        <TextInput
                          style={styles.memberAmountInput}
                          value={m.amount > 0 ? String(m.amount) : ''}
                          onChangeText={v => store.updateMemberAmount(m.contactId, parseFloat(v) || 0)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.mutedLight}
                          editable={store.method !== 'equal' && store.method !== 'item'}
                        />
                      </View>
                    )}
                  </Animated.View>
                ))}

                {/* Running total */}
                <View style={styles.totalBar}>
                  <Text style={styles.totalBarLabel}>
                    {store.method === 'percent' ? 'Total %' : 'Assigned'}
                  </Text>
                  <Text style={[
                    styles.totalBarValue,
                    {
                      color: store.method === 'percent'
                        ? (Math.abs(totalPct - 100) < 0.01 ? colors.green : colors.red)
                        : (Math.abs(totalAssigned - store.totalAmount) < 1 ? colors.green : colors.red)
                    }
                  ]}>
                    {store.method === 'percent'
                      ? `${totalPct.toFixed(1)}%`
                      : `${formatCurrency(totalAssigned)} / ${formatCurrency(store.totalAmount)}`}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Item-wise section */}
            {store.method === 'item' && store.members.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.itemSection}>
                <Text style={styles.fieldLabel}>Items</Text>
                {store.items.map((item, i) => (
                  <View key={item.id} style={styles.itemRow}>
                    <TextInput
                      style={[styles.itemInput, { flex: 2 }]}
                      value={item.name}
                      onChangeText={v => store.updateItem(item.id, { name: v })}
                      placeholder="Item name"
                      placeholderTextColor={colors.mutedLight}
                    />
                    <TextInput
                      style={[styles.itemInput, { flex: 1 }]}
                      value={item.price > 0 ? String(item.price) : ''}
                      onChangeText={v => store.updateItem(item.id, { price: parseFloat(v) || 0 })}
                      placeholder="₹0"
                      placeholderTextColor={colors.mutedLight}
                      keyboardType="numeric"
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1.5 }}>
                      {store.members.map(m => (
                        <TouchableOpacity
                          key={m.contactId}
                          style={[
                            styles.ownerChip,
                            item.ownerId === m.contactId && styles.ownerChipActive,
                          ]}
                          onPress={() => store.updateItem(item.id, { ownerId: m.contactId })}
                        >
                          <Text style={[
                            styles.ownerChipText,
                            item.ownerId === m.contactId && { color: colors.onPrimary },
                          ]}>{m.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => store.removeItem(item.id)}>
                      <MaterialIcons name="remove-circle-outline" size={20} color={colors.red} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addItemBtn}
                  onPress={() => store.addItem('', 0, store.members[0]?.contactId ?? '')}
                >
                  <MaterialIcons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* ── STEP 3: Summary ── */}
        {store.step === 3 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Summary</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>{store.emoji}</Text>
              <Text style={styles.summaryTitle}>{store.title || 'Bill Split'}</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(store.totalAmount)}</Text>
              <Text style={styles.summaryMethod}>
                {store.method.charAt(0).toUpperCase() + store.method.slice(1)} split
              </Text>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Per Person</Text>
            {store.members.map((m, i) => (
              <Animated.View
                key={m.contactId}
                entering={fadeInDown(i * 60)}
                style={styles.summaryRow}
              >
                <View style={[styles.memberAvatar, { backgroundColor: m.avatarColor + '22' }]}>
                  <Text style={[styles.memberAvatarText, { color: m.avatarColor }]}>
                    {m.avatarLetter}
                  </Text>
                </View>
                <Text style={styles.summaryName}>{m.name}</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(m.amount)}</Text>
                {m.phone && (
                  <TouchableOpacity
                    onPress={() => sendWhatsAppReminder(m.phone!, m.name, m.amount)}
                    style={styles.waBtn}
                  >
                    <Text style={styles.waText}>📲</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.footer}>
        {store.step < 3 ? (
          <>
            <TouchableOpacity
              style={[
                styles.nextBtn,
                (store.step === 1 && store.totalAmount <= 0) && styles.nextBtnDisabled,
                (store.step === 2 && !step2Valid) && styles.nextBtnDisabled,
              ]}
              onPress={() => {
                if (store.step === 1 && store.totalAmount > 0) store.setStep(2);
                else if (store.step === 2 && step2Valid) store.setStep(3);
              }}
              disabled={(store.step === 1 && store.totalAmount <= 0) || (store.step === 2 && !step2Valid)}
            >
              <Text style={styles.nextBtnText}>
                {store.step === 2 ? 'Preview →' : 'Next →'}
              </Text>
            </TouchableOpacity>
            {store.step === 2 && store.method === 'percent' && Math.abs(totalPct - 100) > 0.01 && (
              <Text style={styles.validationHint}>
                Total {totalPct.toFixed(1)}% — 100% hona chahiye aage badhne ke liye
              </Text>
            )}
          </>
        ) : (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.backStepBtn}
              onPress={() => store.setStep(2)}
            >
              <Text style={styles.backStepText}>← Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving...' : '✓ Confirm & Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, shadows: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    headerTitle: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: colors.ink },
    stepRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl, gap: 0,
    },
    stepItem: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
      width: 32, height: 32, borderRadius: Radius.full,
      backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: colors.primaryFixed },
    stepDotCurrent: { backgroundColor: colors.primary },
    stepNum: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: colors.muted },
    stepNumActive: { color: colors.primary },
    stepLine: { width: 48, height: 2, backgroundColor: colors.surfaceHigh, marginHorizontal: 4 },
    stepLineActive: { backgroundColor: colors.primaryFixed },
    stepContent: { paddingHorizontal: Spacing.xl },
    stepTitle: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl,
      color: colors.ink, marginBottom: Spacing.xl,
    },
    fieldLabel: {
      fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: colors.muted,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
    },
    emojiRow: { marginBottom: Spacing.sm },
    emojiBtn: {
      width: 44, height: 44, borderRadius: Radius.md,
      backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    emojiBtnActive: { backgroundColor: colors.primaryFixed, borderWidth: 2, borderColor: colors.primary },
    emojiText: { fontSize: 22 },
    input: {
      backgroundColor: colors.surfaceLow, borderRadius: Radius.md,
      padding: Spacing.lg, fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.md, color: colors.ink,
    },
    amountRow: { flexDirection: 'row', alignItems: 'center' },
    rupeeSign: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 36,
      color: colors.surfaceHigh, marginRight: Spacing.sm,
    },
    amountInput: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 44,
      color: colors.primary, flex: 1, letterSpacing: -1,
    },
    methodGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    },
    methodCard: {
      width: '47%', alignItems: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.lg, backgroundColor: colors.surfaceLowest,
      borderRadius: Radius.lg, ...shadows.sm,
    },
    methodCardActive: { backgroundColor: colors.primary },
    methodLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.muted },
    methodLabelActive: { color: colors.onPrimary, fontFamily: FontFamily.bodySemiBold },
    membersSection: { marginTop: Spacing.xl },
    membersSectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: Spacing.sm,
    },
    equalBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.primaryFixed, borderRadius: Radius.full,
      paddingHorizontal: 10, paddingVertical: 5,
    },
    equalBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: colors.primary },
    memberRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: colors.surfaceLowest, borderRadius: Radius.md,
      padding: Spacing.md, marginBottom: Spacing.sm, ...shadows.sm,
    },
    memberAvatar: {
      width: 36, height: 36, borderRadius: Radius.full,
      alignItems: 'center', justifyContent: 'center',
    },
    memberAvatarText: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm },
    memberName: { flex: 1, fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: colors.ink },
    memberInput: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surfaceLow, borderRadius: Radius.sm,
      paddingHorizontal: Spacing.sm, minWidth: 80,
    },
    memberRupee: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: colors.muted },
    memberAmountInput: {
      fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md,
      color: colors.primary, padding: Spacing.sm, minWidth: 60, textAlign: 'right',
    },
    pctSign: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: colors.muted },
    totalBar: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.surfaceLow, borderRadius: Radius.md,
      padding: Spacing.md, marginTop: Spacing.sm,
    },
    totalBarLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.muted },
    totalBarValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md },
    itemSection: { marginTop: Spacing.xl },
    itemRow: {
      flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    itemInput: {
      backgroundColor: colors.surfaceLow, borderRadius: Radius.sm,
      padding: Spacing.sm, fontFamily: FontFamily.body,
      fontSize: FontSize.sm, color: colors.ink,
    },
    ownerChip: {
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
      backgroundColor: colors.surfaceLow, marginRight: 6,
    },
    ownerChipActive: { backgroundColor: colors.primary },
    ownerChipText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.xs, color: colors.muted },
    addItemBtn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      padding: Spacing.md, backgroundColor: colors.primaryFixed,
      borderRadius: Radius.md, justifyContent: 'center',
    },
    addItemText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.primary },
    summaryCard: {
      backgroundColor: colors.primary, borderRadius: Radius.xl,
      padding: Spacing.xxl, alignItems: 'center', ...shadows.lg,
    },
    summaryEmoji: { fontSize: 40, marginBottom: Spacing.sm },
    summaryTitle: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xl,
      color: colors.onPrimary, marginBottom: Spacing.sm,
    },
    summaryTotal: {
      fontFamily: FontFamily.displayExtraBold, fontSize: 36,
      color: colors.onPrimary, letterSpacing: -1,
    },
    summaryMethod: {
      fontFamily: FontFamily.body, fontSize: FontSize.sm,
      color: colors.onPrimary + '99', marginTop: 4,
    },
    summaryRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: colors.surfaceLowest, borderRadius: Radius.md,
      padding: Spacing.md, marginBottom: Spacing.sm, ...shadows.sm,
    },
    summaryName: { flex: 1, fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: colors.ink },
    summaryAmount: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.md, color: colors.red },
    waBtn: {
      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.greenContainer, borderRadius: Radius.full,
    },
    waText: { fontSize: 16 },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: Spacing.xl, backgroundColor: colors.surfaceLowest,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      ...shadows.lg,
    },
    nextBtn: {
      backgroundColor: colors.primary, borderRadius: Radius.full,
      padding: Spacing.lg, alignItems: 'center', ...shadows.md,
    },
    nextBtnDisabled: { backgroundColor: colors.surfaceHigh },
    nextBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: colors.onPrimary },
    validationHint: {
      fontFamily: FontFamily.body, fontSize: FontSize.xs,
      color: colors.red, textAlign: 'center', marginTop: Spacing.sm,
    },
    footerRow: { flexDirection: 'row', gap: Spacing.sm },
    backStepBtn: {
      flex: 1, borderRadius: Radius.full, padding: Spacing.lg,
      alignItems: 'center', backgroundColor: colors.surfaceLow,
    },
    backStepText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: colors.muted },
    saveBtn: {
      flex: 2, backgroundColor: colors.greenBg, borderRadius: Radius.full,
      padding: Spacing.lg, alignItems: 'center', ...shadows.md,
    },
    saveBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: '#fff' },
    successScreen: {
      flex: 1, backgroundColor: colors.surfaceLowest,
      alignItems: 'center', justifyContent: 'center',
    },
    successContent: { alignItems: 'center' },
    successEmoji: { fontSize: 64, marginBottom: Spacing.lg },
    successTitle: {
      fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: colors.ink,
    },
    successSub: {
      fontFamily: FontFamily.body, fontSize: FontSize.md,
      color: colors.muted, marginTop: Spacing.sm,
    },
  });
}
