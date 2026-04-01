import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';

/** Card / button press → scale down to 97% */
export function usePressAnimation() {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return {
    animStyle,
    onPressIn: () => { scale.value = withTiming(0.97, { duration: 80 }); },
    onPressOut: () => { scale.value = withTiming(1, { duration: 120 }); },
  };
}

/** Input error → horizontal shake */
export function useShakeAnimation() {
  const x = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const shake = () => {
    x.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };
  return { animStyle, shake };
}

/** FAB pulse — draws attention on first load */
export function usePulseAnimation() {
  const scale = useSharedValue(1);
  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 180 }),
      withTiming(1, { duration: 180 })
    );
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return { animStyle, pulse };
}

// ── Entering presets — subtle, no spring bounce ──

/** Fade + slide up — for list items, smooth no bounce */
export const fadeInDown = (delayMs = 0) =>
  FadeInDown.delay(delayMs).duration(280);

/** Fade in — for overlays / modals */
export const fadeIn = (delayMs = 0) =>
  FadeIn.delay(delayMs).duration(220);

/** Slide from right — for screen pushes */
export const slideInRight = () =>
  SlideInRight.duration(280);

/** Zoom in — for success states / badges */
export const zoomIn = (delayMs = 0) =>
  ZoomIn.delay(delayMs).duration(250);

/** Staggered list entry delay helper */
export const staggerDelay = (index: number, base = 50) => index * base;

/** Animated layout for list reorders */
export const springLayout = Layout.duration(250);
