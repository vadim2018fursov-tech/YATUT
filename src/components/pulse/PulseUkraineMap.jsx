import {
  Activity,
  ArrowUpRight,
  Users,
} from "lucide-react";

import PulseCityNode from "./PulseCityNode";

import {
  pulseCityNodes,
  pulseSummary,
} from "../../data/pulseMockData";

export default function PulseUkraineMap({
  onNavigate,
}) {
  function openCity(
    node
  ) {
    onNavigate?.(
      "cityPulse",
      {
        cityId:
          node.id,
      }
    );
  }

  return (
    <section className="pulse-ukraine-map">
      <div className="pulse-ukraine-map__background" />

      <div className="pulse-ukraine-map__grid" />

      <div className="pulse-ukraine-map__stars">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <svg
        className="pulse-ukraine-map__shape"
        viewBox="0 0 1000 620"
        role="img"
        aria-label="Карта пульсу України"
      >
        <defs>
          <linearGradient
            id="pulseUkraineFill"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#372064"
              stopOpacity="0.88"
            />

            <stop
              offset="55%"
              stopColor="#25154b"
              stopOpacity="0.94"
            />

            <stop
              offset="100%"
              stopColor="#121029"
              stopOpacity="0.98"
            />
          </linearGradient>

          <linearGradient
            id="pulseUkraineStroke"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#A78BFA"
              stopOpacity="0.74"
            />

            <stop
              offset="50%"
              stopColor="#C026D3"
              stopOpacity="0.72"
            />

            <stop
              offset="100%"
              stopColor="#2563EB"
              stopOpacity="0.56"
            />
          </linearGradient>
        </defs>

        <path
          className="pulse-ukraine-map__outline-glow"
          d="
            M130 195
            L176 160
            L250 146
            L306 112
            L370 133
            L430 111
            L493 137
            L558 123
            L628 147
            L690 132
            L743 166
            L815 170
            L866 208
            L844 252
            L880 292
            L845 327
            L852 379
            L803 395
            L778 437
            L719 430
            L673 465
            L615 448
            L562 468
            L507 442
            L451 467
            L407 438
            L347 451
            L305 421
            L245 427
            L213 389
            L163 379
            L173 333
            L130 301
            L154 257
            L120 225
            Z
          "
        />

        <path
          className="pulse-ukraine-map__outline"
          d="
            M130 195
            L176 160
            L250 146
            L306 112
            L370 133
            L430 111
            L493 137
            L558 123
            L628 147
            L690 132
            L743 166
            L815 170
            L866 208
            L844 252
            L880 292
            L845 327
            L852 379
            L803 395
            L778 437
            L719 430
            L673 465
            L615 448
            L562 468
            L507 442
            L451 467
            L407 438
            L347 451
            L305 421
            L245 427
            L213 389
            L163 379
            L173 333
            L130 301
            L154 257
            L120 225
            Z
          "
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M240 160 C270 230 265 330 240 418"
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M390 132 C420 210 410 340 400 440"
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M548 130 C560 210 550 355 560 455"
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M700 140 C690 225 705 340 720 430"
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M150 270 C330 250 620 250 855 260"
        />

        <path
          className="pulse-ukraine-map__region-line"
          d="M175 360 C350 340 625 350 820 370"
        />

        <path
          className="pulse-ukraine-map__pulse-path"
          d="
            M160 325
            C240 275 315 350 390 290
            C450 240 510 355 580 302
            C650 250 710 330 815 275
          "
        />

        <circle
          className="pulse-ukraine-map__hotspot"
          cx="495"
          cy="260"
          r="5"
        />

        <circle
          className="pulse-ukraine-map__hotspot pulse-ukraine-map__hotspot--two"
          cx="650"
          cy="350"
          r="4"
        />

        <circle
          className="pulse-ukraine-map__hotspot pulse-ukraine-map__hotspot--three"
          cx="315"
          cy="315"
          r="4"
        />
      </svg>

      <div className="pulse-ukraine-map__nodes">
        {pulseCityNodes.map(
          (node) => (
            <PulseCityNode
              key={
                node.id
              }
              city={
                node.city
              }
              peopleNow={
                node.peopleNow
              }
              activity={
                node.activity
              }
              position={
                node.position
              }
              color={
                node.color
              }
              isTrending={
                node.isTrending
              }
              onClick={() =>
                openCity(
                  node
                )
              }
            />
          )
        )}
      </div>

      <div className="pulse-ukraine-map__live-badge">
        <Activity
          size={15}
        />

        <span>
          Україна зараз
        </span>

        <i />
      </div>

      <div className="pulse-ukraine-map__people">
        <Users
          size={18}
        />

        <div>
          <strong>
            {pulseSummary.totalPeopleNow.toLocaleString(
              "uk-UA"
            )}
          </strong>

          <span>
            людей у пульсі
          </span>
        </div>
      </div>

      <button
        type="button"
        className="pulse-ukraine-map__cta"
        onClick={() =>
          onNavigate?.(
            "nearby"
          )
        }
      >
        <span>
          Відкрити карту
        </span>

        <ArrowUpRight
          size={16}
        />
      </button>

      <div className="pulse-ukraine-map__message">
        Жива Україна
        <br />
        в реальному
        <br />
        часі ♡
      </div>
    </section>
  );
}