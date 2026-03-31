import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

export const APP_FONTS = {
  'Manrope': Manrope_400Regular,
  'Manrope-SemiBold': Manrope_600SemiBold,
  'Manrope-Bold': Manrope_700Bold,
  'Manrope-ExtraBold': Manrope_800ExtraBold,
  'Inter': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
  'Inter-Bold': Inter_700Bold,
};

export function useAppFonts() {
  return useFonts(APP_FONTS);
}
