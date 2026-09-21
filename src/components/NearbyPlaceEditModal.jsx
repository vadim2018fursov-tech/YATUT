import {
  useState,
} from "react";

import YatutIcon from "./YatutIcon";
import NearbyCoordinatePicker from "./NearbyCoordinatePicker";

export default function NearbyPlaceEditModal({
  place,
  nearbyPlaces = [],
  onClose,
  onSave,
}) {
  const [
    draft,
    setDraft,
  ] = useState({
    title:
      place.title ||
      "",
    category:
      place.category ||
      "other",
    description:
      place.description ||
      "",
    address:
      place.address ||
      "",
    city:
      place.city ||
      "",
    websiteUrl:
      place.websiteUrl ||
      "",
  });

  const [
    coordinates,
    setCoordinates,
  ] = useState(
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
      ? {
          latitude:
            Number(
              place.latitude
            ),
          longitude:
            Number(
              place.longitude
            ),
        }
      : null
  );

  const [
    pickerOpen,
    setPickerOpen,
  ] = useState(false);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  async function submit() {
    if (
      !draft.title
        .trim() ||
      !draft.city
        .trim() ||
      saving
    ) {
      return;
    }

    try {
      setSaving(
        true
      );

      await onSave?.(
        {
          ...draft,
          title:
            draft.title
              .trim(),
          city:
            draft.city
              .trim(),
          latitude:
            coordinates
              ?.latitude ??
            null,
          longitude:
            coordinates
              ?.longitude ??
            null,
        },
        imageFile
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <div
      className="event-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="event-create-modal nearby-place-edit-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="event-create-header">
          <div>
            <span>
              ПОРУЧ
            </span>

            <h2>
              Редагувати місце
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="event-create-body">
          <div className="event-backend-note">
            <YatutIcon
              name="pin"
              size={19}
            />

            <div>
              <strong>
                Основні дані проходять повторну перевірку
              </strong>

              <span>
                Якщо змінити назву, категорію, місто, адресу або точку на карті — місце знову перейде у статус «очікує модерації». Фото, опис і сайт можна оновити без повторної перевірки.
              </span>
            </div>
          </div>

          <label className="event-field">
            <span>
              Назва *
            </span>

            <input
              value={
                draft.title
              }
              onChange={(
                event
              ) =>
                setDraft({
                  ...draft,
                  title:
                    event.target.value,
                })
              }
            />
          </label>

          <div className="event-field-row">
            <label className="event-field">
              <span>
                Категорія
              </span>

              <input
                value={
                  draft.category
                }
                onChange={(
                  event
                ) =>
                  setDraft({
                    ...draft,
                    category:
                      event.target.value,
                  })
                }
              />
            </label>

            <label className="event-field">
              <span>
                Місто *
              </span>

              <input
                value={
                  draft.city
                }
                onChange={(
                  event
                ) =>
                  setDraft({
                    ...draft,
                    city:
                      event.target.value,
                  })
                }
              />
            </label>
          </div>

          <label className="event-field">
            <span>
              Адреса
            </span>

            <input
              value={
                draft.address
              }
              onChange={(
                event
              ) =>
                setDraft({
                  ...draft,
                  address:
                    event.target.value,
                })
              }
            />
          </label>

          <div className="nearby-place-coordinate-field">
            <div>
              <span>
                Точка на карті
              </span>

              <strong>
                {coordinates
                  ? `${coordinates.latitude.toFixed(
                      5
                    )}, ${coordinates.longitude.toFixed(
                      5
                    )}`
                  : "Координати не задані"}
              </strong>

              <small>
                Можна знайти адресу або поставити точку вручну.
              </small>
            </div>

            <div className="nearby-place-coordinate-actions">
              <button
                type="button"
                className="feature-secondary-button"
                onClick={() =>
                  setPickerOpen(
                    (
                      value
                    ) =>
                      !value
                  )
                }
              >
                <YatutIcon
                  name="pin"
                  size={14}
                />

                {coordinates
                  ? "Змінити точку"
                  : "Вибрати точку"}
              </button>

              {coordinates && (
                <button
                  type="button"
                  className="nearby-place-coordinate-clear"
                  onClick={() =>
                    setCoordinates(
                      null
                    )
                  }
                >
                  Очистити
                </button>
              )}
            </div>
          </div>

          {pickerOpen && (
            <NearbyCoordinatePicker
              value={
                coordinates
              }
              city={
                draft.city
              }
              nearbyPlaces={
                nearbyPlaces
              }
              onClose={() =>
                setPickerOpen(
                  false
                )
              }
              onChange={(
                next
              ) => {
                setCoordinates({
                  latitude:
                    next.latitude,
                  longitude:
                    next.longitude,
                });

                if (
                  next.address
                ) {
                  setDraft(
                    (
                      current
                    ) => ({
                      ...current,
                      address:
                        next.address,
                    })
                  );
                }

                setPickerOpen(
                  false
                );
              }}
            />
          )}

          <label className="event-field">
            <span>
              Опис
            </span>

            <textarea
              value={
                draft.description
              }
              onChange={(
                event
              ) =>
                setDraft({
                  ...draft,
                  description:
                    event.target.value,
                })
              }
            />
          </label>

          <label className="event-field">
            <span>
              Сайт
            </span>

            <input
              value={
                draft.websiteUrl
              }
              onChange={(
                event
              ) =>
                setDraft({
                  ...draft,
                  websiteUrl:
                    event.target.value,
                })
              }
              placeholder="https://..."
            />
          </label>

          <label className="nearby-place-photo-input">
            <span>
              Нове фото
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(
                event
              ) =>
                setImageFile(
                  event.target.files
                    ?.[0] ||
                  null
                )
              }
            />

            <small>
              {imageFile
                ? imageFile.name
                : "Залиште порожнім, щоб не змінювати поточне фото"}
            </small>
          </label>
        </div>

        <footer className="event-create-footer">
          <button
            type="button"
            className="event-create-cancel"
            onClick={
              onClose
            }
          >
            Скасувати
          </button>

          <button
            type="button"
            className="event-create-submit"
            disabled={
              !draft.title
                .trim() ||
              !draft.city
                .trim() ||
              saving
            }
            onClick={
              submit
            }
          >
            {saving
              ? "Зберігаємо..."
              : "Зберегти зміни"}
          </button>
        </footer>
      </section>
    </div>
  );
}
