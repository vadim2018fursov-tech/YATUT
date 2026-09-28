import {
  useAutoAnimate,
} from "@formkit/auto-animate/react";

const DEFAULT_OPTIONS = {
  duration: 180,
  easing:
    "cubic-bezier(.22,.8,.26,1)",
};

export default function useYatutAutoAnimate(
  options = {}
) {
  return useAutoAnimate({
    ...DEFAULT_OPTIONS,
    ...options,
  });
}
