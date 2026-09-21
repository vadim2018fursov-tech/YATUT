const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function headers(
  session
) {
  return {
    apikey:
      SUPABASE_KEY,
    Authorization:
      `Bearer ${session?.access_token || SUPABASE_KEY}`,
    "Content-Type":
      "application/json",
  };
}

async function rpc(
  session,
  name,
  body = {}
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method:
          "POST",
        headers:
          headers(session),
        body:
          JSON.stringify(body),
      }
    );

  const text =
    await response.text();

  let data =
    null;

  try {
    data =
      text
        ? JSON.parse(text)
        : null;
  } catch {
    data =
      text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      "Nearby backend request failed."
    );
  }

  return data;
}

export async function loadNearbyFeed(
  session,
  {
    city = null,
    latitude = null,
    longitude = null,
    radiusKm = 10,
  } = {}
) {
  if (
    !session?.user?.id
  ) {
    return {
      city:
        city ||
        null,
      radiusKm,
      locationMode:
        "none",
      places: [],
      events: [],
      communities: [],
    };
  }

  const data =
    await rpc(
      session,
      "get_nearby_feed",
      {
        search_city:
          city ||
          null,
        user_lat:
          Number.isFinite(
            latitude
          )
            ? latitude
            : null,
        user_lng:
          Number.isFinite(
            longitude
          )
            ? longitude
            : null,
        radius_km:
          radiusKm,
      }
    );

  return {
    city:
      data?.city ||
      city ||
      null,
    radiusKm:
      Number(
        data?.radiusKm ||
        radiusKm
      ),
    locationMode:
      data?.locationMode ||
      "none",
    places:
      Array.isArray(
        data?.places
      )
        ? data.places
        : [],
    events:
      Array.isArray(
        data?.events
      )
        ? data.events
        : [],
    communities:
      Array.isArray(
        data?.communities
      )
        ? data.communities
        : [],
  };
}

export async function submitNearbyPlace(
  session,
  place
) {
  return rpc(
    session,
    "submit_nearby_place",
    {
      place_title:
        place.title,
      place_category:
        place.category ||
        "other",
      place_description:
        place.description ||
        "",
      place_address:
        place.address ||
        null,
      place_city:
        place.city ||
        null,
      place_latitude:
        Number.isFinite(
          place.latitude
        )
          ? place.latitude
          : null,
      place_longitude:
        Number.isFinite(
          place.longitude
        )
          ? place.longitude
          : null,
      place_website_url:
        place.websiteUrl ||
        null,
    }
  );
}
