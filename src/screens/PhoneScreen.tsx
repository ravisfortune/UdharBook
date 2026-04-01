import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { sendOTP, signInWithGoogle } from '@services/auth';
import { useShakeAnimation, fadeInDown } from '@utils/animations';
import { AuthStackParamList } from '@/navigation';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function PhoneScreen() {
  const navigation = useNavigation<Nav>();
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { animStyle: inputShake, shake } = useShakeAnimation();

  const isValid = phone.replace(/\D/g, '').length === 10;

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // session auto-set via onAuthStateChange → navigation switches
    } catch (e: any) {
      if (e?.message !== 'LOGIN_CANCELLED') {
        setError(e?.message ?? 'Google login fail ho gaya');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSendOTP() {
    if (!isValid) { shake(); return; }
    setLoading(true);
    setError('');
    try {
      const fullPhone = `+91${phone.replace(/\D/g, '')}`;
      await sendOTP(fullPhone);
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (e: any) {
      setError(e?.message ?? 'OTP bhejne mein problem aayi');
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Hero */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.hero}>
          <LinearGradient
            colors={['#000666', '#1a237e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroEmoji}>📒</Text>
            <Text style={styles.heroTitle}>UdharBook</Text>
            <Text style={styles.heroTagline}>Hisaab saaf, dosti saaf</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.form}>
          <Animated.View entering={fadeInDown(100)}>
            <Text style={styles.heading}>Login / Sign Up</Text>
            <Text style={styles.subheading}>
              Apna account banao ya login karo
            </Text>
          </Animated.View>

          {/* Google Sign In — Primary */}
          <Animated.View entering={fadeInDown(160)}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color={Colors.ink} />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleBtnText}>Google se login karo</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={fadeInDown(200)} style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ya</Text>
            <View style={styles.divider} />
          </Animated.View>

          {/* Phone toggle / input */}
          <Animated.View entering={fadeInDown(220)}>
            {!showPhone ? (
              <TouchableOpacity
                style={styles.phoneToggleBtn}
                onPress={() => setShowPhone(true)}
              >
                <MaterialIcons name="phone" size={18} color={Colors.muted} />
                <Text style={styles.phoneToggleText}>Phone number se login karo</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View entering={FadeInDown.duration(250)} style={inputShake}>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryFlag}>🇮🇳</Text>
                    <Text style={styles.countryText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={(v) => {
                      setError('');
                      setPhone(v.replace(/\D/g, '').slice(0, 10));
                    }}
                    placeholder="98765 43210"
                    placeholderTextColor={Colors.mutedLight}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>
                {error ? (
                  <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
                    {error}
                  </Animated.Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.sendBtn, !isValid && styles.sendBtnDisabled]}
                  onPress={handleSendOTP}
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.sendBtnText}>OTP Bhejo</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          {/* Guest option */}
          <Animated.View entering={fadeInDown(260)} style={styles.guestRow}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ya</Text>
              <View style={styles.divider} />
            </View>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.navigate('GuestSetup')}
            >
              <MaterialIcons name="person-outline" size={18} color={Colors.muted} />
              <Text style={styles.guestBtnText}>Guest ke taur pe use karo</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={fadeInDown(300)}>
            <Text style={styles.disclaimer}>
              Login karke aap hamare Terms & Privacy Policy se agree karte hain
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },
  hero: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroGradient: {
    padding: Spacing.xxl,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  heroEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  heroTitle: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxxl,
    color: '#fff',
    letterSpacing: -1,
  },
  heroTagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  form: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  heading: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.full,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.surfaceHigh,
    ...Shadows.sm,
  },
  googleIcon: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: 18,
    color: '#4285F4',
  },
  googleBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceHigh,
  },
  dividerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.mutedLight,
  },
  // Phone toggle
  phoneToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceHigh,
  },
  phoneToggleText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  // Phone input
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.surfaceHigh,
  },
  countryFlag: { fontSize: 20 },
  countryText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.red,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
  },
  // Guest
  guestRow: { gap: Spacing.lg },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceHigh,
  },
  guestBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  disclaimer: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.mutedLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
