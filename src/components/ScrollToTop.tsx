/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to top when route changes.
 * Also resets scroll position of internal scrollable containers.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);

    // Also reset scroll position of common scrollable containers
    const scrollableSelectors = [
      '.leadership-callings-content',
      '.page-shell',
      '.ui-page-shell',
      '.tab-content',
      '[data-scroll-container]',
    ];

    scrollableSelectors.forEach((selector) => {
      const containers = document.querySelectorAll(selector);
      containers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.scrollTo(0, 0);
        }
      });
    });
  }, [pathname]);

  return null;
};
