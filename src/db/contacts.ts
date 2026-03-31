import { getDB } from './index';
import uuid from 'react-native-uuid';

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  avatar_color: string;
  avatar_letter: string;
  created_at: number;
  updated_at: number;
  synced: number;
  deleted: number;
}

export interface ContactWithBalance extends Contact {
  net_balance: number;
  last_txn_date: number | null;
}

const AVATAR_COLORS = [
  '#000666', '#7e5700', '#003909', '#93000a',
  '#1a237e', '#e65100', '#006064', '#4a148c',
  '#1b5e20', '#b71c1c', '#0d47a1', '#f57f17',
];

function pickColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export async function createContact(name: string, phone?: string): Promise<Contact> {
  const db = await getDB();
  const now = Date.now();
  const trimmed = name.trim();
  const contact: Contact = {
    id: uuid.v4() as string,
    name: trimmed,
    phone: phone?.trim(),
    avatar_color: pickColor(trimmed),
    avatar_letter: trimmed[0].toUpperCase(),
    created_at: now,
    updated_at: now,
    synced: 0,
    deleted: 0,
  };

  await db.runAsync(
    `INSERT INTO contacts
     (id, name, phone, avatar_color, avatar_letter, created_at, updated_at, synced, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [contact.id, contact.name, contact.phone ?? null,
     contact.avatar_color, contact.avatar_letter,
     contact.created_at, contact.updated_at]
  );

  return contact;
}

export async function getAllContactsWithBalance(): Promise<ContactWithBalance[]> {
  const db = await getDB();
  return db.getAllAsync<ContactWithBalance>(`
    SELECT
      c.id, c.name, c.phone, c.avatar_color, c.avatar_letter,
      c.created_at, c.updated_at, c.synced, c.deleted,
      COALESCE(
        SUM(CASE WHEN t.type='gave' THEN t.amount ELSE -t.amount END), 0
      ) AS net_balance,
      MAX(t.date) AS last_txn_date
    FROM contacts c
    LEFT JOIN transactions t ON t.contact_id = c.id AND t.deleted = 0
    WHERE c.deleted = 0
    GROUP BY c.id
    ORDER BY ABS(net_balance) DESC, c.updated_at DESC
  `);
}

export async function getContactById(id: string): Promise<Contact | null> {
  const db = await getDB();
  return db.getFirstAsync<Contact>(
    `SELECT * FROM contacts WHERE id = ? AND deleted = 0`,
    [id]
  );
}

export async function updateContact(id: string, data: Partial<Pick<Contact, 'name' | 'phone'>>): Promise<void> {
  const db = await getDB();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
  updates.push('updated_at = ?', 'synced = 0');
  values.push(Date.now(), id);

  await db.runAsync(
    `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE contacts SET deleted = 1, synced = 0, updated_at = ? WHERE id = ?`,
    [Date.now(), id]
  );
}

export async function getTotals(): Promise<{ totalMilna: number; totalDena: number }> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ milna: number; dena: number }>(`
    SELECT
      COALESCE(SUM(CASE WHEN type='gave' THEN amount ELSE 0 END), 0) AS milna,
      COALESCE(SUM(CASE WHEN type='received' THEN amount ELSE 0 END), 0) AS dena
    FROM transactions
    WHERE deleted = 0
  `);
  return {
    totalMilna: result?.milna ?? 0,
    totalDena: result?.dena ?? 0,
  };
}
