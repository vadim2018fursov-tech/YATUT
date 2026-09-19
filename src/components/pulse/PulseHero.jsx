import {
  Activity,
  Play,
  Users,
} from "lucide-react";

import PulseUkraineMap from "./PulseUkraineMap";

import {
  pulseSummary,
} from "../../data/pulseMockData";

export default function PulseHero({
  onNavigate,
}) {
  return (
    <section className="pulse-hero pulse-hero--ukraine">
      <div className="pulse-hero__background" />

      <div className="pulse-hero__content">
        {/* ===============================================
            COPY
        =============================================== */}

        <div className="pulse-hero__copy">
          <div className="pulse-hero__eyebrow">
            <Activity
              size={17}
              strokeWidth={2.4}
            />

            <span>
              ЯТУТ PULSE
            </span>
          </div>

          <h1>
            ПУЛЬС
            <br />
            УКРАЇНИ
          </h1>

          <p>
            Живі відео.
            Реальні місця.
            Прямо зараз.
          </p>

          <div className="pulse-hero__actions">
            <button
              type="button"
              className="pulse-hero__primary"
              onClick={() =>
                onNavigate?.(
                  "nearby"
                )
              }
            >
              <Play
                size={17}
                fill="currentColor"
              />

              Дивитися пульс
            </button>

            <div className="pulse-hero__online">
              <Users
                size={19}
              />

              <div>
                <strong>
                  {pulseSummary.totalPeopleNow.toLocaleString(
                    "uk-UA"
                  )}
                </strong>

                <span>
                  людей зараз онлайн
                </span>
              </div>
            </div>
          </div>

          <div className="pulse-hero__signature">
            <span>
              Міста.
            </span>

            <span>
              Люди.
            </span>

            <span>
              Події.
            </span>

            <strong>
              В одному пульсі.
            </strong>
          </div>
        </div>

        {/* ===============================================
            UKRAINE MAP
        =============================================== */}

        <PulseUkraineMap
          onNavigate={
            onNavigate
          }
        />
      </div>
    </section>
  );
}