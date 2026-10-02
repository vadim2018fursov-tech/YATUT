import {
  useEffect,
  useRef,
} from "react";

const PARTICLE_COUNT =
  1320;

const HALO_COUNT =
  110;

function hash(
  value
) {
  const x =
    Math.sin(
      value *
        12.9898 +
        78.233
    ) *
    43758.5453;

  return (
    x -
    Math.floor(
      x
    )
  );
}

function createParticle(
  index,
  halo =
    false
) {
  const u =
    hash(
      index +
        1.17
    );

  const v =
    hash(
      index +
        41.73
    );

  const y =
    v *
      2 -
    1;

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
    u *
    Math.PI *
    2;

  const shell =
    halo
      ? 1.07 +
        hash(
          index +
            91.41
        ) *
          0.28
      : 0.90 +
        hash(
          index +
            67.29
        ) *
          0.13;

  return {
    x:
      Math.cos(
        theta
      ) *
      radial *
      shell,

    y:
      y *
      shell,

    z:
      Math.sin(
        theta
      ) *
      radial *
      shell,

    colorIndex:
      Math.floor(
        hash(
          index +
            19.83
        ) *
          5
      ),

    size:
      0.58 +
      hash(
        index +
          127.9
      ) *
        (
          halo
            ? 1.05
            : 1.48
        ),

    alpha:
      halo
        ? 0.30 +
          hash(
            index +
              47.3
          ) *
            0.42
        : 0.44 +
          hash(
            index +
              33.7
          ) *
            0.50,

    twinkle:
      hash(
        index +
          214.4
      ) >
      0.948,

    halo,
  };
}

const PARTICLES = [
  ...Array.from(
    {
      length:
        PARTICLE_COUNT,
    },
    (
      _,
      index
    ) =>
      createParticle(
        index,
        false
      )
  ),

  ...Array.from(
    {
      length:
        HALO_COUNT,
    },
    (
      _,
      index
    ) =>
      createParticle(
        index +
          PARTICLE_COUNT,
        true
      )
  ),
];

const COLORS = [
  [
    111,
    86,
    255,
  ],
  [
    69,
    179,
    255,
  ],
  [
    245,
    112,
    213,
  ],
  [
    255,
    255,
    255,
  ],
  [
    156,
    126,
    255,
  ],
];

function rotatePoint(
  point,
  angleY,
  angleX,
  angleZ
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

  const cosZ =
    Math.cos(
      angleZ
    );

  const sinZ =
    Math.sin(
      angleZ
    );

  return {
    x:
      x1 *
        cosZ -
      y2 *
        sinZ,

    y:
      x1 *
        sinZ +
      y2 *
        cosZ,

    z:
      z2,
  };
}

function drawOrbit(
  context,
  {
    centerX,
    centerY,
    radius,
    rotation,
    phase,
    color,
    reverse =
      false,
  }
) {
  const rx =
    radius *
    1.18;

  const ry =
    radius *
    0.43;

  context.save();

  context.translate(
    centerX,
    centerY
  );

  context.rotate(
    rotation
  );

  context.beginPath();

  context.ellipse(
    0,
    0,
    rx,
    ry,
    0,
    0,
    Math.PI *
      2
  );

  context.lineWidth =
    1.15;

  context.strokeStyle =
    color;

  context.shadowBlur =
    8;

  context.shadowColor =
    color;

  context.stroke();

  const t =
    reverse
      ? -phase
      : phase;

  const sparkX =
    Math.cos(
      t
    ) *
    rx;

  const sparkY =
    Math.sin(
      t
    ) *
    ry;

  const glow =
    context.createRadialGradient(
      sparkX,
      sparkY,
      0,
      sparkX,
      sparkY,
      13
    );

  glow.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );

  glow.addColorStop(
    0.20,
    "rgba(210,197,255,.90)"
  );

  glow.addColorStop(
    1,
    "rgba(117,91,255,0)"
  );

  context.beginPath();

  context.arc(
    sparkX,
    sparkY,
    13,
    0,
    Math.PI *
      2
  );

  context.fillStyle =
    glow;

  context.fill();

  context.beginPath();

  context.arc(
    sparkX,
    sparkY,
    2.5,
    0,
    Math.PI *
      2
  );

  context.fillStyle =
    "#ffffff";

  context.fill();

  context.restore();

  context.shadowBlur =
    0;
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
          "2d",
          {
            alpha: true,
          }
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
            0.00052;

          const angleX =
            -0.13 +
            Math.sin(
              elapsed *
                0.00031
            ) *
              0.075;

          const angleZ =
            Math.sin(
              elapsed *
                0.00021
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
            0.315;

          context.clearRect(
            0,
            0,
            width,
            height
          );

          const aura =
            context.createRadialGradient(
              centerX,
              centerY,
              radius *
                0.10,
              centerX,
              centerY,
              radius *
                1.16
            );

          aura.addColorStop(
            0,
            "rgba(121,95,255,.15)"
          );

          aura.addColorStop(
            0.54,
            "rgba(83,183,255,.07)"
          );

          aura.addColorStop(
            1,
            "rgba(255,255,255,0)"
          );

          context.beginPath();

          context.arc(
            centerX,
            centerY,
            radius *
              1.16,
            0,
            Math.PI *
              2
          );

          context.fillStyle =
            aura;

          context.fill();

          context.globalCompositeOperation =
            "lighter";

          drawOrbit(
            context,
            {
              centerX,
              centerY,
              radius,
              rotation:
                -0.30 +
                elapsed *
                  0.00012,
              phase:
                elapsed *
                0.0014,
              color:
                "rgba(122,96,255,.27)",
            }
          );

          drawOrbit(
            context,
            {
              centerX,
              centerY,
              radius,
              rotation:
                0.88 -
                elapsed *
                  0.00009,
              phase:
                elapsed *
                0.0011 +
                1.7,
              color:
                "rgba(78,188,255,.24)",
              reverse:
                true,
            }
          );

          drawOrbit(
            context,
            {
              centerX,
              centerY,
              radius:
                radius *
                0.95,
              rotation:
                1.83 +
                elapsed *
                  0.00008,
              phase:
                elapsed *
                0.00125 +
                3.2,
              color:
                "rgba(245,120,216,.20)",
            }
          );

          const rendered =
            PARTICLES.map(
              (
                source,
                index
              ) => {
                const point =
                  rotatePoint(
                    source,
                    angleY,
                    angleX,
                    angleZ
                  );

                return {
                  source,
                  point,
                  index,
                };
              }
            ).sort(
              (
                a,
                b
              ) =>
                a.point.z -
                b.point.z
            );

          for (
            let index =
              0;
            index <
            rendered.length;
            index +=
              1
          ) {
            const {
              source,
              point,
            } =
              rendered[
                index
              ];

            const depth =
              (
                point.z +
                  1.35
              ) /
              2.7;

            const perspective =
              0.70 +
              depth *
                0.42;

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
                ? 0.28 *
                  (
                    0.5 +
                    0.5 *
                      Math.sin(
                        elapsed *
                          0.005 +
                        index *
                          0.31
                      )
                  )
                : 0;

            const alpha =
              Math.min(
                1,
                source.alpha *
                  (
                    0.54 +
                    depth *
                      0.72
                  ) +
                  twinkle
              );

            const dotRadius =
              source.size *
              (
                0.68 +
                depth *
                  0.95
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

            if (
              source.twinkle ||
              (
                !source.halo &&
                depth >
                  0.78
              )
            ) {
              context.shadowBlur =
                source.twinkle
                  ? 7
                  : 3;

              context.shadowColor =
                `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.min(0.72, alpha)})`;
            } else {
              context.shadowBlur =
                0;
            }

            context.fill();
          }

          context.shadowBlur =
            0;

          const beaconSource = {
            x:
              0.61,
            y:
              -0.40,
            z:
              0.69,
          };

          const beacon =
            rotatePoint(
              beaconSource,
              angleY,
              angleX,
              angleZ
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
              0.39;

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
                  0.0036
              );

          const glowRadius =
            20 +
            approach *
              31;

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
            "rgba(255,247,255,.98)"
          );

          gradient.addColorStop(
            0.34,
            "rgba(185,158,255,.70)"
          );

          gradient.addColorStop(
            0.62,
            "rgba(83,184,255,.25)"
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
            3.6 +
              approach *
                4.1,
            0,
            Math.PI *
              2
          );

          context.fillStyle =
            "#ffffff";

          context.shadowBlur =
            22 +
            approach *
              22;

          context.shadowColor =
            "rgba(135,108,255,.96)";

          context.fill();

          context.shadowBlur =
            0;

          context.globalCompositeOperation =
            "source-over";

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
