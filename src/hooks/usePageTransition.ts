import { useEffect, useRef, useState } from 'react';

export const usePageTransition = (
  { duration }: { duration?: number } = { duration: 500 },
) => {
  const [startRender, setStartRender] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      setStartRender(true);
    }, duration);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [duration]);

  return { startRender };
};
