import {
  useEffect,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

import {
  createSavedPlace,
  isSaved,
  subscribeSavedItems,
  toggleSaved,
} from "../storage/savedService";

import {
  deleteNearbyPlaceReview,
  loadNearbyPlaceDetail,
  saveNearbyPlaceReview,
} from "../services/nearbyBackendService";

function formatReviewDate(
  value
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "uk-UA",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    }
  );
}

function Stars({
  value = 0,
  interactive = false,
  onChange,
}) {
  return (
    <div className="nearby-place-stars">
      {[1,2,3,4,5].map(
        (
          star
        ) => (
          <button
            key={star}
            type="button"
            disabled={
              !interactive
            }
            className={
              star <= value
                ? "active"
                : ""
            }
            onClick={() =>
              interactive &&
              onChange?.(
                star
              )
            }
            aria-label={`${star} з 5`}
          >
            ★
          </button>
        )
      )}
    </div>
  );
}

export default function NearbyPlaceDetail({
  authSession,
  placeId,
  onBack,
}) {
  const [
    detail,
    setDetail,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saved,
    setSaved,
  ] = useState(
    () =>
      isSaved(
        "place",
        placeId
      )
  );

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    reviewText,
    setReviewText,
  ] = useState("");

  const [
    savingReview,
    setSavingReview,
  ] = useState(false);

  async function refresh() {
    try {
      setLoading(
        true
      );

      const next =
        await loadNearbyPlaceDetail(
          authSession,
          placeId
        );

      setDetail(
        next
      );

      setRating(
        Number(
          next?.myReview
            ?.rating ||
          5
        )
      );

      setReviewText(
        next?.myReview
          ?.text ||
        ""
      );
    } catch (
      error
    ) {
      console.warn(
        "NEARBY PLACE DETAIL ERROR:",
        error
      );

      window.alert(
        error?.message ||
        "Не вдалося відкрити місце."
      );

      onBack?.();
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(() => {
    refresh();
  }, [
    placeId,
    authSession?.access_token,
  ]);

  useEffect(() => {
    const unsubscribe =
      subscribeSavedItems(
        () => {
          setSaved(
            isSaved(
              "place",
              placeId
            )
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, [
    placeId,
  ]);

  async function submitReview() {
    if (
      savingReview
    ) {
      return;
    }

    try {
      setSavingReview(
        true
      );

      await saveNearbyPlaceReview(
        authSession,
        placeId,
        rating,
        reviewText
      );

      await refresh();
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося зберегти відгук."
      );
    } finally {
      setSavingReview(
        false
      );
    }
  }

  async function removeReview() {
    const confirmed =
      window.confirm(
        "Видалити ваш відгук?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deleteNearbyPlaceReview(
        authSession,
        placeId
      );

      await refresh();
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося видалити відгук."
      );
    }
  }

  if (
    loading
  ) {
    return (
      <section className="feature-page nearby-page nearby-real">
        <section className="feature-real-state">
          <div className="feature-real-state__icon">
            <YatutIcon
              name="pin"
              size={28}
            />
          </div>

          <h2>
            Завантажуємо місце
          </h2>
        </section>
      </section>
    );
  }

  const place =
    detail?.place;

  if (
    !place
  ) {
    return null;
  }

  const reviews =
    Array.isArray(
      detail?.reviews
    )
      ? detail.reviews
      : [];

  return (
    <section className="feature-page nearby-page nearby-place-detail-real">
      <button
        type="button"
        className="event-detail-back"
        onClick={
          onBack
        }
      >
        ← Назад до «Поруч»
      </button>

      <article className="nearby-place-detail-card">
        <div className="nearby-place-detail-cover">
          {place.imageUrl ? (
            <img
              src={
                place.imageUrl
              }
              alt=""
            />
          ) : (
            <YatutIcon
              name="pin"
              size={42}
            />
          )}
        </div>

        <div className="nearby-place-detail-body">
          <header>
            <div>
              <span>
                {
                  place.category ||
                  "Місце"
                }
              </span>

              <h1>
                {
                  place.title
                }
              </h1>

              <p>
                {
                  place.description ||
                  "Опис ще не додано."
                }
              </p>
            </div>

            <button
              type="button"
              className={
                saved
                  ? "feature-primary-button"
                  : "feature-secondary-button"
              }
              onClick={() => {
                toggleSaved(
                  createSavedPlace(
                    place
                  )
                );

                setSaved(
                  isSaved(
                    "place",
                    place.id
                  )
                );
              }}
            >
              <YatutIcon
                name="saved"
                size={16}
              />

              {saved
                ? "Збережено"
                : "Зберегти"}
            </button>
          </header>

          <div className="nearby-place-detail-meta">
            {place.address && (
              <div>
                <strong>
                  Адреса
                </strong>

                <span>
                  {
                    place.address
                  }
                </span>
              </div>
            )}

            <div>
              <strong>
                Місто
              </strong>

              <span>
                {
                  place.city
                }
              </span>
            </div>

            {place.websiteUrl && (
              <div>
                <strong>
                  Сайт
                </strong>

                <a
                  href={
                    place.websiteUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Відкрити сайт
                </a>
              </div>
            )}

            <div>
              <strong>
                Рейтинг
              </strong>

              <span>
                {place.averageRating
                  ? `${place.averageRating} / 5`
                  : "Ще немає оцінок"}
              </span>
            </div>
          </div>

          {place.status ===
            "pending" && (
            <div className="event-backend-note">
              <YatutIcon
                name="pin"
                size={19}
              />

              <div>
                <strong>
                  Місце очікує модерації
                </strong>

                <span>
                  Поки його бачите ви та модератори ЯТУТ.
                </span>
              </div>
            </div>
          )}
        </div>
      </article>

      {place.status ===
        "approved" && (
        <section className="nearby-place-review-panel">
          <header>
            <div>
              <span>
                ВАША ОЦІНКА
              </span>

              <h2>
                Поділіться враженням
              </h2>
            </div>

            {detail?.myReview && (
              <button
                type="button"
                onClick={
                  removeReview
                }
              >
                Видалити мій відгук
              </button>
            )}
          </header>

          <Stars
            value={rating}
            interactive
            onChange={
              setRating
            }
          />

          <textarea
            value={
              reviewText
            }
            maxLength={1500}
            onChange={(
              event
            ) =>
              setReviewText(
                event.target.value
              )
            }
            placeholder="Що вам сподобалось або що варто знати іншим?"
          />

          <button
            type="button"
            className="feature-primary-button"
            disabled={
              savingReview
            }
            onClick={
              submitReview
            }
          >
            {savingReview
              ? "Зберігаємо..."
              : detail?.myReview
              ? "Оновити відгук"
              : "Опублікувати відгук"}
          </button>
        </section>
      )}

      <section className="nearby-place-reviews">
        <header>
          <div>
            <span>
              ВІДГУКИ
            </span>

            <h2>
              Що кажуть люди
            </h2>
          </div>

          <strong>
            {
              reviews.length
            }
          </strong>
        </header>

        {reviews.length ? (
          <div className="nearby-place-review-list">
            {reviews.map(
              (
                review
              ) => (
                <article
                  key={
                    review.id
                  }
                  className="nearby-place-review"
                >
                  <div className="nearby-place-review-avatar">
                    {review.avatarUrl ? (
                      <img
                        src={
                          review.avatarUrl
                        }
                        alt=""
                      />
                    ) : (
                      String(
                        review.name ||
                        "?"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div>
                    <header>
                      <strong>
                        {
                          review.name
                        }
                      </strong>

                      <small>
                        {
                          formatReviewDate(
                            review.updatedAt ||
                            review.createdAt
                          )
                        }
                      </small>
                    </header>

                    <Stars
                      value={
                        Number(
                          review.rating ||
                          0
                        )
                      }
                    />

                    {review.text && (
                      <p>
                        {
                          review.text
                        }
                      </p>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <p className="nearby-real-empty">
            Відгуків ще немає. Можна залишити перший.
          </p>
        )}
      </section>
    </section>
  );
}
