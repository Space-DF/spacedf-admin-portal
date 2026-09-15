import { Map as MapLibreMap } from 'maplibre-gl';

import { createGridHover, GRID_FILL_LAYER } from '@/containers/map/layers/grid';
import { setZoneCells } from '@/containers/map/layers/zone';
import { type DrawTool } from '@/containers/map/types';
import { cellsInRing, pointToCell } from '@/containers/map/utils';

const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;

const DRAG_SLOP = 3;

type Point = { x: number; y: number };

const createMarquee = (map: MapLibreMap) => {
  const element = document.createElement('div');
  Object.assign(element.style, {
    position: 'absolute',
    display: 'none',
    pointerEvents: 'none',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderRadius: '2px',
  });
  map.getCanvasContainer().appendChild(element);

  return {
    show: (from: Point, to: Point, erasing: boolean) => {
      const accent = erasing ? '220, 38, 38' : '109, 40, 217';
      Object.assign(element.style, {
        display: 'block',
        left: `${Math.min(from.x, to.x)}px`,
        top: `${Math.min(from.y, to.y)}px`,
        width: `${Math.abs(to.x - from.x)}px`,
        height: `${Math.abs(to.y - from.y)}px`,
        borderColor: `rgba(${accent}, 0.9)`,
        backgroundColor: `rgba(${accent}, 0.12)`,
      });
    },
    hide: () => {
      element.style.display = 'none';
    },
    destroy: () => element.remove(),
  };
};

type Options = {
  map: MapLibreMap;
  cells: Set<string>;
  getResolution: () => number;
  getTool?: () => DrawTool;
  onChange: () => void;
  onHover?: (h3: string | null) => void;
  onTooLarge?: () => void;
  linkTo?: (h3: string) => string[];
  isActive?: () => boolean;
  isLive?: () => boolean;
};
export const enableZoneDrawing = ({
  map,
  cells,
  getResolution,
  getTool = () => 'paint',
  onChange,
  onHover,
  onTooLarge,
  linkTo,
  isActive = () => true,
  isLive = () => true,
}: Options): (() => void) => {
  const hover = createGridHover(map);
  const canvas = map.getCanvas();
  const marquee = createMarquee(map);

  const panning = () => getTool() === 'pan';

  const idleCursor = () => (panning() ? 'grab' : '');
  const restoreDragPan = () => {
    if (panning()) map.dragPan.enable();
    else map.dragPan.disable();
  };

  restoreDragPan();

  /** null while idle; true is a paint box, false an erase one. */
  let painting: boolean | null = null;
  let startPoint: Point | null = null;
  let lastPoint: Point | null = null;

  let spaceHeld = false;
  let raf = 0;
  let hoveredCell: string | null = null;

  const reportHover = (h3: string | null) => {
    if (hoveredCell === h3) return;
    hoveredCell = h3;
    onHover?.(h3);
  };

  const cellAt = ({ x, y }: Point) => {
    const { lng, lat } = map.unproject([x, y]);
    return pointToCell(lng, lat, getResolution());
  };

  const cellsUnderBox = (a: Point, b: Point): string[] => {
    const ring = (
      [
        [a.x, a.y],
        [b.x, a.y],
        [b.x, b.y],
        [a.x, b.y],
      ] as [number, number][]
    ).map(([x, y]) => {
      const { lng, lat } = map.unproject([x, y]);
      return [lng, lat];
    });

    return cellsInRing(ring, getResolution());
  };

  const renderPreview = () => {
    if (!startPoint || !lastPoint || painting === null) return;
    const preview = new Set(cells);
    const inside = cellsUnderBox(startPoint, lastPoint);
    if (painting) inside.forEach((h3) => preview.add(h3));
    else inside.forEach((h3) => preview.delete(h3));
    setZoneCells(map, preview);
  };

  const schedulePreview = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      renderPreview();
    });
  };

  const cancelPreview = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const closeBox = () => {
    cancelPreview();
    painting = null;
    startPoint = null;
    lastPoint = null;
    marquee.hide();
    canvas.style.cursor = spaceHeld ? 'grab' : idleCursor();
  };

  const cancelBox = () => {
    if (!startPoint) return;
    closeBox();
    setZoneCells(map, cells);
  };

  const endBox = () => {
    if (!startPoint || painting === null) return;

    const adding = painting;
    const from = startPoint;
    const to = lastPoint ?? startPoint;

    const moved =
      Math.abs(to.x - from.x) > DRAG_SLOP ||
      Math.abs(to.y - from.y) > DRAG_SLOP;

    const targets = moved ? cellsUnderBox(from, to) : [cellAt(from)];

    if (moved && !targets.length) {
      closeBox();
      setZoneCells(map, cells);
      onTooLarge?.();
      return;
    }

    let changed = false;

    if (adding) {
      const path = linkTo?.(cellAt(from)) ?? [];
      path.forEach((h3) => cells.add(h3));
      if (path.length) changed = true;
    }

    for (const h3 of targets) {
      if (adding) {
        if (!cells.has(h3)) {
          cells.add(h3);
          changed = true;
        }
      } else if (cells.delete(h3)) {
        changed = true;
      }
    }

    closeBox();

    if (changed) onChange();
    else if (moved) setZoneCells(map, cells);
  };

  const onMouseDown = (e: { originalEvent: MouseEvent; point: Point }) => {
    if (!isActive() || spaceHeld || e.originalEvent.button !== LEFT_BUTTON)
      return;
    if (e.originalEvent.ctrlKey) return;
    painting = e.originalEvent.altKey
      ? getTool() === 'erase'
      : getTool() !== 'erase';
    startPoint = { x: e.point.x, y: e.point.y };
    lastPoint = startPoint;
    canvas.style.cursor = 'crosshair';
    reportHover(painting ? cellAt(startPoint) : null);
  };

  const onMouseMove = (e: { point: Point }) => {
    if (!startPoint || painting === null) return;
    lastPoint = { x: e.point.x, y: e.point.y };
    marquee.show(startPoint, lastPoint, !painting);
    schedulePreview();
  };

  map.on('mousedown', onMouseDown);
  map.on('mousemove', onMouseMove);
  map.on('mouseup', endBox);
  window.addEventListener('mouseup', endBox);

  /** Where the middle button last was; null while it is up. */
  let panFrom: Point | null = null;
  /** Pixels the map owes the drag, flushed a frame at a time. */
  let panBy: Point | null = null;
  let panRaf = 0;

  const flushPan = () => {
    panRaf = 0;
    if (!panBy) return;
    const { x, y } = panBy;
    panBy = null;
    map.panBy([-x, -y], { duration: 0 });
  };

  const onPanStart = (event: MouseEvent) => {
    if (!isActive() || event.button !== MIDDLE_BUTTON) return;
    event.preventDefault();
    cancelBox();
    panFrom = { x: event.clientX, y: event.clientY };
    panBy = null;
    canvas.style.cursor = 'grabbing';
  };

  const onPanMove = (event: MouseEvent) => {
    if (!panFrom) return;
    panBy = {
      x: (panBy?.x ?? 0) + event.clientX - panFrom.x,
      y: (panBy?.y ?? 0) + event.clientY - panFrom.y,
    };
    panFrom = { x: event.clientX, y: event.clientY };
    if (!panRaf) panRaf = requestAnimationFrame(flushPan);
  };

  const endPan = () => {
    if (!panFrom) return;
    panFrom = null;
    if (panRaf) cancelAnimationFrame(panRaf);
    flushPan();
    canvas.style.cursor = spaceHeld ? 'grab' : idleCursor();
  };

  canvas.addEventListener('mousedown', onPanStart);
  window.addEventListener('mousemove', onPanMove);
  window.addEventListener('mouseup', endPan);

  const isTyping = (target: EventTarget | null) => {
    const element = target as HTMLElement | null;
    if (!element) return false;
    return (
      element.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(element.tagName)
    );
  };

  const releaseSpace = () => {
    if (!spaceHeld) return;
    spaceHeld = false;
    restoreDragPan();
    canvas.style.cursor = idleCursor();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isActive() || isTyping(event.target)) return;

    if (event.code === 'Escape') return cancelBox();

    if (event.code !== 'Space' || spaceHeld) return;
    event.preventDefault();
    spaceHeld = true;
    cancelBox();
    map.dragPan.enable();
    canvas.style.cursor = 'grab';
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.code !== 'Space') return;
    releaseSpace();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  // A tab switch swallows the keyup, leaving Space stuck down.
  window.addEventListener('blur', releaseSpace);
  // The same goes for a middle button released over another window.
  window.addEventListener('blur', endPan);

  const onCellEnter = (e: {
    features?: { id?: string | number }[];
    point: Point;
  }) => {
    if (!isActive()) {
      reportHover(null);
      return;
    }
    const id = e.features?.[0]?.id;
    if (id === undefined) return;
    hover.set(id);
    // A trail drawn under an open box or a moving map would fight them.
    if (startPoint || panFrom) return;
    reportHover(getTool() === 'erase' ? null : cellAt(e.point));
    if (!spaceHeld) canvas.style.cursor = 'pointer';
  };

  const onCellLeave = () => {
    hover.clear();
    reportHover(null);
    if (!isActive() || startPoint || panFrom || spaceHeld) return;
    canvas.style.cursor = idleCursor();
  };

  map.on('mousemove', GRID_FILL_LAYER, onCellEnter);
  map.on('mouseleave', GRID_FILL_LAYER, onCellLeave);

  return () => {
    cancelPreview();
    marquee.destroy();
    if (panRaf) cancelAnimationFrame(panRaf);
    window.removeEventListener('mouseup', endBox);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', releaseSpace);
    window.removeEventListener('blur', endPan);
    canvas.removeEventListener('mousedown', onPanStart);
    window.removeEventListener('mousemove', onPanMove);
    window.removeEventListener('mouseup', endPan);

    if (!isLive()) return;

    map.off('mousedown', onMouseDown);
    map.off('mousemove', onMouseMove);
    map.off('mouseup', endBox);
    map.off('mousemove', GRID_FILL_LAYER, onCellEnter);
    map.off('mouseleave', GRID_FILL_LAYER, onCellLeave);
    hover.clear();
    reportHover(null);
    canvas.style.cursor = '';
    map.dragPan.enable();
  };
};
