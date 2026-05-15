import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterType, CameraCapabilities } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';
import { SharedValue } from 'react-native-reanimated';

interface LightingModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  capabilities: CameraCapabilities;
  torchState: SharedValue<number>;
  setTorchState: (value: number) => void;
  torchStrength: SharedValue<number>;
  setTorchStrength: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({
  activeParameter,
  setActiveParameter,
  capabilities,
  torchState,
  setTorchState,
  torchStrength,
  setTorchStrength,
  handlePressWithDouble,
}: LightingModuleProps) => {
  const { t } = useTranslation();
  
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.hasTorch && (
          <ParameterControl
            label={t('parameters.torch')}
            isActive={activeParameter === 'torch'}
            onPress={() => handlePressWithDouble('torch', () => {
              setTorchState(torchState.value === 0 ? 1 : 0);
              setActiveParameter('torch');
            })}
            value={torchState}
            variant="text"
            renderValue={true}
            valueFormatter={(v) => {
              'worklet';
              return v === 0 ? 'OFF' : 'ON';
            }}
          />
        )}
      </View>
    </Animated.View>
  );
};
