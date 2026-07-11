import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export let _lastKnownAngle = 0;

export const _setLastKnownAngleForTesting = (angle: number) => {
  _lastKnownAngle = angle;
};

export const useDeviceRotation = () => {
  const rotationY = useSharedValue(_lastKnownAngle);
  const currentTargetAngle = useRef(_lastKnownAngle);

  useEffect(() => {
    // Limit update frequency to reduce CPU overhead
    Accelerometer.setUpdateInterval(150);

    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (isNaN(x) || isNaN(y)) return;
      let targetAngle = currentTargetAngle.current;

      // Threshold of 0.5 to trigger orientation change, avoiding jitter near the edges
      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0.5) {
          targetAngle = 90; // Landscape Left -> rotate clockwise to stay upright
        } else if (x < -0.5) {
          targetAngle = -90; // Landscape Right -> rotate counter-clockwise to stay upright
        }
      } else {
        if (y > 0.5) {
          targetAngle = 0; // Device is upside down -> map to layout angle 0
        } else if (y < -0.5) {
          targetAngle = 180; // Device is upright (standard portrait) -> map to layout angle 180
        }
      }

      if (targetAngle !== currentTargetAngle.current) {
        // Calculate shortest angular path to prevent 360° spinning
        const currentAngle = isNaN(rotationY.value) ? 0 : rotationY.value;
        const angleDiff = ((targetAngle - currentAngle + 540) % 360) - 180;
        
        currentTargetAngle.current = targetAngle;
        _lastKnownAngle = targetAngle;
        rotationY.value = withTiming(currentAngle + angleDiff, { duration: 300 });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [rotationY]);

  return rotationY;
};
