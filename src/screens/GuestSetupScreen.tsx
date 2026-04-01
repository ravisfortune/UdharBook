import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useAuthStore } from '@store/useAuthStore';
import { useShakeAnimation, fadeInDown } from '@utils/animations';

export default function GuestSetupScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const { animStyle: inputShake, shake } = useShakeAnimation();

  const isValid = name.trim().length >= 2;

  async function handleGuest() {
    if (!isValid) { shake(); return; }
    setLoading(true);
    await loginAsGuest(name.trim());
    // Navigation happens automatically via RootNavigator (isGuest = true)
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Back */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.View entering={fadeInDown(60)}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.heading}>Guest ke taur pe use karo</Text>
            <Text style={styles.subheading}>
              Koi account nahi, koi OTP nahi — seedha shuru karo
            </Text>
          </Animated.View>

          {/* Name input */}
          <Animated.View entering={fadeInDown(120)} style={inputShake}>
            <Text style={styles.label}>Apna naam daalo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(v) => setName(v)}
              placeholder="Jaise: Ramesh Sharma"
              placeholderTextColor={Colors.mutedLight}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleGuest}
            />
          </Animated.View>

          {/* Warning card */}
          <Animated.View entering={fadeInDown(180)} style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <MaterialIcons name="warning-amber" size={18} color={Colors.secondary} />
              <Text style={styles.warningTitle}>Guest mode mein dhyan rakhna</Text>
            </View>
            <View style={styles.warningList}>
              <WarningRow text="Aapka data sirf is phone mein save hoga" />
              <WarningRow text="App uninstall = saara data delete" />
              <WarningRow text="Nayi phone ya doosre device pe data nahi milega" />
              <WarningRow text="Cloud backup nahi hoga" />
            </View>
            <TouchableOpacity style={styles.upgradeHint}>
              <MaterialIcons name="info-outline" size={14} color={Colors.primary} />
              <Text style={styles.upgradeHintText}>
                Baad mein phone number se login karke data save kar sakte ho
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={fadeInDown(240)}>
            <TouchableOpacity
              style={[styles.startBtn, !isValid && styles.startBtnDisabled]}
              onPress={handleGuest}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.startBtnText}>Shuru Karo</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function WarningRow({ text }: { text: string }) {
  return (
    <View style={styles.warningRow}>
      <MaterialIcons name="close" size={14} color={Colors.red} style={{ marginTop: 2 }} />
      <Text style={styles.warningRowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },
  backRow: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xl,
  },
  emoji: { fontSize: 40, marginBottom: Spacing.sm },
  heading: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    ...Shadows.sm,
  },
  warningCard: {
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  warningTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.secondary,
  },
  warningList: { gap: Spacing.sm },
  warningRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  warningRowText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.ink,
    flex: 1,
  },
  upgradeHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: Spacing.md,
  },
  upgradeHintText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.primary,
    flex: 1,
    lineHeight: 16,
  },
  startBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: '#fff',
  },
});
