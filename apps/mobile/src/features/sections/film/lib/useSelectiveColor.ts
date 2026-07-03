import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { 
  DEFAULT_SELECTIVE_SATURATION,
  DEFAULT_SELECTIVE_HUE,
} from '@grovkornet/shared';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { useControlPanelStore } from '@entities/system';
import { COLORS, DEFAULT_BOUNDS, getAdjacentBoundIndices } from './selectiveColorHelpers';

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const useSelectiveColor = (type: 'saturation' | 'hue') => {
  const { activeColorIndex, setActiveColorIndex } = useControlPanelStore(
    useShallow(state => ({
      activeColorIndex: state.selectedColorIndex as ColorIndex,
      setActiveColorIndex: state.setSelectedColorIndex,
    }))
  );

  const {
    v0, v1, v2, v3, v4, v5, v6, v7,
    s0, s1, s2, s3, s4, s5, s6, s7,
    b0, b1, b2, b3, b4, b5, b6, b7
  } = useFilmStore(
    useShallow(state => {
      if (type === 'saturation') {
        return {
          v0: state.satRed,
          v1: state.satOrange,
          v2: state.satYellow,
          v3: state.satGreen,
          v4: state.satCyan,
          v5: state.satBlue,
          v6: state.satPurple,
          v7: state.satMagenta,
          s0: state.setSatRed,
          s1: state.setSatOrange,
          s2: state.setSatYellow,
          s3: state.setSatGreen,
          s4: state.setSatCyan,
          s5: state.setSatBlue,
          s6: state.setSatPurple,
          s7: state.setSatMagenta,
          b0: state.setBoundMagentaRed,
          b1: state.setBoundRedOrange,
          b2: state.setBoundOrangeYellow,
          b3: state.setBoundYellowGreen,
          b4: state.setBoundGreenCyan,
          b5: state.setBoundCyanBlue,
          b6: state.setBoundBluePurple,
          b7: state.setBoundPurpleMagenta,
        };
      } else {
        return {
          v0: state.hueRed,
          v1: state.hueOrange,
          v2: state.hueYellow,
          v3: state.hueGreen,
          v4: state.hueCyan,
          v5: state.hueBlue,
          v6: state.huePurple,
          v7: state.hueMagenta,
          s0: state.setHueRed,
          s1: state.setHueOrange,
          s2: state.setHueYellow,
          s3: state.setHueGreen,
          s4: state.setHueCyan,
          s5: state.setHueBlue,
          s6: state.setHuePurple,
          s7: state.setHueMagenta,
          b0: state.setBoundMagentaRed,
          b1: state.setBoundRedOrange,
          b2: state.setBoundOrangeYellow,
          b3: state.setBoundYellowGreen,
          b4: state.setBoundGreenCyan,
          b5: state.setBoundCyanBlue,
          b6: state.setBoundBluePurple,
          b7: state.setBoundPurpleMagenta,
        };
      }
    })
  );

  const values = useMemo(() => [v0, v1, v2, v3, v4, v5, v6, v7], [v0, v1, v2, v3, v4, v5, v6, v7]);
  const setters = useMemo(() => [s0, s1, s2, s3, s4, s5, s6, s7], [s0, s1, s2, s3, s4, s5, s6, s7]);
  const boundSetters = useMemo(() => [b0, b1, b2, b3, b4, b5, b6, b7], [b0, b1, b2, b3, b4, b5, b6, b7]);

  const handleFullColorReset = useCallback((colorKey: string) => {
    const index = COLORS.indexOf(colorKey as any);
    if (index === -1) return;

    const defaultValue = type === 'saturation' ? DEFAULT_SELECTIVE_SATURATION : DEFAULT_SELECTIVE_HUE;
    setters[index](defaultValue);

    const [firstBoundIdx, secondBoundIdx] = getAdjacentBoundIndices(index);
    boundSetters[firstBoundIdx](DEFAULT_BOUNDS[firstBoundIdx]);
    boundSetters[secondBoundIdx](DEFAULT_BOUNDS[secondBoundIdx]);
  }, [type, setters, boundSetters]);

  const { handlePressWithDouble } = useDoublePress(handleFullColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index));
  }, [handlePressWithDouble, setActiveColorIndex]);

  const worklets = useFilmWorklets();

  const activeValue = useMemo(() => {
    return values[activeColorIndex];
  }, [activeColorIndex, values]);

  const activeSetter = useMemo(() => {
    return setters[activeColorIndex];
  }, [activeColorIndex, setters]);

  const activeWorklet = useMemo(() => {
    const satWorklets = [
      worklets.updateSatRed,
      worklets.updateSatOrange,
      worklets.updateSatYellow,
      worklets.updateSatGreen,
      worklets.updateSatCyan,
      worklets.updateSatBlue,
      worklets.updateSatPurple,
      worklets.updateSatMagenta,
    ];
    const hueWorklets = [
      worklets.updateHueRed,
      worklets.updateHueOrange,
      worklets.updateHueYellow,
      worklets.updateHueGreen,
      worklets.updateHueCyan,
      worklets.updateHueBlue,
      worklets.updateHuePurple,
      worklets.updateHueMagenta,
    ];
    return type === 'saturation' ? satWorklets[activeColorIndex] : hueWorklets[activeColorIndex];
  }, [type, activeColorIndex, worklets]);

  const activeReset = useMemo(() => {
    return () => {
      const defaultValue = type === 'saturation' ? DEFAULT_SELECTIVE_SATURATION : DEFAULT_SELECTIVE_HUE;
      setters[activeColorIndex](defaultValue);
    };
  }, [type, activeColorIndex, setters]);

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
