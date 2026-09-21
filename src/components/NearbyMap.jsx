import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 12;

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    Math.max(
      value,
      min
    ),
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
      Number(
        latitude
      ),
      -85.05112878,
      85.05112878
    );

  const x =
    (
      Number(
        longitude
      ) +
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
        (
          1 +
          sin
        ) /
        (
          1 -
          sin
        )
      ) /
      (
        4 *
        Math.PI
      )
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
        Math.sinh(
          n
        )
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

function clusterMarkers(
  markers,
  center,
  zoom,
  width,
  height
) {
  if (
    !markers.length ||
    !center
  ) {
    return [];
  }

  const centerPoint =
    worldPoint(
      center.latitude,
      center.longitude,
      zoom
    );

  const projected =
    markers
      .map(
        (
          marker
        ) => {
          const point =
            worldPoint(
              marker.latitude,
              marker.longitude,
              zoom
            );

          return {
            ...marker,
            x:
              width /
                2 +
              point.x -
              centerPoint.x,
            y:
              height /
                2 +
              point.y -
              centerPoint.y,
          };
        }
      )
      .filter(
        (
          marker
        ) =>
          marker.x >
            -50 &&
          marker.x <
            width +
              50 &&
          marker.y >
            -50 &&
          marker.y <
            height +
              50
      );

  const buckets =
    new Map();

  projected.forEach(
    (
      marker
    ) => {
      const key =
        `${Math.round(
          marker.x /
            54
        )}:${Math.round(
          marker.y /
            54
        )}`;

      const bucket =
        buckets.get(
          key
        ) ||
        [];

      bucket.push(
        marker
      );

      buckets.set(
        key,
        bucket
      );
    }
  );

  return [
    ...buckets.values(),
  ].map(
    (
      bucket
    ) => ({
      id:
        bucket
          .map(
            (
              marker
            ) =>
              marker.id
          )
          .join(":"),
      x:
        bucket.reduce(
          (
            sum,
            marker
          ) =>
            sum +
            marker.x,
          0
        ) /
        bucket.length,
      y:
        bucket.reduce(
          (
            sum,
            marker
          ) =>
            sum +
            marker.y,
          0
        ) /
        bucket.length,
      markers:
        bucket,
    })
  );
}

function tileSet(
  center,
  zoom,
  width,
  height
) {
  if (
    !center ||
    width <=
      0 ||
    height <=
      0
  ) {
    return [];
  }

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
        width /
          2
      ) /
      TILE_SIZE
    ) -
    1;

  const maxX =
    Math.floor(
      (
        centerPoint.x +
        width /
          2
      ) /
      TILE_SIZE
    ) +
    1;

  const minY =
    Math.floor(
      (
        centerPoint.y -
        height /
          2
      ) /
      TILE_SIZE
    ) -
    1;

  const maxY =
    Math.floor(
      (
        centerPoint.y +
        height /
          2
      ) /
      TILE_SIZE
    ) +
    1;

  const worldTiles =
    2 ** zoom;

  const result =
    [];

  for (
    let x =
      minX;
    x <=
      maxX;
    x +=
      1
  ) {
    for (
      let y =
        minY;
      y <=
        maxY;
      y +=
        1
    ) {
      if (
        y <
          0 ||
        y >=
          worldTiles
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
          width /
            2 +
          x *
            TILE_SIZE -
          centerPoint.x,
        top:
          height /
            2 +
          y *
            TILE_SIZE -
          centerPoint.y,
      });
    }
  }

  return result;
}

export default function NearbyMap({
  places = [],
  events = [],
  onOpenPlace,
  onOpenEvent,
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
      900,
    height:
      520,
  });

  const validMarkers =
    useMemo(
      () => [
        ...places
          .filter(
            (
              place
            ) =>
              Number.isFinite(
                Number(
                  place.latitude
                )
              ) &&
              Number.isFinite(
                Number(
                  place.longitude
                )
              )
          )
          .map(
            (
              place
            ) => ({
              ...place,
              markerType:
                "place",
              latitude:
                Number(
                  place.latitude
                ),
              longitude:
                Number(
                  place.longitude
                ),
            })
          ),
        ...events
          .filter(
            (
              event
            ) =>
              Number.isFinite(
                Number(
                  event.latitude
                )
              ) &&
              Number.isFinite(
                Number(
                  event.longitude
                )
              )
          )
          .map(
            (
              event
            ) => ({
              ...event,
              markerType:
                "event",
              latitude:
                Number(
                  event.latitude
                ),
              longitude:
                Number(
                  event.longitude
                ),
            })
          ),
      ],
      [
        places,
        events,
      ]
    );

  const calculatedCenter =
    useMemo(() => {
      if (
        !validMarkers.length
      ) {
        return null;
      }

      return {
        latitude:
          validMarkers.reduce(
            (
              sum,
              place
            ) =>
              sum +
              Number(
                place.latitude
              ),
            0
          ) /
          validMarkers.length,
        longitude:
          validMarkers.reduce(
            (
              sum,
              place
            ) =>
              sum +
              Number(
                place.longitude
              ),
            0
          ) /
          validMarkers.length,
      };
    }, [
      validMarkers,
    ]);

  const [
    center,
    setCenter,
  ] = useState(
    calculatedCenter
  );

  const [
    zoom,
    setZoom,
  ] = useState(
    DEFAULT_ZOOM
  );

  const [
    activeClusterId,
    setActiveClusterId,
  ] = useState(null);

  useEffect(() => {
    if (
      calculatedCenter
    ) {
      setCenter(
        calculatedCenter
      );
    }
  }, [
    calculatedCenter
      ?.latitude,
    calculatedCenter
      ?.longitude,
  ]);

  useEffect(() => {
    const element =
      stageRef.current;

    if (
      !element
    ) {
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
              320,
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

  const clusters =
    useMemo(
      () =>
        clusterMarkers(
          validMarkers,
          center,
          zoom,
          size.width,
          size.height
        ),
      [
        validMarkers,
        center,
        zoom,
        size.width,
        size.height,
      ]
    );

  const activeCluster =
    clusters.find(
      (
        cluster
      ) =>
        cluster.id ===
        activeClusterId
    ) ||
    null;

  function beginPan(
    event
  ) {
    if (
      event.button !==
      0 ||
      !center
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

    setActiveClusterId(
      null
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

  if (
    !validMarkers.length ||
    !center
  ) {
    return (
      <section className="nearby-map-empty">
        <div>
          <YatutIcon
            name="pin"
            size={28}
          />
        </div>

        <h3>
          На карті поки немає точок
        </h3>

        <p>
          Точка зʼявиться тут, коли місце або подія матимуть перевірені координати.
        </p>
      </section>
    );
  }

  return (
    <section className="nearby-map-shell">
      <div
        ref={
          stageRef
        }
        className="nearby-map-stage"
      >
        <div
          className="nearby-map-canvas"
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
                className="nearby-map-tile"
                src={
                  tile.src
                }
                alt=""
                draggable="false"
                style={{
                  left:
                    tile.left,
                  top:
                    tile.top,
                }}
              />
            )
          )}

          <div className="nearby-map-shade" />

          {clusters.map(
            (
              cluster
            ) => {
              const many =
                cluster.markers
                  .length >
                1;

              return (
                <button
                  key={
                    cluster.id
                  }
                  type="button"
                  className={`nearby-map-marker ${
                    many
                      ? "is-cluster"
                      : cluster.markers[0]
                          ?.markerType ===
                        "event"
                      ? "is-event"
                      : "is-place"
                  }`}
                  style={{
                    left:
                      cluster.x,
                    top:
                      cluster.y,
                  }}
                  onPointerDown={(
                    event
                  ) =>
                    event.stopPropagation()
                  }
                  onClick={() => {
                    if (
                      many
                    ) {
                      setActiveClusterId(
                        cluster.id
                      );
                    } else {
                      const marker =
                        cluster
                          .markers[0];

                      if (
                        marker
                          ?.markerType ===
                        "event"
                      ) {
                        onOpenEvent?.(
                          marker
                        );
                      } else {
                        onOpenPlace?.(
                          marker
                        );
                      }
                    }
                  }}
                >
                  {many ? (
                    cluster.markers
                      .length
                  ) : (
                    <YatutIcon
                      name="pin"
                      size={16}
                    />
                  )}
                </button>
              );
            }
          )}

          {activeCluster && (
            <div
              className="nearby-map-popover"
              onPointerDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <header>
                <strong>
                  {
                    activeCluster
                      .markers
                      .length
                  }{" "}
                  точок
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setActiveClusterId(
                      null
                    )
                  }
                >
                  ×
                </button>
              </header>

              <div>
                {activeCluster.markers.map(
                  (
                    place
                  ) => (
                    <button
                      key={
                        place.id
                      }
                      type="button"
                      onClick={() => {
                        if (
                          place.markerType ===
                          "event"
                        ) {
                          onOpenEvent?.(
                            place
                          );
                        } else {
                          onOpenPlace?.(
                            place
                          );
                        }
                      }}
                    >
                      <strong>
                        {
                          place.title
                        }
                      </strong>

                      <span>
                        {place.markerType ===
                        "event"
                          ? `Подія · ${
                              place.place ||
                              place.city ||
                              "Місце"
                            }`
                          : place.address ||
                            place.city}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div
            className="nearby-map-controls"
            onPointerDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              aria-label="Збільшити масштаб"
              onClick={() =>
                setZoom(
                  (
                    value
                  ) =>
                    clamp(
                      value +
                        1,
                      10,
                      17
                    )
                )
              }
            >
              +
            </button>

            <button
              type="button"
              aria-label="Зменшити масштаб"
              onClick={() =>
                setZoom(
                  (
                    value
                  ) =>
                    clamp(
                      value -
                        1,
                      10,
                      17
                    )
                )
              }
            >
              −
            </button>

            <button
              type="button"
              className="nearby-map-reset"
              aria-label="Повернути карту до всіх місць"
              onClick={() => {
                setCenter(
                  calculatedCenter
                );
                setZoom(
                  DEFAULT_ZOOM
                );
                setActiveClusterId(
                  null
                );
              }}
            >
              ◎
            </button>
          </div>

          <a
            className="nearby-map-attribution"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            onPointerDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            © OpenStreetMap contributors
          </a>
        </div>
      </div>
    </section>
  );
}
