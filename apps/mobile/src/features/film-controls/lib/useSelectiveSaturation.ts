import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets, useFilmParameterControlData } from '@entities/film';
import { DEFAULT_SELECTIVE_SATURATION } from '@grovkornet/shared';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { useSystemStore } from '@entities/system';

export type ColorIndex = 'master' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const useSelectiveSaturation = () => {
  const [activeColorIndex, setActiveColorIndex] = React.useState<ColorIndex>('master');
  const activeParameter = useSystemStore(useShallow(state => state.activeParameter));
  const [prevActiveParameter, setPrevActiveParameter] = React.useState(activeParameter);

  if (activeParameter !== prevActiveParameter) {
    setPrevActiveParameter(activeParameter);
    if (activeParameter === 'saturation') {
      setActiveColorIndex('master');
    }
  }

  const masterData = useFilmParameterControlData('saturation');

  const {
    satRed, setSatRed,
    satOrange, setSatOrange,
    satYellow, setSatYellow,
    satGreen, setSatGreen,
    satCyan, setSatCyan,
    satBlue, setSatBlue,
    satPurple, setSatPurple,
    satMagenta, setSatMagenta,
  } = useFilmStore(
    useShallow(state => ({
      satRed: state.satRed,
      setSatRed: state.setSatRed,
      satOrange: state.satOrange,
      setSatOrange: state.setSatOrange,
      satYellow: state.satYellow,
      setSatYellow: state.setSatYellow,
      satGreen: state.satGreen,
      setSatGreen: state.setSatGreen,
      satCyan: state.satCyan,
      setSatCyan: state.setSatCyan,
      satBlue: state.satBlue,
      setSatBlue: state.setSatBlue,
      satPurple: state.satPurple,
      setSatPurple: state.setSatPurple,
      satMagenta: state.satMagenta,
      setSatMagenta: state.setSatMagenta,
    }))
  );

  const handleColorReset = useCallback((colorKey: string) => {
    if (colorKey === 'master') {
      masterData.onReset();
    } else {
      const v = DEFAULT_SELECTIVE_SATURATION;
      switch (colorKey) {
        case 'red':     setSatRed(v); break;
        case 'orange':  setSatOrange(v); break;
        case 'yellow':  setSatYellow(v); break;
        case 'green':   setSatGreen(v); break;
        case 'cyan':    setSatCyan(v); break;
        case 'blue':    setSatBlue(v); break;
        case 'purple':  setSatPurple(v); break;
        case 'magenta': setSatMagenta(v); break;
      }
    }
  }, [masterData, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index as ColorIndex));
  }, [handlePressWithDouble]);

  const worklets = useFilmWorklets();

  const isMaster = activeColorIndex === 'master';

  const activeValue = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.value;
    switch (activeColorIndex) {
      case 0: return satRed;
      case 1: return satOrange;
      case 2: return satYellow;
      case 3: return satGreen;
      case 4: return satCyan;
      case 5: return satBlue;
      case 6: return satPurple;
      case 7: return satMagenta;
    }
  }, [activeColorIndex, masterData.value, satRed, satOrange, satYellow, satGreen, satCyan, satBlue, satPurple, satMagenta]);

  const activeSetter = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.onChange;
    switch (activeColorIndex) {
      case 0: return setSatRed;
      case 1: return setSatOrange;
      case 2: return setSatYellow;
      case 3: return setSatGreen;
      case 4: return setSatCyan;
      case 5: return setSatBlue;
      case 6: return setSatPurple;
      case 7: return setSatMagenta;
    }
  }, [activeColorIndex, masterData.onChange, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const activeWorklet = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.onUpdateWorklet;
    switch (activeColorIndex) {
      case 0: return worklets.updateSatRed;
      case 1: return worklets.updateSatOrange;
      case 2: return worklets.updateSatYellow;
      case 3: return worklets.updateSatGreen;
      case 4: return worklets.updateSatCyan;
      case 5: return worklets.updateSatBlue;
      case 6: return worklets.updateSatPurple;
      case 7: return worklets.updateSatMagenta;
    }
  }, [activeColorIndex, masterData.onUpdateWorklet, worklets]);

  return {
    activeColorIndex,
    setActiveColorIndex,
    isMaster,
    activeValue,
    activeSetter,
    activeWorklet,
    masterData,
    handleColorPress,
    handlePressWithDouble,
  };
};
