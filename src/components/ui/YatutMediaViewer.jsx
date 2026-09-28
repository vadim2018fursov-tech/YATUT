import {
  X,
} from "lucide-react";

import {
  Dialog,
} from "radix-ui";

export default function YatutMediaViewer({
  open,
  onOpenChange,
  src,
  type = "image",
  alt = "",
}) {
  if (!src) {
    return null;
  }

  return (
    <Dialog.Root
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <Dialog.Portal>
        <Dialog.Overlay className="yatut-media-viewer__overlay" />

        <Dialog.Content
          className="yatut-media-viewer"
          aria-describedby={
            undefined
          }
        >
          <Dialog.Title className="yatut-media-viewer__sr-title">
            Перегляд медіа
          </Dialog.Title>

          <Dialog.Close
            asChild
          >
            <button
              type="button"
              className="yatut-media-viewer__close"
              aria-label="Закрити"
            >
              <X
                size={22}
              />
            </button>
          </Dialog.Close>

          <div className="yatut-media-viewer__stage">
            {type ===
            "video" ? (
              <video
                src={
                  src
                }
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={
                  src
                }
                alt={
                  alt
                }
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
