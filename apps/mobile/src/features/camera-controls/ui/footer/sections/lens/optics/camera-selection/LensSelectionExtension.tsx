import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { PillButton } from '@shared/ui';
import { GenericPillExtension } from '@features/camera-controls/ui/footer/components/GenericPillExtension';

interface LensSelectionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const LensSelectionExtension = ({ parameterExtensionAnimatedStyle }: LensSelectionExtensionProps) => {
  const { capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto } = useHardwareStore(useShallow(state => ({
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
  })));
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  return (
    <GenericPillExtension
      options={capabilities.availableCameras}
      onChange={(cam) => {
        setCameraAuto(false);
        setCameraId(cam.id);
      }}
      isActiveStatic={(cam) => !cameraAuto && cameraId === cam.id}
      getLabel={(cam) => `${cam.focalLength35mm}mm`}
      parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
      pillMaxWidth={75}
      opacity={() => cameraAuto ? 0.4 : 1}
    >
      <PillButton
        label="A"
        isActive={cameraAuto}
        onPress={() => setCameraAuto(!cameraAuto)}
        variant="auto"
        isDebugEnabled={isDebugEnabled}
        style={styles.autoPressable}
      />
    </GenericPillExtension>
  );
};

const styles = StyleSheet.create({
  autoPressable: {
    width: 32,
  },
});
