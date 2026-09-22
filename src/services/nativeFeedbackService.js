import {
  Haptics,
  ImpactStyle,
} from "@capacitor/haptics";

import {
  Capacitor,
} from "@capacitor/core";

async function safeHaptic(
  callback
) {
  if (
    !Capacitor.isNativePlatform()
  ) {
    return;
  }

  try {
    await callback();
  } catch {
    // Haptics are optional and must never block an action.
  }
}

export function nativeSelectionHaptic() {
  return safeHaptic(
    () =>
      Haptics.selectionChanged()
  );
}

export function nativeLightHaptic() {
  return safeHaptic(
    () =>
      Haptics.impact({
        style:
          ImpactStyle.Light,
      })
  );
}

export function nativeMediumHaptic() {
  return safeHaptic(
    () =>
      Haptics.impact({
        style:
          ImpactStyle.Medium,
      })
  );
}
