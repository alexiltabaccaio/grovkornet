import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useLensStore } from '@entities/lens';
import { useSystemStore } from '@entities/system';
import { AutoButton } from '@shared/ui';
import { GenericPillExtension } from '@entities/system';


interface LensSelectionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const LensSelectionExtension = ({ parameterExtensionAnimatedStyle }: LensSelectionExtensionProps) => {
  const { capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto } = useLensStore(useShallow(state => ({
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
  })));
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);

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
      <AutoButton
        isActive={cameraAuto}
        onPress={() => setCameraAuto(!cameraAuto)}
        isDebugEnabled={isDebugEnabled}
      />
    </GenericPillExtension>
  );
};
