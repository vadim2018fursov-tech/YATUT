import {
  Expand,
  Gauge,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const FALLBACK_POSTER =
  "/assets/yatut/cities/kyiv/hero.jpg";

function formatTime(value) {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "0:00";
  }

  const total =
    Math.floor(value);

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) /
        60
    );

  const seconds =
    total % 60;

  if (hours > 0) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

export default function PulseVideoPlayer({
  src = null,
  poster = null,
  title = "ЯТУТ PULSE",
  autoPlay = false,
  startAt = 0,
  endAt = null,
  onPlaybackStart = null,
  onPlaybackPause = null,
  onPlaybackComplete = null,
}) {
  const videoRef =
    useRef(null);

  const playerRef =
    useRef(null);

  const hideTimerRef =
    useRef(null);

  const completionNotifiedRef =
    useRef(false);

  const completedOnceRef =
    useRef(false);

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    volume,
    setVolume,
  ] = useState(1);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    buffered,
    setBuffered,
  ] = useState(0);

  const [
    controlsVisible,
    setControlsVisible,
  ] = useState(true);

  const [
    playbackRate,
    setPlaybackRate,
  ] = useState(1);

  const [
    showSpeed,
    setShowSpeed,
  ] = useState(false);

  const [
    ended,
    setEnded,
  ] = useState(false);

  const hasVideo =
    Boolean(src);

  const safePoster =
    poster ||
    FALLBACK_POSTER;

  const safeStart =
    Math.max(
      0,
      Number(
        startAt ||
        0
      ) ||
      0
    );

  const requestedEnd =
    Number(
      endAt
    );

  const playbackEnd =
    Number.isFinite(
      requestedEnd
    ) &&
    requestedEnd >
      safeStart
      ? Math.min(
          requestedEnd,
          duration ||
            requestedEnd
        )
      : duration;

  const playbackDuration =
    Math.max(
      0,
      (
        playbackEnd ||
        duration ||
        0
      ) -
        safeStart
    );

  function showControls() {
    setControlsVisible(
      true
    );

    if (
      hideTimerRef.current
    ) {
      clearTimeout(
        hideTimerRef.current
      );
    }

    if (playing) {
      hideTimerRef.current =
        setTimeout(
          () => {
            setControlsVisible(
              false
            );

            setShowSpeed(
              false
            );
          },
          2400
        );
    }
  }

  function togglePlay() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      if (
        ended ||
        (
          playbackEnd &&
          video.currentTime >=
            playbackEnd -
              0.04
        )
      ) {
        video.currentTime =
          safeStart;

        completionNotifiedRef.current =
          false;

        setEnded(
          false
        );
      }

      video
        .play()
        .catch(() => {});

      return;
    }

    video.pause();
  }

  function replay() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime =
      safeStart;

    completionNotifiedRef.current =
      false;

    video
      .play()
      .catch(() => {});
  }

  function seekTo(
    event
  ) {
    const video =
      videoRef.current;

    if (
      !video ||
      !duration
    ) {
      return;
    }

    const next =
      Math.min(
        playbackEnd ||
          duration,
        Math.max(
          safeStart,
          Number(
            event.target.value
          )
        )
      );

    video.currentTime =
      next;

    setCurrentTime(
      next
    );

    if (
      !playbackEnd ||
      next <
        playbackEnd -
          0.5
    ) {
      completionNotifiedRef.current =
        false;
    }

    setEnded(
      false
    );
  }

  function changeVolume(
    event
  ) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const next =
      Number(
        event.target.value
      );

    video.volume =
      next;

    video.muted =
      next === 0;

    setVolume(
      next
    );

    setMuted(
      next === 0
    );
  }

  function toggleMute() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted =
      !video.muted;

    video.muted =
      nextMuted;

    setMuted(
      nextMuted
    );
  }

  function changeSpeed(
    rate
  ) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.playbackRate =
      rate;

    setPlaybackRate(
      rate
    );

    setShowSpeed(
      false
    );
  }

  function skip(
    seconds
  ) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const next =
      Math.min(
        playbackEnd ||
          video.duration ||
          Infinity,
        Math.max(
          safeStart,
          video.currentTime +
            seconds
        )
      );

    video.currentTime =
      next;

    if (
      !playbackEnd ||
      next <
        playbackEnd -
          0.5
    ) {
      completionNotifiedRef.current =
        false;

      setEnded(
        false
      );
    }
  }

  async function toggleFullscreen() {
    const player =
      playerRef.current;

    if (!player) {
      return;
    }

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();

        return;
      }

      if (
        player.requestFullscreen
      ) {
        await player.requestFullscreen();
      }
    } catch {
      // browser denied fullscreen
    }
  }

  useEffect(
    () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      function syncTime() {
        const current =
          video.currentTime ||
          0;

        if (
          playbackEnd &&
          current >=
            playbackEnd -
              0.03
        ) {
          video.pause();

          video.currentTime =
            playbackEnd;

          setCurrentTime(
            playbackEnd
          );

          setPlaying(
            false
          );

          setEnded(
            true
          );

          setControlsVisible(
            true
          );

          if (
            !completionNotifiedRef.current
          ) {
            onPlaybackComplete?.({
              replay:
                completedOnceRef.current,
            });

            completedOnceRef.current =
              true;

            completionNotifiedRef.current =
              true;
          }

          return;
        }

        setCurrentTime(
          current
        );

        if (
          video.buffered
            ?.length
        ) {
          const end =
            video.buffered.end(
              video.buffered.length -
                1
            );

          setBuffered(
            end
          );
        }
      }

      function syncDuration() {
        const nextDuration =
          Number.isFinite(
            video.duration
          )
            ? video.duration
            : 0;

        setDuration(
          nextDuration
        );

        if (
          safeStart >
            0 &&
          video.currentTime <
            safeStart
        ) {
          video.currentTime =
            Math.min(
              safeStart,
              nextDuration ||
                safeStart
            );

          setCurrentTime(
            Math.min(
              safeStart,
              nextDuration ||
                safeStart
            )
          );
        }
      }

      function handlePlay() {
        setPlaying(
          true
        );

        setEnded(
          false
        );

        onPlaybackStart?.();

        showControls();
      }

      function handlePause() {
        setPlaying(
          false
        );

        setControlsVisible(
          true
        );

        onPlaybackPause?.();
      }

      function handleEnded() {
        setPlaying(
          false
        );

        setEnded(
          true
        );

        setControlsVisible(
          true
        );

        if (
          !completionNotifiedRef.current
        ) {
          onPlaybackComplete?.({
            replay:
              completedOnceRef.current,
          });

          completedOnceRef.current =
            true;

          completionNotifiedRef.current =
            true;
        }
      }

      video.addEventListener(
        "timeupdate",
        syncTime
      );

      video.addEventListener(
        "progress",
        syncTime
      );

      video.addEventListener(
        "loadedmetadata",
        syncDuration
      );

      video.addEventListener(
        "durationchange",
        syncDuration
      );

      video.addEventListener(
        "play",
        handlePlay
      );

      video.addEventListener(
        "pause",
        handlePause
      );

      video.addEventListener(
        "ended",
        handleEnded
      );

      return () => {
        video.removeEventListener(
          "timeupdate",
          syncTime
        );

        video.removeEventListener(
          "progress",
          syncTime
        );

        video.removeEventListener(
          "loadedmetadata",
          syncDuration
        );

        video.removeEventListener(
          "durationchange",
          syncDuration
        );

        video.removeEventListener(
          "play",
          handlePlay
        );

        video.removeEventListener(
          "pause",
          handlePause
        );

        video.removeEventListener(
          "ended",
          handleEnded
        );
      };
    },
    [
      src,
      safeStart,
      endAt,
      playbackEnd,
      onPlaybackStart,
      onPlaybackPause,
      onPlaybackComplete,
    ]
  );

  useEffect(
    () => {
      function handleKeyDown(
        event
      ) {
        if (
          !hasVideo
        ) {
          return;
        }

        const tag =
          document.activeElement
            ?.tagName;

        if (
          tag ===
            "INPUT" ||
          tag ===
            "TEXTAREA"
        ) {
          return;
        }

        if (
          event.code ===
          "Space"
        ) {
          event.preventDefault();

          togglePlay();
        }

        if (
          event.code ===
          "ArrowRight"
        ) {
          skip(5);
        }

        if (
          event.code ===
          "ArrowLeft"
        ) {
          skip(-5);
        }

        if (
          event.key
            .toLowerCase() ===
          "m"
        ) {
          toggleMute();
        }

        if (
          event.key
            .toLowerCase() ===
          "f"
        ) {
          toggleFullscreen();
        }
      }

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    },
    [
      hasVideo,
      playing,
      muted,
      duration,
    ]
  );

  useEffect(
    () => {
      return () => {
        if (
          hideTimerRef.current
        ) {
          clearTimeout(
            hideTimerRef.current
          );
        }
      };
    },
    []
  );

  const playedPercent =
    playbackDuration
      ? Math.min(
          100,
          Math.max(
            0,
            (
              (
                currentTime -
                safeStart
              ) /
              playbackDuration
            ) *
              100
          )
        )
      : 0;

  const bufferedPercent =
    playbackDuration
      ? Math.min(
          100,
          Math.max(
            0,
            (
              (
                Math.min(
                  buffered,
                  playbackEnd ||
                    buffered
                ) -
                safeStart
              ) /
              playbackDuration
            ) *
              100
          )
        )
      : 0;

  return (
    <section
      ref={
        playerRef
      }
      className={`pulse-real-player ${
        playing
          ? "is-playing"
          : ""
      } ${
        controlsVisible
          ? "show-controls"
          : ""
      }`}
      onMouseMove={
        showControls
      }
      onMouseEnter={
        showControls
      }
      onTouchStart={
        showControls
      }
    >
      {hasVideo ? (
        <video
          ref={
            videoRef
          }
          className="pulse-real-player__video"
          src={src}
          poster={
            safePoster
          }
          preload="metadata"
          playsInline
          autoPlay={
            autoPlay
          }
          onClick={
            togglePlay
          }
          onDoubleClick={
            toggleFullscreen
          }
        />
      ) : (
        <img
          className="pulse-real-player__poster"
          src={
            safePoster
          }
          alt={title}
          onError={(
            event
          ) => {
            const image =
              event.currentTarget;

            if (
              image.dataset
                .fallbackApplied ===
              "true"
            ) {
              return;
            }

            image.dataset.fallbackApplied =
              "true";

            image.src =
              FALLBACK_POSTER;
          }}
        />
      )}

      <div className="pulse-real-player__shade" />

      {!hasVideo && (
        <div className="pulse-real-player__waiting">
          <span>
            <Play
              size={30}
              fill="currentColor"
            />
          </span>

          <strong>
            Відео скоро буде доступне
          </strong>

          <small>
            Для відтворення додай `videoUrl` у дані відео
          </small>
        </div>
      )}

      {hasVideo &&
        !playing &&
        !ended && (
          <button
            type="button"
            className="pulse-real-player__center-play"
            onClick={
              togglePlay
            }
            aria-label="Відтворити"
          >
            <Play
              size={31}
              fill="currentColor"
            />
          </button>
        )}

      {hasVideo &&
        ended && (
          <button
            type="button"
            className="pulse-real-player__center-play"
            onClick={
              replay
            }
          >
            <RotateCcw
              size={27}
            />

            <span>
              Ще раз
            </span>
          </button>
        )}

      {hasVideo && (
        <div className="pulse-real-player__controls">
          <div className="pulse-real-player__timeline">
            <div
              className="pulse-real-player__buffer"
              style={{
                width:
                  `${bufferedPercent}%`,
              }}
            />

            <div
              className="pulse-real-player__played"
              style={{
                width:
                  `${playedPercent}%`,
              }}
            />

            <input
              type="range"
              min={
                safeStart
              }
              max={
                playbackEnd ||
                duration ||
                0
              }
              step="0.01"
              value={
                Math.min(
                  playbackEnd ||
                    duration ||
                    0,
                  Math.max(
                    safeStart,
                    currentTime
                  )
                )
              }
              onChange={
                seekTo
              }
              aria-label="Позиція відео"
            />
          </div>

          <div className="pulse-real-player__control-row">
            <div className="pulse-real-player__left">
              <button
                type="button"
                onClick={
                  togglePlay
                }
                aria-label={
                  playing
                    ? "Пауза"
                    : "Відтворити"
                }
              >
                {playing ? (
                  <Pause
                    size={20}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={20}
                    fill="currentColor"
                  />
                )}
              </button>

              <div className="pulse-real-player__volume">
                <button
                  type="button"
                  onClick={
                    toggleMute
                  }
                >
                  {muted ||
                  volume ===
                    0 ? (
                    <VolumeX
                      size={20}
                    />
                  ) : (
                    <Volume2
                      size={20}
                    />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={
                    muted
                      ? 0
                      : volume
                  }
                  onChange={
                    changeVolume
                  }
                  aria-label="Гучність"
                />
              </div>

              <span className="pulse-real-player__time">
                {formatTime(
                  Math.max(
                    0,
                    currentTime -
                      safeStart
                  )
                )}
                {" / "}
                {formatTime(
                  playbackDuration ||
                  duration
                )}
              </span>
            </div>

            <div className="pulse-real-player__right">
              <div className="pulse-real-player__speed">
                <button
                  type="button"
                  onClick={() =>
                    setShowSpeed(
                      (
                        value
                      ) =>
                        !value
                    )
                  }
                >
                  <Gauge
                    size={19}
                  />

                  <span>
                    {
                      playbackRate
                    }
                    ×
                  </span>
                </button>

                {showSpeed && (
                  <div className="pulse-real-player__speed-menu">
                    {[
                      0.5,
                      0.75,
                      1,
                      1.25,
                      1.5,
                      2,
                    ].map(
                      (
                        rate
                      ) => (
                        <button
                          key={
                            rate
                          }
                          type="button"
                          className={
                            playbackRate ===
                            rate
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                            changeSpeed(
                              rate
                            )
                          }
                        >
                          {rate}×
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={
                  toggleFullscreen
                }
                aria-label="Повний екран"
              >
                <Maximize
                  size={20}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {hasVideo && (
        <div className="pulse-real-player__shortcuts">
          Space · пауза · ← → 5 сек · M · F
        </div>
      )}
    </section>
  );
}