import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { useHardwareStore } from '../../../model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { capabilities, torchState, setTorchState } = useHardwareStore(useShallow(s => ({
    capabilities: s.capabilities,
    torchState: s.torchState,
    setTorchState: s.setTorchState,
  })));
  
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
