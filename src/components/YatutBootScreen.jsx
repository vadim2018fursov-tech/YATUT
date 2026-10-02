import {
  useEffect,
  useRef,
} from "react";

const PARTICLE_COUNT =
  1100;

const GOLDEN_ANGLE =
  Math.PI *
  (
    3 -
    Math.sqrt(
      5
    )
  );

const PARTICLES =
  Array.from(
    {
      length:
        PARTICLE_COUNT,
    },
    (
      _,
      index
    ) => {
      const t =
        index /
        (
          PARTICLE_COUNT -
          1
        );

      const y =
        1 -
        t *
          2;

      const radial =
        Math.sqrt(
          Math.max(
            0,
            1 -
              y *
                y
          )
        );

      const theta =
        GOLDEN_ANGLE *
        index;

      return {
        x:
          Math.cos(
            theta
          ) *
          radial,

        y,

        z:
          Math.sin(
            theta
          ) *
          radial,

        colorIndex:
          index %
          5,

        twinkle:
          (
            index *
            17
          ) %
          23 ===
          0,
      };
    }
  );

const COLORS = [
  [
    115,
    91,
    255,
  ],
  [
    75,
    180,
    255,
  ],
  [
    244,
    119,
    215,
  ],
  [
    255,
    255,
    255,
  ],
  [
    147,
    126,
    255,
  ],
];

function rotatePoint(
  point,
  angleY,
  angleX
) {
  const cosY =
    Math.cos(
      angleY
    );

  const sinY =
    Math.sin(
      angleY
    );

  const x1 =
    point.x *
      cosY +
    point.z *
      sinY;

  const z1 =
    -point.x *
      sinY +
    point.z *
      cosY;

  const cosX =
    Math.cos(
      angleX
    );

  const sinX =
    Math.sin(
      angleX
    );

  const y2 =
    point.y *
      cosX -
    z1 *
      sinX;

  const z2 =
    point.y *
      sinX +
    z1 *
      cosX;

  return {
    x:
      x1,
    y:
      y2,
    z:
      z2,
  };
}

function ParticleSphere() {
  const canvasRef =
    useRef(null);

  useEffect(
    () => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return undefined;
      }

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        return undefined;
      }

      let frameId =
        0;

      let startTime =
        performance.now();

      const resize =
        () => {
          const rect =
            canvas.getBoundingClientRect();

          const dpr =
            Math.min(
              window.devicePixelRatio ||
                1,
              2
            );

          canvas.width =
            Math.max(
              1,
              Math.round(
                rect.width *
                  dpr
              )
            );

          canvas.height =
            Math.max(
              1,
              Math.round(
                rect.height *
                  dpr
              )
            );

          context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
          );
        };

      const draw =
        (
          now
        ) => {
          const rect =
            canvas.getBoundingClientRect();

          const width =
            rect.width;

          const height =
            rect.height;

          if (
            !width ||
            !height
          ) {
            frameId =
              window.requestAnimationFrame(
                draw
              );

            return;
          }

          const elapsed =
            now -
            startTime;

          const angleY =
            elapsed *
            0.00042;

          const angleX =
            -0.16 +
            Math.sin(
              elapsed *
                0.00034
            ) *
              0.055;

          const centerX =
            width /
            2;

          const centerY =
            height /
            2;

          const radius =
            Math.min(
              width,
              height
            ) *
            0.355;

          context.clearRect(
            0,
            0,
            width,
            height
          );

          context.save();

          context.globalCompositeOperation =
            "lighter";

          for (
            let index =
              0;
            index <
            PARTICLES.length;
            index +=
              1
          ) {
            const source =
              PARTICLES[
                index
              ];

            const point =
              rotatePoint(
                source,
                angleY,
                angleX
              );

            const depth =
              (
                point.z +
                1
              ) /
              2;

            const perspective =
              0.72 +
              depth *
                0.34;

            const x =
              centerX +
              point.x *
                radius *
                perspective;

            const y =
              centerY +
              point.y *
                radius *
                perspective;

            const color =
              COLORS[
                source.colorIndex
              ];

            const twinkle =
              source.twinkle
                ? 0.20 *
                  (
                    0.5 +
                    0.5 *
                      Math.sin(
                        elapsed *
                          0.004 +
                        index
                      )
                  )
                : 0;

            const alpha =
              Math.min(
                1,
                0.18 +
                  depth *
                    0.72 +
                  twinkle
              );

            const dotRadius =
              0.52 +
              depth *
                1.35 +
              (
                source.twinkle
                  ? 0.35
                  : 0
              );

            context.beginPath();

            context.arc(
              x,
              y,
              dotRadius,
              0,
              Math.PI *
                2
            );

            context.fillStyle =
              `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

            context.shadowBlur =
              source.twinkle
                ? 7
                : 3.5;

            context.shadowColor =
              `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.min(0.72, alpha)})`;

            context.fill();
          }

          context.restore();

          const beaconSource = {
            x:
              0.64,
            y:
              -0.44,
            z:
              0.63,
          };

          const beacon =
            rotatePoint(
              beaconSource,
              angleY,
              angleX
            );

          const beaconDepth =
            (
              beacon.z +
                1
            ) /
            2;

          const beaconPerspective =
            0.74 +
            beaconDepth *
              0.38;

          const beaconX =
            centerX +
            beacon.x *
              radius *
              beaconPerspective;

          const beaconY =
            centerY +
            beacon.y *
              radius *
              beaconPerspective;

          const approach =
            0.5 +
            0.5 *
              Math.sin(
                elapsed *
                  0.0037
              );

          const glowRadius =
            16 +
            approach *
              25;

          const gradient =
            context.createRadialGradient(
              beaconX,
              beaconY,
              0,
              beaconX,
              beaconY,
              glowRadius
            );

          gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
          );

          gradient.addColorStop(
            0.14,
            "rgba(255,246,255,.96)"
          );

          gradient.addColorStop(
            0.34,
            "rgba(178,153,255,.64)"
          );

          gradient.addColorStop(
            0.62,
            "rgba(83,184,255,.22)"
          );

          gradient.addColorStop(
            1,
            "rgba(109,82,255,0)"
          );

          context.beginPath();

          context.arc(
            beaconX,
            beaconY,
            glowRadius,
            0,
            Math.PI *
              2
          );

          context.fillStyle =
            gradient;

          context.fill();

          context.beginPath();

          context.arc(
            beaconX,
            beaconY,
            3.2 +
              approach *
                3.5,
            0,
            Math.PI *
              2
          );

          context.fillStyle =
            "#ffffff";

          context.shadowBlur =
            18 +
            approach *
              18;

          context.shadowColor =
            "rgba(130,105,255,.94)";

          context.fill();

          context.shadowBlur =
            0;

          frameId =
            window.requestAnimationFrame(
              draw
            );
        };

      resize();

      const resizeObserver =
        new ResizeObserver(
          resize
        );

      resizeObserver.observe(
        canvas
      );

      frameId =
        window.requestAnimationFrame(
          draw
        );

      return () => {
        window.cancelAnimationFrame(
          frameId
        );

        resizeObserver.disconnect();
      };
    },
    []
  );

  return (
    <canvas
      ref={
        canvasRef
      }
      className="yatut-boot__particle-canvas"
      aria-hidden="true"
    />
  );
}

export default function YatutBootScreen() {
  return (
    <div
      className="yatut-boot yatut-boot--canvas"
      role="status"
      aria-label="ЯТУТ завантажується"
    >
      <div className="yatut-boot__ambient yatut-boot__ambient--one" />
      <div className="yatut-boot__ambient yatut-boot__ambient--two" />
      <div className="yatut-boot__ambient yatut-boot__ambient--three" />

      <div className="yatut-boot__canvas-stage">
        <div className="yatut-boot__canvas-glow" />

        <ParticleSphere />

        <div className="yatut-boot__logo-lockup">
          <div className="yatut-boot__logo-mark">
            Я
          </div>

          <strong>
            ТУТ
          </strong>
        </div>
      </div>
    </div>
  );
}
