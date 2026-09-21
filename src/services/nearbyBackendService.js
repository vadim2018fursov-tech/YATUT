import {
  uploadNearbyPlaceImage,
} from "./storageService";

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
    canModerate:
      Boolean(
        data?.canModerate
      ),
  };
}

export async function submitNearbyPlace(
  session,
  place,
  imageFile = null
) {
  const placeId =
    await rpc(
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

  if (
    placeId &&
    imageFile
  ) {
    const uploaded =
      await uploadNearbyPlaceImage(
        session,
        placeId,
        imageFile
      );

    if (
      uploaded?.url
    ) {
      await rpc(
        session,
        "set_nearby_place_image",
        {
          target_place_id:
            placeId,
          place_image_url:
            uploaded.url,
        }
      );
    }
  }

  return placeId;
}

export async function loadNearbyPlaceDetail(
  session,
  placeId
) {
  return rpc(
    session,
    "get_nearby_place_detail",
    {
      target_place_id:
        placeId,
    }
  );
}

export async function saveNearbyPlaceReview(
  session,
  placeId,
  rating,
  text
) {
  return rpc(
    session,
    "upsert_nearby_place_review",
    {
      target_place_id:
        placeId,
      review_rating:
        Number(
          rating
        ),
      review_text:
        text ||
        "",
    }
  );
}

export async function deleteNearbyPlaceReview(
  session,
  placeId
) {
  return rpc(
    session,
    "delete_my_nearby_place_review",
    {
      target_place_id:
        placeId,
    }
  );
}

export async function loadNearbyModerationQueue(
  session
) {
  const rows =
    await rpc(
      session,
      "get_nearby_moderation_queue",
      {}
    );

  return Array.isArray(
    rows
  )
    ? rows
    : [];
}

export async function moderateNearbyPlace(
  session,
  placeId,
  decision,
  moderationNote = ""
) {
  await rpc(
    session,
    "moderate_nearby_place",
    {
      target_place_id:
        placeId,
      decision,
      moderation_note:
        moderationNote ||
        null,
    }
  );
}


export async function updateNearbyPlace(
  session,
  placeId,
  place,
  imageFile = null
) {
  const status =
    await rpc(
      session,
      "update_my_nearby_place",
      {
        target_place_id:
          placeId,
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

  if (
    imageFile
  ) {
    const uploaded =
      await uploadNearbyPlaceImage(
        session,
        placeId,
        imageFile
      );

    if (
      uploaded?.url
    ) {
      await rpc(
        session,
        "set_nearby_place_image",
        {
          target_place_id:
            placeId,
          place_image_url:
            uploaded.url,
        }
      );
    }
  }

  return status;
}


export async function loadNearbyPlaceHistory(
  session,
  placeId
) {
  const rows =
    await rpc(
      session,
      "get_nearby_place_history",
      {
        target_place_id:
          placeId,
      }
    );

  return Array.isArray(
    rows
  )
    ? rows
    : [];
}

export async function deleteNearbyPlace(
  session,
  placeId
) {
  await rpc(
    session,
    "delete_my_nearby_place",
    {
      target_place_id:
        placeId,
    }
  );
}
