import {
  ArrowRight,
  Activity,
} from "lucide-react";

import {
  pulseStats,
} from "../../data/homeMockData";

function FaceStack({
  faces = [],
  extra,
}) {
  return (
    <div className="premium-face-stack">
      {faces.map((face, index) => (
        <span
          key={`${face}-${index}`}
          style={{
            zIndex: faces.length - index,
          }}
        >
          {face}
        </span>
      ))}

      {extra && (
        <b>
          {extra}
        </b>
      )}
    </div>
  );
}

function PulseMetric({
  item,
}) {
  return (
    <article className="premium-pulse-metric">
      <strong>
        {item.value}
      </strong>

      <span>
        {item.label}
      </span>

      {item.image ? (
        <div className="premium-pulse-image">
          <img
            src={item.image}
            alt=""
            loading="lazy"
          />
        </div>
      ) : (
        <FaceStack
          faces={item.faces}
          extra={item.extra}
        />
      )}

      {item.note && (
        <small>
          {item.note}
        </small>
      )}
    </article>
  );
}

function PulseYatut() {
  return (
    <section className="premium-pulse-card">
      <header className="premium-pulse-header">
        <div className="premium-pulse-title">
          <span className="premium-pulse-symbol">
            <Activity size={27} />
          </span>

          <div>
            <strong>
              Пульс ЯТУТ
            </strong>

            <p>
              Що відбувається у твоєму світі прямо зараз
            </p>
          </div>
        </div>

        <div className="premium-pulse-actions">
          <span>
            Оновлено щойно
            <i />
          </span>

          <button type="button">
            Дивитись усі
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <div className="premium-pulse-grid">
        {pulseStats.map((item) => (
          <PulseMetric
            key={item.id}
            item={item}
          />
        ))}

        <article className="premium-pulse-quote">
          <span>
            «Разом
            <br />
            ми робимо Україну
            <br />
            ближчою» 💜
          </span>
        </article>
      </div>
    </section>
  );
}

export default PulseYatut;