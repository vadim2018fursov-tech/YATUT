import {
  useMemo,
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

  const x =
    (
      longitude +
      180
    ) /
    360 *
    scale;

  const sin =
    Math.sin(
      latitude *
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
            -40 &&
          marker.x <
            width +
              40 &&
          marker.y >
            -40 &&
          marker.y <
            height +
              40
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
            52
        )}:${Math.round(
          marker.y /
            52
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
  onOpenPlace,
}) {
  const validPlaces =
    useMemo(
      () =>
        places.filter(
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
        ),
      [
        places,
      ]
    );

  const initialCenter =
    useMemo(() => {
      if (
        !validPlaces.length
      ) {
        return null;
      }

      return {
        latitude:
          validPlaces.reduce(
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
          validPlaces.length,
        longitude:
          validPlaces.reduce(
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
          validPlaces.length,
      };
    }, [
      validPlaces,
    ]);

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

  const width =
    900;

  const height =
    520;

  const tiles =
    useMemo(
      () =>
        tileSet(
          initialCenter,
          zoom,
          width,
          height
        ),
      [
        initialCenter,
        zoom,
      ]
    );

  const clusters =
    useMemo(
      () =>
        clusterMarkers(
          validPlaces.map(
            (
              place
            ) => ({
              ...place,
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
          initialCenter,
          zoom,
          width,
          height
        ),
      [
        validPlaces,
        initialCenter,
        zoom,
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

  if (
    !validPlaces.length
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
          Місце зʼявиться тут, коли для нього будуть збережені координати.
        </p>
      </section>
    );
  }

  return (
    <section className="nearby-map-shell">
      <div
        className="nearby-map-stage"
        style={{
          "--nearby-map-width":
            `${width}px`,
          "--nearby-map-height":
            `${height}px`,
        }}
      >
        <div className="nearby-map-canvas">
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
                      : ""
                  }`}
                  style={{
                    left:
                      cluster.x,
                    top:
                      cluster.y,
                  }}
                  onClick={() => {
                    if (
                      many
                    ) {
                      setActiveClusterId(
                        cluster.id
                      );
                    } else {
                      onOpenPlace?.(
                        cluster
                          .markers[0]
                      );
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
            <div className="nearby-map-popover">
              <header>
                <strong>
                  {
                    activeCluster
                      .markers
                      .length
                  }{" "}
                  місця
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
                      onClick={() =>
                        onOpenPlace?.(
                          place
                        )
                      }
                    >
                      <strong>
                        {
                          place.title
                        }
                      </strong>

                      <span>
                        {
                          place.address ||
                          place.city
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div className="nearby-map-controls">
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
          </div>

          <a
            className="nearby-map-attribution"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap
          </a>
        </div>
      </div>
    </section>
  );
}
