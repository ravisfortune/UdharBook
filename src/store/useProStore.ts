import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_LIMITS, ProFeature } from '@config/pro';
import { fetchRemoteConfig } from '@services/remoteConfig';

const PRO_KEY = 'udharbook_is_pro';

interface ProStore {
  isPro: boolean;
  proEnabled: boolean;  // remote flag — false = all free, true = gates active
  loading: boolean;

  initialize: () => Promise<void>;
  activatePro: () => Promise<void>;   // Call after successful payment
  deactivatePro: () => Promise<void>; // For testing/admin

  /** Check if user can access a feature */
  canAccess: (feature: ProFeature) => boolean;

  /** Check contact limit — returns true if can add more */
  canAddContact: (currentCount: number) => boolean;

  /** Check transaction limit */
  canAddTransaction: (currentCount: number) => boolean;

  /** Check if a theme is accessible */
  canUseTheme: (themeId: string) => boolean;

  /** How many months of reports to show */
  reportMonths: () => number;
}

export const useProStore = create<ProStore>((set, get) => ({
  isPro: false,
  proEnabled: false,
  loading: true,

  initialize: async () => {
    const [saved, remoteConfig] = await Promise.all([
      AsyncStorage.getItem(PRO_KEY),
      fetchRemoteConfig(),
    ]);
    set({
      isPro: saved === 'true',
      proEnabled: remoteConfig.pro_enabled,
      loading: false,
    });
  },

  activatePro: async () => {
    await AsyncStorage.setItem(PRO_KEY, 'true');
    set({ isPro: true });
  },

  deactivatePro: async () => {
    await AsyncStorage.removeItem(PRO_KEY);
    set({ isPro: false });
  },

  canAccess: (feature: ProFeature) => {
    if (!get().proEnabled) return true;      // Pro not launched yet — all free
    if (get().isPro) return true;        // Paying user — all access
    // Free user restrictions
    switch (feature) {
      case 'unlimitedContacts':
      case 'unlimitedTransactions':
      case 'allThemes':
      case 'fullReports':
      case 'pdfExport':
      case 'emiCalculator':
      case 'multipleBusinesses':
        return false;
      default:
        return true;
    }
  },

  canAddContact: (currentCount: number) => {
    if (!get().proEnabled) return true;
    if (get().isPro) return true;
    return currentCount < FREE_LIMITS.contacts;
  },

  canAddTransaction: (currentCount: number) => {
    if (!get().proEnabled) return true;
    if (get().isPro) return true;
    return currentCount < FREE_LIMITS.transactions;
  },

  canUseTheme: (themeId: string) => {
    if (!get().proEnabled) return true;
    if (get().isPro) return true;
    return FREE_LIMITS.themes.includes(themeId);
  },

  reportMonths: () => {
    if (!get().proEnabled) return 12;
    if (get().isPro) return 12;
    return FREE_LIMITS.reportMonths;
  },
}));
