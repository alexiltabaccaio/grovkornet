import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { SectionType, ModuleType } from './types';
import { SECTION_MODULES } from './constants';

export const useVisibleModules = (section: SectionType): readonly ModuleType[] => {
  const { hasTorch } = useBodyStore(
    useShallow((s) => ({
      hasTorch: s.capabilities.hasTorch,
    }))
  );

  const { availableCameras } = useLensStore(
    useShallow((s) => ({
      availableCameras: s.capabilities.availableCameras,
    }))
  );

  const { availableNoiseReductionModes } = useFilmStore(
    useShallow((s) => ({
      availableNoiseReductionModes: s.capabilities?.availableNoiseReductionModes,
    }))
  );

  return useMemo(() => {
    const modules = [...SECTION_MODULES[section]];
    
    return modules.filter((moduleName) => {
      if (moduleName === 'lighting') {
        // 'lighting' only has 'torch'. If no torch is physically present, hide the entire module.
        return !!hasTorch;
      }
      
      if (moduleName === 'optics') {
        // optics has focus (always visible), so optics is always visible.
        return true;
      }

      if (moduleName === 'processing') {
        // processing has sharpening (always visible), so processing is always visible.
        return true;
      }
      
      return true;
    });
  }, [section, hasTorch, availableCameras, availableNoiseReductionModes]);
};
