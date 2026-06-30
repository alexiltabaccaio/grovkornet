import { useCallback } from 'react';
import { ParameterType } from '@entities/system';
import { resetFilmParameter } from '@features/sections/film';
import { resetBodyParameter } from '@features/sections/body';
import { resetLensParameter } from '@features/sections/lens';

export const useResetTool = () => {
  return useCallback((tool: ParameterType) => {
    if (tool === 'none') return;

    // Chain of Responsibility using feature actions
    if (resetBodyParameter(tool)) return;
    if (resetLensParameter(tool)) return;
    if (resetFilmParameter(tool)) return;
  }, []);
};
