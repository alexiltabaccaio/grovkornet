import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
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

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const useSelectiveSaturation = () => {
  const [activeColorIndex, setActiveColorIndex] = React.useState<ColorIndex>(0);
  const activeParameter = useSystemStore(useShallow(state => state.activeParameter));
  const [prevActiveParameter, setPrevActiveParameter] = React.useState(activeParameter);

  if (activeParameter !== prevActiveParameter) {
    setPrevActiveParameter(activeParameter);
    if (activeParameter === 'saturation') {
      setActiveColorIndex(0);
    }
  }

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

  const handleSaturationOnlyReset = useCallback((colorKey: string) => {
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
  }, [setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const handleFullColorReset = useCallback((colorKey: string) => {
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
  }, [setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta, setBoundMagentaRed, setBoundRedOrange, setBoundOrangeYellow, setBoundYellowGreen, setBoundGreenCyan, setBoundCyanBlue, setBoundBluePurple, setBoundPurpleMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleFullColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index as ColorIndex));
  }, [handlePressWithDouble]);

  const worklets = useFilmWorklets();

  const activeValue = useMemo(() => {
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
  }, [activeColorIndex, satRed, satOrange, satYellow, satGreen, satCyan, satBlue, satPurple, satMagenta]);

  const activeSetter = useMemo(() => {
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
  }, [activeColorIndex, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const activeWorklet = useMemo(() => {
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
  }, [activeColorIndex, worklets]);

  const activeReset = useMemo(() => {
    const colorKeys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'];
    return () => handleSaturationOnlyReset(colorKeys[activeColorIndex]);
  }, [activeColorIndex, handleSaturationOnlyReset]);

  return {
    activeColorIndex,
    setActiveColorIndex,
    activeValue,
    activeSetter,
    activeWorklet,
    activeReset,
    handleColorPress,
    handlePressWithDouble,
  };
};
