import { create } from 'zustand';
import i18n from '@i18n/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId } from '@theme/themes';

type Locale = 'hi' | 'en';

interface AppStore {
  locale: Locale;
  dbReady: boolean;
  themeId: ThemeId;
  setLocale: (locale: Locale) => Promise<void>;
  setDbReady: (ready: boolean) => void;
  setTheme: (themeId: ThemeId) => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  locale: 'hi',
  dbReady: false,
  themeId: 'default',

  setLocale: async (locale) => {
    await i18n.changeLanguage(locale);
    await AsyncStorage.setItem('locale', locale);
    set({ locale });
  },

  setDbReady: (dbReady) => set({ dbReady }),

  setTheme: async (themeId) => {
    await AsyncStorage.setItem('themeId', themeId);
    set({ themeId });
  },
}));

/** Load saved locale + theme on boot */
export async function loadSavedLocale() {
  const [savedLocale, savedTheme] = await Promise.all([
    AsyncStorage.getItem('locale'),
    AsyncStorage.getItem('themeId'),
  ]);
  if (savedLocale) {
    await useAppStore.getState().setLocale(savedLocale as Locale);
  }
  if (savedTheme) {
    useAppStore.setState({ themeId: savedTheme as ThemeId });
  }
}
