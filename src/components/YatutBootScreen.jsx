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
      <div className="yatut-boot__ambient yatut-boot__ambient--three" />
      <div className="yatut-boot__grain" />

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
                  scale: 0.94,
                  y: 14,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
        >
          <motion.div
            className="yatut-boot__glass"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [
                      0,
                      -4,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease:
                "easeInOut",
            }}
          >
            <span className="yatut-boot__ring yatut-boot__ring--one" />
            <span className="yatut-boot__ring yatut-boot__ring--two" />

            <motion.div
              className="yatut-boot__mark"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 18px 42px rgba(94,72,246,.18)",
                        "0 22px 54px rgba(94,72,246,.34)",
                        "0 18px 42px rgba(94,72,246,.18)",
                      ],
                      scale: [
                        1,
                        1.025,
                        1,
                      ],
                    }
              }
              transition={{
                duration: 2.4,
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
                  duration: 2.4,
                  repeat: Infinity,
                  ease:
                    "easeInOut",
                }}
              >
                Я
              </motion.span>
            </motion.div>

            <div className="yatut-boot__wordmark">
              <motion.strong
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        letterSpacing:
                          ".24em",
                      }
                }
                animate={{
                  opacity: 1,
                  letterSpacing:
                    ".10em",
                }}
                transition={{
                  delay: 0.08,
                  duration: 0.48,
                }}
              >
                ТУТ
              </motion.strong>

              <motion.span
                className="yatut-boot__tagline"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 6,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.22,
                  duration: 0.42,
                }}
              >
                Ближче до своїх
              </motion.span>
            </div>
          </motion.div>

          <div className="yatut-boot__progress">
            <motion.div
              className="yatut-boot__progress-fill"
              animate={
                reduceMotion
                  ? {
                      scaleX: 0.72,
                    }
                  : {
                      scaleX: [
                        0.22,
                        0.72,
                        0.42,
                        0.94,
                      ],
                      x: [
                        "-18%",
                        "4%",
                        "12%",
                        "0%",
                      ],
                    }
              }
              transition={{
                duration: 2.1,
                repeat: Infinity,
                repeatType:
                  "mirror",
                ease:
                  "easeInOut",
              }}
            />
          </div>

          <motion.span
            className="yatut-boot__loading-copy"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [
                      0.54,
                      0.9,
                      0.54,
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
            Твій простір уже поруч
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
