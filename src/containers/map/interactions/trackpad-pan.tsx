import { type Map as MapLibreMap } from 'maplibre-gl';

const GESTURE_IDLE_MS = 160;

const fromMouseWheel = (event: WheelEvent) => {
  if (event.deltaMode !== 0) return true;
  if (event.deltaX !== 0) return false;
  const notch = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
  return notch !== undefined && notch % 120 === 0;
};

export const enableTrackpadPan = (map: MapLibreMap): (() => void) => {
  const container = map.getContainer();
  let panning = false;
  let idle = 0;

  let owed: [number, number] | null = null;
  let frame = 0;

  const flush = () => {
    frame = 0;
    if (!owed) return;
    const by = owed;
    owed = null;
    map.panBy(by, { duration: 0 });
  };

  const closeGesture = () => {
    window.clearTimeout(idle);
    idle = 0;
  };

  const onWheel = (event: WheelEvent) => {
    // A pinch comes through with ctrl held, and is already the zoom gesture.
    if (event.ctrlKey || event.metaKey) {
      closeGesture();
      panning = false;
      return;
    }

    if (!idle) panning = !fromMouseWheel(event);
    window.clearTimeout(idle);
    idle = window.setTimeout(closeGesture, GESTURE_IDLE_MS);

    if (!panning) return;

    event.preventDefault();
    event.stopPropagation();

    owed = [(owed?.[0] ?? 0) + event.deltaX, (owed?.[1] ?? 0) + event.deltaY];
    if (!frame) frame = requestAnimationFrame(flush);
  };

  container.addEventListener('wheel', onWheel, {
    capture: true,
    passive: false,
  });

  return () => {
    container.removeEventListener('wheel', onWheel, { capture: true });
    closeGesture();
    if (frame) cancelAnimationFrame(frame);
  };
};
