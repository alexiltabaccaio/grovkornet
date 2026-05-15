import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

const formatEv = (v: number) => {
  'worklet';
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
};

const formatShutterSpeed = (v: number) => {
  'worklet';
  return `1/${Math.round(v)}`;
};

interface ExposureModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  iso: SharedValue<number>;
  setIso: (value: number) => void;
  isoAuto: SharedValue<boolean>;
  setIsoAuto: (value: boolean) => void;
  ev: SharedValue<number>;
  setEv: (value: number) => void;
  evAuto: SharedValue<boolean>;
  setEvAuto: (value: boolean) => void;
  shutterSpeed: SharedValue<number>;
  setShutterSpeed: (value: number) => void;
  shutterSpeedAuto: SharedValue<boolean>;
  setShutterSpeedAuto: (value: boolean) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ExposureModule = ({
  activeParameter,
  setActiveParameter,
  iso,
  setIso,
  isoAuto,
  setIsoAuto,
  ev,
  setEv,
  evAuto,
  setEvAuto,
  shutterSpeed,
  setShutterSpeed,
  shutterSpeedAuto,
  setShutterSpeedAuto,
  handlePressWithDouble,
}: ExposureModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label={t('parameters.iso')}
          isActive={activeParameter === 'iso'}
          onPress={() => handlePressWithDouble('iso', () => setActiveParameter('iso'))}
          value={iso}
          minValue={50}
          maxValue={3200}
          onChange={setIso}
          variant="text"
          isAuto={isoAuto}
          onLongPress={() => setIsoAuto(!isoAuto.value)}
        />
        <ParameterControl
          label={t('parameters.ev')}
          isActive={activeParameter === 'ev'}
          onPress={() => handlePressWithDouble('ev', () => setActiveParameter('ev'))}
          value={ev}
          minValue={-2.0}
          maxValue={2.0}
          onChange={setEv}
          variant="text"
          isAuto={evAuto}
          onLongPress={() => setEvAuto(!evAuto.value)}
          valueFormatter={formatEv}
        />
        <ParameterControl
          label={t('parameters.shutter_speed')}
          isActive={activeParameter === 'shutter_speed'}
          onPress={() => handlePressWithDouble('shutter_speed', () => setActiveParameter('shutter_speed'))}
          value={shutterSpeed}
          minValue={1}
          maxValue={1000}
          onChange={setShutterSpeed}
          variant="text"
          isAuto={shutterSpeedAuto}
          onLongPress={() => setShutterSpeedAuto(!shutterSpeedAuto.value)}
          valueFormatter={formatShutterSpeed}
        />
      </View>
    </Animated.View>
  );
};
