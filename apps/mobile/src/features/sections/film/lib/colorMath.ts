/**
 * Chromatic circle mapping utilities for the film color bounds controls.
 * Important: These functions include the 'worklet' directive to run smoothly on the UI thread.
 */

/**
 * Unwraps an angle (in degrees) to be relative to a reference angle on the chromatic circle.
 */
export const unwrap = (h: number, ref: number): number => {
  'worklet';
  let val = h;
  while (val < ref) val += 360;
  while (val >= ref + 360) val -= 360;
  return val;
};

/**
 * Maps an angle to a horizontal pixel coordinate along the slider track.
 */
export const angleToX = (
  angle: number,
  minAngle: number,
  maxAngle: number,
  trackWidth: number
): number => {
  'worklet';
  if (trackWidth === 0) return 6;
  const totalRange = maxAngle - minAngle;
  if (totalRange <= 0) return 6;
  const pct = (angle - minAngle) / totalRange;
  return 6 + pct * (trackWidth - 12);
};

/**
 * Maps a horizontal pixel coordinate along the slider track back to an angle.
 */
export const xToAngle = (
  x: number,
  minAngle: number,
  maxAngle: number,
  trackWidth: number
): number => {
  'worklet';
  if (trackWidth <= 12) return minAngle;
  const totalRange = maxAngle - minAngle;
  const pct = Math.min(Math.max((x - 6) / (trackWidth - 12), 0), 1);
  return minAngle + pct * totalRange;
};
