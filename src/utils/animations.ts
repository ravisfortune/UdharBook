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
    onPressIn: () => { scale.value = withSpring(0.97, { damping: 15 }); },
    onPressOut: () => { scale.value = withSpring(1, { damping: 15 }); },
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
      withTiming(-10, { duration: 55 }),
      withTiming(10, { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming(6, { duration: 55 }),
      withTiming(0, { duration: 55 })
    );
  };
  return { animStyle, shake };
}

/** FAB pulse — draws attention on first load */
export function usePulseAnimation() {
  const scale = useSharedValue(1);
  const pulse = () => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 4 }),
      withSpring(1, { damping: 8 })
    );
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return { animStyle, pulse };
}

// ── Entering presets (use as `entering` prop on Animated.View) ──

/** Fade + slide up — for list items */
export const fadeInDown = (delayMs = 0) =>
  FadeInDown.delay(delayMs).duration(380).springify().damping(18);

/** Fade in — for overlays / modals */
export const fadeIn = (delayMs = 0) =>
  FadeIn.delay(delayMs).duration(280);

/** Slide from right — for screen pushes */
export const slideInRight = () =>
  SlideInRight.duration(350).springify();

/** Zoom in — for success states / badges */
export const zoomIn = (delayMs = 0) =>
  ZoomIn.delay(delayMs).duration(300).springify();

/** Staggered list entry delay helper */
export const staggerDelay = (index: number, base = 60) => index * base;

/** Animated layout for list reorders */
export const springLayout = Layout.springify().damping(18);
