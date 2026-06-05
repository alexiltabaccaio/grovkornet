import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';

export const DeviceHealthWarningBanner = () => {
  const { t } = useTranslation();
  const thermalState = useSystemStore(state => state.thermalState);
  const preferredFps = usePreferencesStore(state => state.fpsSetting) ?? 60;

  // Pulsing animation for the warning dot
  const dotOpacity = useSharedValue(0.4);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [dotOpacity]);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
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

  if (!shouldShow) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(250)}
      style={styles.bannerContainer}
      testID="device-health-warning-banner"
    >
      <View style={styles.content}>
        <Animated.View style={[styles.dot, dotAnimatedStyle]} />
        <Text style={styles.text}>{t(messageKey)}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.25)',
    backgroundColor: 'rgba(20, 10, 10, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4b4b',
    marginRight: 8,
  },
  text: {
    color: '#ff4b4b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
