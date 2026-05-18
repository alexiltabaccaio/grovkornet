import React, { useEffect, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface LensSelectionParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LensSelectionParam = ({ handlePressWithDouble }: LensSelectionParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { capabilities, cameraId, setCameraId, cameraAuto } = useHardwareStore(useShallow(s => ({
    capabilities: s.capabilities,
    cameraId: s.cameraId,
    setCameraId: s.setCameraId,
    cameraAuto: s.cameraAuto,
  })));

  const autoShared = useSharedValue(cameraAuto);
  useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto, autoShared]);

  const currentIndex = capabilities.availableCameras.findIndex((c: { id: string; focalLength35mm: number }) => c.id === cameraId);
  const selectedIndex = currentIndex === -1 ? 0 : currentIndex;
  
  const indexShared = useSharedValue(selectedIndex);
  useEffect(() => {
    indexShared.value = selectedIndex;
  }, [selectedIndex, indexShared]);

  const handleIndexChange = (val: number) => {
    const intVal = Math.round(val);
    const cam = capabilities.availableCameras[intVal];
    if (cam && cam.id !== cameraId) {
      setCameraId(cam.id);
    }
  };

  const focalLengths = useMemo(() => capabilities.availableCameras.map((c: { id: string; focalLength35mm: number }) => c.focalLength35mm), [capabilities.availableCameras]);

  const formatLens = (val: number) => {
    'worklet';
    const index = Math.round(val);
    if (index >= 0 && index < focalLengths.length) {
      return `${focalLengths[index]}mm`;
    }
    return '';
  };

  if (capabilities.availableCameras.length === 0) return null;

  return (
    <ParameterControl
      label={t('parameters.lens')}
      isActive={activeParameter === 'camera_selection'}
      onPress={() => handlePressWithDouble('camera_selection', () => setActiveParameter('camera_selection'))}
      value={indexShared}
      minValue={0}
      maxValue={Math.max(0, capabilities.availableCameras.length - 1)}
      onChange={handleIndexChange}
      variant="text"
      isAuto={autoShared}
      valueFormatter={formatLens}
    />
  );
};
