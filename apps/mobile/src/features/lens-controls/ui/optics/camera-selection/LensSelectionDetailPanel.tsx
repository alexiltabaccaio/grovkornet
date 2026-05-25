import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useLensStore } from '@entities/lens';
import { useSystemStore, GenericPillDetailPanel } from '@entities/system';
import { AutoButton } from '@shared/ui';

interface LensSelectionDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const LensSelectionDetailPanel = ({ parameterDetailPanelAnimatedStyle }: LensSelectionDetailPanelProps) => {
  const { capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto } = useLensStore(useShallow(state => ({
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
  })));
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);

  return (
    <GenericPillDetailPanel
      options={capabilities.availableCameras}
      onChange={(cam) => {
        setCameraAuto(false);
        setCameraId(cam.id);
      }}
      isActiveStatic={(cam) => !cameraAuto && cameraId === cam.id}
      getLabel={(cam) => `${cam.focalLength35mm}mm`}
      parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
      pillMaxWidth={75}
      gap={8}
      paddingHorizontal={24}
      scrollable={true}
      opacity={cameraAuto ? 0.4 : 1}
      leftAccessory={
        <AutoButton
          isActive={cameraAuto}
          onPress={() => setCameraAuto(!cameraAuto)}
          isDebugEnabled={isDebugEnabled}
        />
      }
    />
  );
};

