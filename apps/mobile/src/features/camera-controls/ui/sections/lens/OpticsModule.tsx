import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { useHardwareStore } from '../../../model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

const formatFocus = (v: number) => {
  'worklet';
  if (v <= 0.1) return '∞';
  
  const distanceInMeters = 1 / v;
  if (distanceInMeters >= 1) {
    return `${distanceInMeters.toFixed(1)}m`;
  } else {
    return `${((distanceInMeters * 100)).toFixed(0)}cm`;
  }
};

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({ handlePressWithDouble }: OpticsModuleProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const {
    focusDistance, setFocusDistance, focusAuto, setFocusAuto,
    capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto
  } = useHardwareStore(useShallow(s => ({
    focusDistance: s.focusDistance,
    setFocusDistance: s.setFocusDistance,
    focusAuto: s.focusAuto,
    setFocusAuto: s.setFocusAuto,
    capabilities: s.capabilities,
    cameraId: s.cameraId,
    setCameraId: s.setCameraId,
    cameraAuto: s.cameraAuto,
    setCameraAuto: s.setCameraAuto,
  })));

  const autoShared = useSharedValue(cameraAuto);
  useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto, autoShared]);

  const currentIndex = capabilities.availableCameras.findIndex(c => c.id === cameraId);
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

  const focalLengths = useMemo(() => capabilities.availableCameras.map(c => c.focalLength35mm), [capabilities.availableCameras]);

  const formatLens = (val: number) => {
    'worklet';
    const index = Math.round(val);
    if (index >= 0 && index < focalLengths.length) {
      return `${focalLengths[index]}mm`;
    }
    return '';
  };

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.availableCameras.length > 0 && (
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
        )}
        <ParameterControl
          label={t('parameters.focus')}
          isActive={activeParameter === 'focus'}
          onPress={() => handlePressWithDouble('focus', () => setActiveParameter('focus'))}
          value={focusDistance}
          minValue={0}
          maxValue={10}
          onChange={setFocusDistance}
          variant="text"
          isAuto={focusAuto}
          valueFormatter={formatFocus}
          invertDrag={true}
        />
      </View>
    </Animated.View>
  );
};
