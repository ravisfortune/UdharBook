import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { verifyOTP } from '@services/auth';
import { useAuthStore } from '@store/useAuthStore';
import { useShakeAnimation, fadeInDown } from '@utils/animations';
import { AuthStackParamList } from '@/navigation';

type OTPRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute<OTPRouteProp>();
  const { phone } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const { animStyle: boxShake, shake } = useShakeAnimation();

  const otpValue = otp.join('');
  const isComplete = otpValue.length === OTP_LENGTH;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (isComplete) {
      handleVerify(otpValue);
    }
  }, [otpValue]);

  async function handleVerify(token?: string) {
    const code = token ?? otpValue;
    if (code.length < OTP_LENGTH) return;

    setLoading(true);
    setError('');
    try {
      const user = await verifyOTP(phone, code);
      // Session is set via onAuthStateChange in useAuthStore.initialize()
      // Navigation happens automatically via RootNavigator session check
    } catch (e: any) {
      setError(e?.message ?? 'OTP galat hai, dobara try karo');
      shake();
      // Clear OTP fields on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const { sendOTP } = await import('@services/auth');
      await sendOTP(phone);
      setTimer(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (e: any) {
      setError(e?.message ?? 'OTP bhejne mein problem aayi');
    } finally {
      setResending(false);
    }
  }

  function handleChange(value: string, index: number) {
    // Handle paste of full OTP
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < OTP_LENGTH) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  }

  const maskedPhone = phone.replace('+91', '').replace(/(\d{2})(\d{4})(\d{4})/, '$1XXXX$3');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Back button */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={fadeInDown(60)}>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.heading}>OTP daalo</Text>
            <Text style={styles.subheading}>
              {`+91 ${maskedPhone} par bheja gaya`}
            </Text>
          </Animated.View>

          {/* OTP boxes */}
          <Animated.View entering={fadeInDown(120)} style={[styles.otpRow, boxShake]}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH} // allows paste
                textAlign="center"
                autoFocus={i === 0}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </Animated.View>

          {error ? (
            <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
              {error}
            </Animated.Text>
          ) : null}

          {/* Verify button */}
          <Animated.View entering={fadeInDown(180)}>
            <TouchableOpacity
              style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}
              onPress={() => handleVerify()}
              disabled={!isComplete || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.verifyBtnText}>Verify karo</Text>
                  <MaterialIcons name="check-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Resend */}
          <Animated.View entering={fadeInDown(240)} style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                OTP dobara bhejo ({timer}s)
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.resendText}>OTP dobara bhejo</Text>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View entering={fadeInDown(300)}>
            <Text style={styles.disclaimer}>
              Number galat ho gaya? Wapas jao aur sahi number daalo
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radius.lg,
    fontFamily: FontFamily.displayExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.ink,
    textAlign: 'center',
    ...Shadows.sm,
  },
  otpBoxFilled: {
    backgroundColor: Colors.primaryFixed,
    color: Colors.primary,
  },
  otpBoxError: {
    backgroundColor: Colors.redContainer,
    color: Colors.red,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.red,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  verifyBtnDisabled: { opacity: 0.4 },
  verifyBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
  },
  resendRow: { alignItems: 'center' },
  timerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.mutedLight,
  },
  resendText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  disclaimer: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.mutedLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
