import React, { useEffect } from 'react';
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

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.availableCameras.map((cam) => (
          <ParameterControl
            key={cam.id}
            label={t('parameters.lens')}
            isActive={activeParameter === 'camera_selection' && cameraId === cam.id}
            onPress={() => handlePressWithDouble('camera_selection', () => {
                setCameraId(cam.id);
                setActiveParameter('camera_selection');
            })}
            variant="text"
            isAuto={autoShared}
            onLongPress={() => setCameraAuto(true)}
            staticText={`${cam.focalLength35mm}mm`}
          />
        ))}
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
          onLongPress={() => setFocusAuto(!focusAuto.value)}
          valueFormatter={formatFocus}
          invertDrag={true}
        />
      </View>
    </Animated.View>
  );
};
