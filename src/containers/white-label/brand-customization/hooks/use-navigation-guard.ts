'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useNavigationGuard = (shouldBlock: boolean) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldBlock) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      // Let the browser handle modified clicks (new tab/window, etc.).
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement).closest('a');
      const href = anchor?.getAttribute('href');
      if (!anchor || !href || anchor.target === '_blank') return;
      if (href.startsWith('#') || href.startsWith('mailto:')) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      pendingHref.current = url.pathname + url.search + url.hash;
      setShowDialog(true);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);

  const confirmNavigation = useCallback(() => {
    const href = pendingHref.current;
    pendingHref.current = null;
    setShowDialog(false);
    if (href) router.push(href);
  }, [router]);

  const cancelNavigation = useCallback(() => {
    pendingHref.current = null;
    setShowDialog(false);
  }, []);

  return { showDialog, confirmNavigation, cancelNavigation };
};
