// Camera controls for panning/zooming to selected nodes

import { useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface CameraState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

interface UseCameraControlsOptions {
  /** Target position to focus on (node x, y) */
  targetX: number | null;
  targetY: number | null;
  /** Canvas dimensions */
  canvasWidth: number;
  canvasHeight: number;
  /** Animation duration in ms */
  duration?: number;
}

interface UseCameraControlsResult {
  /** Current camera offset X */
  offsetX: number;
  /** Current camera offset Y */
  offsetY: number;
  /** Current zoom level */
  zoom: number;
  /** Whether camera is animating */
  isAnimating: boolean;
  /** Reset camera to default */
  reset: () => void;
}

const DEFAULT_CAMERA: CameraState = { offsetX: 0, offsetY: 0, zoom: 1 };

export const useCameraControls = ({ targetX, targetY, canvasWidth, canvasHeight, duration = 500 }: UseCameraControlsOptions): UseCameraControlsResult => {
  const prefersReducedMotion = useReducedMotion();
  const [camera, setCamera] = useState<CameraState>(DEFAULT_CAMERA);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Animate camera to target
  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Compute target camera state
    let targetCamera: CameraState;

    if (targetX === null || targetY === null) {
      // No target - reset to default
      if (camera.offsetX === 0 && camera.offsetY === 0 && camera.zoom === 1) {
        // Already at default, nothing to do
        return;
      }
      targetCamera = DEFAULT_CAMERA;
    } else {
      // Calculate offset to center target (with slight offset for panel)
      targetCamera = {
        offsetX: canvasWidth / 2 - targetX - 100, // Offset left for side panel
        offsetY: canvasHeight / 2 - targetY,
        zoom: 1.2,
      };
    }

    // For reduced motion, schedule state update via timeout (not synchronous)
    if (prefersReducedMotion) {
      const timeoutId = setTimeout(() => {
        setCamera(targetCamera);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Animate to target
    const startTime = performance.now();
    const fromCamera = { ...camera };

    const frame = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      setCamera({
        offsetX: fromCamera.offsetX + (targetCamera.offsetX - fromCamera.offsetX) * eased,
        offsetY: fromCamera.offsetY + (targetCamera.offsetY - fromCamera.offsetY) * eased,
        zoom: fromCamera.zoom + (targetCamera.zoom - fromCamera.zoom) * eased,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        setIsAnimating(false);
        animationRef.current = null;
      }
    };

    // Start animation via timeout to avoid synchronous setState
    const startTimeoutId = setTimeout(() => {
      setIsAnimating(true);
      animationRef.current = requestAnimationFrame(frame);
    }, 0);

    return () => {
      clearTimeout(startTimeoutId);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetX, targetY, canvasWidth, canvasHeight, duration, prefersReducedMotion, camera]);

  const reset = useCallback(() => {
    if (prefersReducedMotion) {
      setCamera(DEFAULT_CAMERA);
    } else {
      // Animate to default
      const startTime = performance.now();
      const fromCamera = { ...camera };

      setIsAnimating(true);

      const frame = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);

        setCamera({
          offsetX: fromCamera.offsetX + (DEFAULT_CAMERA.offsetX - fromCamera.offsetX) * eased,
          offsetY: fromCamera.offsetY + (DEFAULT_CAMERA.offsetY - fromCamera.offsetY) * eased,
          zoom: fromCamera.zoom + (DEFAULT_CAMERA.zoom - fromCamera.zoom) * eased,
        });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          setIsAnimating(false);
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(frame);
    }
  }, [camera, duration, prefersReducedMotion]);

  return {
    offsetX: camera.offsetX,
    offsetY: camera.offsetY,
    zoom: camera.zoom,
    isAnimating,
    reset,
  };
};

const easeOutExpo = (x: number): number => (x === 1 ? 1 : 1 - 2 ** (-10 * x));
