import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterType, CameraCapabilities } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface LensModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  capabilities: CameraCapabilities;
  cameraId: string;
  setCameraId: (id: string) => void;
  cameraAuto: boolean;
  setCameraAuto: (auto: boolean) => void;
  torchState: SharedValue<number>;
  setTorchState: (value: number) => void;
  torchStrength: SharedValue<number>;
  setTorchStrength: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LensModule = ({
  activeParameter,
  setActiveParameter,
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
  
  // Sincronizza il boolean nativo di React con l'attributo isAuto richiesto da FooterParameterControl
  const autoShared = useSharedValue(cameraAuto);
  React.useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto]);

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.availableCameras.map((cam) => (
          <FooterParameterControl
            key={cam.id}
            label={t('parameters.lens')}
            isActive={activeParameter === 'lens' && cameraId === cam.id}
            onPress={() => {
                setCameraId(cam.id);
                setActiveParameter('lens');
            }}
            variant="text"
            isAuto={autoShared}
            onLongPress={() => setCameraAuto(true)}
            staticText={`${cam.focalLength35mm}mm`}
          />
        ))}
        {capabilities.hasTorch && (
          <FooterParameterControl
            label={t('parameters.torch')}
            isActive={activeParameter === 'torch'}
            onPress={() => {
              setTorchState(torchState.value === 0 ? 1 : 0);
              setActiveParameter('torch');
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
          <FooterParameterControl
            label={t('parameters.torch_dimmer')}
            isActive={activeParameter === 'torch_dimmer'}
            onPress={() => handlePressWithDouble('torch_dimmer', () => setActiveParameter('torch_dimmer'))}
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
