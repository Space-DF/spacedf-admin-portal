import { useEffect, useRef, useState } from 'react';

export const useDimension = (virtualWidth: number, virtualHeight: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  const scale =
    dimensions.width > 0 && dimensions.height > 0
      ? Math.min(
          dimensions.width / virtualWidth,
          dimensions.height / virtualHeight,
        )
      : 1;

  return { containerRef, scale, dimensions };
};
