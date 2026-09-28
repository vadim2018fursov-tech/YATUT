import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

const PAGE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.72,
};

export default function AnimatedPageSwitch({
  pageKey,
  children,
}) {
  const reduceMotion =
    useReducedMotion();

  const variants =
    reduceMotion
      ? {
          initial: {
            opacity: 1,
          },
          animate: {
            opacity: 1,
          },
          exit: {
            opacity: 1,
          },
        }
      : {
          initial: {
            opacity: 0,
            y: 10,
            scale: 0.995,
            filter:
              "blur(3px)",
          },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter:
              "blur(0px)",
          },
          exit: {
            opacity: 0,
            y: -6,
            scale: 0.998,
            filter:
              "blur(2px)",
          },
        };

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
    >
      <motion.div
        key={pageKey}
        className="yatut-page-motion"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={
          reduceMotion
            ? {
                duration: 0,
              }
            : PAGE_SPRING
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
