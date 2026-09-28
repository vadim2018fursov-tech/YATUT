import {
  Dialog,
} from "radix-ui";

export default function YatutDialog({
  open,
  onOpenChange,
  trigger = null,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      {trigger ? (
        <Dialog.Trigger
          asChild
        >
          {trigger}
        </Dialog.Trigger>
      ) : null}

      <Dialog.Portal>
        <Dialog.Overlay className="yatut-dialog-overlay" />

        <Dialog.Content
          className={
            ("yatut-dialog-content " +
              className).trim()
          }
        >
          {title ? (
            <Dialog.Title className="yatut-dialog-title">
              {title}
            </Dialog.Title>
          ) : null}

          {description ? (
            <Dialog.Description className="yatut-dialog-description">
              {description}
            </Dialog.Description>
          ) : null}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export {
  Dialog as YatutDialogPrimitive,
};
