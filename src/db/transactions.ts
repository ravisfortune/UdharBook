import { getDB } from './index';
import uuid from 'react-native-uuid';

export interface Transaction {
  id: string;
  contact_id: string;
  type: 'gave' | 'received';
  amount: number;
  note?: string;
  date: number;
  split_id?: string;
  created_at: number;
  synced: number;
  deleted: number;
}

export interface TransactionWithContact extends Transaction {
  contact_name: string;
  contact_avatar_color: string;
  contact_avatar_letter: string;
}

export async function createTransaction(
  data: Pick<Transaction, 'contact_id' | 'type' | 'amount' | 'note' | 'date' | 'split_id'>
): Promise<Transaction> {
  const db = await getDB();
  const txn: Transaction = {
    id: uuid.v4() as string,
    ...data,
    note: data.note?.trim() || undefined,
    created_at: Date.now(),
    synced: 0,
    deleted: 0,
  };

  await db.runAsync(
    `INSERT INTO transactions
     (id, contact_id, type, amount, note, date, split_id, created_at, synced, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [txn.id, txn.contact_id, txn.type, txn.amount,
     txn.note ?? null, txn.date, txn.split_id ?? null, txn.created_at]
  );

  // Update contact's updated_at for re-sorting
  await db.runAsync(
    `UPDATE contacts SET updated_at = ?, synced = 0 WHERE id = ?`,
    [Date.now(), data.contact_id]
  );

  return txn;
}

export async function getTransactionsByContact(contactId: string): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE contact_id = ? AND deleted = 0
     ORDER BY date DESC`,
    [contactId]
  );
}

export async function getNetBalance(contactId: string): Promise<number> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ net: number }>(
    `SELECT COALESCE(
       SUM(CASE WHEN type='gave' THEN amount ELSE -amount END), 0
     ) AS net
     FROM transactions
     WHERE contact_id = ? AND deleted = 0`,
    [contactId]
  );
  return result?.net ?? 0;
}

export async function getRecentTransactions(limit = 5): Promise<TransactionWithContact[]> {
  const db = await getDB();
  return db.getAllAsync<TransactionWithContact>(`
    SELECT t.*,
      c.name AS contact_name,
      c.avatar_color AS contact_avatar_color,
      c.avatar_letter AS contact_avatar_letter
    FROM transactions t
    JOIN contacts c ON c.id = t.contact_id
    WHERE t.deleted = 0 AND c.deleted = 0
    ORDER BY t.created_at DESC
    LIMIT ?
  `, [limit]);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE transactions SET deleted = 1, synced = 0 WHERE id = ?`,
    [id]
  );
}
