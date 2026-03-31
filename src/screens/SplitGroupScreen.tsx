import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useSplitStore } from '@store/useSplitStore';
import ContactPicker from '@components/ContactPicker';
import { formatCurrency } from '@utils/currency';
import { fadeInDown } from '@utils/animations';

export default function SplitGroupScreen() {
  const navigation = useNavigation();
  const store = useSplitStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [txnType, setTxnType] = useState<'gave' | 'received'>('gave');

  const total = store.members.reduce((s, m) => s + m.amount, 0);
  const canSave = store.members.length >= 1 && total > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await store.saveSplit();
      setSaved(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch {
      Alert.alert('Error', 'Could not save');
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <View style={styles.successScreen}>
        <Animated.View entering={ZoomIn.springify()} style={styles.successContent}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Group Udhar Saved!</Text>
          <Text style={styles.successSub}>{store.members.length} transactions created</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Udhar</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Type toggle */}
        <Animated.View entering={FadeInDown.delay(60)} style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, txnType === 'gave' && styles.typeBtnActive]}
            onPress={() => setTxnType('gave')}
          >
            <Text style={[styles.typeTxt, txnType === 'gave' && styles.typeTxtActive]}>
              💸 Maine Diya
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, txnType === 'received' && styles.typeBtnGreen]}
            onPress={() => setTxnType('received')}
          >
            <Text style={[styles.typeTxt, txnType === 'received' && styles.typeTxtActive]}>
              🤝 Maine Liya
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(80)}>
          <Text style={styles.fieldLabel}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            value={store.title}
            onChangeText={store.setTitle}
            placeholder="e.g. Trip to Goa"
            placeholderTextColor={Colors.mutedLight}
          />
        </Animated.View>

        {/* Contact picker */}
        <Animated.View entering={FadeInDown.delay(120)} style={{ marginTop: Spacing.xl }}>
          <Text style={styles.fieldLabel}>Add People</Text>
          <ContactPicker
            selected={store.members}
            onAdd={m => store.addMember(m)}
            onRemove={id => store.removeMember(id)}
          />
        </Animated.View>

        {/* Per-member amounts */}
        {store.members.length > 0 && (
          <Animated.View entering={FadeInDown.delay(160)} style={{ marginTop: Spacing.xl }}>
            <Text style={styles.fieldLabel}>Amount per Person</Text>
            {store.members.map((m, i) => (
              <Animated.View
                key={m.contactId}
                entering={fadeInDown(i * 50)}
                style={styles.memberRow}
              >
                <View style={[styles.avatar, { backgroundColor: m.avatarColor + '22' }]}>
                  <Text style={[styles.avatarTxt, { color: m.avatarColor }]}>
                    {m.avatarLetter}
                  </Text>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                <View style={styles.amountBox}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={m.amount > 0 ? String(m.amount) : ''}
                    onChangeText={v => store.updateMemberAmount(m.contactId, parseFloat(v) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.mutedLight}
                  />
                </View>
              </Animated.View>
            ))}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Save */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && { opacity: 0.4 }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text style={styles.saveBtnTxt}>
            {saving ? 'Saving...' : `Save Group Udhar (${store.members.length} people)`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: Colors.ink },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  typeToggle: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg,
    padding: 4, marginBottom: Spacing.xl,
  },
  typeBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: Colors.primary, ...Shadows.sm },
  typeBtnGreen: { backgroundColor: Colors.greenBg, ...Shadows.sm },
  typeTxt: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: Colors.muted },
  typeTxtActive: { color: '#fff', fontFamily: FontFamily.bodySemiBold },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceLow, borderRadius: Radius.md,
    padding: Spacing.lg, fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md, color: Colors.ink,
  },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceLowest, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  avatar: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm },
  memberName: { flex: 1, fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.ink },
  amountBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm,
  },
  rupee: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: Colors.muted },
  amountInput: {
    fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg,
    color: Colors.primary, padding: Spacing.sm, minWidth: 80, textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.primaryFixed, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  totalLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.primary },
  totalValue: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.lg, color: Colors.primary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl, backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, ...Shadows.lg,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.md,
  },
  saveBtnTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.onPrimary },
  successScreen: {
    flex: 1, backgroundColor: Colors.surfaceLowest, alignItems: 'center', justifyContent: 'center',
  },
  successContent: { alignItems: 'center' },
  successEmoji: { fontSize: 60, marginBottom: Spacing.lg },
  successTitle: { fontFamily: FontFamily.displayExtraBold, fontSize: FontSize.xxl, color: Colors.ink },
  successSub: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.muted, marginTop: Spacing.sm },
});
