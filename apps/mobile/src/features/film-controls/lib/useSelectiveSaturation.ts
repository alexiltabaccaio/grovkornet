import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets, useFilmParameterControlData } from '@entities/film';
import { 
  DEFAULT_SELECTIVE_SATURATION,
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_BOUND_MAGENTA_RED,
} from '@grovkornet/shared';
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
    setBoundMagentaRed,
    setBoundRedOrange,
    setBoundOrangeYellow,
    setBoundYellowGreen,
    setBoundGreenCyan,
    setBoundCyanBlue,
    setBoundBluePurple,
    setBoundPurpleMagenta,
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
      setBoundMagentaRed: state.setBoundMagentaRed,
      setBoundRedOrange: state.setBoundRedOrange,
      setBoundOrangeYellow: state.setBoundOrangeYellow,
      setBoundYellowGreen: state.setBoundYellowGreen,
      setBoundGreenCyan: state.setBoundGreenCyan,
      setBoundCyanBlue: state.setBoundCyanBlue,
      setBoundBluePurple: state.setBoundBluePurple,
      setBoundPurpleMagenta: state.setBoundPurpleMagenta,
    }))
  );

  // RESET HIERARCHY FOR SELECTIVE SATURATION:
  // 1. Double tap on main 'Saturation' parameter -> Resets EVERYTHING (all colors and bounds) via useFilmStore resetEffect.
  // 2. Double tap on multi-color Master dot -> Resets ONLY the master saturation.
  // 3. Double tap on specific color dot (e.g. Green) -> Resets BOTH the saturation and bounds for that color (handleFullColorReset).
  // 4. Double tap on top saturation slider -> Resets ONLY the saturation for that color (handleSaturationOnlyReset).
  // 5. Double tap on bottom ColorRangeSlider -> Resets ONLY the bounds for that color (handled locally in ColorRangeSlider.tsx).

  const handleSaturationOnlyReset = useCallback((colorKey: string) => {
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

  const handleFullColorReset = useCallback((colorKey: string) => {
    if (colorKey === 'master') {
      masterData.onReset();
    } else {
      const v = DEFAULT_SELECTIVE_SATURATION;
      switch (colorKey) {
        case 'red':
          setSatRed(v);
          setBoundMagentaRed(DEFAULT_BOUND_MAGENTA_RED);
          setBoundRedOrange(DEFAULT_BOUND_RED_ORANGE);
          break;
        case 'orange':
          setSatOrange(v);
          setBoundRedOrange(DEFAULT_BOUND_RED_ORANGE);
          setBoundOrangeYellow(DEFAULT_BOUND_ORANGE_YELLOW);
          break;
        case 'yellow':
          setSatYellow(v);
          setBoundOrangeYellow(DEFAULT_BOUND_ORANGE_YELLOW);
          setBoundYellowGreen(DEFAULT_BOUND_YELLOW_GREEN);
          break;
        case 'green':
          setSatGreen(v);
          setBoundYellowGreen(DEFAULT_BOUND_YELLOW_GREEN);
          setBoundGreenCyan(DEFAULT_BOUND_GREEN_CYAN);
          break;
        case 'cyan':
          setSatCyan(v);
          setBoundGreenCyan(DEFAULT_BOUND_GREEN_CYAN);
          setBoundCyanBlue(DEFAULT_BOUND_CYAN_BLUE);
          break;
        case 'blue':
          setSatBlue(v);
          setBoundCyanBlue(DEFAULT_BOUND_CYAN_BLUE);
          setBoundBluePurple(DEFAULT_BOUND_BLUE_PURPLE);
          break;
        case 'purple':
          setSatPurple(v);
          setBoundBluePurple(DEFAULT_BOUND_BLUE_PURPLE);
          setBoundPurpleMagenta(DEFAULT_BOUND_PURPLE_MAGENTA);
          break;
        case 'magenta':
          setSatMagenta(v);
          setBoundPurpleMagenta(DEFAULT_BOUND_PURPLE_MAGENTA);
          setBoundMagentaRed(DEFAULT_BOUND_MAGENTA_RED);
          break;
      }
    }
  }, [masterData, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta, setBoundMagentaRed, setBoundRedOrange, setBoundOrangeYellow, setBoundYellowGreen, setBoundGreenCyan, setBoundCyanBlue, setBoundBluePurple, setBoundPurpleMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleFullColorReset);

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

  const activeReset = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.onReset;
    const colorKeys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'];
    return () => handleSaturationOnlyReset(colorKeys[activeColorIndex as number]);
  }, [activeColorIndex, masterData.onReset, handleSaturationOnlyReset]);

  return {
    activeColorIndex,
    setActiveColorIndex,
    isMaster,
    activeValue,
    activeSetter,
    activeWorklet,
    activeReset,
    masterData,
    handleColorPress,
    handlePressWithDouble,
  };
};
