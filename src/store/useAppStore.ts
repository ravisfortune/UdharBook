import { create } from 'zustand';
import i18n from '@i18n/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Locale = 'hi' | 'en';

interface AppStore {
  locale: Locale;
  dbReady: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  setDbReady: (ready: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  locale: 'hi',
  dbReady: false,

  setLocale: async (locale) => {
    await i18n.changeLanguage(locale);
    await AsyncStorage.setItem('locale', locale);
    set({ locale });
  },

  setDbReady: (dbReady) => set({ dbReady }),
}));

/** Load saved locale on boot */
export async function loadSavedLocale() {
  const saved = await AsyncStorage.getItem('locale') as Locale | null;
  if (saved) {
    await useAppStore.getState().setLocale(saved);
  }
}
