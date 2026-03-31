/**
 * Theme — brand.config se automatically generate hota hai.
 * Components mein useTheme() hook use karo, hardcoded colors mat likho.
 */

import { activeBrand, BrandConfig } from "../config/brand.config";

export interface AppTheme {
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    onPrimary: string;
    onBackground: string;
    onSurface: string;
    error: string;
    border: string;
    muted: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    fontSizeXs: number;
    fontSizeSm: number;
    fontSizeMd: number;
    fontSizeLg: number;
    fontSizeXl: number;
    fontSizeXxl: number;
    fontWeightRegular: "400";
    fontWeightMedium: "500";
    fontWeightBold: "700";
  };
  brand: BrandConfig;
}

function buildTheme(brand: BrandConfig): AppTheme {
  return {
    colors: {
      primary: brand.primaryColor,
      accent: brand.accentColor,
      background: brand.backgroundColor,
      surface: "#FFFFFF",
      onPrimary: brand.onPrimaryColor,
      onBackground: "#111827",
      onSurface: "#374151",
      error: "#EF4444",
      border: "#E5E7EB",
      muted: "#9CA3AF",
      success: "#10B981",
      warning: "#F59E0B",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
      full: 9999,
    },
    typography: {
      fontSizeXs: 11,
      fontSizeSm: 13,
      fontSizeMd: 15,
      fontSizeLg: 17,
      fontSizeXl: 20,
      fontSizeXxl: 24,
      fontWeightRegular: "400",
      fontWeightMedium: "500",
      fontWeightBold: "700",
    },
    brand,
  };
}

export const theme = buildTheme(activeBrand);
