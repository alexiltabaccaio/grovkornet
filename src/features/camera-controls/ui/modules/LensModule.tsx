import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { PrimaryParameterType, CameraCapabilities } from '@shared/types/camera';
import { PrimaryParameterControl } from '../PrimaryParameterControl';
import { footerStyles } from '../Footer.styles';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface LensModuleProps {
  activePrimaryParameter: PrimaryParameterType;
  setActivePrimaryParameter: (param: PrimaryParameterType) => void;
  capabilities: CameraCapabilities;
  cameraId: string;
  setCameraId: (id: string) => void;
  cameraAuto: boolean;
  setCameraAuto: (auto: boolean) => void;
  torchState: SharedValue<number>;
  setTorchState: (value: number) => void;
  torchStrength: SharedValue<number>;
  setTorchStrength: (value: number) => void;
  handlePressWithDouble: (param: PrimaryParameterType, action: () => void) => void;
}

export const LensModule = ({
  activePrimaryParameter,
  setActivePrimaryParameter,
  capabilities,
  cameraId,
  setCameraId,
  cameraAuto,
  setCameraAuto,
  torchState,
  setTorchState,
  torchStrength,
  setTorchStrength,
  handlePressWithDouble,
}: LensModuleProps) => {
  const { t } = useTranslation();
  
  // Sincronizza il boolean nativo di React con l'attributo isAuto richiesto da PrimaryParameterControl
  const autoShared = useSharedValue(cameraAuto);
  React.useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto]);

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.availableCameras.map((cam) => (
          <PrimaryParameterControl
            key={cam.id}
            label={t('parameters.lens')}
            isActive={activePrimaryParameter === 'lens' && cameraId === cam.id}
            onPress={() => {
                setCameraId(cam.id);
                setActivePrimaryParameter('lens');
            }}
            variant="text"
            isAuto={autoShared}
            onLongPress={() => setCameraAuto(true)}
            staticText={`${cam.focalLength35mm}mm`}
          />
        ))}
        {capabilities.hasTorch && (
          <PrimaryParameterControl
            label={t('parameters.torch')}
            isActive={activePrimaryParameter === 'torch'}
            onPress={() => {
              setTorchState(torchState.value === 0 ? 1 : 0);
              setActivePrimaryParameter('torch');
            }}
            value={torchState}
            variant="text"
            renderValue={true}
            valueFormatter={(v) => {
              'worklet';
              return v === 0 ? 'OFF' : 'ON';
            }}
          />
        )}
        {capabilities.hasTorch && capabilities.maxTorchStrength !== undefined && capabilities.maxTorchStrength > 1 && (
          <PrimaryParameterControl
            label={t('parameters.torch_dimmer')}
            isActive={activePrimaryParameter === 'torch_dimmer'}
            onPress={() => handlePressWithDouble('torch_dimmer', () => setActivePrimaryParameter('torch_dimmer'))}
            value={torchStrength}
            minValue={1}
            maxValue={capabilities.maxTorchStrength}
            onChange={setTorchStrength}
            variant="text"
            renderValue={true}
            valueFormatter={(v) => {
              'worklet';
              return `${Math.round(v)}`;
            }}
          />
        )}
      </View>
    </Animated.View>
  );
};
