export async function shareYatutItem({
  title = "ЯТУТ",
  text = "",
  path = "",
  fallbackMessage = "Посилання скопійовано",
} = {}) {
  const url =
    path
      ? new URL(
          path,
          `${window.location.origin}/`
        ).toString()
      : window.location.href;

  try {
    if (
      navigator.share
    ) {
      await navigator.share({
        title,
        text,
        url,
      });

      return {
        shared: true,
        copied: false,
      };
    }

    if (
      navigator.clipboard
        ?.writeText
    ) {
      await navigator.clipboard.writeText(
        url
      );

      return {
        shared: false,
        copied: true,
        message:
          fallbackMessage,
      };
    }
  } catch (error) {
    if (
      error?.name ===
        "AbortError"
    ) {
      return {
        shared: false,
        copied: false,
        cancelled: true,
      };
    }

    console.warn(
      "YATUT SHARE ERROR:",
      error
    );
  }

  return {
    shared: false,
    copied: false,
  };
}
