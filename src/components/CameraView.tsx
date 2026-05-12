import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useCameraEffects } from '../hooks/useCameraEffects';
import { VerticalSliders } from './VerticalSliders';
import { Footer } from './Footer';

export const CameraView = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  
  // Custom hook containing all the logic for frame processing and state synchronization
  const {
    activeTab,
    setActiveTab,
    activeImageTool,
    setActiveImageTool,
    grainIntensity,
    saturation,
    contrast,
    grainEnabled,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setGrainEnabled,
    resetTool,
    frameProcessor,
  } = useCameraEffects();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Native Camera with integrated Skia Frame Processor */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="rgb"
        frameProcessor={frameProcessor}
      />

      {/* Lateral Vertical Sliders */}
      <VerticalSliders
        grainIntensity={grainIntensity}
        saturation={saturation}
        contrast={contrast}
        activeTab={activeTab}
        activeImageTool={activeImageTool}
        onGrainIntensityChange={setGrainIntensity}
        onSaturationChange={setSaturation}
        onContrastChange={setContrast}
      />

      {/* Simplified Footer */}
      <Footer
        enabled={grainEnabled}
        activeImageTool={activeImageTool}
        onGrainToggle={setGrainEnabled}
        onTabChange={setActiveTab}
        onImageToolChange={setActiveImageTool}
        onResetTool={resetTool}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
