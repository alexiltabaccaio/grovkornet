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

const formatEv = (v: number) => {
  'worklet';
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
};

const formatShutterSpeed = (v: number) => {
  'worklet';
  return `1/${Math.round(v)}`;
};

interface ExposureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ExposureModule = ({ handlePressWithDouble }: ExposureModuleProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const {
    iso, setIso, isoAuto, setIsoAuto,
    ev, setEv, evAuto, setEvAuto,
    shutterSpeed, setShutterSpeed, shutterSpeedAuto, setShutterSpeedAuto
  } = useHardwareStore(useShallow(s => ({
    iso: s.iso,
    setIso: s.setIso,
    isoAuto: s.isoAuto,
    setIsoAuto: s.setIsoAuto,
    ev: s.ev,
    setEv: s.setEv,
    evAuto: s.evAuto,
    setEvAuto: s.setEvAuto,
    shutterSpeed: s.shutterSpeed,
    setShutterSpeed: s.setShutterSpeed,
    shutterSpeedAuto: s.shutterSpeedAuto,
    setShutterSpeedAuto: s.setShutterSpeedAuto,
  })));

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
