/**
 * Cloud Sync Service
 * SQLite (source of truth) → Supabase (cloud backup)
 *
 * Strategy:
 *  - Every record has a `synced` flag (0 = pending, 1 = done)
 *  - On sync: fetch unsynced rows, upsert to Supabase, mark synced
 *  - Deletions use `deleted` soft-delete flag (synced first, then marked)
 *  - Runs on: app foreground, post-write, manual trigger
 */

import { supabase } from './supabase';
import { getDB } from '@db/index';
import { useAuthStore } from '@store/useAuthStore';

let syncInProgress = false;

export async function syncToCloud(userId: string): Promise<void> {
  // Never sync guest users — their data stays local only
  if (useAuthStore.getState().isGuest) return;
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const db = await getDB();
    await Promise.all([
      syncContacts(db, userId),
      syncTransactions(db, userId),
      syncSplits(db, userId),
    ]);
  } finally {
    syncInProgress = false;
  }
}

// ─── Contacts ─────────────────────────────────────────────────

async function syncContacts(db: any, userId: string) {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM contacts WHERE synced = 0'
  );
  if (!rows.length) return;

  const records = rows.map((r: any) => ({
    id: r.id,
    user_id: userId,
    name: r.name,
    phone: r.phone ?? null,
    avatar_color: r.avatar_color,
    avatar_letter: r.avatar_letter,
    created_at: r.created_at,
    updated_at: r.updated_at,
    deleted: r.deleted === 1,
  }));

  const { error } = await supabase
    .from('contacts')
    .upsert(records, { onConflict: 'id' });

  if (error) throw error;

  // Mark synced
  const ids = rows.map((r: any) => `'${r.id}'`).join(',');
  await db.execAsync(`UPDATE contacts SET synced = 1 WHERE id IN (${ids})`);
}

// ─── Transactions ──────────────────────────────────────────────

async function syncTransactions(db: any, userId: string) {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM transactions WHERE synced = 0'
  );
  if (!rows.length) return;

  const records = rows.map((r: any) => ({
    id: r.id,
    user_id: userId,
    contact_id: r.contact_id,
    type: r.type,
    amount: r.amount,
    note: r.note ?? null,
    date: r.date,
    split_id: r.split_id ?? null,
    created_at: r.created_at,
    deleted: r.deleted === 1,
  }));

  const { error } = await supabase
    .from('transactions')
    .upsert(records, { onConflict: 'id' });

  if (error) throw error;

  const ids = rows.map((r: any) => `'${r.id}'`).join(',');
  await db.execAsync(`UPDATE transactions SET synced = 1 WHERE id IN (${ids})`);
}

// ─── Splits + members ─────────────────────────────────────────

async function syncSplits(db: any, userId: string) {
  const splits = await db.getAllAsync<any>(
    'SELECT * FROM splits WHERE synced = 0'
  );

  if (splits.length) {
    const splitRecords = splits.map((r: any) => ({
      id: r.id,
      user_id: userId,
      title: r.title ?? null,
      emoji: r.emoji,
      split_type: r.split_type,
      split_method: r.split_method ?? null,
      total_amount: r.total_amount,
      created_at: r.created_at,
      settled: r.settled === 1,
    }));

    const { error } = await supabase
      .from('splits')
      .upsert(splitRecords, { onConflict: 'id' });

    if (error) throw error;

    const ids = splits.map((r: any) => `'${r.id}'`).join(',');
    await db.execAsync(`UPDATE splits SET synced = 1 WHERE id IN (${ids})`);

    // Sync members for these splits
    const splitIds = splits.map((r: any) => `'${r.id}'`).join(',');
    const members = await db.getAllAsync<any>(
      `SELECT * FROM split_members WHERE split_id IN (${splitIds})`
    );

    if (members.length) {
      const memberRecords = members.map((r: any) => ({
        id: r.id,
        split_id: r.split_id,
        contact_id: r.contact_id,
        amount: r.amount,
        percentage: r.percentage ?? null,
        paid: r.paid === 1,
      }));

      const { error: memberError } = await supabase
        .from('split_members')
        .upsert(memberRecords, { onConflict: 'id' });

      if (memberError) throw memberError;
    }
  }
}

// ─── Restore from cloud ───────────────────────────────────────

/**
 * Pull all user data from Supabase into local SQLite.
 * Only runs when local DB is empty (new device / fresh install).
 * Marks all restored rows as synced = 1 to avoid re-uploading.
 */
export async function restoreFromCloud(userId: string): Promise<void> {
  if (useAuthStore.getState().isGuest) return;

  const db = await getDB();

  // Check if local DB already has data — if yes, skip restore
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM contacts WHERE deleted = 0'
  );
  if (existing && existing.count > 0) return;

  // ── Restore contacts ──
  const { data: contacts, error: cErr } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false);

  if (cErr) throw cErr;

  if (contacts && contacts.length > 0) {
    for (const c of contacts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO contacts
          (id, name, phone, avatar_color, avatar_letter, created_at, updated_at, synced, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [c.id, c.name, c.phone ?? null, c.avatar_color, c.avatar_letter, c.created_at, c.updated_at]
      );
    }
  }

  // ── Restore transactions ──
  const { data: txns, error: tErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false);

  if (tErr) throw tErr;

  if (txns && txns.length > 0) {
    for (const t of txns) {
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
          (id, contact_id, type, amount, note, date, split_id, created_at, synced, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [t.id, t.contact_id, t.type, t.amount, t.note ?? null, t.date, t.split_id ?? null, t.created_at]
      );
    }
  }

  // ── Restore splits ──
  const { data: splits, error: sErr } = await supabase
    .from('splits')
    .select('*')
    .eq('user_id', userId);

  if (sErr) throw sErr;

  if (splits && splits.length > 0) {
    for (const s of splits) {
      await db.runAsync(
        `INSERT OR REPLACE INTO splits
          (id, title, emoji, split_type, split_method, total_amount, created_at, settled, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.id, s.title ?? null, s.emoji, s.split_type, s.split_method ?? null, s.total_amount, s.created_at, s.settled ? 1 : 0]
      );
    }

    // ── Restore split members ──
    const splitIds = splits.map((s: any) => s.id);
    const { data: members, error: mErr } = await supabase
      .from('split_members')
      .select('*')
      .in('split_id', splitIds);

    if (mErr) throw mErr;

    if (members && members.length > 0) {
      for (const m of members) {
        await db.runAsync(
          `INSERT OR REPLACE INTO split_members
            (id, split_id, contact_id, amount, percentage, paid)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [m.id, m.split_id, m.contact_id, m.amount, m.percentage ?? null, m.paid ? 1 : 0]
        );
      }
    }
  }
}

// ─── Public helpers ───────────────────────────────────────────

/** Call after any write operation — non-blocking */
export function triggerSync(userId: string) {
  syncToCloud(userId).catch(() => {
    // Silent fail — will retry on next trigger
  });
}

/** Call on login — non-blocking restore if local DB is empty */
export function triggerRestore(userId: string) {
  restoreFromCloud(userId).catch(() => {
    // Silent fail
  });
}
