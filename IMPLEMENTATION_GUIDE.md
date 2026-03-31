# UdharBook — Complete Implementation Guide
> **Model:** Multi-Tenant SaaS (ek app, har user ka data alag)
> **Reference:** PRD (`UDHARBOOK_PRD.md`) + Design (`stitch-5/DESIGN.md`) + UI (`udharbook-final-v2.html`)

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Complete Tech Stack & Why](#2-complete-tech-stack--why)
3. [Phase 1 — Project Setup & Foundation](#3-phase-1--project-setup--foundation)
4. [Phase 2 — Local Database (Offline-First)](#4-phase-2--local-database-offline-first)
5. [Phase 3 — UI System (Design Tokens + Themes + Fonts + Animations)](#5-phase-3--ui-system)
6. [Phase 4 — Core Screens](#6-phase-4--core-screens)
7. [Phase 5 — Supabase (Auth + Cloud Sync)](#7-phase-5--supabase-auth--cloud-sync)
8. [Phase 6 — WhatsApp Integration](#8-phase-6--whatsapp-integration)
9. [Phase 7 — Split Feature](#9-phase-7--split-feature)
10. [Phase 8 — Monetization (Razorpay)](#10-phase-8--monetization-razorpay)
11. [Phase 9 — Push Notifications](#11-phase-9--push-notifications)
12. [Phase 10 — Build & Publish](#12-phase-10--build--publish)
13. [Environment Variables Checklist](#13-environment-variables-checklist)
14. [Folder Structure (Final)](#14-folder-structure-final)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S PHONE                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │          React Native (Expo)                      │  │
│  │                                                   │  │
│  │  Screens → Zustand Store → SQLite (expo-sqlite)   │  │
│  │                  ↕ (background sync)              │  │
│  │              Supabase Client                      │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS (when online)
                          ▼
              ┌───────────────────────┐
              │      SUPABASE         │
              │  Auth (OTP via SMS)   │
              │  PostgreSQL DB        │
              │  Realtime sync        │
              └───────────────────────┘
```

**Offline-First Rule:** Har write pehle SQLite mein jaati hai. Network mile toh Supabase sync hoti hai. App bina internet ke bhi fully usable hai.

---

## 2. Complete Tech Stack & Why

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Framework | Expo (React Native) | ~54 | iOS + Android ek codebase, OTA updates |
| Language | TypeScript | ~5.9 | Type safety, better DX |
| **Local DB** | **expo-sqlite** | ~15.1 | Built-in Expo, offline-first, no native linking needed |
| Cloud DB | Supabase | ^2.x | Free tier, Postgres, Auth, Realtime |
| Auth | Supabase Auth (Phone OTP) | - | No password, Indian UX |
| State | Zustand | ^5 | Simple, no boilerplate |
| Navigation | React Navigation v7 | ^7 | Stack + Bottom Tabs |
| Animations | react-native-reanimated | ~3.x | Smooth 60fps, built in Expo |
| Lottie | lottie-react-native | ^7 | Micro-animations (empty states, success) |
| Fonts | expo-font + @expo-google-fonts | - | Manrope + Inter |
| Icons | @expo/vector-icons | - | MaterialIcons, Ionicons |
| i18n | i18next + react-i18next | ^24 / ^15 | Hindi + English |
| Payments | react-native-razorpay | ^2.x | India-first UPI |
| WhatsApp | expo-linking | ~7.x | Deep link, free |
| Notifications | expo-notifications | ~0.29 | Local EMI reminders |
| Storage | @react-native-async-storage | ^2 | Settings, language pref |
| Safe Area | react-native-safe-area-context | ^5 | iPhone notch handling |

### Local DB: Why expo-sqlite?
- **Offline-first:** Data turant store hota hai, network ka wait nahi
- **Fast:** Native SQLite, 100k records bhi instant query
- **No config:** Expo ke saath out-of-the-box kaam karta hai
- **Better than:** AsyncStorage (not relational), WatermelonDB (complex), Realm (heavy)

---

## 3. Phase 1 — Project Setup & Foundation

### Step 1.1: Install All Dependencies

```bash
# Core navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Local DB
npx expo install expo-sqlite

# Supabase
npm install @supabase/supabase-js

# Fonts
npx expo install expo-font @expo-google-fonts/manrope @expo-google-fonts/inter

# Animations
npx expo install react-native-reanimated lottie-react-native

# Icons (already with Expo)
# @expo/vector-icons is included

# WhatsApp / Linking
npx expo install expo-linking

# Notifications
npx expo install expo-notifications

# Async Storage
npx expo install @react-native-async-storage/async-storage

# i18n
npm install i18next react-i18next
npx expo install expo-localization

# Razorpay (check latest version)
npm install react-native-razorpay

# Zustand
npm install zustand

# UUID for IDs
npm install react-native-uuid
```

### Step 1.2: tsconfig.json — Path Aliases Add Karo

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@store/*": ["src/store/*"],
      "@db/*": ["src/db/*"],
      "@services/*": ["src/services/*"],
      "@theme/*": ["src/theme/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### Step 1.3: babel.config.js — Reanimated Plugin

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
        },
      }],
      'react-native-reanimated/plugin', // ← MUST be last
    ],
  };
};
```

**Note:** `npm install babel-plugin-module-resolver` bhi karo.

### Step 1.4: app.config.ts Update

```typescript
// EAS Build ke liye dynamic config
// Brand ID se bundle ID, app name sab change hoga
// (already setup hai - see app.config.ts)
```

---

## 4. Phase 2 — Local Database (Offline-First)

### Step 2.1: Schema — `src/db/schema.ts`

```typescript
import * as SQLite from 'expo-sqlite';

export async function initDB() {
  const db = await SQLite.openDatabaseAsync('udharbook.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      avatar_color TEXT DEFAULT '#000666',
      avatar_letter TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('gave','received')),
      amount REAL NOT NULL CHECK(amount > 0),
      note TEXT,
      date INTEGER NOT NULL,
      split_id TEXT,
      created_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS splits (
      id TEXT PRIMARY KEY,
      title TEXT,
      emoji TEXT DEFAULT '💸',
      split_type TEXT NOT NULL CHECK(split_type IN ('bill','loan','group')),
      split_method TEXT CHECK(split_method IN ('equal','custom','percent','item')),
      total_amount REAL NOT NULL,
      created_at INTEGER NOT NULL,
      settled INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS split_members (
      id TEXT PRIMARY KEY,
      split_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      amount REAL NOT NULL,
      percentage REAL,
      paid INTEGER DEFAULT 0,
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE INDEX IF NOT EXISTS idx_txn_contact ON transactions(contact_id);
    CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date DESC);
    CREATE INDEX IF NOT EXISTS idx_split_members ON split_members(split_id);
  `);

  return db;
}
```

### Step 2.2: DB Singleton — `src/db/index.ts`

```typescript
import * as SQLite from 'expo-sqlite';
import { initDB } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await initDB();
  }
  return _db;
}
```

### Step 2.3: Contacts CRUD — `src/db/contacts.ts`

```typescript
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
}

const AVATAR_COLORS = [
  '#000666','#7e5700','#003909','#93000a',
  '#1a237e','#e65100','#006064','#4a148c'
];

export async function createContact(name: string, phone?: string): Promise<Contact> {
  const db = await getDB();
  const now = Date.now();
  const contact: Contact = {
    id: uuid.v4() as string,
    name: name.trim(),
    phone,
    avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    avatar_letter: name.trim()[0].toUpperCase(),
    created_at: now,
    updated_at: now,
    synced: 0,
  };

  await db.runAsync(
    `INSERT INTO contacts (id, name, phone, avatar_color, avatar_letter, created_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [contact.id, contact.name, contact.phone ?? null, contact.avatar_color,
     contact.avatar_letter, contact.created_at, contact.updated_at, contact.synced]
  );

  return contact;
}

export async function getAllContacts(): Promise<Contact[]> {
  const db = await getDB();
  return db.getAllAsync<Contact>(
    `SELECT * FROM contacts WHERE deleted = 0 ORDER BY updated_at DESC`
  );
}

export async function getContactById(id: string): Promise<Contact | null> {
  const db = await getDB();
  return db.getFirstAsync<Contact>(`SELECT * FROM contacts WHERE id = ?`, [id]);
}
```

### Step 2.4: Transactions CRUD — `src/db/transactions.ts`

```typescript
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
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'synced'>): Promise<Transaction> {
  const db = await getDB();
  const txn: Transaction = {
    id: uuid.v4() as string,
    ...data,
    created_at: Date.now(),
    synced: 0,
  };

  await db.runAsync(
    `INSERT INTO transactions (id, contact_id, type, amount, note, date, split_id, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [txn.id, txn.contact_id, txn.type, txn.amount,
     txn.note ?? null, txn.date, txn.split_id ?? null, txn.created_at, txn.synced]
  );

  return txn;
}

export async function getTransactionsByContact(contactId: string): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE contact_id = ? AND deleted = 0 ORDER BY date DESC`,
    [contactId]
  );
}

export async function getNetBalance(contactId: string): Promise<number> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ net: number }>(
    `SELECT
       SUM(CASE WHEN type='gave' THEN amount ELSE -amount END) as net
     FROM transactions
     WHERE contact_id = ? AND deleted = 0`,
    [contactId]
  );
  return result?.net ?? 0;
}

export async function getAllContactsWithBalance(): Promise<Array<{
  id: string; name: string; phone?: string;
  avatar_color: string; avatar_letter: string;
  net_balance: number; last_txn_date: number;
}>> {
  const db = await getDB();
  return db.getAllAsync(`
    SELECT
      c.id, c.name, c.phone, c.avatar_color, c.avatar_letter,
      COALESCE(SUM(CASE WHEN t.type='gave' THEN t.amount ELSE -t.amount END), 0) as net_balance,
      MAX(t.date) as last_txn_date
    FROM contacts c
    LEFT JOIN transactions t ON t.contact_id = c.id AND t.deleted = 0
    WHERE c.deleted = 0
    GROUP BY c.id
    ORDER BY ABS(net_balance) DESC, last_txn_date DESC
  `);
}
```

### Step 2.5: Sync Logic — `src/db/sync.ts`

```typescript
// Offline-first sync strategy
import { getDB } from './index';
import { supabase } from '../services/supabase';

export async function syncPendingToSupabase(userId: string) {
  const db = await getDB();

  // 1. Push unsynced contacts
  const unsyncedContacts = await db.getAllAsync(
    `SELECT * FROM contacts WHERE synced = 0 AND deleted = 0`
  );
  if (unsyncedContacts.length > 0) {
    const { error } = await supabase
      .from('contacts')
      .upsert(unsyncedContacts.map(c => ({ ...c, user_id: userId })));
    if (!error) {
      await db.runAsync(
        `UPDATE contacts SET synced = 1 WHERE synced = 0`
      );
    }
  }

  // 2. Push unsynced transactions
  const unsyncedTxns = await db.getAllAsync(
    `SELECT * FROM transactions WHERE synced = 0 AND deleted = 0`
  );
  if (unsyncedTxns.length > 0) {
    const { error } = await supabase
      .from('transactions')
      .upsert(unsyncedTxns.map(t => ({ ...t, user_id: userId })));
    if (!error) {
      await db.runAsync(
        `UPDATE transactions SET synced = 1 WHERE synced = 0`
      );
    }
  }
}

export async function pullFromSupabase(userId: string) {
  // Pull latest data from Supabase → merge into SQLite
  // Conflict resolution: server timestamp wins
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId);

  if (contacts) {
    const db = await getDB();
    for (const c of contacts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO contacts
         (id, name, phone, avatar_color, avatar_letter, created_at, updated_at, synced, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [c.id, c.name, c.phone, c.avatar_color, c.avatar_letter,
         c.created_at, c.updated_at, c.deleted ?? 0]
      );
    }
  }
}
```

---

## 5. Phase 3 — UI System

### Step 3.1: Design Tokens — `src/theme/tokens.ts`

```typescript
// Ledger-Luxe (Default) — from stitch-5/DESIGN.md
export const LuxeTokens = {
  // Colors
  primary: '#000666',
  primaryContainer: '#1a237e',
  primaryFixed: '#e0e0ff',
  secondary: '#7e5700',
  secondaryContainer: '#feb300',
  secondaryFixed: '#ffdeac',
  surface: '#f7f9fc',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f2f4f7',
  surfaceHigh: '#e6e8eb',
  green: '#5aa958',
  greenBg: '#003909',
  red: '#93000a',
  redBg: '#ffdad6',
  ink: '#191c1e',
  muted: '#454652',
  border: 'rgba(0,7,103,0.12)',

  // Shadows (indigo-tinted, not black)
  shadowSm: '0 4px 16px rgba(0,7,103,0.08)',
  shadow: '0 12px 32px rgba(0,7,103,0.06)',

  // Radius
  radiusSm: 8,
  radius: 16,
  radiusLg: 24,
  radiusXl: 32,
  radiusFull: 999,

  // Fonts
  fontDisplay: 'Manrope',
  fontBody: 'Inter',

  // Spacing (4px grid)
  space1: 4,   space2: 8,   space3: 12,
  space4: 16,  space5: 20,  space6: 24,
  space8: 32,  space10: 40, space12: 48,
};

// Cartoon Theme
export const CartoonTokens = {
  primary: '#FFD93D', primaryContainer: '#FF8C42',
  surface: '#FFF8F0', surfaceLowest: '#fff',
  green: '#00C77A', red: '#FF6B6B',
  ink: '#1a1a2e', muted: '#999999',
  fontDisplay: 'FredokaOne', fontBody: 'Nunito',
  radius: 20, radiusLg: 28,
};

// Midnight Theme
export const MidnightTokens = {
  primary: '#7C3AED', primaryContainer: '#5B21B6',
  surface: '#13131A', surfaceLowest: '#1E1E2C', surfaceLow: '#1a1a28',
  green: '#10B981', red: '#EF4444',
  ink: '#E8E8F0', muted: '#6B7280',
  fontDisplay: 'Poppins', fontBody: 'Inter',
  radius: 16, radiusLg: 24,
};

// Saffron Theme
export const SaffronTokens = {
  primary: '#FF6B00', primaryContainer: '#E85D04',
  surface: '#FFF9F0', surfaceLowest: '#fff', surfaceLow: '#fef3e8',
  green: '#2D6A4F', red: '#C1121F',
  ink: '#3D1C02', muted: '#9C6644',
  fontDisplay: 'Baloo2', fontBody: 'Poppins',
  radius: 16, radiusLg: 24,
};
```

### Step 3.2: Font Loading — `src/theme/fonts.ts`

```typescript
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular, Manrope_600SemiBold,
  Manrope_700Bold, Manrope_800ExtraBold
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular, Inter_500Medium,
  Inter_600SemiBold, Inter_700Bold
} from '@expo-google-fonts/inter';

export function useAppFonts() {
  return useFonts({
    'Manrope': Manrope_400Regular,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
}
```

### Step 3.3: Animations Guide — `src/utils/animations.ts`

```typescript
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
  interpolate, Extrapolation, FadeIn,
  FadeInDown, SlideInRight, ZoomIn,
  Layout, FlipInEasyX
} from 'react-native-reanimated';

// ── Preset animations tum use karoge ──

// 1. Card press feedback (98% scale on press)
export function usePressAnimation() {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  return {
    animStyle,
    onPressIn: () => { scale.value = withSpring(0.97); },
    onPressOut: () => { scale.value = withSpring(1); },
  };
}

// 2. Amount input shake (jab galat input)
export function useShakeAnimation() {
  const x = useSharedValue(0);
  const shake = () => {
    x.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }]
  }));
  return { animStyle, shake };
}

// 3. Screen entry animations (use as entering prop)
export const enterFromBottom = FadeInDown.duration(400).springify();
export const enterFromRight = SlideInRight.duration(350);
export const enterZoom = ZoomIn.duration(300).springify();
export const enterFade = FadeIn.duration(300);

// 4. List item animation
export const listItemLayout = Layout.springify();

// Usage example:
// <Animated.View entering={FadeInDown.delay(index * 80)}>
//   <ContactCard />
// </Animated.View>
```

### Step 3.4: Lottie Assets Setup

Yeh Lottie files download karo from lottiefiles.com aur `assets/lottie/` mein rakhna:

| File | Usage | Search on LottieFiles |
|------|-------|----------------------|
| `success.json` | Transaction add hone pe | "success checkmark" |
| `empty-box.json` | Koi contact nahi | "empty box" |
| `confetti.json` | Balance settle hone pe | "confetti celebration" |
| `sync.json` | Syncing indicator | "sync loading" |
| `money-fly.json` | Onboarding | "money flying" |

```typescript
// Usage:
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../../assets/lottie/success.json')}
  autoPlay
  loop={false}
  style={{ width: 120, height: 120 }}
  onAnimationFinish={() => navigation.goBack()}
/>
```

### Step 3.5: Icons — MaterialIcons Usage Guide

```typescript
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Bottom nav icons:
// Home     → MaterialIcons "home"
// Contacts → MaterialIcons "people"
// Split    → MaterialIcons "call-split"
// Reports  → MaterialIcons "bar-chart"

// Screens:
// WhatsApp → Ionicons "logo-whatsapp"
// Add      → MaterialIcons "add"
// Gave     → MaterialIcons "arrow-upward"
// Received → MaterialIcons "arrow-downward"
// Settled  → MaterialIcons "check-circle"
// Phone    → MaterialIcons "phone"
// Calendar → MaterialIcons "calendar-today"
// Share    → MaterialIcons "share"
```

---

## 6. Phase 4 — Core Screens

### Step 4.1: Navigation Structure — `src/navigation/index.tsx`

```
AppNavigator
├── AuthStack (jab logged out)
│   ├── OnboardingScreen
│   └── OTPLoginScreen
└── MainStack (jab logged in)
    ├── BottomTabs
    │   ├── HomeScreen
    │   ├── ContactsScreen
    │   ├── SplitScreen
    │   └── ReportsScreen (Pro only)
    ├── ContactDetailScreen
    ├── AddTransactionScreen
    ├── SplitBillScreen
    ├── SplitLoanScreen
    ├── SplitGroupScreen
    └── SettingsScreen
```

### Step 4.2: HomeScreen Components Breakdown

```
HomeScreen
├── Header (name + settings icon)
├── BalanceHeroCard                  ← gradient indigo card
│   ├── "Hisaab Saaf" label
│   ├── Total milna (green)
│   ├── Total dena (red)
│   └── Net Balance (large Manrope font)
├── SplitKaroBanner                  ← saffron #ffdeac
├── ContactsList
│   └── ContactRow (for each)
│       ├── Avatar (initials + color)
│       ├── Name + last transaction
│       └── Balance amount (green/red)
└── FAB (+ button)                   ← fixed bottom right
```

### Step 4.3: Key Design Rules to Follow (from DESIGN.md)

```
✅ NO 1px borders — use background color shifts
✅ Min 16px radius, max 48px
✅ Shadow: 0 12px 32px rgba(0,7,103,0.06) — indigo tint
✅ Typography: Manrope for amounts, Inter for labels
✅ Card press: scale to 0.98 (use usePressAnimation)
✅ Green amounts: color #5aa958
✅ Red amounts: color #93000a on #ffdad6 background
✅ Saffron for Pro features: #ffdeac / #feb300
✅ Bottom nav: glassmorphism (rgba(255,255,255,0.6) + blur 20px)
```

---

## 7. Phase 5 — Supabase (Auth + Cloud Sync)

### Step 5.1: Supabase Project Setup (supabase.com)

1. New project banao → free tier
2. Project URL + anon key copy karo
3. Authentication → Providers → Phone → Enable
4. SMS provider (Twilio ya Vonage) configure karo for OTP

### Step 5.2: .env File

```bash
# .env (gitignore mein hai)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Step 5.3: Supabase Tables (SQL Editor mein run karo)

```sql
-- Enable RLS (Row Level Security) — critical!
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_color TEXT,
  avatar_letter TEXT,
  created_at BIGINT,
  updated_at BIGINT,
  deleted BOOLEAN DEFAULT false,
  synced BOOLEAN DEFAULT true
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  type TEXT CHECK(type IN ('gave','received')),
  amount NUMERIC NOT NULL,
  note TEXT,
  date BIGINT,
  split_id UUID,
  created_at BIGINT,
  deleted BOOLEAN DEFAULT false
);

-- Row Level Security — har user sirf apna data dekhe
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their contacts"
  ON contacts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);
```

### Step 5.4: Supabase Client — `src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Step 5.5: OTP Auth Flow — `src/services/auth.ts`

```typescript
import { supabase } from './supabase';

export async function sendOTP(phone: string) {
  // phone: "+919876543210" format
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

---

## 8. Phase 6 — WhatsApp Integration

### Method 1: Deep Link (Free — Phase 1 mein use karo)

```typescript
// src/services/whatsapp.ts
import { Linking } from 'react-native';

const REMINDER_TEMPLATES = {
  hi: (name: string, amount: number) =>
    `Bhai ${name}, mere paas tumhara ₹${amount.toLocaleString('en-IN')} dena baaki hai. Convenient ho toh bata dena 🙏`,

  en: (name: string, amount: number) =>
    `Hey ${name}, you have a pending payment of ₹${amount.toLocaleString('en-IN')}. Please let me know when convenient 🙏`,

  settled: (name: string) =>
    `${name}! Hamara hisaab saaf ho gaya 🎉 Thanks!`,

  splitReminder: (name: string, amount: number, billName: string) =>
    `${name}, ${billName} mein tera share ₹${amount.toLocaleString('en-IN')} baaki hai. Whenever possible 🙏`,
};

export async function sendWhatsAppReminder(
  phone: string,
  name: string,
  amount: number,
  lang: 'hi' | 'en' = 'hi'
) {
  const message = REMINDER_TEMPLATES[lang](name, amount);
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const url = `whatsapp://send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    // WhatsApp installed nahi — fallback to SMS
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    await Linking.openURL(smsUrl);
    return;
  }

  await Linking.openURL(url);
}

// Bill split ke baad sab logo ko remind karo
export async function sendBulkSplitReminders(
  members: Array<{ phone: string; name: string; amount: number }>,
  billName: string
) {
  for (const member of members) {
    const message = REMINDER_TEMPLATES.splitReminder(member.name, member.amount, billName);
    const url = `whatsapp://send?phone=91${member.phone}&text=${encodeURIComponent(message)}`;
    await Linking.openURL(url);
    // Small delay between messages
    await new Promise(r => setTimeout(r, 500));
  }
}
```

### Method 2: WhatsApp Business API (Pro feature — Phase 4)

```
Setup Steps:
1. business.whatsapp.com → Register
2. Meta Business Account banao
3. Phone number verify karo
4. Message templates approve karao (24-48 hrs)
5. Supabase Edge Function se API call karo

Template example (submit for approval):
"Hello {{1}}, you have a pending amount of ₹{{2}}
 in UdharBook. Please settle when convenient."

API se call: POST https://graph.facebook.com/v18.0/{phone_id}/messages
```

---

## 9. Phase 7 — Split Feature

### 3 Types:

#### Bill Split — 4 Methods:
1. **Equal:** Total ÷ N (auto calculate)
2. **Custom:** Manual amount per person
3. **Percent:** % slider (sum must = 100%)
4. **Item-wise:** Items list, per item owner assign

#### Loan Split:
- EMI = Total ÷ Installments
- Start date se schedule generate
- Local notifications set karo per EMI

#### Group Udhar:
- Ek se zyada contacts select
- Individual amounts
- Single save → multiple transactions create

### Step 9.1: Split Store — `src/store/useSplitStore.ts`

```typescript
import { create } from 'zustand';

interface SplitMember {
  contactId: string;
  name: string;
  amount: number;
  percentage?: number;
  paid: boolean;
}

interface SplitState {
  // Current split being created
  splitType: 'bill' | 'loan' | 'group' | null;
  title: string;
  emoji: string;
  totalAmount: number;
  method: 'equal' | 'custom' | 'percent' | 'item';
  members: SplitMember[];
  step: 1 | 2 | 3;

  // Actions
  setSplitType: (type: 'bill' | 'loan' | 'group') => void;
  setTotalAmount: (amount: number) => void;
  addMember: (contact: { id: string; name: string }) => void;
  removeMember: (contactId: string) => void;
  updateMemberAmount: (contactId: string, amount: number) => void;
  equalSplit: () => void;
  reset: () => void;
}
```

---

## 10. Phase 8 — Monetization (Razorpay)

### Free vs Pro Limits

```typescript
// src/utils/limits.ts
export const FREE_LIMITS = {
  maxContacts: 10,
  features: ['home', 'contacts', 'add_transaction', 'whatsapp_reminder'],
};

export const PRO_FEATURES = [
  'unlimited_contacts',
  'split_feature',
  'reports_pdf',
  'cloud_sync',
  'whatsapp_auto_reminder',
  'all_themes',
];
```

### Razorpay Setup

```typescript
// src/services/razorpay.ts
import RazorpayCheckout from 'react-native-razorpay';

export const PRO_PLANS = {
  monthly: { amount: 9900, description: 'Pro Monthly' },    // ₹99 in paise
  yearly: { amount: 79900, description: 'Pro Yearly' },     // ₹799 in paise
};

export async function initiateProSubscription(
  plan: 'monthly' | 'yearly',
  user: { name: string; phone: string }
) {
  const options = {
    description: PRO_PLANS[plan].description,
    currency: 'INR',
    key: process.env.EXPO_PUBLIC_RAZORPAY_KEY!,
    amount: PRO_PLANS[plan].amount,
    name: 'UdharBook Pro',
    prefill: { contact: user.phone, name: user.name },
    theme: { color: '#000666' },
  };

  const data = await RazorpayCheckout.open(options);
  // data.razorpay_payment_id → verify on backend
  return data;
}
```

---

## 11. Phase 9 — Push Notifications

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleEMIReminder(
  contactName: string,
  amount: number,
  date: Date
) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 EMI Reminder',
      body: `${contactName} ka ₹${amount.toLocaleString('en-IN')} aaj milna chahiye!`,
      data: { type: 'emi_reminder' },
    },
    trigger: {
      date,
      repeats: false,
    },
  });
}

export async function scheduleWeeklyReminder(contactName: string, amount: number) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '📒 UdharBook',
      body: `${contactName} abhi bhi ₹${amount.toLocaleString('en-IN')} dena hai`,
    },
    trigger: {
      weekday: 2, // Monday
      hour: 10,
      minute: 0,
      repeats: true,
    } as any,
  });
}
```

---

## 12. Phase 10 — Build & Publish

### iOS Build

```bash
# 1. EAS setup
npm install -g eas-cli
eas login

# 2. Configure
eas build:configure

# 3. Build
eas build --platform ios --profile production

# 4. Submit to App Store
eas submit --platform ios
```

**iOS Requirements:**
- Apple Developer Account: $99/year (developer.apple.com)
- Bundle ID register karo: `com.udharbook.app`
- App Store Connect pe listing banao

### Android Build

```bash
# Build APK/AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**Android Requirements:**
- Google Play Console: ₹2,500 one-time
- Bundle ID: `com.udharbook.app`
- Release track: Internal → Alpha → Production

### OTA Updates (bina store ke)

```bash
# Minor bug fix → directly users ke phone pe
eas update --branch production --message "Fixed balance calculation"
```

---

## 13. Environment Variables Checklist

```bash
# .env file (add to .gitignore)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EXPO_PUBLIC_RAZORPAY_KEY=rzp_live_xxx
EXPO_PUBLIC_APP_VERSION=1.0.0

# eas.json ke liye (server-side only, not EXPO_PUBLIC_)
SUPABASE_SERVICE_KEY=eyJxxx...  # Only in Supabase Edge Functions
RAZORPAY_SECRET=xxx             # Only in backend
```

---

## 14. Folder Structure (Final)

```
UdharBook/
├── App.tsx                         ← Root (DB init + Font load + Navigator)
├── app.config.ts                   ← Dynamic Expo config
├── eas.json                        ← Build profiles
├── .env                            ← Secrets (gitignored)
├── UDHARBOOK_PRD.md
├── IMPLEMENTATION_GUIDE.md         ← This file
│
├── assets/
│   ├── fonts/                      ← Custom fonts (if needed)
│   ├── lottie/                     ← success.json, empty.json etc.
│   └── brands/
│       └── default/               ← icon.png, splash-icon.png
│
└── src/
    ├── config/
    │   └── brand.config.ts         ← White-label config
    │
    ├── theme/
    │   ├── tokens.ts               ← Design tokens (all 7 themes)
    │   ├── ThemeContext.tsx        ← useTheme() hook
    │   └── fonts.ts                ← Font loading hook
    │
    ├── i18n/
    │   ├── index.ts
    │   └── locales/
    │       ├── hi.ts
    │       └── en.ts
    │
    ├── db/
    │   ├── index.ts                ← DB singleton
    │   ├── schema.ts               ← CREATE TABLE statements
    │   ├── contacts.ts             ← Contact CRUD
    │   ├── transactions.ts         ← Transaction CRUD
    │   └── sync.ts                 ← Supabase sync
    │
    ├── services/
    │   ├── supabase.ts             ← Supabase client
    │   ├── auth.ts                 ← OTP login/logout
    │   ├── whatsapp.ts             ← WhatsApp reminder
    │   ├── razorpay.ts             ← Payment
    │   └── notifications.ts        ← Push notifications
    │
    ├── store/
    │   ├── useContactStore.ts      ← Contacts state
    │   ├── useTransactionStore.ts  ← Transactions state
    │   ├── useSplitStore.ts        ← Split creation state
    │   ├── useAuthStore.ts         ← User session
    │   └── useAppStore.ts          ← Language, theme, pro status
    │
    ├── navigation/
    │   └── index.tsx               ← All navigators
    │
    ├── screens/
    │   ├── OnboardingScreen.tsx
    │   ├── OTPLoginScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── ContactsScreen.tsx
    │   ├── ContactDetailScreen.tsx
    │   ├── AddTransactionScreen.tsx
    │   ├── SplitScreen.tsx
    │   ├── SplitBillScreen.tsx
    │   ├── SplitLoanScreen.tsx
    │   ├── SplitGroupScreen.tsx
    │   ├── ReportsScreen.tsx
    │   └── SettingsScreen.tsx
    │
    ├── components/
    │   ├── BalanceHeroCard.tsx
    │   ├── ContactRow.tsx
    │   ├── TransactionItem.tsx
    │   ├── SplitKaroBanner.tsx
    │   ├── ProBadge.tsx
    │   ├── WhatsAppButton.tsx
    │   ├── AnimatedFAB.tsx
    │   └── LottieOverlay.tsx
    │
    └── utils/
        ├── currency.ts             ← ₹ formatting
        ├── date.ts                 ← Hindi date labels
        ├── balance.ts              ← Net balance calc
        ├── limits.ts               ← Free vs Pro limits
        └── animations.ts           ← Reanimated presets
```

---

## 🚦 Development Order (Follow This Sequence)

```
Week 1:
  ✅ Phase 1 — Dependencies + babel + tsconfig
  ✅ Phase 2 — SQLite DB setup + CRUD
  ✅ Phase 3 — Theme tokens + Fonts + Navigation skeleton

Week 2:
  ⬜ Phase 4 — HomeScreen + ContactDetailScreen + AddTransactionScreen
             — Animations + Lottie on success states

Week 3:
  ⬜ Phase 5 — Supabase setup + OTP auth + cloud sync
  ⬜ Phase 6 — WhatsApp deep link integration

Week 4:
  ⬜ Phase 7 — Split feature (Bill + Group + Loan)
  ⬜ Phase 8 — Razorpay Pro subscription

Week 5:
  ⬜ Phase 9 — Push notifications
  ⬜ Phase 10 — EAS build + Play Store submit
```

---

*Last updated: March 2026 | UdharBook — Hisaab saaf, dosti saaf*
