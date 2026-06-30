import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useLensStore } from '@entities/lens';
import { useSystemStore, GenericPillPanel } from '@entities/system';
import { AutoButton } from '@shared/ui';

interface LensSelectionPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const LensSelectionPanel = ({ animatedStyle }: LensSelectionPanelProps) => {
  const { capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto, activeCameraId } = useLensStore(useShallow(state => ({
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
    activeCameraId: state.activeCameraId,
  })));
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);

  return (
    <GenericPillPanel
      options={capabilities.availableCameras}
      onChange={(cam) => {
        setCameraAuto(false);
        setCameraId(cam.id);
      }}
      isActiveStatic={(cam) => cameraAuto ? activeCameraId === cam.id : cameraId === cam.id}
      getLabel={(cam) => `${cam.focalLength35mm}mm`}
      animatedStyle={animatedStyle}
      pillMaxWidth={75}
      gap={8}
      paddingHorizontal={24}
      scrollable={true}
      opacity={(cam) => cameraAuto ? (activeCameraId === cam.id ? 1 : 0.4) : 1}
      leftAccessory={
        <AutoButton
          isActive={cameraAuto}
          onPress={() => setCameraAuto(!cameraAuto)}
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        />
      }
    />
  );
};

