/**
 * app.config.ts — Dynamic Expo config
 *
 * Static app.json ki jagah yeh file use hoti hai.
 * EAS build ke time BRAND_ID env variable se
 * bundle ID, app name sab automatically set ho jaata hai.
 *
 * Run: BRAND_ID=sharma-store eas build --profile sharma-store
 */

import { ExpoConfig, ConfigContext } from "expo/config";

const brandId = process.env.BRAND_ID ?? "default";
const appName = process.env.APP_NAME ?? "UdharBook";
const bundleIdIos = process.env.BUNDLE_ID_IOS ?? "com.udharbook.app";
const bundleIdAndroid = process.env.BUNDLE_ID_ANDROID ?? "com.udharbook.app";
const splashColor = process.env.SPLASH_COLOR ?? "#000666";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: "udharbook",
  version: "1.0.0",
  orientation: "portrait",
  icon: `./assets/brands/${brandId}/icon.png`,
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: `./assets/brands/${brandId}/splash-icon.png`,
    resizeMode: "contain",
    backgroundColor: splashColor,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: bundleIdIos,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: `./assets/brands/${brandId}/adaptive-icon.png`,
      backgroundColor: splashColor,
    },
    package: bundleIdAndroid,
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    brandId,
  },
});
