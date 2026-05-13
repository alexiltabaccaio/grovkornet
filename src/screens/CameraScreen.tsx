import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useTranslation } from 'react-i18next';

import { useCameraEffects } from '@features/camera-controls/lib/useCameraEffects';
import { GestureController } from '@features/camera-controls/ui/GestureController';
import { Footer } from '@features/camera-controls/ui/Footer';

export const CameraScreen = () => {
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  
  const {
    activeTab,
    setActiveTab,
    activeModule,
    setActiveModule,
    activeParameter,
    setActiveParameter,
    grainIntensity,
    saturation,
    contrast,
    chromaticAberration,
    grainEnabled,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setChromaticAberration,
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
        <Text style={styles.text}>{t('camera.requesting_permissions')}</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('camera.not_found')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="rgb"
        frameProcessor={frameProcessor}
      />

      <GestureController
        grainIntensity={grainIntensity}
        saturation={saturation}
        contrast={contrast}
        chromaticAberration={chromaticAberration}
        activeTab={activeTab}
        activeModule={activeModule}
        activeParameter={activeParameter}
        onGrainIntensityChange={setGrainIntensity}
        onSaturationChange={setSaturation}
        onContrastChange={setContrast}
        onChromaticAberrationChange={setChromaticAberration}
      />

      <Footer
        enabled={grainEnabled}
        grainIntensity={grainIntensity}
        saturation={saturation}
        contrast={contrast}
        chromaticAberration={chromaticAberration}
        activeTab={activeTab}
        activeModule={activeModule}
        activeParameter={activeParameter}
        onGrainToggle={setGrainEnabled}
        onTabChange={setActiveTab}
        onModuleChange={setActiveModule}
        onParameterChange={setActiveParameter}
        setGrainIntensity={setGrainIntensity}
        setSaturation={setSaturation}
        setContrast={setContrast}
        setChromaticAberration={setChromaticAberration}
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
