import {
  ArrowRight,
  Eye,
  MapPin,
  Play,
} from "lucide-react";

import {
  getRegion,
} from "../../data/regions";

function formatViews(
  value
) {
  const number =
    Number(
      value || 0
    );

  if (
    number >=
    1000000
  ) {
    return `${(
      number /
      1000000
    ).toFixed(1)}M`;
  }

  if (
    number >=
    1000
  ) {
    return `${(
      number /
      1000
    ).toFixed(1)}K`;
  }

  return String(
    number
  );
}

function WaveCard({
  item,
  index,
  isLast,
  onOpen,
}) {
  const region =
    getRegion(
      item.city
    );

  return (
    <div className="pulse-wave-step">
      <button
        type="button"
        className="pulse-wave-card"
        onClick={() =>
          onOpen?.(
            item
          )
        }
      >
        <div className="pulse-wave-card__media">
          <img
            src={
              item.thumbnail
            }
            alt={`${region.name} — ${item.location}`}
            loading="lazy"
          />

          <div className="pulse-wave-card__shade" />

          <div className="pulse-wave-card__index">
            {String(
              index + 1
            ).padStart(
              2,
              "0"
            )}
          </div>

          <div className="pulse-wave-card__play">
            <Play
              size={15}
              fill="currentColor"
            />
          </div>

          <div className="pulse-wave-card__city">
            <strong>
              {
                region.name
              }
            </strong>

            <span>
              {
                item.location
              }
            </span>
          </div>
        </div>

        <div className="pulse-wave-card__footer">
          <div className="pulse-wave-card__author">
            <span>
              {
                item.author
                  ?.initials ||
                "Я"
              }
            </span>

            <div>
              <strong>
                @
                {
                  item.author
                    ?.username ||
                  "yatut"
                }
              </strong>

              <small>
                Автор міста
              </small>
            </div>
          </div>

          <div className="pulse-wave-card__views">
            <Eye
              size={13}
            />

            <span>
              {formatViews(
                item.views
              )}
            </span>
          </div>
        </div>
      </button>

      {!isLast && (
        <div className="pulse-wave-step__connector">
          <span />

          <ArrowRight
            size={18}
          />
        </div>
      )}
    </div>
  );
}

export default function WaveTimeline({
  items = [],
  onOpen,
}) {
  return (
    <div className="pulse-wave-timeline">
      {items.map(
        (
          item,
          index
        ) => (
          <WaveCard
            key={
              item.id
            }
            item={
              item
            }
            index={
              index
            }
            isLast={
              index ===
              items.length -
                1
            }
            onOpen={
              onOpen
            }
          />
        )
      )}
    </div>
  );
}