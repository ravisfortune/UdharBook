# 📒 UdharBook — Product Requirements Document
> Version 1.0 | Created for VS Code Claude Implementation

---

## 🎯 App Overview

**UdharBook** is a React Native mobile app (Android + iOS) for tracking personal and business loans (udhar) in India. It solves the problem of forgotten debts between friends, family, and small business owners.

**Target Users:**
- Friends & family tracking personal udhar
- Small shopkeepers (kirana, salon, hardware)
- Students in hostels/PGs

**Tagline:** *"Hisaab saaf, dosti saaf"*

---

## 💰 Monetization

| Plan | Price | Limits |
|------|-------|--------|
| Free | ₹0 | Max 10 contacts, basic features |
| Pro Monthly | ₹99/month | Unlimited contacts + all features |
| Pro Yearly | ₹799/year | Same as monthly (save 33%) |

**Payment Gateway:** Razorpay

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | React Native + Expo | Cross-platform Android + iOS |
| Local DB | SQLite (expo-sqlite) | Offline-first, fast |
| Cloud Sync | Supabase | Free tier, real-time sync |
| Auth | Supabase Auth (OTP) | Phone number login |
| Payments | Razorpay | India-first, UPI support |
| Notifications | Expo Push Notifications | Cross-platform |
| WhatsApp | WhatsApp Business API + Linking | Reminders |
| State | Zustand | Simple, lightweight |
| Navigation | React Navigation v6 | Stack + Bottom tabs |

---

## 📁 Folder Structure

```
UdharBook/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ContactDetailScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── SplitScreen.tsx
│   │   ├── SplitBillScreen.tsx
│   │   ├── SplitLoanScreen.tsx
│   │   ├── SplitGroupScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── components/
│   │   ├── ContactCard.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── SplitTypeCard.tsx
│   │   ├── ThemeSwitcher.tsx
│   │   └── WhatsAppReminder.tsx
│   ├── themes/
│   │   ├── index.ts          # Theme context + switcher
│   │   ├── cartoon.ts        # Playful, bold outlines (DEFAULT)
│   │   ├── glass.ts          # Dark glassmorphism
│   │   ├── neu.ts            # Neumorphism, soft 3D
│   │   └── magazine.ts       # Editorial, Righteous font
│   ├── db/
│   │   ├── schema.ts         # SQLite table definitions
│   │   ├── contacts.ts       # Contact CRUD operations
│   │   ├── transactions.ts   # Transaction CRUD operations
│   │   └── sync.ts           # Supabase sync logic
│   ├── services/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── whatsapp.ts       # WhatsApp reminder logic
│   │   ├── razorpay.ts       # Payment integration
│   │   └── notifications.ts  # Push notification service
│   ├── store/
│   │   ├── useContactStore.ts
│   │   ├── useTransactionStore.ts
│   │   └── useThemeStore.ts
│   └── utils/
│       ├── currency.ts       # ₹ formatting helpers
│       ├── date.ts           # Date formatting (Hindi)
│       └── balance.ts        # Net balance calculations
├── assets/
│   ├── fonts/                # Fredoka One, Nunito
│   └── images/
├── UDHARBOOK_PRD.md          # This file
├── udharbook-prototype.html  # UI reference (see HTML file)
├── app.json
├── App.tsx
└── package.json
```

---

## 🗄️ Database Schema

### contacts table
```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_color TEXT,       -- gradient color key
  avatar_letter TEXT,      -- first letter
  created_at INTEGER,
  updated_at INTEGER,
  synced INTEGER DEFAULT 0
);
```

### transactions table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  type TEXT NOT NULL,      -- 'gave' | 'received'
  amount REAL NOT NULL,
  note TEXT,
  date INTEGER,            -- timestamp
  split_id TEXT,           -- linked to splits table
  created_at INTEGER,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

### splits table
```sql
CREATE TABLE splits (
  id TEXT PRIMARY KEY,
  title TEXT,
  emoji TEXT,
  split_type TEXT,         -- 'bill' | 'loan' | 'group'
  split_method TEXT,       -- 'equal' | 'custom' | 'percent' | 'item'
  total_amount REAL,
  created_at INTEGER,
  settled INTEGER DEFAULT 0
);
```

### split_members table
```sql
CREATE TABLE split_members (
  id TEXT PRIMARY KEY,
  split_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  amount REAL NOT NULL,
  percentage REAL,
  paid INTEGER DEFAULT 0,
  FOREIGN KEY (split_id) REFERENCES splits(id)
);
```

---

## ⚖️ Core Business Logic

### Net Balance Calculation
```typescript
// transactions.ts
export const getNetBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((total, tx) => {
    return tx.type === 'gave'
      ? total + tx.amount    // We gave → they owe us → positive
      : total - tx.amount    // We received → we owe → negative
  }, 0);
};

// Balance states:
// netBalance > 0  → "Tumhe milna hai" (green)
// netBalance < 0  → "Tumhara dena hai" (red)
// netBalance === 0 → "Settled! 🎉" (show badge)
```

### Offline-First Sync
```typescript
// sync.ts
// 1. Always write to SQLite first (instant)
// 2. When internet available → push to Supabase
// 3. On app open → pull latest from Supabase
// 4. Conflict resolution: latest timestamp wins
```

---

## 📱 Screens & Features

### 1. Home Screen
- Net balance summary card (total milna + dena)
- Recent contacts list with balance per contact
- **Split Karo** button (NEW badge)
- Bottom navigation: Home, Contacts, Split, Reports
- Settled contacts show 🎉 badge

### 2. Contact Detail Screen
- Hero section: name, phone, net balance
- 3-stat strip: Diya total, Net, Liya total
- Transaction history grouped by date
- WhatsApp Reminder button
- Add Transaction FAB

### 3. Add Transaction Screen
- Toggle: Maine Diya 💸 / Maine Liya 🤝
- Amount input (large, Fredoka One font)
- Contact selector with recent suggestions
- Note field (optional)
- Date picker (default: today)

### 4. Split Feature (3 types)

#### 4a. Bill Split (3-step flow)
- **Step 1:** Bill name + emoji + total amount + method select
- **Step 2 (Equal):** Auto divide among people, live update
- **Step 2 (Custom):** Manual amount per person, running total
- **Step 2 (Percent):** % per person, progress bar to 100%
- **Step 2 (Item-wise):** Add items, assign owner per item
- **Step 3:** Summary → confirm → auto-create transactions + WhatsApp remind

#### 4b. Loan Split
- Select contact
- Total loan amount
- EMI slider (2–24 installments)
- Start date picker
- Live EMI schedule table preview
- Save → creates recurring transaction schedule

#### 4c. Group Udhar
- Gave/Received toggle
- Optional title
- Multiple contacts with individual amounts
- Running total
- Save → creates individual transactions for each

### 5. Reports Screen (Pro only)
- Monthly summary chart
- Top debtors list
- Settled vs pending breakdown
- Export to PDF

### 6. Settings Screen
- Profile (name, phone)
- Theme switcher (4 themes)
- Language toggle (Hindi / English)
- Pro upgrade card
- Backup & restore
- About

---

## 🎨 Theme System

### 4 Themes (see HTML prototype for visual reference)

| Theme | Key Style | Fonts | Default? |
|-------|-----------|-------|---------|
| 🎨 Cartoon | Bold black outlines, offset shadows, bright gradients | Fredoka One + Nunito | ✅ YES |
| ✨ Glass | Dark bg, frosted glass cards, neon glow accents | Baloo 2 + Sora | - |
| 🪨 Neu | Light gray bg, soft 3D inset/outset shadows | DM Serif Display + Space Grotesk | - |
| 📰 Magazine | Cream bg, dark ink, editorial grid | Righteous + Space Grotesk | - |

### Theme Colors (Cartoon - Default)
```typescript
export const cartoonTheme = {
  bg: '#FFF8F0',
  card: '#FFFFFF',
  ink: '#1a1a2e',
  yellow: '#FFD93D',
  orange: '#FF8C42',
  green: '#00C77A',
  red: '#FF6B6B',
  purple: '#A29BFE',
  pink: '#FD79A8',
  blue: '#74B9FF',
  muted: '#999999',
  border: 'rgba(26,26,46,0.1)',
  // Card style
  cardBorder: '2.5px solid #1a1a2e',
  cardShadow: '3px 3px 0 #1a1a2e',  // Comic book shadow
};
```

---

## 💬 WhatsApp Integration

### Method 1: Deep Link (Free, works immediately)
```typescript
// whatsapp.ts
export const sendWhatsAppReminder = (phone: string, name: string, amount: number) => {
  const message = `Bhai ${name}, ₹${amount} dene the mere. Convenient ho toh bata dena 🙏`;
  const url = `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(message)}`;
  Linking.openURL(url);
};
```

### Method 2: WhatsApp Business API (Pro feature, auto-send)
- Register at business.whatsapp.com
- Use approved message templates
- Auto-send scheduled reminders

---

## 🔔 Push Notifications

```typescript
// notifications.ts
// Schedule local notification for EMI reminders
import * as Notifications from 'expo-notifications';

export const scheduleEMIReminder = async (contactName: string, amount: number, date: Date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 EMI Reminder',
      body: `${contactName} ka ₹${amount} aaj milna chahiye!`,
    },
    trigger: { date },
  });
};
```

---

## 🚀 Development Phases

### Phase 1 — MVP (2-3 weeks)
- [ ] Expo project setup + navigation
- [ ] SQLite DB setup (contacts + transactions)
- [ ] Home screen with balance cards
- [ ] Add transaction screen
- [ ] Contact detail with history
- [ ] Cartoon theme (default)
- [ ] WhatsApp deep link reminder
- [ ] Android APK build

### Phase 2 — Core Features (2 weeks)
- [ ] All 4 themes + theme switcher
- [ ] Split feature (Bill + Group)
- [ ] Loan EMI split
- [ ] Supabase auth (OTP login)
- [ ] Cloud sync

### Phase 3 — Monetization (1 week)
- [ ] Razorpay Pro subscription
- [ ] Free tier limits (10 contacts)
- [ ] Reports screen (Pro)
- [ ] PDF export

### Phase 4 — Polish (1 week)
- [ ] iOS build + App Store
- [ ] WhatsApp Business API
- [ ] Push notifications
- [ ] Play Store listing

---

## 📋 VS Code Claude Instructions

When giving this file to Claude in VS Code, say:

```
"I am building UdharBook React Native app. 
Here is my PRD file (UDHARBOOK_PRD.md) and 
HTML prototype (udharbook-split.html) for UI reference.

Please help me implement this step by step starting with Phase 1.
Follow the tech stack, folder structure, and DB schema exactly as defined.
Use the HTML prototype colors and component styles as reference for React Native components.
Start with: Expo project setup + folder structure."
```

---

## 📞 Key Contacts & Links

- **Supabase:** supabase.com (free tier: 500MB DB, 2GB storage)
- **Razorpay:** razorpay.com (register as individual, needs GST for ₹)
- **WhatsApp Business:** business.whatsapp.com
- **Expo EAS Build:** expo.dev/eas (free for personal)
- **Google Play Console:** play.google.com/console (₹2,500 one-time)
- **Apple Developer:** developer.apple.com ($99/year)

---

*Last updated: March 2026 | Built with ❤️ for Bharat*

---

## 🎨 Design System — "Digital Ledger-Luxe" (Added from Stitch)

**Creative North Star:** Bharat-first fintech that feels curated, not just programmed. High-end Indian editorial design meets modern architectural layering.

### Primary Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #000666 | Main brand, hero gradient start |
| primary-container | #1a237e | Hero gradient end |
| primary-fixed | #e0e0ff | Subtle tints, input glow |
| secondary | #7e5700 | Saffron — Pro/premium accents |
| secondary-container | #feb300 | Saffron CTA buttons |
| secondary-fixed | #ffdeac | Pro badges, gold leaf feel |
| surface | #f7f9fc | Base background |
| surface-container-lowest | #ffffff | Primary content cards |
| surface-container-low | #f2f4f7 | De-emphasized sections |
| on-tertiary-container | #5aa958 | "You Get" green amounts |
| on-error-container | #93000a | "You Owe" red amounts |

### Typography
- **Headlines/Display:** Manrope (authoritative, wide kerning = stability)
- **Body/Labels:** Inter (functional, legible on all devices)

### Design Rules
1. **No-Line Rule** — Never use 1px borders. Use background color shifts for separation
2. **No pure black** — Always use `on-surface` (#191c1e) for text
3. **No sharp corners** — Min 16px radius, max 48px
4. **Ambient shadows** — `box-shadow: 0 12px 32px rgba(0,7,103,0.06)` (indigo-tinted, not black)
5. **Glass overlays** — surface_variant at 60% opacity + 20px backdrop blur
6. **Hero gradient** — linear-gradient(135deg, #000666, #1a237e)

### Theme 8: Ledger-Luxe (NEW — from Stitch)
- The 8th theme in the app
- Indigo deep navy + Saffron gold accents
- Glassmorphism balance card
- Manrope + Inter typography
- No borders, tonal layering only
- Split Karo banner in saffron (#ffdeac)
- Bottom nav: glass blur effect

### Key UI Components (Stitch-sourced)
- **Balance Hero Card:** Full-width gradient card (indigo→navy), glass sub-cards
- **Split Karo Banner:** Saffron (#ffdeac) background, brown icon, NEW badge
- **Contact Rows:** No borders, surface shifts only, avatar initials
- **Bento Stats:** Asymmetric 2-col grid (Monthly Flow + Ledger Health)
- **FAB:** Primary indigo, rounded-2xl, fixed bottom-right
- **Bottom Nav:** Glassmorphism, rounded-top-3xl

