/**
 * Global App State — Zustand
 *
 * Language switch, user info, aur global UI state yahan rakhte hain.
 */

import { create } from "zustand";
import i18n from "../i18n";
import { activeBrand } from "../config/brand.config";

interface AppState {
  /** Currently active language code */
  currentLocale: string;
  /** Change language at runtime */
  setLocale: (locale: string) => void;
  /** Is app initializing */
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLocale: activeBrand.defaultLocale,

  setLocale: (locale: string) => {
    i18n.changeLanguage(locale);
    set({ currentLocale: locale });
  },

  isInitialized: false,
  setInitialized: (val) => set({ isInitialized: val }),
}));
