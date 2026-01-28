import type { RefObject } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoScrollOptions {
  // Container element ref
  containerRef: RefObject<HTMLDivElement | null>;
  // Dependency to trigger scroll (e.g., message count)
  dependency: number;
  // Whether to use smooth scroll (false = instant)
  // If 'auto', uses instant when dependency jumps by >1, smooth otherwise
  smooth?: boolean | 'auto';
}

interface UseAutoScrollReturn {
  // Whether auto-scroll is active (user is at bottom)
  isAutoScrolling: boolean;
  // Call when container scrolls to track position
  handleScroll: () => void;
}

/**
 * Hook to manage auto-scrolling behavior for log-style containers.
 *
 * Features:
 * - Auto-scrolls to bottom when dependency changes
 * - Pauses when user scrolls up
 * - Resumes when user scrolls to exact bottom
 * - Supports smooth, instant, or auto (hybrid) scroll modes
 */
export const useAutoScroll = ({ containerRef, dependency, smooth = 'auto' }: UseAutoScrollOptions): UseAutoScrollReturn => {
  // Track if user is at the bottom of the container
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Track previous dependency to detect changes (accessed only in effect)
  const prevDependencyRef = useRef(dependency);
  // Track programmatic scrolls to ignore scroll events during animation
  const isProgrammaticScrollRef = useRef(false);
  // Track pending timeout to cancel on rapid clicks
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Check if scroll position is at the exact bottom.
   * Uses a small tolerance (1px) for floating point precision.
   */
  const checkIsAtBottom = useCallback((container: HTMLDivElement): boolean => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    // Allow 1px tolerance for rounding
    return scrollTop + clientHeight >= scrollHeight - 1;
  }, []);

  /**
   * Handle scroll events to track user position.
   * Ignores events fired during programmatic scrolling.
   */
  const handleScroll = useCallback(() => {
    // Ignore scroll events during our own programmatic scrolls
    if (isProgrammaticScrollRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    setIsAtBottom(checkIsAtBottom(container));
  }, [containerRef, checkIsAtBottom]);

  /**
   * Scroll to bottom when dependency changes and user is at bottom.
   */
  useEffect(() => {
    const prevValue = prevDependencyRef.current;

    // Skip if dependency hasn't changed
    if (dependency === prevValue) return;

    // Calculate if this is a "jump" (more than 1 item added)
    const delta = dependency - prevValue;
    const isJump = delta > 1;

    // Update ref for next comparison
    prevDependencyRef.current = dependency;

    // Only auto-scroll if user is at bottom
    if (!isAtBottom) return;

    const container = containerRef.current;
    if (!container) return;

    // Determine scroll behavior
    let scrollBehavior: ScrollBehavior;
    if (smooth === 'auto') {
      // Auto mode: instant for jumps, smooth for single additions
      scrollBehavior = isJump ? 'instant' : 'smooth';
    } else {
      scrollBehavior = smooth ? 'smooth' : 'instant';
    }

    // Cancel any pending timeout from previous scroll (prevents race condition on rapid clicks)
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    // Mark that we're programmatically scrolling to ignore scroll events
    isProgrammaticScrollRef.current = true;

    // Scroll to bottom
    container.scrollTo({
      top: container.scrollHeight,
      behavior: scrollBehavior,
    });

    // Clear the flag after scroll completes
    if (scrollBehavior === 'smooth') {
      // Smooth scroll animation typically takes ~300ms
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        scrollTimeoutRef.current = null;
      }, 300);
    } else {
      // Instant scroll completes immediately
      isProgrammaticScrollRef.current = false;
    }
  }, [dependency, isAtBottom, containerRef, smooth]);

  return {
    isAutoScrolling: isAtBottom,
    handleScroll,
  };
};
