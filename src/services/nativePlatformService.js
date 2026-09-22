import { Capacitor } from "@capacitor/core";

export function initNativePlatform() {
  const native =
    Capacitor.isNativePlatform();

  const platform =
    Capacitor.getPlatform();

  document.documentElement
    .classList.toggle(
      "yatut-native",
      native
    );

  document.documentElement
    .classList.toggle(
      "yatut-native-ios",
      native &&
        platform ===
          "ios"
    );

  document.documentElement
    .classList.toggle(
      "yatut-native-android",
      native &&
        platform ===
          "android"
    );

  return {
    native,
    platform,
  };
}

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}
