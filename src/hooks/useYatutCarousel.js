import useEmblaCarousel from "embla-carousel-react";

const DEFAULT_OPTIONS = {
  align: "start",
  containScroll:
    "trimSnaps",
  dragFree: false,
  skipSnaps: false,
};

export default function useYatutCarousel(
  options = {},
  plugins = []
) {
  return useEmblaCarousel(
    {
      ...DEFAULT_OPTIONS,
      ...options,
    },
    plugins
  );
}
