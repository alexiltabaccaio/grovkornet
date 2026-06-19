import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { 
  DEFAULT_SELECTIVE_SATURATION,
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
import { useControlPanelStore } from '@entities/system';

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const useSelectiveColor = (type: 'saturation' | 'hue') => {
  const { activeColorIndex, setActiveColorIndex } = useControlPanelStore(
    useShallow(state => ({
      activeColorIndex: state.selectedColorIndex as ColorIndex,
      setActiveColorIndex: state.setSelectedColorIndex,
    }))
  );

  const {
    satRed, setSatRed,
    satOrange, setSatOrange,
    satYellow, setSatYellow,
    satGreen, setSatGreen,
    satCyan, setSatCyan,
    satBlue, setSatBlue,
    satPurple, setSatPurple,
    satMagenta, setSatMagenta,

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

  const handleParameterOnlyReset = useCallback((colorKey: string) => {
    if (type === 'saturation') {
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
    } else {
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
    }
  }, [type, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta, setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta]);

  const handleFullColorReset = useCallback((colorKey: string) => {
    if (type === 'saturation') {
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
    } else {
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
    }
  }, [type, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta, setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta, setBoundMagentaRed, setBoundRedOrange, setBoundOrangeYellow, setBoundYellowGreen, setBoundGreenCyan, setBoundCyanBlue, setBoundBluePurple, setBoundPurpleMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleFullColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index));
  }, [handlePressWithDouble, setActiveColorIndex]);

  const worklets = useFilmWorklets();

  const activeValue = useMemo(() => {
    if (type === 'saturation') {
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
    } else {
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
    }
  }, [type, activeColorIndex, satRed, satOrange, satYellow, satGreen, satCyan, satBlue, satPurple, satMagenta, hueRed, hueOrange, hueYellow, hueGreen, hueCyan, hueBlue, huePurple, hueMagenta]);

  const activeSetter = useMemo(() => {
    if (type === 'saturation') {
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
    } else {
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
    }
  }, [type, activeColorIndex, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta, setHueRed, setHueOrange, setHueYellow, setHueGreen, setHueCyan, setHueBlue, setHuePurple, setHueMagenta]);

  const activeWorklet = useMemo(() => {
    if (type === 'saturation') {
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
    } else {
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
    }
  }, [type, activeColorIndex, worklets]);

  const activeReset = useMemo(() => {
    const colorKeys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'];
    return () => handleParameterOnlyReset(colorKeys[activeColorIndex]);
  }, [activeColorIndex, handleParameterOnlyReset]);

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
