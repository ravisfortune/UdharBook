import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@services/supabase';
import { signOut as authSignOut, getSession } from '@services/auth';
import { restoreFromCloud, triggerSync } from '@services/sync';
import { useContactStore } from '@store/useContactStore';
import { identifyUser, resetPurchasesUser } from '@services/purchases';

const GUEST_KEY = 'udharbook_guest_name';

interface AuthStore {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  guestName: string | null;
  loading: boolean;
  isRestoring: boolean;

  /** Call once on app boot */
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  /** Login as guest — data stays local only */
  loginAsGuest: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  isGuest: false,
  guestName: null,
  loading: true,
  isRestoring: false,

  initialize: async () => {
    // Check for guest session first
    const guestName = await AsyncStorage.getItem(GUEST_KEY);
    if (guestName) {
      set({ isGuest: true, guestName, loading: false });
      return;
    }

    // Restore Supabase session
    const session = await getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, isGuest: false });
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        identifyUser(userId).catch(() => {});
        set({ isRestoring: true });
        restoreFromCloud(userId)
          .catch(() => {})
          .finally(() => {
            set({ isRestoring: false });
            triggerSync(userId);
            useContactStore.getState().loadContacts();
          });
      }
    });
  },

  setSession: (session) =>
    set({ session, user: session?.user ?? null, isGuest: false }),

  loginAsGuest: async (name: string) => {
    await AsyncStorage.setItem(GUEST_KEY, name);
    set({ isGuest: true, guestName: name, session: null, user: null });
  },

  signOut: async () => {
    const guestName = await AsyncStorage.getItem(GUEST_KEY);
    if (guestName) {
      await AsyncStorage.removeItem(GUEST_KEY);
      set({ isGuest: false, guestName: null });
      return;
    }
    await authSignOut();
    resetPurchasesUser().catch(() => {});
    set({ session: null, user: null, isGuest: false, guestName: null });
  },
}));
