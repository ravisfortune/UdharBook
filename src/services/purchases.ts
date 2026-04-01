import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ─── Replace with your RevenueCat API keys from dashboard ────────────────────
// dashboard.revenuecat.com → Project → API Keys
const RC_ANDROID_KEY = 'test_aKSIAIedLiEFeEwBCmPvKVVPmWG'; // Test key — replace with real key after Play Console setup
const RC_IOS_KEY     = 'test_aKSIAIedLiEFeEwBCmPvKVVPmWG'; // Same test key for now

export const ENTITLEMENT_PRO = 'UdharBook Pro';

// ─── Init — call once at app boot ────────────────────────────────────────────
export async function initPurchases(userId?: string) {
  Purchases.setLogLevel(LOG_LEVEL.WARN);

  const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
  await Purchases.configure({ apiKey, appUserID: userId ?? null });
}

// ─── Check if user is Pro ─────────────────────────────────────────────────────
export async function checkProStatus(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
  } catch {
    return false;
  }
}

// ─── Get available packages ──────────────────────────────────────────────────
export async function getPackages(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

// ─── Purchase a package ───────────────────────────────────────────────────────
export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}

// ─── Restore purchases ────────────────────────────────────────────────────────
export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}

// ─── Set user ID after login ──────────────────────────────────────────────────
export async function identifyUser(userId: string) {
  await Purchases.logIn(userId);
}

// ─── Clear user on logout ─────────────────────────────────────────────────────
export async function resetPurchasesUser() {
  await Purchases.logOut();
}
