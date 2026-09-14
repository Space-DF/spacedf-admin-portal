import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reports the natural width of whatever node the returned ref is attached to.
 *
 * The last measurement is deliberately kept when the node detaches, so a modal
 * animating between two steps holds its current width during the swap instead
 * of collapsing to zero while neither step is mounted.
 */
export const useMeasuredWidth = () => {
  const [width, setWidth] = useState<number>();
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    setWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, width] as const;
};
