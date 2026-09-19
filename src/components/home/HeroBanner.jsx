import {
  Play,
} from "lucide-react";

import YatButton from "../ui/YatButton";

import {
  currentCity,
} from "../../data/homeMockData";

function HeroBanner() {
  return (
    <section
      className="premium-home-hero"
      style={{
        backgroundImage: `url("${currentCity.hero}")`,
      }}
    >
      <div className="premium-home-hero-overlay" />

      <div className="premium-home-hero-content">
        <div className="premium-home-hero-brand">
          <span>Я</span>

          <strong>
            ЯТУТ
          </strong>
        </div>

        <h1>
          Більше, ніж соцмережа.
        </h1>

        <p>
          Реальні люди. Справжні місця.
          Важливі моменти.
        </p>

        <div className="premium-home-hero-actions">
          <YatButton
            variant="white"
            icon={
              <Play
                size={16}
                fill="currentColor"
              />
            }
          >
            Дивитись відео
          </YatButton>

          <YatButton variant="heroGlass">
            Дізнатися більше
          </YatButton>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;