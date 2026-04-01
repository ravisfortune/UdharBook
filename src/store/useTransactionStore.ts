import { create } from 'zustand';
import {
  Transaction,
  createTransaction,
  getTransactionsByContact,
  deleteTransaction,
} from '@db/transactions';
import { useContactStore } from './useContactStore';
import { triggerSync } from '@services/sync';
import { useAuthStore } from './useAuthStore';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;

  loadForContact: (contactId: string) => Promise<void>;
  addTransaction: (
    data: Pick<Transaction, 'contact_id' | 'type' | 'amount' | 'note' | 'date'>
  ) => Promise<Transaction>;
  removeTransaction: (id: string, contactId: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loading: false,

  loadForContact: async (contactId) => {
    set({ loading: true });
    const transactions = await getTransactionsByContact(contactId);
    set({ transactions, loading: false });
  },

  addTransaction: async (data) => {
    const txn = await createTransaction({ ...data, split_id: undefined });
    await useContactStore.getState().loadContacts();
    const userId = useAuthStore.getState().user?.id;
    if (userId) triggerSync(userId);
    return txn;
  },

  removeTransaction: async (id, contactId) => {
    await deleteTransaction(id);
    const transactions = await getTransactionsByContact(contactId);
    set({ transactions });
    await useContactStore.getState().loadContacts();
    const userId = useAuthStore.getState().user?.id;
    if (userId) triggerSync(userId);
  },
}));
