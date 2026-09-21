import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 14;

const CITY_CENTERS = {
  "київ": [50.4501, 30.5234],
  "киев": [50.4501, 30.5234],
  "kyiv": [50.4501, 30.5234],
  "львів": [49.8397, 24.0297],
  "львов": [49.8397, 24.0297],
  "lviv": [49.8397, 24.0297],
  "одеса": [46.4825, 30.7233],
  "одесса": [46.4825, 30.7233],
  "odesa": [46.4825, 30.7233],
  "харків": [49.9935, 36.2304],
  "харьков": [49.9935, 36.2304],
  "kharkiv": [49.9935, 36.2304],
  "дніпро": [48.4647, 35.0462],
  "днепр": [48.4647, 35.0462],
  "dnipro": [48.4647, 35.0462],
  "запоріжжя": [47.8388, 35.1396],
  "чернігів": [51.4982, 31.2893],
  "полтава": [49.5883, 34.5514],
  "вінниця": [49.2331, 28.4682],
  "черкаси": [49.4444, 32.0598],
  "житомир": [50.2547, 28.6587],
  "миколаїв": [46.975, 31.9946],
  "херсон": [46.6354, 32.6169],
  "ужгород": [48.6208, 22.2879],
  "чернівці": [48.2915, 25.9403],
  "івано-франківськ": [48.9226, 24.7111],
  "тернопіль": [49.5535, 25.5948],
  "луцьк": [50.7472, 25.3254],
  "рівне": [50.6199, 26.2516],
  "кропивницький": [48.5079, 32.2623],
  "суми": [50.9077, 34.7981],
};

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function worldPoint(
  latitude,
  longitude,
  zoom
) {
  const scale =
    TILE_SIZE *
    2 ** zoom;

  const safeLatitude =
    clamp(
      Number(latitude),
      -85.05112878,
      85.05112878
    );

  const x =
    (
      Number(longitude) +
      180
    ) /
    360 *
    scale;

  const sin =
    Math.sin(
      safeLatitude *
      Math.PI /
      180
    );

  const y =
    (
      0.5 -
      Math.log(
        (1 + sin) /
        (1 - sin)
      ) /
      (4 * Math.PI)
    ) *
    scale;

  return {
    x,
    y,
  };
}

function worldToLatLng(
  x,
  y,
  zoom
) {
  const scale =
    TILE_SIZE *
    2 ** zoom;

  const longitude =
    x /
      scale *
      360 -
    180;

  const n =
    Math.PI -
    2 *
      Math.PI *
      y /
      scale;

  const latitude =
    180 /
      Math.PI *
      Math.atan(
        Math.sinh(n)
      );

  return {
    latitude:
      clamp(
        latitude,
        -85.05112878,
        85.05112878
      ),
    longitude:
      (
        (
          longitude +
          540
        ) %
        360
      ) -
      180,
  };
}

function tileSet(
  center,
  zoom,
  width,
  height
) {
  const centerPoint =
    worldPoint(
      center.latitude,
      center.longitude,
      zoom
    );

  const minX =
    Math.floor(
      (
        centerPoint.x -
        width / 2
      ) /
      TILE_SIZE
    ) - 1;

  const maxX =
    Math.floor(
      (
        centerPoint.x +
        width / 2
      ) /
      TILE_SIZE
    ) + 1;

  const minY =
    Math.floor(
      (
        centerPoint.y -
        height / 2
      ) /
      TILE_SIZE
    ) - 1;

  const maxY =
    Math.floor(
      (
        centerPoint.y +
        height / 2
      ) /
      TILE_SIZE
    ) + 1;

  const worldTiles =
    2 ** zoom;

  const result = [];

  for (
    let x = minX;
    x <= maxX;
    x += 1
  ) {
    for (
      let y = minY;
      y <= maxY;
      y += 1
    ) {
      if (
        y < 0 ||
        y >= worldTiles
      ) {
        continue;
      }

      const wrappedX =
        (
          (
            x %
            worldTiles
          ) +
          worldTiles
        ) %
        worldTiles;

      result.push({
        id:
          `${zoom}:${x}:${y}`,
        src:
          `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left:
          width / 2 +
          x * TILE_SIZE -
          centerPoint.x,
        top:
          height / 2 +
          y * TILE_SIZE -
          centerPoint.y,
      });
    }
  }

  return result;
}

function resolveInitialCenter({
  value,
  city,
  nearbyPlaces,
  userCoordinates,
}) {
  if (
    Number.isFinite(
      Number(value?.latitude)
    ) &&
    Number.isFinite(
      Number(value?.longitude)
    )
  ) {
    return {
      latitude:
        Number(value.latitude),
      longitude:
        Number(value.longitude),
    };
  }

  if (
    Number.isFinite(
      Number(userCoordinates?.latitude)
    ) &&
    Number.isFinite(
      Number(userCoordinates?.longitude)
    )
  ) {
    return {
      latitude:
        Number(
          userCoordinates.latitude
        ),
      longitude:
        Number(
          userCoordinates.longitude
        ),
    };
  }

  const mapped =
    nearbyPlaces.find(
      (
        item
      ) =>
        Number.isFinite(
          Number(item.latitude)
        ) &&
        Number.isFinite(
          Number(item.longitude)
        )
    );

  if (mapped) {
    return {
      latitude:
        Number(mapped.latitude),
      longitude:
        Number(mapped.longitude),
    };
  }

  const cityKey =
    String(city || "")
      .trim()
      .toLowerCase();

  const cityCenter =
    CITY_CENTERS[cityKey];

  if (cityCenter) {
    return {
      latitude:
        cityCenter[0],
      longitude:
        cityCenter[1],
    };
  }

  return {
    latitude:
      49.0,
    longitude:
      31.0,
  };
}

export default function NearbyCoordinatePicker({
  value = null,
  city = "",
  nearbyPlaces = [],
  userCoordinates = null,
  onChange,
  onClose,
}) {
  const stageRef =
    useRef(null);

  const dragRef =
    useRef(null);

  const [
    size,
    setSize,
  ] = useState({
    width:
      720,
    height:
      390,
  });

  const initialCenter =
    useMemo(
      () =>
        resolveInitialCenter({
          value,
          city,
          nearbyPlaces,
          userCoordinates,
        }),
      []
    );

  const [
    center,
    setCenter,
  ] = useState(
    initialCenter
  );

  const [
    zoom,
    setZoom,
  ] = useState(
    DEFAULT_ZOOM
  );

  useEffect(() => {
    const element =
      stageRef.current;

    if (!element) {
      return;
    }

    const update =
      () => {
        const rect =
          element.getBoundingClientRect();

        setSize({
          width:
            Math.max(
              280,
              Math.round(
                rect.width
              )
            ),
          height:
            Math.max(
              300,
              Math.round(
                rect.height
              )
            ),
        });
      };

    update();

    const observer =
      new ResizeObserver(
        update
      );

    observer.observe(
      element
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  const tiles =
    useMemo(
      () =>
        tileSet(
          center,
          zoom,
          size.width,
          size.height
        ),
      [
        center,
        zoom,
        size.width,
        size.height,
      ]
    );

  function beginPan(
    event
  ) {
    if (
      event.button !== 0
    ) {
      return;
    }

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      );

    dragRef.current = {
      pointerId:
        event.pointerId,
      x:
        event.clientX,
      y:
        event.clientY,
      centerPoint:
        worldPoint(
          center.latitude,
          center.longitude,
          zoom
        ),
    };
  }

  function movePan(
    event
  ) {
    const drag =
      dragRef.current;

    if (
      !drag ||
      drag.pointerId !==
        event.pointerId
    ) {
      return;
    }

    const dx =
      event.clientX -
      drag.x;

    const dy =
      event.clientY -
      drag.y;

    setCenter(
      worldToLatLng(
        drag.centerPoint.x -
          dx,
        drag.centerPoint.y -
          dy,
        zoom
      )
    );
  }

  function endPan(
    event
  ) {
    if (
      dragRef.current
        ?.pointerId ===
      event.pointerId
    ) {
      dragRef.current =
        null;
    }
  }

  return (
    <section className="nearby-coordinate-picker">
      <header>
        <div>
          <span>
            ТОЧКА НА КАРТІ
          </span>

          <h3>
            Вкажіть точне місце
          </h3>

          <p>
            Переміщуйте карту так, щоб маркер у центрі стояв на потрібній точці.
          </p>
        </div>

        <button
          type="button"
          aria-label="Закрити карту"
          onClick={
            onClose
          }
        >
          ×
        </button>
      </header>

      <div
        ref={
          stageRef
        }
        className="nearby-coordinate-picker__stage"
        onPointerDown={
          beginPan
        }
        onPointerMove={
          movePan
        }
        onPointerUp={
          endPan
        }
        onPointerCancel={
          endPan
        }
        onPointerLeave={
          endPan
        }
      >
        {tiles.map(
          (
            tile
          ) => (
            <img
              key={
                tile.id
              }
              src={
                tile.src
              }
              alt=""
              draggable="false"
              className="nearby-coordinate-picker__tile"
              style={{
                left:
                  tile.left,
                top:
                  tile.top,
              }}
            />
          )
        )}

        <div className="nearby-coordinate-picker__shade" />

        <div className="nearby-coordinate-picker__pin">
          <YatutIcon
            name="pin"
            size={18}
          />
        </div>

        <div
          className="nearby-coordinate-picker__controls"
          onPointerDown={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            onClick={() =>
              setZoom(
                (
                  current
                ) =>
                  clamp(
                    current + 1,
                    5,
                    18
                  )
              )
            }
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              setZoom(
                (
                  current
                ) =>
                  clamp(
                    current - 1,
                    5,
                    18
                  )
              )
            }
          >
            −
          </button>
        </div>

        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="nearby-coordinate-picker__attribution"
          onPointerDown={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          © OpenStreetMap contributors
        </a>
      </div>

      <footer>
        <div>
          <strong>
            {center.latitude.toFixed(
              6
            )},{" "}
            {center.longitude.toFixed(
              6
            )}
          </strong>

          <span>
            Координати будуть збережені лише для цього місця.
          </span>
        </div>

        <button
          type="button"
          className="feature-primary-button"
          onClick={() =>
            onChange?.({
              latitude:
                Number(
                  center.latitude.toFixed(
                    7
                  )
                ),
              longitude:
                Number(
                  center.longitude.toFixed(
                    7
                  )
                ),
            })
          }
        >
          Використати цю точку
        </button>
      </footer>
    </section>
  );
}
