import { useCallback } from 'react';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { ParameterType } from '@entities/system';

export const useResetTool = () => {
  return useCallback((tool: ParameterType) => {
    if (tool === 'none') return;

    // Chain of Responsibility
    if (useBodyStore.getState().resetParameter(tool)) return;
    if (useLensStore.getState().resetParameter(tool)) return;
    if (useFilmStore.getState().resetParameter(tool)) return;
  }, []);
};
