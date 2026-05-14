import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';

const formatFocus = (v: number) => {
  'worklet';
  if (v <= 0.1) return '∞';
  
  const distanceInMeters = 1 / v;
  if (distanceInMeters >= 1) {
    return `${distanceInMeters.toFixed(1)}m`;
  } else {
    return `${(distanceInMeters * 100).toFixed(0)}cm`;
  }
};

interface FocusModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  focusDistance: SharedValue<number>;
  setFocusDistance: (value: number) => void;
  focusAuto: SharedValue<boolean>;
  setFocusAuto: (value: boolean) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FocusModule = ({
  activeParameter,
  setActiveParameter,
  focusDistance,
  setFocusDistance,
  focusAuto,
  setFocusAuto,
  handlePressWithDouble,
}: FocusModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <FooterParameterControl
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
