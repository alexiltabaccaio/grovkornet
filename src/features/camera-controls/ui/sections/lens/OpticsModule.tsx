import React from 'react';
import { View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterType, CameraCapabilities } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';
import { useSharedValue } from 'react-native-reanimated';

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
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  focusDistance: SharedValue<number>;
  setFocusDistance: (value: number) => void;
  focusAuto: SharedValue<boolean>;
  setFocusAuto: (value: boolean) => void;
  capabilities: CameraCapabilities;
  cameraId: string;
  setCameraId: (id: string) => void;
  cameraAuto: boolean;
  setCameraAuto: (auto: boolean) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({
  activeParameter,
  setActiveParameter,
  focusDistance,
  setFocusDistance,
  focusAuto,
  setFocusAuto,
  capabilities,
  cameraId,
  setCameraId,
  cameraAuto,
  setCameraAuto,
  handlePressWithDouble,
}: OpticsModuleProps) => {
  const { t } = useTranslation();

  const autoShared = useSharedValue(cameraAuto);
  React.useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto]);

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
