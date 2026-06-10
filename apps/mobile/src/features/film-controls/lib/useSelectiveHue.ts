import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { 
  DEFAULT_SELECTIVE_HUE,
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

export const useSelectiveHue = () => {
  const [activeColorIndex, setActiveColorIndex] = React.useState<ColorIndex>(0);
  const activeParameter = useSystemStore(useShallow(state => state.activeParameter));
  const [prevActiveParameter, setPrevActiveParameter] = React.useState(activeParameter);

  if (activeParameter !== prevActiveParameter) {
    setPrevActiveParameter(activeParameter);
    if (activeParameter === 'hue') {
      setActiveColorIndex(0);
    }
  }

  const {
    hueRed, setHueRed,
    hueOrange, setHueOrange,
    hueYellow, setHueYellow,
    hueGreen, setHueGreen,
    hueCyan, setHueCyan,
    hueBlue, setHueBlue,
    huePurple, setHuePurple,
    hueMagenta, setHueMagenta,
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
      hueRed: state.hueRed,
      setHueRed: state.setHueRed,
      hueOrange: state.hueOrange,
      setHueOrange: state.setHueOrange,
      hueYellow: state.hueYellow,
      setHueYellow: state.setHueYellow,
      hueGreen: state.hueGreen,
      setHueGreen: state.setHueGreen,
      hueCyan: state.hueCyan,
      setHueCyan: state.setHueCyan,
      hueBlue: state.hueBlue,
      setHueBlue: state.setHueBlue,
      huePurple: state.huePurple,
      setHuePurple: state.setHuePurple,
      hueMagenta: state.hueMagenta,
      setHueMagenta: state.setHueMagenta,
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

  const handleHueOnlyReset = useCallback((colorKey: string) => {
    const v = DEFAULT_SELECTIVE_HUE;
    switch (colorKey) {
      case 'red':     setHueRed(v); break;
      case 'orange':  setHueOrange(v); break;
      case 'yellow':  setHueYellow(v); break;
      case 'green':   setHueGreen(v); break;
      case 'cyan':    setHueCyan(v); break;
      case 'blue':    setHueBlue(v); break;
      case 'purple':  setHuePurple(v); break;
      case 'magenta': setHueMagenta(v); break;
    }
  }, [setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta]);

  const handleFullColorReset = useCallback((colorKey: string) => {
    const v = DEFAULT_SELECTIVE_HUE;
    switch (colorKey) {
      case 'red':
        setHueRed(v);
        setBoundMagentaRed(DEFAULT_BOUND_MAGENTA_RED);
        setBoundRedOrange(DEFAULT_BOUND_RED_ORANGE);
        break;
      case 'orange':
        setHueOrange(v);
        setBoundRedOrange(DEFAULT_BOUND_RED_ORANGE);
        setBoundOrangeYellow(DEFAULT_BOUND_ORANGE_YELLOW);
        break;
      case 'yellow':
        setHueYellow(v);
        setBoundOrangeYellow(DEFAULT_BOUND_ORANGE_YELLOW);
        setBoundYellowGreen(DEFAULT_BOUND_YELLOW_GREEN);
        break;
      case 'green':
        setHueGreen(v);
        setBoundYellowGreen(DEFAULT_BOUND_YELLOW_GREEN);
        setBoundGreenCyan(DEFAULT_BOUND_GREEN_CYAN);
        break;
      case 'cyan':
        setHueCyan(v);
        setBoundGreenCyan(DEFAULT_BOUND_GREEN_CYAN);
        setBoundCyanBlue(DEFAULT_BOUND_CYAN_BLUE);
        break;
      case 'blue':
        setHueBlue(v);
        setBoundCyanBlue(DEFAULT_BOUND_CYAN_BLUE);
        setBoundBluePurple(DEFAULT_BOUND_BLUE_PURPLE);
        break;
      case 'purple':
        setHuePurple(v);
        setBoundBluePurple(DEFAULT_BOUND_BLUE_PURPLE);
        setBoundPurpleMagenta(DEFAULT_BOUND_PURPLE_MAGENTA);
        break;
      case 'magenta':
        setHueMagenta(v);
        setBoundPurpleMagenta(DEFAULT_BOUND_PURPLE_MAGENTA);
        setBoundMagentaRed(DEFAULT_BOUND_MAGENTA_RED);
        break;
    }
  }, [setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta, setBoundMagentaRed, setBoundRedOrange, setBoundOrangeYellow, setBoundYellowGreen, setBoundGreenCyan, setBoundCyanBlue, setBoundBluePurple, setBoundPurpleMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleFullColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index as ColorIndex));
  }, [handlePressWithDouble]);

  const worklets = useFilmWorklets();

  const activeValue = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return hueRed;
      case 1: return hueOrange;
      case 2: return hueYellow;
      case 3: return hueGreen;
      case 4: return hueCyan;
      case 5: return hueBlue;
      case 6: return huePurple;
      case 7: return hueMagenta;
    }
  }, [activeColorIndex, hueRed, hueOrange, hueYellow, hueGreen, hueCyan, hueBlue, huePurple, hueMagenta]);

  const activeSetter = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return setHueRed;
      case 1: return setHueOrange;
      case 2: return setHueYellow;
      case 3: return setHueGreen;
      case 4: return setHueCyan;
      case 5: return setHueBlue;
      case 6: return setHuePurple;
      case 7: return setHueMagenta;
    }
  }, [activeColorIndex, setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta]);

  const activeWorklet = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return worklets.updateHueRed;
      case 1: return worklets.updateHueOrange;
      case 2: return worklets.updateHueYellow;
      case 3: return worklets.updateHueGreen;
      case 4: return worklets.updateHueCyan;
      case 5: return worklets.updateHueBlue;
      case 6: return worklets.updateHuePurple;
      case 7: return worklets.updateHueMagenta;
    }
  }, [activeColorIndex, worklets]);

  const activeReset = useMemo(() => {
    const colorKeys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'];
    return () => handleHueOnlyReset(colorKeys[activeColorIndex]);
  }, [activeColorIndex, handleHueOnlyReset]);

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
