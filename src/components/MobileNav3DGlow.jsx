import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  Float,
} from "@react-three/drei";

import {
  Bloom,
  EffectComposer,
} from "@react-three/postprocessing";

import {
  MathUtils,
} from "three";

const SLOT_X = [
  -2.16,
  -1.08,
  0,
  1.08,
  2.16,
];

function MovingGlow({
  activeIndex,
  reducedMotion,
}) {
  const groupRef =
    useRef(null);

  const coreRef =
    useRef(null);

  const haloRef =
    useRef(null);

  const initialX =
    activeIndex >= 0
      ? SLOT_X[
          activeIndex
        ] ?? 0
      : 0;

  useFrame(
    (
      state,
      delta
    ) => {
      const group =
        groupRef.current;

      const core =
        coreRef.current;

      const halo =
        haloRef.current;

      if (
        !group ||
        !core ||
        !halo
      ) {
        return;
      }

      const visible =
        activeIndex >= 0;

      const targetX =
        visible
          ? SLOT_X[
              activeIndex
            ] ?? 0
          : 0;

      group.position.x =
        MathUtils.damp(
          group.position.x,
          targetX,
          reducedMotion
            ? 24
            : 7.2,
          delta
        );

      const time =
        state.clock
          .elapsedTime;

      if (
        !reducedMotion
      ) {
        group.rotation.z =
          Math.sin(
            time * 0.7
          ) * 0.07;

        group.position.y =
          Math.sin(
            time * 0.9
          ) * 0.035;
      }

      core.opacity =
        MathUtils.damp(
          core.opacity,
          visible
            ? 0.46
            : 0.10,
          7.5,
          delta
        );

      halo.opacity =
        MathUtils.damp(
          halo.opacity,
          visible
            ? 0.20
            : 0.07,
          7.5,
          delta
        );
    }
  );

  return (
    <group
      ref={
        groupRef
      }
      position={[
        initialX,
        0,
        0,
      ]}
    >
      <mesh
        scale={[
          1.25,
          0.48,
          0.58,
        ]}
        rotation={[
          0.32,
          0.08,
          0.12,
        ]}
      >
        <sphereGeometry
          args={[
            0.66,
            24,
            16,
          ]}
        />

        <meshBasicMaterial
          ref={
            coreRef
          }
          color="#8a7bff"
          transparent
          opacity={0.42}
          toneMapped={
            false
          }
          depthWrite={
            false
          }
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.02,
          -0.32,
        ]}
        scale={[
          1.82,
          0.72,
          0.46,
        ]}
      >
        <sphereGeometry
          args={[
            0.72,
            22,
            14,
          ]}
        />

        <meshBasicMaterial
          ref={
            haloRef
          }
          color="#5848ee"
          transparent
          opacity={0.18}
          toneMapped={
            false
          }
          depthWrite={
            false
          }
        />
      </mesh>
    </group>
  );
}

function AmbientOrb({
  position,
  scale,
  color,
  opacity,
  reducedMotion,
  speed = 0.45,
}) {
  return (
    <Float
      speed={
        reducedMotion
          ? 0
          : speed
      }
      rotationIntensity={
        reducedMotion
          ? 0
          : 0.12
      }
      floatIntensity={
        reducedMotion
          ? 0
          : 0.22
      }
    >
      <mesh
        position={
          position
        }
        scale={
          scale
        }
      >
        <sphereGeometry
          args={[
            0.62,
            20,
            12,
          ]}
        />

        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            opacity
          }
          toneMapped={
            false
          }
          depthWrite={
            false
          }
        />
      </mesh>
    </Float>
  );
}

function NavDepthScene({
  activeIndex,
  reducedMotion,
}) {
  return (
    <>
      <MovingGlow
        activeIndex={
          activeIndex
        }
        reducedMotion={
          reducedMotion
        }
      />

      <AmbientOrb
        position={[
          -2.35,
          0.23,
          -0.55,
        ]}
        scale={[
          0.82,
          0.34,
          0.45,
        ]}
        color="#a89eff"
        opacity={0.10}
        reducedMotion={
          reducedMotion
        }
      />

      <AmbientOrb
        position={[
          2.42,
          -0.16,
          -0.5,
        ]}
        scale={[
          0.96,
          0.38,
          0.48,
        ]}
        color="#6b58ff"
        opacity={0.13}
        reducedMotion={
          reducedMotion
        }
        speed={0.55}
      />

      <EffectComposer
        multisampling={
          0
        }
      >
        <Bloom
          intensity={
            reducedMotion
              ? 0.30
              : 0.48
          }
          luminanceThreshold={
            0.02
          }
          luminanceSmoothing={
            0.82
          }
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function MobileNav3DGlow({
  activeIndex = -1,
}) {
  const [
    reducedMotion,
    setReducedMotion,
  ] =
    useState(false);

  useEffect(
    () => {
      const media =
        window.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        );

      const sync =
        () => {
          setReducedMotion(
            Boolean(
              media?.matches
            )
          );
        };

      sync();

      media?.addEventListener?.(
        "change",
        sync
      );

      return () => {
        media?.removeEventListener?.(
          "change",
          sync
        );
      };
    },
    []
  );

  const normalizedIndex =
    useMemo(
      () =>
        Number.isFinite(
          activeIndex
        )
          ? Math.max(
              -1,
              Math.min(
                4,
                activeIndex
              )
            )
          : -1,
      [
        activeIndex,
      ]
    );

  return (
    <span
      className="mobile-nav-3d"
      aria-hidden="true"
    >
      <Canvas
        orthographic
        dpr={[
          1,
          1.25,
        ]}
        camera={{
          position: [
            0,
            0,
            10,
          ],
          zoom: 80,
        }}
        gl={{
          alpha: true,
          antialias:
            false,
          powerPreference:
            "high-performance",
          premultipliedAlpha:
            true,
        }}
        frameloop={
          reducedMotion
            ? "demand"
            : "always"
        }
        fallback={
          <span className="mobile-nav-3d-fallback" />
        }
      >
        <NavDepthScene
          activeIndex={
            normalizedIndex
          }
          reducedMotion={
            reducedMotion
          }
        />
      </Canvas>
    </span>
  );
}
