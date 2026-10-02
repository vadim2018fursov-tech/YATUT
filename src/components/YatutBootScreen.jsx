import {
  motion,
  useReducedMotion,
} from "motion/react";

const BOOT_PARTICLES =
  Array.from(
    {
      length: 220,
    },
    (
      _,
      index
    ) => {
      const count =
        220;

      const y =
        1 -
        (
          index /
          (
            count -
            1
          )
        ) *
          2;

      const radius =
        Math.sqrt(
          Math.max(
            0,
            1 -
              y *
                y
          )
        );

      const theta =
        Math.PI *
        (
          3 -
          Math.sqrt(
            5
          )
        ) *
        index;

      const x =
        Math.cos(
          theta
        ) *
        radius;

      const z =
        Math.sin(
          theta
        ) *
        radius;

      const hueIndex =
        index %
        5;

      const tone =
        [
          "violet",
          "blue",
          "pink",
          "ice",
          "violet",
        ][
          hueIndex
        ];

      const size =
        1.5 +
        (
          (
            index *
            7
          ) %
          9
        ) /
          10;

      const opacity =
        0.48 +
        (
          (
            index *
            11
          ) %
          45
        ) /
          100;

      return {
        x:
          x *
          118,
        y:
          y *
          118,
        z:
          z *
          118,
        tone,
        size,
        opacity,
      };
    }
  );

export default function YatutBootScreen() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div
      className="yatut-boot yatut-boot--particles"
      role="status"
      aria-label="ЯТУТ завантажується"
    >
      <div className="yatut-boot__ambient yatut-boot__ambient--one" />
      <div className="yatut-boot__ambient yatut-boot__ambient--two" />
      <div className="yatut-boot__ambient yatut-boot__ambient--three" />

      <motion.div
        className="yatut-boot__particle-stage"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                scale: 0.88,
                y: 14,
              }
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.62,
          ease: [
            0.22,
            0.8,
            0.26,
            1,
          ],
        }}
      >
        <div className="yatut-boot__sphere-shell">
          <span className="yatut-boot__orbit yatut-boot__orbit--one" />
          <span className="yatut-boot__orbit yatut-boot__orbit--two" />
          <span className="yatut-boot__orbit yatut-boot__orbit--three" />

          <div
            className={
              `yatut-boot__sphere ${reduceMotion ? "is-static" : ""}`
            }
          >
            {
              BOOT_PARTICLES.map(
                (
                  particle,
                  index
                ) => (
                  <span
                    key={
                      index
                    }
                    className={
                      `yatut-boot__particle yatut-boot__particle--${particle.tone}`
                    }
                    style={{
                      "--particle-x":
                        `${particle.x.toFixed(2)}px`,
                      "--particle-y":
                        `${particle.y.toFixed(2)}px`,
                      "--particle-z":
                        `${particle.z.toFixed(2)}px`,
                      "--particle-size":
                        `${particle.size.toFixed(2)}px`,
                      "--particle-opacity":
                        particle.opacity.toFixed(
                          2
                        ),
                    }}
                  />
                )
              )
            }

            <span className="yatut-boot__beacon">
              <span className="yatut-boot__beacon-core" />
            </span>
          </div>
        </div>

        <motion.div
          className="yatut-boot__logo-lockup"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 10,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.18,
            duration: 0.46,
          }}
        >
          <div className="yatut-boot__logo-mark">
            Я
          </div>

          <strong>
            ТУТ
          </strong>
        </motion.div>
      </motion.div>
    </div>
  );
}
