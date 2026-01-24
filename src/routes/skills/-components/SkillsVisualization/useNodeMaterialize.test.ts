import { describe, expect, test } from 'vitest';

import { getMaterializeDrawParams } from './useNodeMaterialize';

describe('getMaterializeDrawParams', () => {
  describe('hidden phase', () => {
    test('returns zero opacity and scale', () => {
      const params = getMaterializeDrawParams('hidden', 0);

      expect(params.opacity).toBe(0);
      expect(params.scale).toBe(0);
      expect(params.showCrosshair).toBe(false);
      expect(params.showWireframe).toBe(false);
      expect(params.showParticles).toBe(false);
      expect(params.flashIntensity).toBe(0);
    });

    test('returns same values regardless of progress', () => {
      const params = getMaterializeDrawParams('hidden', 0.5);

      expect(params.opacity).toBe(0);
      expect(params.scale).toBe(0);
    });
  });

  describe('crosshair phase', () => {
    test('shows crosshair', () => {
      const params = getMaterializeDrawParams('crosshair', 0.5);

      expect(params.showCrosshair).toBe(true);
      expect(params.showWireframe).toBe(false);
      expect(params.showParticles).toBe(false);
    });

    test('opacity increases with progress', () => {
      const paramsStart = getMaterializeDrawParams('crosshair', 0);
      const paramsMid = getMaterializeDrawParams('crosshair', 0.5);
      const paramsEnd = getMaterializeDrawParams('crosshair', 1);

      expect(paramsStart.opacity).toBe(0);
      expect(paramsMid.opacity).toBeCloseTo(0.4);
      expect(paramsEnd.opacity).toBeCloseTo(0.8);
    });

    test('scale remains zero', () => {
      const params = getMaterializeDrawParams('crosshair', 1);
      expect(params.scale).toBe(0);
    });
  });

  describe('wireframe phase', () => {
    test('shows crosshair and wireframe', () => {
      const params = getMaterializeDrawParams('wireframe', 0.5);

      expect(params.showCrosshair).toBe(true);
      expect(params.showWireframe).toBe(true);
      expect(params.showParticles).toBe(false);
    });

    test('scale increases with progress up to 0.5', () => {
      const paramsStart = getMaterializeDrawParams('wireframe', 0);
      const paramsEnd = getMaterializeDrawParams('wireframe', 1);

      expect(paramsStart.scale).toBe(0);
      expect(paramsEnd.scale).toBeCloseTo(0.5);
    });

    test('maintains constant opacity', () => {
      const params = getMaterializeDrawParams('wireframe', 0.5);
      expect(params.opacity).toBeCloseTo(0.8);
    });
  });

  describe('particles phase', () => {
    test('shows particles', () => {
      const params = getMaterializeDrawParams('particles', 0.5);

      expect(params.showParticles).toBe(true);
    });

    test('crosshair fades out at 50% progress', () => {
      const paramsEarly = getMaterializeDrawParams('particles', 0.3);
      const paramsLate = getMaterializeDrawParams('particles', 0.6);

      expect(paramsEarly.showCrosshair).toBe(true);
      expect(paramsLate.showCrosshair).toBe(false);
    });

    test('wireframe fades out at 70% progress', () => {
      const paramsEarly = getMaterializeDrawParams('particles', 0.5);
      const paramsLate = getMaterializeDrawParams('particles', 0.8);

      expect(paramsEarly.showWireframe).toBe(true);
      expect(paramsLate.showWireframe).toBe(false);
    });

    test('scale increases from 0.5 to 1.0', () => {
      const paramsStart = getMaterializeDrawParams('particles', 0);
      const paramsEnd = getMaterializeDrawParams('particles', 1);

      expect(paramsStart.scale).toBeCloseTo(0.5);
      expect(paramsEnd.scale).toBeCloseTo(1);
    });

    test('opacity increases from 0.8 to 1.0', () => {
      const paramsStart = getMaterializeDrawParams('particles', 0);
      const paramsEnd = getMaterializeDrawParams('particles', 1);

      expect(paramsStart.opacity).toBeCloseTo(0.8);
      expect(paramsEnd.opacity).toBeCloseTo(1);
    });
  });

  describe('flash phase', () => {
    test('flashIntensity decreases with progress (1 - progress)', () => {
      const paramsStart = getMaterializeDrawParams('flash', 0);
      const paramsMid = getMaterializeDrawParams('flash', 0.5);
      const paramsEnd = getMaterializeDrawParams('flash', 1);

      expect(paramsStart.flashIntensity).toBe(1);
      expect(paramsMid.flashIntensity).toBe(0.5);
      expect(paramsEnd.flashIntensity).toBe(0);
    });

    test('hides all construction elements', () => {
      const params = getMaterializeDrawParams('flash', 0.5);

      expect(params.showCrosshair).toBe(false);
      expect(params.showWireframe).toBe(false);
      expect(params.showParticles).toBe(false);
    });

    test('full opacity and scale > 1 at start (bounce effect)', () => {
      const params = getMaterializeDrawParams('flash', 0);

      expect(params.opacity).toBe(1);
      expect(params.scale).toBeGreaterThan(1);
    });

    test('scale returns to 1 at end', () => {
      const params = getMaterializeDrawParams('flash', 1);
      expect(params.scale).toBe(1);
    });
  });

  describe('visible phase', () => {
    test('returns final stable state', () => {
      const params = getMaterializeDrawParams('visible', 1);

      expect(params.opacity).toBe(1);
      expect(params.scale).toBe(1);
      expect(params.showCrosshair).toBe(false);
      expect(params.showWireframe).toBe(false);
      expect(params.showParticles).toBe(false);
      expect(params.flashIntensity).toBe(0);
    });

    test('returns same values regardless of progress', () => {
      const params0 = getMaterializeDrawParams('visible', 0);
      const params1 = getMaterializeDrawParams('visible', 1);

      expect(params0).toEqual(params1);
    });
  });
});
