import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPulseMediaById,
} from "../services/pulseBackendService";

import {
  isPulseBackendId,
  loadPulseInteractionState,
  setPulseLike,
  setPulseSaved,
  togglePulseFollow,
} from "../services/pulseSocialService";

import {
  subscribePulseRealtime,
} from "../services/realtimeService";

export default function usePulseSocial({
  video,
  authSession,
  realtime = true,
}) {
  const backend =
    Boolean(
      video?.backend &&
      isPulseBackendId(
        video?.id
      )
    );

  const [
    liked,
    setLiked,
  ] =
    useState(false);

  const [
    saved,
    setSaved,
  ] =
    useState(false);

  const [
    following,
    setFollowing,
  ] =
    useState(false);

  const [
    likesCount,
    setLikesCount,
  ] =
    useState(
      Number(
        video?.likes ||
        0
      )
    );

  const [
    commentsCount,
    setCommentsCount,
  ] =
    useState(
      Number(
        video?.comments ||
        0
      )
    );

  const [
    savesCount,
    setSavesCount,
  ] =
    useState(
      Number(
        video?.saves ||
        0
      )
    );

  const [
    followersCount,
    setFollowersCount,
  ] =
    useState(
      Number(
        video?.author
          ?.followersCount ||
        0
      )
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const authorId =
    video?.author?.id ||
    null;

  const userId =
    authSession?.user?.id ||
    null;

  const isOwnAuthor =
    Boolean(
      authorId &&
      userId &&
      authorId ===
        userId
    );

  useEffect(
    () => {
      setLikesCount(
        Number(
          video?.likes ||
          0
        )
      );

      setCommentsCount(
        Number(
          video?.comments ||
          0
        )
      );

      setSavesCount(
        Number(
          video?.saves ||
          0
        )
      );
    },
    [
      video?.id,
      video?.likes,
      video?.comments,
      video?.saves,
    ]
  );

  const refresh =
    useCallback(
      async () => {
        if (
          !backend ||
          !userId
        ) {
          return;
        }

        try {
          const [
            interaction,
            freshVideo,
          ] =
            await Promise.all([
              loadPulseInteractionState(
                authSession,
                {
                  mediaId:
                    video.id,
                  authorId,
                }
              ),
              getPulseMediaById(
                authSession,
                video.id
              ),
            ]);

          setLiked(
            interaction.liked
          );

          setSaved(
            interaction.saved
          );

          setFollowing(
            interaction.following
          );

          setFollowersCount(
            Number(
              interaction.followersCount ||
              0
            )
          );

          if (
            freshVideo
          ) {
            setLikesCount(
              Number(
                freshVideo.likes ||
                0
              )
            );

            setCommentsCount(
              Number(
                freshVideo.comments ||
                0
              )
            );

            setSavesCount(
              Number(
                freshVideo.saves ||
                0
              )
            );
          }
        } catch (
          error
        ) {
          console.warn(
            "PULSE SOCIAL REFRESH ERROR:",
            error
          );
        }
      },
      [
        backend,
        userId,
        authSession,
        video?.id,
        authorId,
      ]
    );

  useEffect(
    () => {
      if (
        !backend ||
        !userId
      ) {
        return;
      }

      let active =
        true;

      refresh();

      if (
        !realtime
      ) {
        return () => {
          active =
            false;
        };
      }

      const realtimeChannel =
        subscribePulseRealtime({
          session:
            authSession,
          onChange:
            () => {
              if (
                active
              ) {
                refresh();
              }
            },
        });

      return () => {
        active =
          false;

        realtimeChannel?.close?.();
      };
    },
    [
      backend,
      userId,
      authSession,
      refresh,
      realtime,
    ]
  );

  const toggleLike =
    useCallback(
      async () => {
        const next =
          !liked;

        if (
          !backend ||
          !userId
        ) {
          setLiked(
            next
          );

          setLikesCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? 1
                      : -1
                  )
              )
          );

          return;
        }

        setLiked(
          next
        );

        setLikesCount(
          (
            count
          ) =>
            Math.max(
              0,
              count +
                (
                  next
                    ? 1
                    : -1
                )
            )
        );

        try {
          await setPulseLike(
            authSession,
            video.id,
            next
          );
        } catch (
          error
        ) {
          console.warn(
            "PULSE LIKE ERROR:",
            error
          );

          setLiked(
            !next
          );

          setLikesCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? -1
                      : 1
                  )
              )
          );
        }
      },
      [
        liked,
        backend,
        userId,
        authSession,
        video,
      ]
    );

  const toggleSaved =
    useCallback(
      async () => {
        const next =
          !saved;

        if (
          !backend ||
          !userId
        ) {
          setSaved(
            next
          );

          setSavesCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? 1
                      : -1
                  )
              )
          );

          return;
        }

        setSaved(
          next
        );

        setSavesCount(
          (
            count
          ) =>
            Math.max(
              0,
              count +
                (
                  next
                    ? 1
                    : -1
                )
            )
        );

        try {
          await setPulseSaved(
            authSession,
            video,
            next
          );
        } catch (
          error
        ) {
          console.warn(
            "PULSE SAVE ERROR:",
            error
          );

          setSaved(
            !next
          );

          setSavesCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? -1
                      : 1
                  )
              )
          );
        }
      },
      [
        saved,
        backend,
        userId,
        authSession,
        video,
      ]
    );

  const toggleFollow =
    useCallback(
      async () => {
        if (
          isOwnAuthor ||
          !authorId
        ) {
          return;
        }

        const next =
          !following;

        if (
          !backend ||
          !userId
        ) {
          setFollowing(
            next
          );

          setFollowersCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? 1
                      : -1
                  )
              )
          );

          return;
        }

        setBusy(
          true
        );

        setFollowing(
          next
        );

        setFollowersCount(
          (
            count
          ) =>
            Math.max(
              0,
              count +
                (
                  next
                    ? 1
                    : -1
                )
          )
        );

        try {
          const result =
            await togglePulseFollow(
              authSession,
              authorId
            );

          setFollowing(
            result
          );

          if (
            result !==
            next
          ) {
            setFollowersCount(
              (
                count
              ) =>
                Math.max(
                  0,
                  count +
                    (
                      result
                        ? 1
                        : -1
                    )
                )
            );
          }
        } catch (
          error
        ) {
          console.warn(
            "PULSE FOLLOW ERROR:",
            error
          );

          setFollowing(
            !next
          );

          setFollowersCount(
            (
              count
            ) =>
              Math.max(
                0,
                count +
                  (
                    next
                      ? -1
                      : 1
                  )
              )
          );
        } finally {
          setBusy(
            false
          );
        }
      },
      [
        isOwnAuthor,
        authorId,
        following,
        backend,
        userId,
        authSession,
      ]
    );

  return useMemo(
    () => ({
      backend,
      liked,
      saved,
      following,
      likesCount,
      commentsCount,
      savesCount,
      followersCount,
      busy,
      isOwnAuthor,
      toggleLike,
      toggleSaved,
      toggleFollow,
      refresh,
    }),
    [
      backend,
      liked,
      saved,
      following,
      likesCount,
      commentsCount,
      savesCount,
      followersCount,
      busy,
      isOwnAuthor,
      toggleLike,
      toggleSaved,
      toggleFollow,
      refresh,
    ]
  );
}
