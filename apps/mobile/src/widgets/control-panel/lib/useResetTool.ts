import { useCallback } from 'react';
import { ParameterType } from '@entities/system';
import { resetFilmParameter } from '@features/film-controls';
import { resetBodyParameter } from '@features/body-controls';
import { resetLensParameter } from '@features/lens-controls';

export const useResetTool = () => {
  return useCallback((tool: ParameterType) => {
    if (tool === 'none') return;

    // Chain of Responsibility using feature actions
    if (resetBodyParameter(tool)) return;
    if (resetLensParameter(tool)) return;
    if (resetFilmParameter(tool)) return;
  }, []);
};
