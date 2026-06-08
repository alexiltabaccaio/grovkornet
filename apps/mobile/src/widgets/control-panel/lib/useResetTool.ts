import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { ParameterType } from '@entities/system';

export const useResetTool = () => {
  const { resetEffect, setTemperatureAuto, setContrastAuto, setBlackLevelAuto, setHighlightsAuto, setPivotAuto } = useFilmStore(
    useShallow(s => ({
      resetEffect: s.resetEffect,
      setTemperatureAuto: s.setTemperatureAuto,
      setContrastAuto: s.setContrastAuto,
      setBlackLevelAuto: s.setBlackLevelAuto,
      setHighlightsAuto: s.setHighlightsAuto,
      setPivotAuto: s.setPivotAuto,
    }))
  );

  const { setEvAuto, setIsoAuto, setShutterSpeedAuto, setTorchState, setFpsSetting } = useBodyStore(
    useShallow(s => ({
      setEvAuto: s.setEvAuto,
      setIsoAuto: s.setIsoAuto,
      setShutterSpeedAuto: s.setShutterSpeedAuto,
      setTorchState: s.setTorchState,
      setFpsSetting: s.setFpsSetting,
    }))
  );

  const maxFps = useBodyStore(s => s.capabilities.maxFps);

  const { setFocusAuto, setCameraAuto } = useLensStore(
    useShallow(s => ({
      setFocusAuto: s.setFocusAuto,
      setCameraAuto: s.setCameraAuto,
    }))
  );

  const resetTool = useCallback((tool: ParameterType) => {
    if (tool === 'ev') setEvAuto(true);
    else if (tool === 'iso') setIsoAuto(true);
    else if (tool === 'shutter_speed') setShutterSpeedAuto(true);
    else if (tool === 'focus') setFocusAuto(true);
    else if (tool === 'temperature' || tool === 'tint') setTemperatureAuto(true);
    else if (tool === 'contrast') {
      setContrastAuto(true);
      setPivotAuto(true);
    }
    else if (tool === 'blackLevel') setBlackLevelAuto(true);
    else if (tool === 'highlights') setHighlightsAuto(true);
    else if (tool === 'pivot') setPivotAuto(true);
    else if (tool === 'camera_selection') setCameraAuto(true);
    else if (tool === 'torch') setTorchState(0);
    else if (tool === 'fps_setting') {
      const currentMaxFps = maxFps ?? 60;
      setFpsSetting(currentMaxFps >= 60 ? 60 : 30);
    }
    else if (tool === 'none') {
      // Do nothing
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      resetEffect(tool as any);
    }
  }, [
    setEvAuto,
    setIsoAuto,
    setShutterSpeedAuto,
    setFocusAuto,
    setTemperatureAuto,
    setContrastAuto,
    setBlackLevelAuto,
    setHighlightsAuto,
    setPivotAuto,
    setCameraAuto,
    setTorchState,
    maxFps,
    setFpsSetting,
    resetEffect,
  ]);

  return resetTool;
};
