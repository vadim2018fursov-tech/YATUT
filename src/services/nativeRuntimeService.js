import {
  App,
} from "@capacitor/app";

import {
  Keyboard,
  KeyboardResize,
} from "@capacitor/keyboard";

import {
  SplashScreen,
} from "@capacitor/splash-screen";

import {
  StatusBar,
  Style,
} from "@capacitor/status-bar";

import {
  Capacitor,
} from "@capacitor/core";

function routeFromNativeUrl(
  rawUrl
) {
  try {
    const url =
      new URL(
        rawUrl
      );

    if (
      url.protocol ===
      "yatut:"
    ) {
      const host =
        url.hostname
          ? `/${url.hostname}`
          : "";

      const pathname =
        url.pathname &&
        url.pathname !==
          "/"
          ? url.pathname
          : "";

      return `${host}${pathname}${url.search}${url.hash}` ||
        "/";
    }

    if (
      url.hostname ===
        "yatut.vercel.app" ||
      url.hostname.endsWith(
        ".yatut.vercel.app"
      )
    ) {
      return `${url.pathname}${url.search}${url.hash}` ||
        "/";
    }
  } catch {
    // Ignore malformed external URLs.
  }

  return null;
}

function navigateNativeUrl(
  rawUrl
) {
  const route =
    routeFromNativeUrl(
      rawUrl
    );

  if (!route) {
    return;
  }

  const current =
    `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (
    current !==
    route
  ) {
    window.history.pushState(
      {},
      "",
      route
    );
  }

  window.dispatchEvent(
    new PopStateEvent(
      "popstate"
    )
  );
}

export async function initNativeRuntime() {
  if (
    !Capacitor.isNativePlatform()
  ) {
    return () => {};
  }

  const root =
    document.documentElement;

  root.classList.add(
    "yatut-native-runtime"
  );

  try {
    await StatusBar.setOverlaysWebView({
      overlay: false,
    });

    await StatusBar.setStyle({
      style:
        Style.Light,
    });
  } catch (
    error
  ) {
    console.warn(
      "YATUT NATIVE STATUS BAR:",
      error
    );
  }

  try {
    await Keyboard.setResizeMode({
      mode:
        KeyboardResize.Native,
    });
  } catch (
    error
  ) {
    console.warn(
      "YATUT NATIVE KEYBOARD RESIZE:",
      error
    );
  }

  try {
    await Keyboard.setAccessoryBarVisible({
      isVisible:
        true,
    });
  } catch {
    // Android and some iOS versions do not expose this setting.
  }

  const listeners =
    [];

  listeners.push(
    await Keyboard.addListener(
      "keyboardWillShow",
      (
        info
      ) => {
        root.classList.add(
          "yatut-native-keyboard-open"
        );

        root.style.setProperty(
          "--yatut-native-keyboard-height",
          `${Math.round(
            info.keyboardHeight ||
              0
          )}px`
        );
      }
    )
  );

  listeners.push(
    await Keyboard.addListener(
      "keyboardDidShow",
      (
        info
      ) => {
        root.classList.add(
          "yatut-native-keyboard-open"
        );

        root.style.setProperty(
          "--yatut-native-keyboard-height",
          `${Math.round(
            info.keyboardHeight ||
              0
          )}px`
        );
      }
    )
  );

  listeners.push(
    await Keyboard.addListener(
      "keyboardWillHide",
      () => {
        root.classList.remove(
          "yatut-native-keyboard-open"
        );

        root.style.setProperty(
          "--yatut-native-keyboard-height",
          "0px"
        );
      }
    )
  );

  listeners.push(
    await Keyboard.addListener(
      "keyboardDidHide",
      () => {
        root.classList.remove(
          "yatut-native-keyboard-open"
        );

        root.style.setProperty(
          "--yatut-native-keyboard-height",
          "0px"
        );
      }
    )
  );

  listeners.push(
    await App.addListener(
      "appUrlOpen",
      (
        event
      ) => {
        navigateNativeUrl(
          event.url
        );
      }
    )
  );

  listeners.push(
    await App.addListener(
      "appStateChange",
      (
        state
      ) => {
        root.classList.toggle(
          "yatut-native-active",
          Boolean(
            state.isActive
          )
        );

        window.dispatchEvent(
          new CustomEvent(
            "yatut:native-app-state",
            {
              detail:
                state,
            }
          )
        );
      }
    )
  );

  try {
    const launchUrl =
      await App.getLaunchUrl();

    if (
      launchUrl?.url
    ) {
      navigateNativeUrl(
        launchUrl.url
      );
    }
  } catch (
    error
  ) {
    console.warn(
      "YATUT NATIVE LAUNCH URL:",
      error
    );
  }

  try {
    await SplashScreen.hide({
      fadeOutDuration:
        260,
    });
  } catch (
    error
  ) {
    console.warn(
      "YATUT NATIVE SPLASH:",
      error
    );
  }

  return () => {
    listeners.forEach(
      (
        listener
      ) => {
        listener?.remove?.();
      }
    );
  };
}
