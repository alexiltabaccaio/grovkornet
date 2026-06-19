import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { useFilmStore } from '@entities/film';
import { SectionType, ModuleType, SECTION_MODULES } from '@entities/system';

export const useVisibleModules = (section: SectionType): readonly ModuleType[] => {
  const { hasTorch } = useBodyStore(
    useShallow((s) => ({
      hasTorch: s.capabilities.hasTorch,
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
        // processing now only has noise_reduction, so hide it if noise reduction is not available
        return !!availableNoiseReductionModes && availableNoiseReductionModes.length > 0;
      }
      
      return true;
    });
  }, [section, hasTorch, availableNoiseReductionModes]);
};
