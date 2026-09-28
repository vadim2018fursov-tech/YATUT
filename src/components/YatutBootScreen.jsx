import {
  lazy,
  Suspense,
} from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

const LazyYatutRive =
  lazy(
    () =>
      import(
        "./ui/YatutRive"
      )
  );

export default function YatutBootScreen({
  riveSrc =
    import.meta.env
      .VITE_YATUT_BOOT_RIVE ||
    "",
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <div
      className="yatut-boot"
      role="status"
      aria-label="ЯТУТ завантажується"
    >
      <div className="yatut-boot__ambient yatut-boot__ambient--one" />
      <div className="yatut-boot__ambient yatut-boot__ambient--two" />

      {riveSrc ? (
        <Suspense
          fallback={
            null
          }
        >
          <LazyYatutRive
            src={
              riveSrc
            }
            className="yatut-boot__rive"
          />
        </Suspense>
      ) : (
        <motion.div
          className="yatut-boot__brand"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.9,
                  y: 10,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 28,
          }}
        >
          <motion.div
            className="yatut-boot__mark"
            animate={
              reduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 12px 34px rgba(99,91,255,.14)",
                      "0 18px 46px rgba(99,91,255,.28)",
                      "0 12px 34px rgba(99,91,255,.14)",
                    ],
                    scale: [
                      1,
                      1.025,
                      1,
                    ],
                  }
            }
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease:
                "easeInOut",
            }}
          >
            <motion.span
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate: [
                        0,
                        -2,
                        2,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease:
                  "easeInOut",
              }}
            >
              Я
            </motion.span>
          </motion.div>

          <motion.strong
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    letterSpacing:
                      ".28em",
                  }
            }
            animate={{
              opacity: 1,
              letterSpacing:
                ".12em",
            }}
            transition={{
              delay: 0.1,
              duration: 0.42,
            }}
          >
            ТУТ
          </motion.strong>

          <motion.div
            className="yatut-boot__pulse"
            animate={
              reduceMotion
                ? undefined
                : {
                    scaleX: [
                      0.45,
                      1,
                      0.45,
                    ],
                    opacity: [
                      0.35,
                      1,
                      0.35,
                    ],
                  }
            }
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease:
                "easeInOut",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
