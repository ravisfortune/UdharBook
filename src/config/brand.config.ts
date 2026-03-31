/**
 * BRAND CONFIG — White-label ka dil
 *
 * Build time pe EAS environment variables se brand automatically pick hota hai.
 * Local development mein defaultBrand use hoti hai.
 *
 * Naya brand add karna:
 *   1. Yahan nayi BrandConfig banao
 *   2. brandsMap mein add karo
 *   3. eas.json mein nayi build profile banao BRAND_ID ke saath
 */

import Constants from "expo-constants";

export interface BrandConfig {
  appName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onPrimaryColor: string;
  defaultLocale: string;
  supportedLocales: string[];
  supportPhone?: string;
  logo?: number | null;
  splashColor: string;
}

// ─── Brand Definitions ────────────────────────────────────────────────────────

const defaultBrand: BrandConfig = {
  appName: "UdharBook",
  tagline: "Apna hisaab, apne haath",
  primaryColor: "#2563EB",
  accentColor: "#10B981",
  backgroundColor: "#F9FAFB",
  onPrimaryColor: "#FFFFFF",
  defaultLocale: "hi",
  supportedLocales: ["hi", "en"],
  supportPhone: "+91-9999999999",
  logo: null,
  splashColor: "#2563EB",
};

const sharmaBrand: BrandConfig = {
  appName: "Sharma Store Khata",
  tagline: "Sharma General Store — Digital Ledger",
  primaryColor: "#DC2626",
  accentColor: "#F59E0B",
  backgroundColor: "#FFF7ED",
  onPrimaryColor: "#FFFFFF",
  defaultLocale: "hi",
  supportedLocales: ["hi", "en"],
  supportPhone: "+91-9876543210",
  logo: null, // replace: require('../../assets/brands/sharma/logo.png')
  splashColor: "#DC2626",
};

const vermaClothBrand: BrandConfig = {
  appName: "Verma Cloth Khata",
  tagline: "Verma Cloth House — Hisaab Kitaab",
  primaryColor: "#7C3AED",
  accentColor: "#EC4899",
  backgroundColor: "#F5F3FF",
  onPrimaryColor: "#FFFFFF",
  defaultLocale: "hi",
  supportedLocales: ["hi", "en"],
  supportPhone: "+91-9123456789",
  logo: null,
  splashColor: "#7C3AED",
};

// ─── Brand Map ────────────────────────────────────────────────────────────────

const brandsMap: Record<string, BrandConfig> = {
  default: defaultBrand,
  "sharma-store": sharmaBrand,
  "verma-cloth": vermaClothBrand,
};

// ─── Active Brand Resolution ──────────────────────────────────────────────────
// EAS build time pe BRAND_ID env variable se pick hota hai.
// Local dev mein "default" use hota hai.

const brandId: string =
  Constants.expoConfig?.extra?.brandId ??
  process.env.BRAND_ID ??
  "default";

export const activeBrand: BrandConfig = brandsMap[brandId] ?? defaultBrand;
