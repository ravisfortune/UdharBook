import { getDB } from './index';
import uuid from 'react-native-uuid';

export type SplitType = 'bill' | 'loan' | 'group';
export type SplitMethod = 'equal' | 'custom' | 'percent' | 'item';

export interface Split {
  id: string;
  title: string;
  emoji: string;
  split_type: SplitType;
  split_method: SplitMethod;
  total_amount: number;
  created_at: number;
  settled: number;
}

export interface SplitMember {
  id: string;
  split_id: string;
  contact_id: string;
  amount: number;
  percentage?: number;
  paid: number;
  // joined from contacts
  contact_name?: string;
  avatar_color?: string;
  avatar_letter?: string;
}

export async function createSplit(data: {
  title: string;
  emoji: string;
  split_type: SplitType;
  split_method: SplitMethod;
  total_amount: number;
  members: Array<{ contact_id: string; amount: number; percentage?: number }>;
}): Promise<Split> {
  const db = await getDB();
  const now = Date.now();
  const split: Split = {
    id: uuid.v4() as string,
    title: data.title,
    emoji: data.emoji,
    split_type: data.split_type,
    split_method: data.split_method,
    total_amount: data.total_amount,
    created_at: now,
    settled: 0,
  };

  await db.runAsync(
    `INSERT INTO splits (id, title, emoji, split_type, split_method, total_amount, created_at, settled)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [split.id, split.title, split.emoji, split.split_type,
     split.split_method, split.total_amount, split.created_at]
  );

  for (const m of data.members) {
    await db.runAsync(
      `INSERT INTO split_members (id, split_id, contact_id, amount, percentage, paid)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [uuid.v4() as string, split.id, m.contact_id, m.amount, m.percentage ?? null]
    );
  }

  return split;
}

export async function getAllSplits(): Promise<Split[]> {
  const db = await getDB();
  return db.getAllAsync<Split>(
    `SELECT * FROM splits ORDER BY created_at DESC`
  );
}

export async function getSplitWithMembers(splitId: string): Promise<{
  split: Split;
  members: SplitMember[];
} | null> {
  const db = await getDB();
  const split = await db.getFirstAsync<Split>(
    `SELECT * FROM splits WHERE id = ?`, [splitId]
  );
  if (!split) return null;

  const members = await db.getAllAsync<SplitMember>(`
    SELECT sm.*, c.name as contact_name, c.avatar_color, c.avatar_letter
    FROM split_members sm
    JOIN contacts c ON c.id = sm.contact_id
    WHERE sm.split_id = ?
  `, [splitId]);

  return { split, members };
}

export async function markMemberPaid(memberId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE split_members SET paid = 1 WHERE id = ?`, [memberId]
  );
}
