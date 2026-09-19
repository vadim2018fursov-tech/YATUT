import {
  Users,
} from "lucide-react";

export default function PulsePeopleRow({
  people = [],
  label = "Дивляться друзі",
  count = null,
}) {
  return (
    <div className="pulse-people-row">
      <div className="pulse-people-row__avatars">
        {people
          .slice(
            0,
            4
          )
          .map(
            (
              person,
              index
            ) => (
              <span
                key={
                  person.id ||
                  `${person.username}-${index}`
                }
                style={{
                  zIndex:
                    10 -
                    index,
                }}
              >
                {
                  person.initials ||
                  person.name
                    ?.charAt(
                      0
                    ) ||
                  "Я"
                }
              </span>
            )
          )}

        {count ? (
          <b>
            +{count}
          </b>
        ) : null}
      </div>

      <div className="pulse-people-row__copy">
        <Users
          size={14}
        />

        <span>
          {label}
        </span>
      </div>
    </div>
  );
}