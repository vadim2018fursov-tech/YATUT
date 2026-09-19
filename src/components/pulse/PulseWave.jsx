import {
  Activity,
  MapPin,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";

import ContinueStoryButton from "./ContinueStoryButton";
import WaveTimeline from "./WaveTimeline";

import {
  pulseWave,
} from "../../data/pulseMockData";

export default function PulseWave({
  onOpenVideo,
  onContinue,
}) {
  return (
    <section className="pulse-wave">
      <div className="pulse-wave__glow pulse-wave__glow--one" />
      <div className="pulse-wave__glow pulse-wave__glow--two" />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="pulse-wave__header">
        <div className="pulse-wave__brand">
          <div className="pulse-wave__brand-icon">
            <Activity
              size={24}
              strokeWidth={2.4}
            />
          </div>

          <div>
            <span>
              ЯТУТ PULSE
            </span>

            <h2>
              ЯТУТ Хвиля
            </h2>

            <p>
              Одне відео.
              Багато міст.
              Разом створюємо хвилю.
            </p>
          </div>
        </div>

        <div className="pulse-wave__live">
          <Radio
            size={14}
          />

          <span>
            Хвиля активна
          </span>

          <i />
        </div>
      </header>

      {/* =================================================
          PROMPT
      ================================================= */}

      <div className="pulse-wave__prompt">
        <div className="pulse-wave__prompt-main">
          <span className="pulse-wave__prompt-icon">
            <Sparkles
              size={19}
            />
          </span>

          <div>
            <small>
              ТЕМА ХВИЛІ
            </small>

            <strong>
              «
              {
                pulseWave.prompt
              }
              »
            </strong>
          </div>
        </div>

        <div className="pulse-wave__prompt-stats">
          <span>
            <MapPin
              size={14}
            />

            4 міста
          </span>

          <span>
            <Users
              size={14}
            />

            38 авторів
          </span>

          <span>
            <Activity
              size={14}
            />

            росте зараз
          </span>
        </div>
      </div>

      {/* =================================================
          TIMELINE
      ================================================= */}

      <WaveTimeline
        items={
          pulseWave.items
        }
        onOpen={
          onOpenVideo
        }
      />

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="pulse-wave__footer">
        <div className="pulse-wave__footer-copy">
          <span className="pulse-wave__footer-wave">
            〰
          </span>

          <div>
            <strong>
              Твоє місто може бути наступним
            </strong>

            <p>
              Запиши момент тут і зараз та продовж історію України.
            </p>
          </div>
        </div>

        <ContinueStoryButton
          onClick={
            onContinue
          }
        />
      </footer>
    </section>
  );
}