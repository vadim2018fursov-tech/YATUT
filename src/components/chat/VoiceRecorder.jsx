import {
  useEffect,
  useRef,
  useState,
} from "react";

function formatDuration(seconds) {
  const minutes = Math.floor(
    seconds / 60
  );

  const rest =
    seconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    rest
  ).padStart(
    2,
    "0"
  )}`;
}

function getRecorderOptions() {
  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    return undefined;
  }

  const formats = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];

  const supported =
    formats.find(
      (type) =>
        MediaRecorder.isTypeSupported?.(
          type
        )
    );

  return supported
    ? {
        mimeType:
          supported,
      }
    : undefined;
}

function VoiceRecorder({
  onCancel,
  onSend,
}) {
  const recorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const timerRef =
    useRef(null);

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    startRecording();

    return () => {
      clearInterval(
        timerRef.current
      );

      if (
        recorderRef.current &&
        recorderRef.current
          .state !==
          "inactive"
      ) {
        recorderRef.current.stop();
      }

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    };
  }, []);

  const startRecording =
    async () => {
      if (
        !navigator
          .mediaDevices
          ?.getUserMedia ||
        typeof MediaRecorder ===
          "undefined"
      ) {
        setError(
          "Запис голосу не підтримується цим браузером."
        );

        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        streamRef.current =
          stream;

        chunksRef.current =
          [];

        const options =
          getRecorderOptions();

        const recorder =
          options
            ? new MediaRecorder(
                stream,
                options
              )
            : new MediaRecorder(
                stream
              );

        recorderRef.current =
          recorder;

        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size >
                0
            ) {
              chunksRef.current.push(
                event.data
              );
            }
          };

        recorder.start();

        setRecording(
          true
        );

        setDuration(
          0
        );

        timerRef.current =
          setInterval(
            () => {
              setDuration(
                (previous) =>
                  previous +
                  1
              );
            },
            1000
          );
      } catch {
        setError(
          "Дозвольте ЯТУТ доступ до мікрофона."
        );
      }
    };

  const stopStream =
    () => {
      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      streamRef.current =
        null;

      clearInterval(
        timerRef.current
      );
    };

  const cancelRecording =
    () => {
      const recorder =
        recorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.onstop =
          () => {
            stopStream();

            onCancel?.();
          };

        recorder.stop();
      } else {
        stopStream();

        onCancel?.();
      }
    };

  const sendRecording =
    () => {
      const recorder =
        recorderRef.current;

      if (
        !recorder ||
        recorder.state ===
          "inactive"
      ) {
        return;
      }

      recorder.onstop =
        () => {
          const mimeType =
            recorder.mimeType ||
            chunksRef.current[
              0
            ]?.type ||
            "audio/webm";

          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  mimeType,
              }
            );

          stopStream();

          onSend?.(
            blob,
            Math.max(
              duration,
              1
            )
          );
        };

      recorder.stop();

      setRecording(
        false
      );
    };

  return (
    <div className="voice-recorder">

      <button
        className="voice-cancel"
        onClick={
          cancelRecording
        }
        title="Скасувати"
      >
        ×
      </button>

      <div className="voice-recording-status">

        <span
          className={`voice-live-dot ${
            recording
              ? "active"
              : ""
          }`}
        />

        <div>
          <strong>
            Запис голосового
          </strong>

          <span>
            {error ||
              formatDuration(
                duration
              )}
          </span>
        </div>

      </div>

      <div className="voice-wave">
        {Array.from({
          length: 18,
        }).map(
          (_, index) => (
            <span
              key={
                index
              }
              style={{
                "--voice-i":
                  index,
              }}
            />
          )
        )}
      </div>

      <button
        className="voice-send"
        disabled={
          Boolean(
            error
          )
        }
        onClick={
          sendRecording
        }
        title="Надіслати"
      >
        ➤
      </button>

    </div>
  );
}

export default VoiceRecorder;