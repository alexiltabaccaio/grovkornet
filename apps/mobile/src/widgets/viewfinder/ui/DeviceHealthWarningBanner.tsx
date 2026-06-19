import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useCameraStore } from '@entities/camera';
import { usePreferencesStore } from '@entities/preferences';

export const DeviceHealthWarningBanner = () => {
  const { t } = useTranslation();
  const thermalState = useCameraStore(state => state.thermalState);
  const preferredFps = usePreferencesStore(state => state.fpsSetting) ?? 60;

  const [isTextVisible, setIsTextVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pulsing animation for the warning circle dependent on the thermalState
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    if (thermalState === 'critical') {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.4, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [thermalState, pulseOpacity]);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Determine if we should show the warning banner
  let shouldShow = false;
  let messageKey = '';
  
  if (thermalState === 'warning' && preferredFps > 30) {
    shouldShow = true;
    messageKey = 'device_health.warning';
  } else if (thermalState === 'critical' && preferredFps > 15) {
    shouldShow = true;
    messageKey = 'device_health.critical';
  }

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [prevShouldShow, setPrevShouldShow] = useState(shouldShow);
  if (shouldShow !== prevShouldShow) {
    setPrevShouldShow(shouldShow);
    if (!shouldShow) {
      setIsTextVisible(false);
    }
  }

  useEffect(() => {
    if (!shouldShow) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [shouldShow]);

  const handleCirclePress = () => {
    if (isTextVisible) {
      setIsTextVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      setIsTextVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsTextVisible(false);
        timeoutRef.current = null;
      }, 5000);
    }
  };

  const handleTextPress = () => {
    setIsTextVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <>
      {shouldShow && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(250)}
          style={styles.container}
          pointerEvents="box-none"
        >
          {/* Exclamation Circle on the left */}
          <TouchableOpacity
            onPress={handleCirclePress}
            activeOpacity={0.7}
            testID="device-health-warning-circle"
          >
            <Animated.View style={[styles.circle, circleAnimatedStyle]}>
              <Text style={styles.exclamationText}>!</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Warning Text on the same line, to the right of the circle */}
          {isTextVisible && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(250)}
              style={styles.textContainer}
              testID="device-health-warning-banner"
            >
              <TouchableOpacity
                onPress={handleTextPress}
                activeOpacity={0.9}
                testID="device-health-warning-text-button"
              >
                <Text style={styles.text}>{t(messageKey)}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ff4b4b',
    backgroundColor: 'rgba(20, 10, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exclamationText: {
    color: '#ff4b4b',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(20, 10, 10, 0.9)',
    borderColor: 'rgba(255, 75, 75, 0.35)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#ff4b4b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

