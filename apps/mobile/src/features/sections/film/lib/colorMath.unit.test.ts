import { unwrap, angleToX, xToAngle } from './colorMath';

describe('colorMath', () => {
  describe('unwrap', () => {
    it('returns the angle directly if it lies within [ref, ref + 360)', () => {
      expect(unwrap(180, 0)).toBe(180);
      expect(unwrap(90, 45)).toBe(90);
    });

    it('adds 360 if angle is below ref', () => {
      expect(unwrap(-10, 0)).toBe(350);
      expect(unwrap(10, 90)).toBe(370);
    });

    it('subtracts 360 if angle is above or equal to ref + 360', () => {
      expect(unwrap(370, 0)).toBe(10);
      expect(unwrap(460, 90)).toBe(100);
    });
  });

  describe('angleToX', () => {
    it('returns 6 if trackWidth is 0', () => {
      expect(angleToX(180, 0, 360, 0)).toBe(6);
    });

    it('returns 6 if total range is 0 or negative', () => {
      expect(angleToX(180, 180, 180, 200)).toBe(6);
      expect(angleToX(180, 200, 100, 200)).toBe(6);
    });

    it('correctly maps angle to X coordinate', () => {
      // trackWidth = 200, margins = 6, inner width = 188
      // Middle angle (180) in a 0-360 range should yield 6 + 188 * 0.5 = 100
      expect(angleToX(180, 0, 360, 200)).toBe(100);

      // Start angle should yield 6
      expect(angleToX(0, 0, 360, 200)).toBe(6);

      // End angle should yield 194
      expect(angleToX(360, 0, 360, 200)).toBe(194);
    });
  });

  describe('xToAngle', () => {
    it('returns minAngle if trackWidth is 0', () => {
      expect(xToAngle(100, 45, 135, 0)).toBe(45);
    });

    it('correctly maps X back to angle', () => {
      // Middle of track width 200 is 100. For range 0-360, it should be 180.
      expect(xToAngle(100, 0, 360, 200)).toBe(180);

      // Start X (<= 6) should yield minAngle
      expect(xToAngle(6, 0, 360, 200)).toBe(0);
      expect(xToAngle(0, 0, 360, 200)).toBe(0);

      // End X (>= 194) should yield maxAngle
      expect(xToAngle(194, 0, 360, 200)).toBe(360);
      expect(xToAngle(250, 0, 360, 200)).toBe(360);
    });
  });
});
