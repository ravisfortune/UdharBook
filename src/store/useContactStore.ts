import { create } from 'zustand';
import {
  Contact,
  ContactWithBalance,
  createContact,
  getAllContactsWithBalance,
  getContactById,
  deleteContact,
  getTotals,
} from '@db/contacts';

interface ContactStore {
  contacts: ContactWithBalance[];
  totalMilna: number;
  totalDena: number;
  loading: boolean;

  loadContacts: () => Promise<void>;
  addContact: (name: string, phone?: string) => Promise<Contact>;
  removeContact: (id: string) => Promise<void>;
  getContact: (id: string) => Promise<Contact | null>;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  totalMilna: 0,
  totalDena: 0,
  loading: false,

  loadContacts: async () => {
    set({ loading: true });
    const [contacts, totals] = await Promise.all([
      getAllContactsWithBalance(),
      getTotals(),
    ]);
    set({
      contacts,
      totalMilna: totals.totalMilna,
      totalDena: totals.totalDena,
      loading: false,
    });
  },

  addContact: async (name, phone) => {
    const contact = await createContact(name, phone);
    await get().loadContacts();
    return contact;
  },

  removeContact: async (id) => {
    await deleteContact(id);
    await get().loadContacts();
  },

  getContact: async (id) => getContactById(id),
}));
