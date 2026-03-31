import { create } from 'zustand';
import { SplitType, SplitMethod, createSplit, getAllSplits, Split } from '@db/splits';
import { createTransaction } from '@db/transactions';
import { useContactStore } from './useContactStore';

export interface SplitMemberDraft {
  contactId: string;
  name: string;
  avatarColor: string;
  avatarLetter: string;
  amount: number;
  percentage: number;
  phone?: string;
}

export interface ItemRow {
  id: string;
  name: string;
  price: number;
  ownerId: string; // contactId
}

interface SplitStore {
  // Draft state
  splitType: SplitType | null;
  title: string;
  emoji: string;
  totalAmount: number;
  method: SplitMethod;
  members: SplitMemberDraft[];
  items: ItemRow[];
  step: 1 | 2 | 3;

  // Saved splits list
  splits: Split[];

  // Actions
  setSplitType: (t: SplitType) => void;
  setTitle: (t: string) => void;
  setEmoji: (e: string) => void;
  setTotalAmount: (n: number) => void;
  setMethod: (m: SplitMethod) => void;
  setStep: (s: 1 | 2 | 3) => void;

  addMember: (m: Omit<SplitMemberDraft, 'amount' | 'percentage'>) => void;
  removeMember: (contactId: string) => void;
  updateMemberAmount: (contactId: string, amount: number) => void;
  updateMemberPercent: (contactId: string, pct: number) => void;
  equalSplit: () => void;

  addItem: (name: string, price: number, ownerId: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<ItemRow>) => void;

  saveSplit: () => Promise<Split>;
  loadSplits: () => Promise<void>;
  reset: () => void;
}

const INITIAL: Pick<SplitStore,
  'splitType' | 'title' | 'emoji' | 'totalAmount' |
  'method' | 'members' | 'items' | 'step'
> = {
  splitType: null,
  title: '',
  emoji: '💸',
  totalAmount: 0,
  method: 'equal',
  members: [],
  items: [],
  step: 1,
};

export const useSplitStore = create<SplitStore>((set, get) => ({
  ...INITIAL,
  splits: [],

  setSplitType: (splitType) => set({ splitType }),
  setTitle: (title) => set({ title }),
  setEmoji: (emoji) => set({ emoji }),
  setTotalAmount: (totalAmount) => set({ totalAmount }),
  setMethod: (method) => set({ method }),
  setStep: (step) => set({ step }),

  addMember: (m) => set((s) => ({
    members: s.members.find(x => x.contactId === m.contactId)
      ? s.members
      : [...s.members, { ...m, amount: 0, percentage: 0 }],
  })),

  removeMember: (contactId) => set((s) => ({
    members: s.members.filter(m => m.contactId !== contactId),
  })),

  updateMemberAmount: (contactId, amount) => set((s) => ({
    members: s.members.map(m =>
      m.contactId === contactId ? { ...m, amount } : m
    ),
  })),

  updateMemberPercent: (contactId, percentage) => set((s) => {
    const members = s.members.map(m =>
      m.contactId === contactId ? { ...m, percentage } : m
    );
    // Recalculate amounts from percentages
    const total = s.totalAmount;
    return {
      members: members.map(m => ({
        ...m,
        amount: Math.round((m.percentage / 100) * total * 100) / 100,
      })),
    };
  }),

  equalSplit: () => set((s) => {
    const n = s.members.length;
    if (n === 0) return s;
    const each = Math.round((s.totalAmount / n) * 100) / 100;
    // Give remainder to last person
    const remainder = Math.round((s.totalAmount - each * n) * 100) / 100;
    return {
      members: s.members.map((m, i) => ({
        ...m,
        amount: i === n - 1 ? each + remainder : each,
        percentage: Math.round((100 / n) * 10) / 10,
      })),
    };
  }),

  addItem: (name, price, ownerId) => set((s) => ({
    items: [...s.items, {
      id: Math.random().toString(36).slice(2),
      name, price, ownerId,
    }],
  })),

  removeItem: (id) => set((s) => ({
    items: s.items.filter(item => item.id !== id),
  })),

  updateItem: (id, patch) => set((s) => ({
    items: s.items.map(item => item.id === id ? { ...item, ...patch } : item),
  })),

  saveSplit: async () => {
    const s = get();
    // For item-wise: calculate amounts per member from items
    let members = s.members;
    if (s.method === 'item') {
      members = s.members.map(m => ({
        ...m,
        amount: s.items
          .filter(item => item.ownerId === m.contactId)
          .reduce((sum, item) => sum + item.price, 0),
      }));
    }

    const split = await createSplit({
      title: s.title || 'Split',
      emoji: s.emoji,
      split_type: s.splitType!,
      split_method: s.method,
      total_amount: s.totalAmount,
      members: members.map(m => ({
        contact_id: m.contactId,
        amount: m.amount,
        percentage: m.percentage,
      })),
    });

    // Auto-create transactions for each member
    for (const m of members) {
      if (m.amount > 0) {
        await createTransaction({
          contact_id: m.contactId,
          type: 'gave',
          amount: m.amount,
          note: `${s.emoji} ${s.title}`,
          date: Date.now(),
          split_id: split.id,
        });
      }
    }

    // Refresh contacts
    await useContactStore.getState().loadContacts();

    get().reset();
    return split;
  },

  loadSplits: async () => {
    const splits = await getAllSplits();
    set({ splits });
  },

  reset: () => set({ ...INITIAL }),
}));
