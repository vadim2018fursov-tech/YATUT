import {
  useRive,
} from "@rive-app/react-canvas";

export default function YatutRive({
  src,
  artboard,
  stateMachines,
  autoplay = true,
  className = "",
  fit,
  alignment,
}) {
  const {
    RiveComponent,
  } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout:
      fit || alignment
        ? {
            fit,
            alignment,
          }
        : undefined,
  });

  if (!src) {
    return null;
  }

  return (
    <RiveComponent
      className={
        className
      }
    />
  );
}
